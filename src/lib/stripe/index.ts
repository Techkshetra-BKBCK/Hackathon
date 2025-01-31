import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-01-31',
  appInfo: {
    name: 'VaultX App',
    version: '0.1.0',
  },
})


