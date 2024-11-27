'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface DonationSliderProps {
  minAmount?: number
  maxAmount?: number
  defaultAmount?: number
  currency?: string
}

export function DonationSlider({
  minAmount = 5,
  maxAmount = 100,
  defaultAmount = 10,
  currency = 'USD'
}: DonationSliderProps) {
  const [amount, setAmount] = useState(defaultAmount)
  const [isLoading, setIsLoading] = useState(false)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isCustom, setIsCustom] = useState(false)

  // Predefined donation amounts
  const quickAmounts = [5, 10, 25, 50]

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustom(false)
    setAmount(Number(e.target.value))
  }

  // Handle quick amount selection
  const handleQuickAmountClick = (value: number) => {
    setIsCustom(false)
    setAmount(value)
  }

  // Handle custom amount input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setCustomAmount('')
      setIsCustom(true)
      return
    }

    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setCustomAmount(value)
      setAmount(numValue)
      setIsCustom(true)
    }
  }

  // Handle donation submission
  const handleDonate = async () => {
    if (amount < minAmount) {
      toast.error(`Minimum donation amount is ${formatCurrency(minAmount)}`)
      return
    }

    if (amount > maxAmount) {
      toast.error(`Maximum donation amount is ${formatCurrency(maxAmount)}`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: currency.toLowerCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Load Stripe
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to initialize')
      }

      // Redirect to Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Donation error:', error)
      toast.error('Failed to process donation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">Support Our Work</h3>
          <p className="text-gray-600 mt-1">Choose your donation amount</p>
        </div>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((value) => (
            <button
              key={value}
              onClick={() => handleQuickAmountClick(value)}
              className={`py-2 px-4 rounded-md transition-colors ${
                amount === value && !isCustom
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {formatCurrency(value)}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            value={amount}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatCurrency(minAmount)}</span>
            <span>{formatCurrency(maxAmount)}</span>
          </div>
        </div>

        {/* Custom amount input */}
        <div className="relative">
          <input
            type="text"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="Enter custom amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {currency === 'USD' ? '$' : currency}
          </span>
        </div>

        {/* Selected amount display */}
        <div className="text-center">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(amount)}
          </span>
        </div>

        {/* Donate button */}
        <button
          onClick={handleDonate}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Donate Now'
          )}
        </button>
      </div>
    </div>
  )
}
