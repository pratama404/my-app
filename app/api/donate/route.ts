import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// This is a mock implementation. In a real application,
// you would integrate with a payment processor like Stripe
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { amount, currency = 'USD' } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      )
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Donation',
              description: 'Thank you for supporting our work!',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/donation/cancel`,
      metadata: {
        type: 'donation',
        amount: amount.toString(),
        currency: currency,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    )
  }
}
