import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { nanoid } from 'nanoid'

// Custom error classes for better error handling
class UploadError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
    this.name = 'UploadError'
  }
}

// Validate file type
const isValidFileType = (type: string): boolean => {
  const validTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/x-m4a',
    'audio/m4a',
    'video/mp4',
    'audio/mp4'
  ]
  return validTypes.includes(type)
}

// Ensure uploads directory exists
const ensureUploadsDirectory = async () => {
  const uploadDir = join(process.cwd(), 'uploads')
  try {
    await mkdir(uploadDir, { recursive: true })
    return uploadDir
  } catch (error) {
    console.error('Error creating uploads directory:', error)
    throw new UploadError('Failed to create uploads directory', 500)
  }
}

export async function POST(req: Request) {
  try {
    // Ensure uploads directory exists
    const uploadDir = await ensureUploadsDirectory()

    // Parse form data
    const formData = await req.formData().catch(() => {
      throw new UploadError('Invalid form data', 400)
    })

    // Get file from form data
    const file = formData.get('file') as File
    if (!file) {
      throw new UploadError('No file provided', 400)
    }

    // Log file details for debugging
    console.log('Received file:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Validate file type
    if (!isValidFileType(file.type)) {
      throw new UploadError(
        'Invalid file type. Supported types: MP3, WAV, M4A, MP4',
        400
      )
    }

    // Validate file size (25MB)
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      throw new UploadError('File too large. Maximum size is 25MB', 400)
    }

    try {
      // Create unique filename
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Get file extension from original filename
      const originalExt = file.name.split('.').pop()?.toLowerCase()
      if (!originalExt) {
        throw new UploadError('Invalid file extension', 400)
      }

      const uniqueId = nanoid()
      const filename = `${uniqueId}.${originalExt}`
      const filePath = join(uploadDir, filename)

      // Write file to disk
      await writeFile(filePath, buffer)
      console.log('File saved successfully:', filePath)

      return NextResponse.json({ 
        success: true,
        filename,
        type: file.type,
        size: file.size 
      })

    } catch (error) {
      console.error('Error saving file:', error)
      if (error instanceof UploadError) {
        throw error
      }
      throw new UploadError('Error saving file', 500)
    }

  } catch (error) {
    console.error('Upload error:', error)
    
    // Return appropriate error response
    if (error instanceof UploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
