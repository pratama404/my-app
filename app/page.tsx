'use client'

import { useState, useEffect } from 'react'
import { FileUpload } from '@/components/file-upload'
import { TranscriptionResult } from '@/components/transcription-result'
import { ChatInterface } from '@/components/chat-interface'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { DonateButton } from '@/components/donate-button'

interface Transcription {
  success: boolean
  transcription: string
  metadata: {
    filename: string
    language: {
      code: string
      confidence: number
      name: string
    }
    timing: {
      estimatedDuration: number
      estimatedWordsPerMinute: number
    }
    statistics: {
      wordCount: number
      sentenceCount: number
      paragraphCount: number
      avgWordsPerSentence: number
      avgSentencesPerParagraph: number
    }
    readability: {
      level: string
    }
  }
}

const features = [
  {
    title: '🎙️ Voice to Text',
    description: 'Advanced AI-powered transcription with high accuracy',
    benefits: ['Multiple Languages', 'Fast Processing', 'High Accuracy'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: '🤖 AI Chat Companion',
    description: 'Your personal mood-aware AI assistant',
    benefits: ['Mood Analysis', 'Personalized Support', 'Activity Suggestions'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: '🎵 Music & Activities',
    description: 'Get personalized recommendations based on your mood',
    benefits: ['Spotify Integration', 'Custom Playlists', 'Activity Matching'],
    color: 'from-green-500 to-teal-500'
  },
  {
    title: '📊 Smart Analytics',
    description: 'Detailed analysis of your audio content',
    benefits: ['Language Detection', 'Readability Scores', 'Word Statistics'],
    color: 'from-orange-500 to-red-500'
  }
]

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [transcription, setTranscription] = useState<Transcription | null>(null)
  const [loadingPhase, setLoadingPhase] = useState<string>('')
  const [activeMode, setActiveMode] = useState<'transcribe' | 'chat'>('transcribe')
  const [showFeatures, setShowFeatures] = useState(true)
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    const hasUsedApp = localStorage.getItem('hasUsedApp')
    if (hasUsedApp) {
      setShowFeatures(false)
    }

    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleStartUsing = () => {
    setShowFeatures(false)
    localStorage.setItem('hasUsedApp', 'true')
  }

  const handleFileSelect = async (file: File) => {
    if (isLoading) return

    setIsLoading(true)
    setTranscription(null)
    setLoadingPhase('Preparing file...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      setLoadingPhase('Uploading file...')
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const uploadData = await uploadResponse.json()
      const { filename } = uploadData

      setLoadingPhase('Transcribing audio...')
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      })

      if (!transcribeResponse.ok) {
        const error = await transcribeResponse.json()
        throw new Error(error.error || 'Failed to transcribe file')
      }

      const transcriptionData = await transcribeResponse.json()
      setTranscription(transcriptionData)
      toast.success('Transcription completed!')
    } catch (error) {
      console.error('Transcription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process file')
      setTranscription(null)
    } finally {
      setIsLoading(false)
      setLoadingPhase('')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AnimatePresence mode="wait">
        {showFeatures ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-16"
          >
            {/* Hero Section */}
            <div className="text-center mb-16">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl font-bold text-gray-900 mb-6"
              >
                Your Personal
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {' '}AI Companion
                </span>
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              >
                Experience the future of personal assistance with our AI-powered companion. 
                Transform your voice into text, understand your emotions, and get personalized recommendations.
              </motion.p>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={handleStartUsing}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full 
                  font-medium text-lg hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Get Started Now
              </motion.button>
            </div>

            {/* Feature Slider */}
            <div className="max-w-6xl mx-auto relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <motion.div
                  animate={{ x: `-${currentFeature * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className={`min-w-full p-12 bg-gradient-to-br ${feature.color}`}
                    >
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-white">
                          <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                          <p className="text-lg mb-6 opacity-90">{feature.description}</p>
                          <ul className="space-y-3">
                            {feature.benefits.map((benefit) => (
                              <li key={benefit} className="flex items-center space-x-2">
                                <span className="text-xl">✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex justify-center">
                          <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-7xl">{feature.title.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              
              {/* Feature Navigation Dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentFeature === index
                        ? 'bg-blue-600 w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="max-w-4xl mx-auto">
              {/* Mode Toggle */}
              <div className="mb-8">
                <div className="flex justify-center space-x-4 p-2 bg-white rounded-xl shadow-sm">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveMode('transcribe')}
                    className={`px-6 py-3 rounded-lg transition-all ${
                      activeMode === 'transcribe'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🎙️ Transcribe Audio
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveMode('chat')}
                    className={`px-6 py-3 rounded-lg transition-all ${
                      activeMode === 'chat'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    💭 Chat Mode
                  </motion.button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeMode === 'transcribe' ? (
                  <motion.div
                    key="transcribe"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <FileUpload
                          onFileSelect={handleFileSelect}
                          isLoading={isLoading}
                          loadingPhase={loadingPhase}
                        />
                      </div>

                      {transcription && transcription.success && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                          <TranscriptionResult transcription={transcription} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChatInterface />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DonateButton />
    </main>
  )
}
