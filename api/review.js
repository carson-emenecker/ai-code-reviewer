import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Server-side Supabase client (service role). Used only to validate the caller's
// access token and to read/write plan + usage data. Never exposed to the browser.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// Free-plan quota. Must match the value shown in the UI (src/lib/supabase.js).
const FREE_DAILY_LIMIT = 3
const PRO_ONLY_SCAN_TYPES = new Set(['Security Audit'])

// In-memory rate limiter: 10 req/min per IP as defense in depth.
// Per-instance only (resets on cold start); the authoritative control is the per-user quota below.
const rateLimitMap = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const windowMs = 60 * 1000
  const max = 10
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= max) return true
  entry.count++
  return false
}

function todayString() {
  return new Date().toISOString().split('T')[0] // "YYYY-MM-DD"
}

async function getAuthenticatedUser(req) {
  const header = req.headers['authorization'] || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

async function getSubscriptionStatus(userId) {
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.status ?? 'free'
}

async function getUsageToday(userId) {
  const { data } = await supabase
    .from('usage_tracking')
    .select('review_count')
    .eq('user_id', userId)
    .eq('date', todayString())
    .maybeSingle()
  return data?.review_count ?? 0
}

async function incrementUsage(userId, current) {
  await supabase
    .from('usage_tracking')
    .upsert({ user_id: userId, date: todayString(), review_count: current + 1 }, { onConflict: 'user_id,date' })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket.remoteAddress
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' })
  }

  // Identity comes from the verified Supabase access token, never from the request body.
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Please sign in to analyze code.' })
  }

  const { code, language, scanType } = req.body ?? {}

  if (!code || !language || !scanType) {
    return res.status(400).json({ error: 'Missing required fields: code, language, scanType' })
  }

  const subscription = await getSubscriptionStatus(user.id)
  const isPro = subscription === 'pro'

  if (!isPro && PRO_ONLY_SCAN_TYPES.has(scanType)) {
    return res.status(403).json({ error: 'Security Audit is a Pro feature.' })
  }

  const usageToday = isPro ? 0 : await getUsageToday(user.id)
  if (!isPro && usageToday >= FREE_DAILY_LIMIT) {
    return res.status(429).json({ error: `You've used all ${FREE_DAILY_LIMIT} free reviews today.` })
  }

  const prompt = `You are an expert code reviewer. Analyze the following ${language} code and return a JSON object with exactly this structure:
{
  "bugs": [],
  "securityIssues": [],
  "improvements": []
}

Each array item must have: { "title": string, "description": string, "severity": "low" | "medium" | "high" | "critical" }

Scan focus: ${scanType}

Code to review:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON, no markdown, no explanation.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].text.trim()
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    let review
    try {
      review = JSON.parse(text)
    } catch {
      console.error('JSON parse failed. Raw response:', raw)
      return res.status(500).json({ error: 'Failed to parse review response' })
    }

    if (!isPro) {
      await incrementUsage(user.id, usageToday)
    }

    return res.status(200).json(review)
  } catch (err) {
    console.error('Anthropic API error:', err)
    return res.status(500).json({ error: 'Failed to call review API' })
  }
}
