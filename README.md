🚀 Quick Start Guide

1. Prerequisites
   Ensure you have installed:

Node.js (v18+ recommended)

Download: nodejs.org

npm (comes with Node.js) or Yarn (optional)

bash
npm install -g yarn

bash
npm install 2. Install Dependencies
Run in the project root:

bash
npm install

# or

yarn install 3. Available Scripts
Command Description
npm run dev Starts Next.js dev server (Turbopack) on http://localhost:9002
npm run genkit:dev Starts Genkit AI dev server
npm run genkit:watch Runs Genkit in watch mode
npm run build Builds for production
npm run start Runs the production build
npm run lint Runs ESLint
npm run typecheck Checks TypeScript types 4. Running the Project
Development Mode
bash
npm run dev
Runs at: http://localhost:9002

Production Build
bash
npm run build # Build optimized version
npm run start # Start production server
Genkit AI (Optional)
If using AI features:

bash
npm run genkit:dev

# or

npm run genkit:watch 5. Key Libraries & Frameworks
Category Libraries
Core Next.js, React, TypeScript
Styling Tailwind CSS, Radix UI, Lucide Icons
State & Forms TanStack Query, React Hook Form, Zod
AI Genkit, Google AI
Charts Recharts 6. Environment Setup (.env)
If the project uses Genkit, create a .env file:

env

# Genkit AI (if used)

GOOGLE_AI_API_KEY=your_google_ai_key 7. Troubleshooting
Installation Issues?
Delete node_modules and reinstall:

bash
rm -rf node_modules package-lock.json
npm install

Run:

bash
Genkit Not Working?
Verify GOOGLE_AI_API_KEY is set.

Check Genkit docs: genkit.dev

HOW TO PLAY THE GAME?
🎯 Objective
Be the first player to get three of your marks in a row — horizontally, vertically, or diagonally.

🧩 Game Setup
The game is played on a 3×3 grid (3 rows and 3 columns).

There are 2 players:

❌ Player 1 uses "X"

⭕ Player 2 uses "O"

▶️ How to Play
Player X always goes first.

Players take turns placing their mark (X or O) in any empty square.

The game continues until:

One player gets 3 marks in a row (wins), or

All 9 squares are filled (result is a draw)

✅ How to Win
You win if you place 3 of your marks in a row:

➖ Horizontally (e.g., top row)

⬇️ Vertically (e.g., first column)

➚ or ➘ Diagonally

⚠️ Game Draw
If all squares are filled and no player has 3 in a row, the game is a draw (also called a tie or “cat’s game”).

🧠 Tips & Strategies
Take the center if available — it gives more winning options.

Block your opponent if they are about to win.

If you go first and take a corner, you can often force a win.

ALGORTHIM USED: MINI-MAX
