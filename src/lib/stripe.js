import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24',
})

export function getStripeJs() {
  return import('@stripe/stripe-js').then(({ loadStripe }) => {
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  })
}
