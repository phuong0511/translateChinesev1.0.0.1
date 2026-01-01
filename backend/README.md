# Backend API Server for Chinese Novel Translator

## Environment Variables

Create `.env` file in this directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
```

### For Railway Deployment:
Add these variables in Railway dashboard:
- `GEMINI_API_KEY` - Your Gemini API key
- `PORT` - Set to 3001 or leave empty (Railway assigns automatically)
- `NODE_ENV` - Set to `production`

## Setup & Run Locally

```bash
# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### POST /api/translate
Translates Chinese text to Vietnamese using Gemini AI.

**Request:**
```json
{
  "text": "原文中文...",
  "context": "Hồ sơ và ngữ cảnh...",
  "mode": "translate"
}
```

**Response:**
```json
{
  "translation": "Bản dịch tiếng Việt..."
}
```

**Modes:**
- `translate` - Full translation with system instruction
- `analyze` - Context analysis (low temp: 0.3)

## Deploy to Railway

1. Push to GitHub (Railway connects to your repo)
2. In Railway dashboard:
   - Create new Project
   - Connect GitHub repo
   - Add environment variables
   - Railway auto-deploys on push

## Security

- ✅ API Key never exposed to client
- ✅ CORS restricted to GitHub Pages domain
- ✅ Only POST requests allowed
- ✅ Input validation on all endpoints
