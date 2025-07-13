# 🧠 AI-Powered Connect 4 Game

A strategic two-player Connect 4 game powered by **Alpha-Beta Pruning AI**, built using **Next.js**, **Genkit**, and **Tailwind CSS**.

---

## ✅ 1. Prerequisites (Pre-install)

Ensure the following are installed:

- [Node.js (v18+)](https://nodejs.org/)
- npm (comes with Node.js) or [Yarn (optional)](https://classic.yarnpkg.com/en/docs/install/)
- TypeScript (usually included in `devDependencies`)
- Firebase CLI (if using Firebase features):

```bash
To install Yarn (if preferred):

bash
Copy
Edit
npm install -g yarn
📦 2. Install Dependencies
Run this in your project root:

bash
Copy
Edit
npm install
Or, if using Yarn:

bash
Copy
Edit
yarn install
🔧 3. Available Scripts
Command	Description
npm run dev	Start Next.js in dev mode with Turbopack (port 9002)
npm run genkit:dev	Start Genkit AI dev server
npm run genkit:watch	Run Genkit in watch mode for auto reload
npm run build	Build the app for production
npm run start	Start production server
npm run lint	Run ESLint for code linting
npm run typecheck	Check TypeScript types

🚀 4. Running the Project
🛠 Development Mode (Hot Reload)
bash
Copy
Edit
npm run dev
Visit the app at: http://localhost:9002

⚙️ Production Build
bash
Copy
Edit
npm run build   # Build the app
npm run start   # Start server
🧠 Genkit AI (Optional)
If using Genkit:

bash
Copy
Edit
npm run genkit:dev
# or
npm run genkit:watch
🧰 5. Key Libraries & Frameworks Used
Next.js – React-based web framework

Tailwind CSS – Utility-first CSS framework

TypeScript – Type safety

Firebase – Realtime backend services

TanStack Query – Data fetching and caching

Genkit – AI agent toolkit by Google

Radix UI – Accessible, customizable UI primitives

🔐 6. Environment Variables
If Genkit is used, include a .env file with your config:

env
Copy
Edit
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
GOOGLE_AI_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_CONFIG={...}
🎮 How to Play Connect 4?
🎯 Objective
Be the first to connect 4 discs in a row — horizontally, vertically, or diagonally.

🧩 Game Setup
Grid: 7 columns × 6 rows

Two Players:

🟠 Player 1 → Orange discs

🔵 Player 2 → Blue discs

▶️ Gameplay Rules
Players take turns dropping one disc per move.

Discs fall to the lowest empty space in a column.

The first to connect 4 in a row wins.

✅ Win Conditions
➖ Horizontal

⬇️ Vertical

➚ / ➘ Diagonal

⚠️ Draw
If the grid is full and no one connects 4, the game ends in a draw.

🧠 Tips
Control the center column for maximum reach.

Block your opponent’s 3-in-a-row setups.

Create dual threats that force your opponent to choose.

🤖 Algorithm Used: Alpha-Beta Pruning
The AI opponent uses Alpha-Beta Pruning, an optimization of the Minimax algorithm, to:

Efficiently explore the game tree

Avoid evaluating unnecessary branches

Make intelligent and fast move decisions

Time Complexity:
Best Case: O(b<sup>m/2</sup>)

Worst Case: O(b<sup>m</sup>)
(where b = branching factor, m = max depth)

