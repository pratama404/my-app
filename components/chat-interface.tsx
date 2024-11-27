'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ShareRecommendations } from './share-recommendations'
import { TextToSpeech } from './text-to-speech'
import { Volume2, X } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  mood?: string
  timestamp: number
}

const moodEmojis: { [key: string]: string } = {
  happy: '😊',
  sad: '😢',
  energetic: '⚡',
  relaxed: '😌',
  stressed: '😰',
  creative: '🎨'
}

const moodColors: { [key: string]: { bg: string, border: string, gradient: string, text: string } } = {
  happy: {
    text: 'text-yellow-800',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    gradient: 'from-yellow-400 to-orange-400'
  },
  sad: {
    text: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    gradient: 'from-blue-400 to-indigo-400'
  },
  energetic: {
    text: 'text-red-800',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    gradient: 'from-orange-400 to-red-400'
  },
  relaxed: {
    text: 'text-green-800',
    bg: 'bg-green-50',
    border: 'border-green-200',
    gradient: 'from-green-400 to-teal-400'
  },
  stressed: {
    text: 'text-red-800',
    bg: 'bg-red-50',
    border: 'border-red-200',
    gradient: 'from-red-400 to-pink-400'
  },
  creative: {
    text: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    gradient: 'from-purple-400 to-pink-400'
  }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showTextToSpeech, setShowTextToSpeech] = useState(false)
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood)
    setIsTyping(true)
    
    // Simulate AI typing
    setTimeout(() => {
      const newMessage: Message = {
        role: 'assistant',
        content: `I notice you're feeling ${mood}. Here are some activities that might help enhance your mood:`,
        mood,
        timestamp: Date.now()
      }
      setMessages([...messages, newMessage])
      setIsTyping(false)
    }, 1000)

    setShowWelcome(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages([...messages, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Simulate natural typing delay
      setTimeout(() => {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
      }, Math.random() * 1000 + 500)

    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to get response. Please try again.')
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center p-8"
            >
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                How are you feeling today?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(moodEmojis).map(([mood, emoji]) => (
                  <motion.button
                    key={mood}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMoodSelect(mood)}
                    className={`p-6 rounded-xl border-2 ${moodColors[mood].bg} ${moodColors[mood].border}
                      transition-all hover:shadow-lg flex flex-col items-center space-y-3`}
                  >
                    <span className="text-4xl filter drop-shadow-sm">{emoji}</span>
                    <span className="capitalize font-medium">{mood}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'rounded-lg p-4 max-w-[80%] space-y-2',
                message.role === 'user'
                  ? 'bg-gradient-to-r text-white ' + moodColors[message.mood || 'happy'].gradient
                  : cn(
                      moodColors[message.mood || 'happy'].bg,
                      'border',
                      moodColors[message.mood || 'happy'].border
                    )
              )}
            >
              <div className="flex items-center justify-between space-x-2">
                <span
                  className={cn(
                    message.role === 'user'
                      ? 'text-white'
                      : moodColors[message.mood || 'happy'].text
                  )}
                >
                  {message.content}
                </span>
                <button
                  onClick={() => {
                    setCurrentSpeakingText(message.content)
                    setShowTextToSpeech(true)
                  }}
                  className={cn(
                    'ml-2 p-1 rounded-full hover:bg-opacity-10 hover:bg-black transition-colors',
                    message.role === 'user'
                      ? 'text-white'
                      : moodColors[message.mood || 'happy'].text
                  )}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className={`rounded-lg p-4 ${selectedMood ? moodColors[selectedMood].bg : 'bg-gray-200'}`}>
              <div className="flex space-x-2">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  className="w-2 h-2 bg-gray-600 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, repeatType: 'reverse' }}
                  className="w-2 h-2 bg-gray-600 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, delay: 0.4, repeat: Infinity, repeatType: 'reverse' }}
                  className="w-2 h-2 bg-gray-600 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex space-x-4">
          <motion.input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 
              transition-colors text-lg text-black placeholder-gray-500"
            disabled={isLoading}
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl
              font-medium text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </motion.button>
        </div>
      </form>
      
      {/* Text-to-Speech Modal */}
      <AnimatePresence>
        {showTextToSpeech && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Text to Speech</h2>
                <button
                  onClick={() => setShowTextToSpeech(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <TextToSpeech 
                  text={currentSpeakingText}
                  onFinish={() => setShowTextToSpeech(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
