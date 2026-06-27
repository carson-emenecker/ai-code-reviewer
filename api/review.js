import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// In-memory rate limiter: 10 req/min per IP for unauthenticated requests
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const isAuthenticated = !!req.headers['authorization']
  if (!isAuthenticated) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket.remoteAddress
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please slow down or log in.' })
    }
  }

  const { code, language, scanType } = req.body

  if (!code || !language || !scanType) {
    return res.status(400).json({ error: 'Missing required fields: code, language, scanType' })
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

    try {
      const review = JSON.parse(text)
      return res.status(200).json(review)
    } catch {
      console.error('JSON parse failed. Raw response:', raw)
      return res.status(500).json({ error: 'Failed to parse review response' })
    }
  } catch (err) {
    console.error('Anthropic API error:', err)
    return res.status(500).json({ error: 'Failed to call review API' })
  }
}
