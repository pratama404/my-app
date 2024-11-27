'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TextToSpeech } from './text-to-speech'
import { ShareRecommendations } from './share-recommendations'
import { motion } from 'framer-motion'

interface TranscriptionResultProps {
  transcription: {
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
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  const [isCopying, setIsCopying] = useState(false)
  const [detectedMood, setDetectedMood] = useState('neutral')
  const [musicGenre, setMusicGenre] = useState('pop')
  const [copied, setCopied] = useState(false)

  // Analyze text for mood when component mounts
  useEffect(() => {
    analyzeMood(transcription.transcription)
  }, [transcription.transcription])

  const analyzeMood = (text: string) => {
    const lowerText = text.toLowerCase()
    
    // Simple mood detection based on keywords
    if (lowerText.match(/happy|joy|excited|wonderful|great|amazing/g)) {
      setDetectedMood('happy')
      setMusicGenre('pop')
    } else if (lowerText.match(/sad|down|upset|depressed|unhappy/g)) {
      setDetectedMood('sad')
      setMusicGenre('acoustic')
    } else if (lowerText.match(/angry|mad|frustrated|annoyed/g)) {
      setDetectedMood('angry')
      setMusicGenre('rock')
    } else if (lowerText.match(/relaxed|calm|peaceful|tranquil/g)) {
      setDetectedMood('relaxed')
      setMusicGenre('ambient')
    } else if (lowerText.match(/energetic|pumped|motivated|inspired/g)) {
      setDetectedMood('energetic')
      setMusicGenre('electronic')
    }
  }

  const handleCopy = async () => {
    try {
      setIsCopying(true)
      await navigator.clipboard.writeText(transcription.transcription)
      toast.success('Transcription copied to clipboard!')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy transcription')
    } finally {
      setIsCopying(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([transcription.transcription], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcription.txt'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'nl': 'Dutch',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      // Add more languages as needed
    }
    return languages[code] || code
  }

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Transcription Result</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isCopying ? 'Copying...' : copied ? '✓ Copied' : 'Copy Text'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Download
            </button>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
          {transcription.transcription}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* File Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">File Info</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>Filename: {transcription.metadata.filename}</p>
            <p>Duration: {formatDuration(transcription.metadata.timing.estimatedDuration)}</p>
            <p>Language: {getLanguageName(transcription.metadata.language.code)}</p>
            <p>Confidence: {Math.round(transcription.metadata.language.confidence * 100)}%</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">Text Statistics</h3>
          <div className="space-y-2 text-sm text-purple-800">
            <p>Words: {transcription.metadata.statistics.wordCount}</p>
            <p>Sentences: {transcription.metadata.statistics.sentenceCount}</p>
            <p>Paragraphs: {transcription.metadata.statistics.paragraphCount}</p>
            <p>Words per Sentence: {Math.round(transcription.metadata.statistics.avgWordsPerSentence)}</p>
          </div>
        </div>

        {/* Mood and Share */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">Mood & Share</h3>
          <div className="space-y-4">
            <div className="text-sm text-green-800">
              <p>Detected Mood: {detectedMood}</p>
              <p>Suggested Genre: {musicGenre}</p>
            </div>
            <ShareRecommendations
              text={`Just transcribed an audio file! Here's a snippet: "${transcription.transcription.slice(0, 100)}..."`}
              mood={detectedMood}
              genre={musicGenre}
            />
          </div>
        </div>
      </div>

      {/* Text-to-Speech */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">Text-to-Speech</h3>
        <TextToSpeech text={transcription.transcription} />
      </div>
    </div>
  )
}
