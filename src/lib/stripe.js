export async function redirectToCheckout() {
  const { loadStripe } = await import('@stripe/stripe-js')
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  await stripe.redirectToCheckout({
    lineItems: [{ price: 'price_placeholder', quantity: 1 }],
    mode: 'subscription',
    successUrl: `${window.location.origin}/?checkout=success`,
    cancelUrl: `${window.location.origin}/pricing`,
  })
}
