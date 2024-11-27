import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('Missing NEXT_PUBLIC_APP_URL')
}

// Initialize Stripe with the latest stable API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
  typescript: true
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      )
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const successUrl = new URL('/donate/success', baseUrl).toString()
    const cancelUrl = new URL('/donate/cancel', baseUrl).toString()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support AI Mood Companion',
              description: 'Thank you for your generous support!'
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        source: 'AI Mood Companion',
        amount: amount.toString(),
      },
    })

    if (!session?.url) {
      throw new Error('Failed to create checkout session URL')
    }

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe API error:', error)
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Your card was declined.' },
        { status: 400 }
      )
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid parameters provided to Stripe API.' },
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    )
  }
}
