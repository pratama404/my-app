'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CancelPage() {
  const router = useRouter()

  useEffect(() => {
    // Automatically redirect after 10 seconds
    const timeout = setTimeout(() => {
      router.push('/')
    }, 10000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl"
          >
            🤝
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
        >
          Maybe Next Time
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-600 mb-8"
        >
          No worries! You can still enjoy all our features. We appreciate your interest in supporting us.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium 
              hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            Return to Home
          </Link>
          
          <p className="text-sm text-gray-500">
            You will be automatically redirected in a few seconds...
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
