import Stripe from 'stripe'

let stripeInstance = null

export function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24',
    })
  }
  return stripeInstance
}

export function getStripeJs() {
  return import('@stripe/stripe-js').then(({ loadStripe }) => {
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  })
}
