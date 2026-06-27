import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
