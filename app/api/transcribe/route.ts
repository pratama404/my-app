import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import os from 'os'

// Validate API key
if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

export async function POST(req: Request) {
  try {
    // Get form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm']
    if (!validTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only WAV, MP3, and WebM files are supported.' },
        { status: 400 }
      )
    }

    // Save file to temp directory
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempDir = os.tmpdir()
    const filePath = join(tempDir, `upload-${Date.now()}-${audioFile.name}`)
    await writeFile(filePath, buffer)

    try {
      // Initialize Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      // Process with Gemini
      const prompt = `Please transcribe this audio file and provide a summary of its content.`
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return NextResponse.json({
        transcription: text,
        summary: text, // In this case, they're the same since Gemini provides both
        filename: audioFile.name,
        duration: 0, // Add audio duration calculation if needed
      })
    } catch (error: any) {
      console.error('Gemini API error:', error)
      return NextResponse.json(
        { error: 'Failed to process audio with Gemini' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
