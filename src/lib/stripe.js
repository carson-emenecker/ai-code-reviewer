import { supabase } from './supabase'

export async function redirectToCheckout() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to upgrade.')

  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id }),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error || 'Failed to create checkout session')
  }

  const { url } = await res.json()
  window.location.href = url
}
