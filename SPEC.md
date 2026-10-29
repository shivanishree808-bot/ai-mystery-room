AI Mystery Room - Specification
1. Overview

AI Mystery Room is an AI-powered mystery-solving web app. The player enters a premise and a difficulty, Google Gemini generates a fictional mystery (story, suspects, clues, hints, solution), and the player investigates, accuses a suspect, and receives a score.

2. Problem Statement

Traditional mystery games have fixed stories with little replay value. This app generates a new mystery from any user premise and difficulty, combining generative AI, logical reasoning, interactive gameplay and dynamic scoring.

3. Target Users
Students who enjoy puzzles
Fans of detective stories
Casual gamers
People interested in interactive AI apps
4. Features
Core (required)
Create a mystery from a premise
Select difficulty (Easy / Medium / Hard)
Generate the mystery with Gemini
Display suspects
Discover clues
Request hints
Accuse a suspect
Calculate score
Reveal the solution only after the accusation
Start a new game
Optional (only if time permits)

Timer, mystery history, leaderboard, sound effects, dark mode, animated detective board, downloadable case report.

5. User Flow

Home -> Create Mystery -> Choose Difficulty -> Gemini generates case -> Investigation Room (discover clues, request hints) -> Accuse a suspect -> Score calculated -> Results -> Play again

6. Tech Stack
Technology	Purpose
React + Vite	Frontend
Tailwind CSS	Styling
React Router, Axios	Navigation and API calls
Node.js + Express	Backend API
MongoDB Atlas + Mongoose	Database
Gemini API (@google/genai)	Mystery generation
Zod	Validation of requests and AI output
Git + GitHub	Version control
Vercel (frontend), Render or similar (backend)	Deployment
7. Assumptions
No account needed to play
Each case has a unique ID
Only the backend can access the Gemini API key
One final accusation per case
Works on desktop and mobile
8. Pages
Path	Page	Purpose
/	Home	Intro and "START INVESTIGATION" button
/create	Create Mystery	Premise input, difficulty, "GENERATE MY CASE" button, loading and error states
/case/:id	Investigation Room	Story, suspect cards, clue board, hint button, progress, score
/case/:id/accuse	Accusation	Select a suspect, confirm, submit
/case/:id/result	Results	Outcome, culprit, explanation, supporting clues, score breakdown, play again
9. Difficulty Rules
Difficulty	Suspects	Clues	Hints	Correct-accusation bonus
Easy	3	5	2	100
Medium	4	7	3	150
Hard	5	9	3	200
10. Scoring (calculated on the backend only)
Correct accusation: bonus from the table above (incorrect = 0)
Each discovered clue: +5
Each hint used: -10
Final score = max(0, bonus + clue points - hint penalties)
Calculated exactly once, when the accusation is accepted
11. Gemini Generation Rules

Gemini must return structured JSON containing: title, story, difficulty, suspects (id, name, role, description, statement), clues (id, description, relevance), hints, solution (culpritId, explanation, supportingClueIds).

Rules:

Exact suspect, clue and hint counts for the chosen difficulty
Fictional content only
All IDs unique
Culprit must be one of the suspects
Supporting clues must exist
Hints must not directly reveal the culprit
The solution must follow logically from the clues

Validation: Zod checks the AI output (fields, types, counts, unique IDs, valid references). Invalid output is retried a limited number of times, then rejected. It is never stored.

12. Data Model (Case)

title, premise, story, difficulty, suspects, clues, hints, solution (private), playerProgress (discoveredClueIds, hintsUsed), accusation (accusedSuspectId, isCorrect), score, status (active / completed), createdAt.

13. API Endpoints
Method	Route	Purpose
POST	/api/cases	Generate and save a mystery
GET	/api/cases/:id	Get public case data and progress
POST	/api/cases/:id/clues/:clueId/discover	Discover a clue (idempotent)
POST	/api/cases/:id/hints	Request next hint
POST	/api/cases/:id/accuse	Submit accusation, complete case
GET	/api/cases/:id/result	Get result (only after completion)
GET	/api/health	Health check

Status codes: 400 invalid request, 404 case not found, 409 case already completed, 502 invalid AI output after retries, 500 unexpected error. Never expose stack traces, keys or database details.

14. Security Rules
The Gemini API key and MongoDB URI live only in backend .env files, never in frontend code or GitHub
Active-case responses must NOT include the culprit ID or solution explanation
The backend decides whether an accusation is correct
The backend calculates the score; never trust a score from the browser
Result endpoint rejects requests before the case is completed
A completed case cannot be modified
CORS allows only the deployed frontend origin
15. Definition of Done
All five pages work on desktop and mobile
Mysteries generate at all three difficulties with correct counts
Clues, hints, accusation and scoring work and are enforced by the backend
Solution is never exposed before the accusation
Code is on GitHub with no secrets, plus README and SPEC.md
Frontend and backend are deployed and a full game can be played on the live site
16. Deadline

2 November 2026, 11:59 PM