1. Prerequisites (Pre-install)
   Ensure you have the following installed:

Node.js (v18 or later recommended)

Download: https://nodejs.org/

npm (comes with Node.js) or Yarn (optional)

Install Yarn:

bash
npm install -g yarn
TypeScript (optional, since it's included in devDependencies)

Firebase CLI (if using Firebase features)

bash
npm install -g firebase-tools 2. Install Dependencies
Run this command in the project root directory:

bash
npm install
or (if using Yarn):

bash
yarn install 3. Available Scripts (from package.json)
Command Description
npm run dev Starts Next.js in dev mode with Turbopack (port 9002)
npm run genkit:dev Starts Genkit AI dev server
npm run genkit:watch Starts Genkit in watch mode
npm run build Builds the app for production
npm run start Runs the production build
npm run lint Runs ESLint for code linting
npm run typecheck Checks TypeScript types 4. Running the Project
Development Mode (Hot Reload)
bash
npm run dev
App runs at: http://localhost:9002

Production Build
bash
npm run build # Build first
npm run start # Then start the server
Genkit AI (Optional)
If using Genkit for AI features:

bash
npm run genkit:dev

# or

npm run genkit:watch 5. Key Libraries/Frameworks Used
Next.js (React framework)

Tailwind CSS (Styling)

TypeScript (Type checking)

Firebase (Backend services)

TanStack Query (Data fetching)

Genkit (AI toolkit by Google)

Radix UI (Accessible UI components)

6. Environment Variables (.env)
   If the project uses Genkit, ensure you have a .env file with required keys (e.g., NEXT_PUBLIC_FIREBASE_CONFIG, GOOGLE_AI_API_KEY).

Example .env:

env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
Troubleshooting
If npm install fails, try:

bash
rm -rf node_modules package-lock.json
npm install
For Genkit errors, ensure you have valid Google AI API keys.

HOW TO PLAY THE GAME?
🎯 Objective
Be the first player to get 4 discs in a row — either vertically, horizontally, or diagonally.

🧩 Game Setup
Grid: 7 columns × 6 rows

2 Players:

🟠 Player 1 → Orange discs

🔵 Player 2 → Blue discs

The board starts empty.

▶️ How to Play
Players take turns.

On your turn, drop one disc into any of the 7 columns.

The disc falls to the lowest available space in that column.

The first player to connect 4 of their own discs in a line wins!

✅ How to Win
Get 4 of your own discs in a row:

➖ Horizontally

⬇️ Vertically

➚ or ➘ Diagonally

⚠️ Draw
If the board fills up and no one connects 4, the game is a draw.

🧠 Tips
Try to build multiple threats.

Block your opponent when they have 3 in a row.

Control the center — it gives more possibilities to connect 4.

ALGORITHM USED: ALPHA-BETA
