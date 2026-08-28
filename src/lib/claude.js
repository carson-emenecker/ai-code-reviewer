import { supabase } from './supabase'

export async function reviewCode({ code, language, scanType }) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Please sign in to analyze code.')

  const res = await fetch('/api/review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ code, language, scanType }),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error || `Request failed with status ${res.status}`)
  }

  return res.json()
}
