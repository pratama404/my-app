'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PlayCircle,
  PauseCircle,
  StopCircle,
  Volume2,
  Settings2,
  Download,
  RefreshCw,
} from 'lucide-react'

interface TextToSpeechProps {
  text: string
  onFinish?: () => void
}

interface VoiceOption {
  name: string
  voice: SpeechSynthesisVoice
}

export function TextToSpeech({ text, onFinish }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      const voiceOptions = availableVoices.map((voice) => ({
        name: `${voice.name} (${voice.lang})`,
        voice: voice,
      }))
      setVoices(voiceOptions)
      
      // Set default voice (preferably English)
      const defaultVoice = voiceOptions.find(
        (v) => v.voice.lang.startsWith('en-')
      )
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name)
      } else if (voiceOptions.length > 0) {
        setSelectedVoice(voiceOptions[0].name)
      }
    }

    loadVoices()
    
    // Chrome requires this event listener for voice loading
    if (typeof window !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const createUtterance = () => {
    const utterance = new SpeechSynthesisUtterance(text)
    const selectedVoiceObj = voices.find((v) => v.name === selectedVoice)
    
    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj.voice
    }
    
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      onFinish?.()
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      toast.error('Error during speech synthesis')
      setIsPlaying(false)
      setIsPaused(false)
    }

    return utterance
  }

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    if (isPlaying) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      setIsPlaying(false)
      return
    }

    try {
      window.speechSynthesis.cancel()
      utteranceRef.current = createUtterance()
      window.speechSynthesis.speak(utteranceRef.current)
      setIsPlaying(true)
    } catch (error) {
      console.error('Speech synthesis error:', error)
      toast.error('Failed to start speech synthesis')
    }
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const handleDownload = async () => {
    try {
      const utterance = createUtterance()
      // Implementation for audio download would go here
      // This would require a server-side API or a third-party service
      toast.info('Audio download feature coming soon!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download audio')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlay}
            className={cn(
              'w-10 h-10',
              isPlaying && !isPaused && 'text-primary border-primary'
            )}
          >
            {isPlaying ? (
              isPaused ? <PlayCircle className="h-5 w-5" /> : <PauseCircle className="h-5 w-5" />
            ) : (
              <PlayCircle className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="w-10 h-10"
          >
            <StopCircle className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className={cn('w-10 h-10', showSettings && 'border-primary text-primary')}
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          className="w-10 h-10"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: showSettings ? 'auto' : 0,
          opacity: showSettings ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden space-y-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Voice</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rate</label>
          <Slider
            value={[rate]}
            onValueChange={([value]) => setRate(value)}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pitch</label>
          <Slider
            value={[pitch]}
            onValueChange={([value]) => setPitch(value)}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Volume</label>
          <Slider
            value={[volume]}
            onValueChange={([value]) => setVolume(value)}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>
      </motion.div>
    </div>
  )
}
