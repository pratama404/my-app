import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

    // Try to create a model instance and test with a simple prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent('Hello, are you working?')
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ 
      success: true, 
      message: 'Gemini API key is valid',
      key: process.env.GOOGLE_API_KEY?.substring(0, 10) + '...' // Only show first few chars
    })
  } catch (error: any) {
    // Safely handle error details
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      status: 500
    }
    
    console.error('Gemini API error:', errorDetails)
    
    return NextResponse.json({ 
      success: false, 
      error: errorDetails.message,
      type: errorDetails.name
    }, { 
      status: errorDetails.status 
    })
  }
}
