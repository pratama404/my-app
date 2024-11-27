# Project Overview
Your goal is to build a Next.js application that allows users to transcribe audio files using OpenAI's Whisper API. The application should provide a clean, user-friendly interface for uploading audio files, displaying transcription results, and downloading the transcribed text.
Technologies Used:
- Next.js 15 for the framework
- TypeScript for type safety
- Tailwind CSS for styling
- OpenAI Whisper API for audio transcription
- Sonner for toast notifications
# Core Functionalities
## 1. File Upload
- Single file upload interface with drag-and-drop support
- Immediate file processing upon selection
- File type validation (MP3, WAV, M4A, MP4)
- File size validation (max 25MB)
- Loading state indication during upload and processing
- Error handling with user-friendly notifications
## 2. Audio Transcription
- Automatic transcription using OpenAI's Whisper API
- Server-side processing with temporary file storage
- Language detection
- Duration calculation
- Word count analysis
- Real-time status updates via toast notifications
- Comprehensive error handling
## 3. Result Display
- Clean presentation of transcription results
- Display of metadata:
  * Detected language
  * Audio duration
  * Word count
- Formatted text display with proper whitespace handling
- Error state handling with user feedback
## 4. File Download
- Download button for transcribed text
- Formatted text file output including:
  * Language information
  * Duration details
  * Word count statistics
  * Full transcription text
- Automatic file naming
- Success notification upon download
## 5. Error Handling
- Comprehensive input validation
- User-friendly error messages
- Network error handling
- API error management
- File cleanup on error
- Development mode stack traces
# Doc
## 1 OpenAI Whisper API Documentation
The OpenAI Whisper API can be used to transcribe audio files.
## 2 OpenAI Whisper API Documentation
The following code snippet demonstrates how to use OpenAI's Whisper API to transcribe an audio file in JavaScript:
```javascript
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
async function main() {
  const file = await openai.uploadFile("audio_file.mp3");
  const transcription = await openai.createTranscription(
    "whisper-1",
    file.id,
    "en-US"
  );
  console.log(transcription.text);
}
main();
```
# Important Implementation Notes
## 0. Adding logs
- Always add server side logs to your code so we can debug any potential issues
## 1. Project setup
- All new components should go in /components at the root (not in the app folder) and be named like example-component.tsx unless otherwise specified
- All new pages go in /app
- Use the Next.js 15 app router
- All data fetching should be done in a server component and pass the data down as props
- Client components (useState, hooks, etc) require that 'use client' is set at the top of the file
## 2. Server-Side API Calls:
- All interactions with external APIs (e.g., Reddit, OpenAI) should be performed server-side.
- Create dedicated API routes in the `pages/api` directory for each external API interaction.
- Client-side components should fetch data through these API routes, not directly from external APIs.
## 3. Environment Variables:
- Store all sensitive information (API keys, credentials) in environment variables.
- Use a `.env.local` file for local development and ensure it's listed in `.gitignore`.
- For production, set environment variables in the deployment platform (e.g., Vercel).
- Access environment variables only in server-side code or API routes.
## 4. Error Handling and Logging:
- Implement comprehensive error handling in both client-side components and server-side API routes.
- Log errors on the server-side for debugging purposes.
- Display user-friendly error messages on the client-side.
## 5. Type Safety:
- Use TypeScript interfaces for all data structures, especially API responses.
- Avoid using `any` type; instead, define proper types for all variables and function parameters.
## 6. API Client Initialization:
- Initialize API clients (e.g., Snoowrap for Reddit, OpenAI) in server-side code only.
- Implement checks to ensure API clients are properly initialized before use.
## 7. Data Fetching in Components:
- Use React hooks (e.g., `useEffect`) for data fetching in client-side components.
- Implement loading states and error handling for all data fetching operations.
## 8. Next.js Configuration:
- Utilize `next.config.mjs` for environment-specific configurations.
- Use the `env` property in `next.config.mjs` to make environment variables available to the application.
## 9. CORS and API Routes:
- Use Next.js API routes to avoid CORS issues when interacting with external APIs.
- Implement proper request validation in API routes.
## 10. Component Structure:
- Separate concerns between client and server components.
- Use server components for initial data fetching and pass data as props to client components.
## 11. Security:
- Never expose API keys or sensitive credentials on the client-side.
- Implement proper authentication and authorization for API routes if needed.
## 12. Special syntax:
- When use shadcn, use npx shadcn@latest add xxx, instead of shadcn-ui@latest, this is deprecated

