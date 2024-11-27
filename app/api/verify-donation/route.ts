import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Verify this is a donation session
    if (session.metadata?.type !== 'donation') {
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        amount: session.metadata?.amount,
        currency: session.metadata?.currency,
        customer: session.customer,
        email: session.customer_details?.email,
      },
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}
