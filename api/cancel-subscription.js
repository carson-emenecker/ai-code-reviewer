import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' })
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.stripe_subscription_id) {
    return res.status(404).json({ error: 'No active subscription found' })
  }

  try {
    const updated = await stripe.subscriptions.update(data.stripe_subscription_id, {
      cancel_at_period_end: true,
    })
    return res.status(200).json({ success: true, cancel_at: updated.cancel_at })
  } catch (err) {
    console.error('Stripe cancel error:', err)
    return res.status(500).json({ error: 'Failed to cancel subscription' })
  }
}
