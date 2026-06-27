import Anthropic from '@anthropic-ai/sdk'

// WARNING: In production, move this to a server-side API route (Vercel Function
// or Supabase Edge Function) so the API key is never exposed in the browser.
const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function reviewCode({ code, language, scanType }) {
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

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].text.trim()
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    return JSON.parse(text)
  } catch (err) {
    console.error('JSON parse failed. Raw response:', raw)
    throw new Error('Failed to parse review response. Raw output logged to console.')
  }
}
