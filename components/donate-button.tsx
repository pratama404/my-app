'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

// Validate environment variable
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (!stripePublishableKey) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
}

const donationAmounts = [
  { amount: 5, label: '☕ Coffee' },
  { amount: 10, label: '🍕 Pizza' },
  { amount: 20, label: '📚 Book' },
  { amount: 50, label: '💝 Super Support' }
]

export function DonateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const handleDonation = async (amount: number) => {
    try {
      setIsLoading(true)
      setSelectedAmount(amount)

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (!data.url) {
        throw new Error('No checkout URL received')
      }

      // Redirect to Stripe checkout URL
      window.location.href = data.url
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
      setSelectedAmount(null)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Support Us! 💖
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {donationAmounts.map(({ amount, label }) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDonation(amount)}
              disabled={isLoading}
              className={`
                px-4 py-3 rounded-xl font-medium text-sm
                transition-all duration-200
                ${
                  isLoading && selectedAmount === amount
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading && selectedAmount === amount ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  ${amount} - {label}
                </>
              )}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center">
          Secure payments powered by Stripe 🔒
        </p>
      </motion.div>
    </div>
  )
}
