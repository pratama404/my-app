import { NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Custom error class for TTS errors
class TTSError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    this.name = 'TTSError';
  }
}

export async function POST(req: Request) {
  try {
    const { text, voice = 'en-US-Standard-A', languageCode = 'en-US' } = await req.json();

    if (!text) {
      throw new TTSError('Text is required', 400);
    }

    // Create a unique filename
    const outputFileName = `${uuidv4()}.mp3`;
    const outputPath = join(process.cwd(), 'public', 'audio', outputFileName);

    // Creates a client
    const client = new textToSpeech.TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    // Construct the request
    const request = {
      input: { text },
      voice: { languageCode, name: voice },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    try {
      // Performs the text-to-speech request
      const [response] = await client.synthesizeSpeech(request);

      // Write the binary audio content to a file
      await writeFile(outputPath, response.audioContent as Buffer);

      return NextResponse.json({
        success: true,
        audioUrl: `/audio/${outputFileName}`,
        message: 'Audio file created successfully'
      });
    } catch (error: any) {
      console.error('Text-to-speech error:', error);
      
      if (error.code === 7) { // Resource exhausted
        throw new TTSError('Rate limit exceeded. Please try again later.', 429);
      }
      
      throw new TTSError(error.message || 'Failed to generate speech', 500);
    }
  } catch (error) {
    console.error('Error in text-to-speech route:', error);
    if (error instanceof TTSError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
