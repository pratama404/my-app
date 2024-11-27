import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

const moodPrompts = {
  happy: {
    context: "The user is feeling happy and positive. Let's suggest activities that maintain and enhance this mood.",
    tone: "upbeat and encouraging"
  },
  sad: {
    context: "The user is feeling sad. Let's suggest uplifting and comforting activities.",
    tone: "empathetic and gentle"
  },
  energetic: {
    context: "The user is feeling energetic. Let's suggest activities that channel this energy productively.",
    tone: "dynamic and enthusiastic"
  },
  relaxed: {
    context: "The user is feeling relaxed. Let's suggest activities that maintain this peaceful state.",
    tone: "calm and soothing"
  },
  stressed: {
    context: "The user is feeling stressed. Let's suggest calming and stress-relieving activities.",
    tone: "supportive and reassuring"
  },
  creative: {
    context: "The user is feeling creative. Let's suggest activities that nurture this creative energy.",
    tone: "inspiring and imaginative"
  }
}

export async function POST(req: Request) {
  try {
    const { mood, message } = await req.json()

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    let prompt = ''
    if (mood) {
      const moodInfo = moodPrompts[mood as keyof typeof moodPrompts]
      prompt = `As a supportive AI companion focusing on emotional well-being and activity recommendations:

${moodInfo.context}

Please provide:
1. A supportive response in a ${moodInfo.tone} tone
2. A list of 3-4 specific, mood-appropriate activities

Format the response as a JSON object with:
{
  "message": "your supportive response",
  "activities": ["activity 1", "activity 2", "activity 3"]
}

Keep the message concise but warm, and make the activities specific and actionable.`
    } else {
      prompt = `As a supportive AI companion focusing on emotional well-being, respond to this message: "${message}"

Analyze the emotional content and provide:
1. An empathetic and supportive response
2. 2-3 relevant activity suggestions based on the emotional context

Format the response as a JSON object with:
{
  "message": "your supportive response",
  "activities": ["activity 1", "activity 2"]
}

Keep the message concise but warm, and make the activities specific and actionable.`
    }

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }
      
      const data = JSON.parse(jsonMatch[0])
      return NextResponse.json(data)
    } catch (error) {
      console.error('Generation error:', error)
      throw new Error('Failed to generate response')
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
