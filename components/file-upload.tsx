'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface FileUploadProps {
  onFileSelect: (file: File & { duration?: number }) => Promise<void>
  isLoading?: boolean
  loadingPhase?: string
}

export function FileUpload({
  onFileSelect,
  isLoading = false,
  loadingPhase = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  // Function to get audio duration
  const getAudioDuration = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio()
        audio.src = URL.createObjectURL(file)

        audio.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(audio.src)
          resolve(audio.duration)
        })

        audio.addEventListener('error', (e) => {
          URL.revokeObjectURL(audio.src)
          reject(new Error('Failed to load audio file'))
        })
      } catch (error) {
        reject(new Error('Failed to process audio file'))
      }
    })
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        if (acceptedFiles.length === 0) {
          toast.error('Please select an audio file')
          return
        }

        const file = acceptedFiles[0]

        // Validate file size (25MB limit)
        const maxSize = 25 * 1024 * 1024 // 25MB in bytes
        if (file.size > maxSize) {
          toast.error('File size must be less than 25MB')
          return
        }

        // Validate file type
        const validTypes = [
          'audio/mpeg',
          'audio/mp3',
          'audio/wav',
          'audio/wave',
          'audio/x-wav',
          'audio/x-m4a',
          'audio/m4a',
          'audio/mp4',
          'video/mp4'
        ]

        if (!validTypes.includes(file.type)) {
          toast.error('Please upload a valid audio file (MP3, WAV, M4A, or MP4)')
          return
        }

        try {
          // Get audio duration
          const duration = await getAudioDuration(file)
          const fileWithDuration = Object.assign(file, { duration })
          await onFileSelect(fileWithDuration)
        } catch (error) {
          console.error('Error processing audio:', error)
          toast.error('Failed to process audio file. Please try again.')
        }
      } catch (error) {
        console.error('File upload error:', error)
        toast.error('Failed to upload file. Please try again.')
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.mp4'],
      'video/mp4': ['.mp4']
    },
    maxFiles: 1,
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input {...getInputProps()} disabled={isLoading} />
      <div className="text-center">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-sm text-gray-500">{loadingPhase}</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the audio file here...</p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              Drag and drop an audio file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports MP3, WAV, M4A, and MP4 (max 25MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
