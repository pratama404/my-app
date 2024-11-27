'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function DonationSuccess() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID found')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/verify-donation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
          throw new Error('Failed to verify donation')
        }

        // Session verified
        setIsLoading(false)
      } catch (error) {
        console.error('Verification error:', error)
        setError('Failed to verify donation')
        setIsLoading(false)
      }
    }

    verifySession()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-xl font-semibold">{error}</div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Thank You!</h1>
          <p className="text-gray-600">
            Your donation has been successfully processed. We truly appreciate your
            support!
          </p>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return Home
            </Link>
            <p className="text-sm text-gray-500">
              A confirmation email will be sent to you shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
