# AI Mystery Room

AI Mystery Room is an AI-powered mystery-solving web app. The player enters a premise and a difficulty, Google Gemini generates a fictional mystery (story, suspects, clues, hints and a hidden solution), and the player investigates, accuses a suspect and receives a score.

Live website: _add your deployed URL here_

## Features

- Generate a new mystery from any premise (Easy, Medium or Hard)
- Investigate suspects and uncover clues (+5 points each)
- Request hints (-10 points each, limited per difficulty)
- Accuse one suspect, with a confirmation step
- Server-calculated score and a full results page with the explanation
- Responsive design for desktop and mobile

## Tech stack

| Technology | Purpose |
| --- | --- |
| React + Vite | Frontend |
| Tailwind CSS | Styling |
| React Router, Axios | Navigation and API calls |
| Node.js + Express | Backend API |
| MongoDB Atlas + Mongoose | Database |
| Google Gemini API (`@google/genai`) | Mystery generation |
| Zod | Request and AI-output validation |

## Difficulty and scoring

| Difficulty | Suspects | Clues | Hints | Correct-accusation bonus |
| --- | --- | --- | --- | --- |
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

Final score = max(0, bonus + 5 per clue - 10 per hint). An incorrect accusation earns no bonus. The score is calculated only on the server, once, when the accusation is accepted.

## Security design

- The Gemini API key and the database connection string live only in the backend `.env` file.
- The solution and the hint texts are hidden by default in the database model and are never sent while a case is active.
- The server decides whether an accusation is correct. The browser sends only a suspect ID.
- A case can receive only one accusation, and the result endpoint refuses requests until the case is completed.
- Gemini output is validated with Zod and extra rules (exact counts, unique IDs, valid culprit and clue references) before it is saved, with limited retries.
- Suspects and clues are shuffled on the server so the culprit's position is random.

## Getting started

### Requirements

- Node.js 20 or newer
- A MongoDB Atlas database
- A Gemini API key from Google AI Studio

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env` (copy `server/.env.example`) and fill in your own values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

Check `http://localhost:5000/api/health`.

### 2. Frontend

```bash
cd client
npm install
```

Create `client/.env` (copy `client/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:5173`.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/cases` | Generate and save a mystery |
| GET | `/api/cases/:id` | Get the public case and progress |
| POST | `/api/cases/:id/clues/:clueId/discover` | Discover a clue |
| POST | `/api/cases/:id/hints` | Request the next hint |
| POST | `/api/cases/:id/accuse` | Submit the accusation |
| GET | `/api/cases/:id/result` | Get the result (after completion only) |

## Project structure

```text
ai-mystery-room/
├── SPEC.md
├── README.md
├── client/    React + Vite + Tailwind frontend
└── server/    Express API, Mongoose models, Gemini service
```

See `SPEC.md` for the full specification.

## Deployment

- Frontend: Vercel (project root `client`, environment variable `VITE_API_BASE_URL`)
- Backend: a Node.js host such as Render (root `server`, start command `npm start`)
- Database: MongoDB Atlas

All mysteries are fictional.