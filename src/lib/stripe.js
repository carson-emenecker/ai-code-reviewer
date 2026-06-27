import { loadStripe } from '@stripe/stripe-js'

// Replace 'price_1Tmyh1QbsHYUfUX01cD1FnFI' with the Price ID from your Stripe Dashboard
// (Products → your Pro product → Pricing → copy the price_xxx ID)
const STRIPE_PRICE_ID = 'price_1Tmyh1QbsHYUfUX01cD1FnFI'

let stripePromise = null
function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

export async function redirectToCheckout() {
  const stripe = await getStripe()
  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    mode: 'subscription',
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/pricing`,
  })
  if (error) throw new Error(error.message)
}
