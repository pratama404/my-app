import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

async function handleDonationSuccess(session: Stripe.Checkout.Session) {
  // Here you can:
  // 1. Send thank you emails
  // 2. Update database records
  // 3. Trigger any other business logic
  console.log('Successful donation:', {
    amount: session.metadata?.amount,
    currency: session.metadata?.currency,
    customer: session.customer,
    email: session.customer_details?.email,
  })
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')

  let event: Stripe.Event

  try {
    // If webhook secret is not set, parse the raw body
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      event = JSON.parse(body) as Stripe.Event
      console.log('Webhook signature verification skipped - development mode')
    } else {
      // Verify webhook signature if secret is available
      event = stripe.webhooks.constructEvent(
        body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        if (session.metadata?.type === 'donation') {
          await handleDonationSuccess(session)
        } else {
          console.log('Payment successful:', session.id)
        }
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', failedPayment.id)
        break

      // Add more event handlers as needed
      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
