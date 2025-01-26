# UMassD Schedule Assistant

An AI-powered web application that helps UMass Dartmouth students manage and query their class schedules using natural language.

## Features

- 🔒 Simple user authentication
- 📅 ICS file upload support for class schedules
- 🎯 Natural language queries about your schedule
- 🎤 Voice input support
- 🔊 Text-to-speech responses
- ⚡ Real-time responses using Google's Gemini AI
- 🕒 Timezone-aware (EST/EDT)

## Technologies Used

- React
- TypeScript
- Google Gemini AI API
- Web Speech API
- Tailwind CSS
- Lucide Icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## How to Use

1. Enter your name to log in
2. Download your class schedule (.ics file) from COIN:
   - Login to MyUmassD
   - Go to QUICKLAUNCH
   - Select 'Coin for students'
   - Expand 'Academics' on the left panel
   - Click on 'My class schedule'
   - Click 'Email as a .ics'
   - Download the .ics file from your university email
3. Upload the .ics file to the application
4. Ask questions about your schedule using:
   - Text input
   - Voice commands (click the microphone button)
5. Get AI-powered responses with optional text-to-speech playback

## Example Questions

- "Where is my Artificial Intelligence class?"
- "When is my next class?"
- "What classes do I have today?"
- "What's my schedule for tomorrow?"

## Notes

- All times are displayed in Eastern Time (EST/EDT)
- The AI assistant provides real-time, context-aware responses
- Voice input requires browser support for Web Speech API
- Internet connection required for AI functionality

## Credits

Crafted with ❤️ by Shishir