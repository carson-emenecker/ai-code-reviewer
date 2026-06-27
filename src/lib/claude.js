export async function reviewCode({ code, language, scanType }) {
  const res = await fetch('/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, scanType }),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error || `Request failed with status ${res.status}`)
  }

  return res.json()
}
