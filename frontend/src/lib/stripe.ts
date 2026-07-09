import { loadStripe } from '@stripe/stripe-js'

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() || ''

export const isStripeClientConfigured = STRIPE_PUBLISHABLE_KEY.length > 0

export const stripePromise = isStripeClientConfigured
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null
