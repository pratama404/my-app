'use client'

import Link from 'next/link'

export default function DonationCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Donation Cancelled
          </h1>
          <p className="text-gray-600">
            Your donation has been cancelled. No charges have been made to your
            account.
          </p>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return Home
            </Link>
            <p className="text-sm text-gray-500">
              Feel free to try again whenever you're ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
