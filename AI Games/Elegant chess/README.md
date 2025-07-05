✅ How to Run the Project
🔹 Step 1: Pre-install Required Software
You need to install the following globally on your system:

Node.js (v18 or above)
Download from Node.js

npm or yarn (Comes with Node.js)

Genkit CLI

bash
Copy
Edit
npm install -g genkit-cli
(Optional but useful) VS Code for editing

🔹 Step 2: Install Dependencies
Run this in the root directory of the project:

bash
Copy
Edit
npm install
🔹 Step 3: Run the Next.js App
To start the development server:

bash
Copy
Edit
npm run dev
This will start the Next.js app on http://localhost:9002

🔹 Step 4: Run Genkit AI Dev Server
For Genkit AI features, you can use:

bash
Copy
Edit
npm run genkit:dev
Or if you want live-reload support:

bash
Copy
Edit
npm run genkit:watch
🔹 Step 5: Other Useful Commands
Build the project for production:

bash
Copy
Edit
npm run build
Start production server (after build):

bash
Copy
Edit
npm run start
Lint check:

bash
Copy
Edit
npm run lint
Type check with TypeScript:

bash
Copy
Edit
npm run typecheck
📦 Key Frameworks & Libraries Used
Tool / Library Purpose
Next.js Web app framework (React-based)
React, React DOM UI library
Genkit AI workflow orchestration
@genkit-ai/googleai Integrate Google AI models
TailwindCSS Utility-first CSS framework
Radix UI Accessible UI components
Zod Schema validation
React Hook Form Form handling
Firebase Backend & Auth
TanStack Query Data fetching
Recharts Charting library
Lucide React Icons
Dotenv Load environment variables

USED ALGORITHM: ALPHA-BETA

♟️ HOW TO PLAY CHESS?
🎯 Objective
The goal is to checkmate your opponent’s king — trap it so it cannot escape capture.

🧩 1. Setup
Chess is played on an 8×8 board with alternating light and dark squares.

Each player starts with 16 pieces:

1 King

1 Queen

2 Rooks

2 Bishops

2 Knights

8 Pawns

White pieces are placed on ranks 1 and 2, black on ranks 7 and 8.

Queen goes on her color (White queen on white square, black queen on black square).

🔁 2. Turn Order
White moves first, then players alternate turns.

🧠 3. How Each Piece Moves
Piece Movement
Pawn Moves forward 1 square. First move can go 2. Captures diagonally.
Rook Moves any number of squares horizontally or vertically.
Bishop Moves any number of squares diagonally.
Knight Moves in an L-shape: 2 in one direction + 1 perpendicular. Can jump over pieces.
Queen Moves like both rook and bishop (any direction).
King Moves 1 square in any direction. Special move: castling.

✨ 4. Special Moves
🏰 Castling
A move between the king and rook (once per game).

King moves 2 squares toward a rook, rook jumps over.

Conditions:

Neither piece has moved before

No pieces in between

King is not in or passing through check

🔄 En Passant
If a pawn moves 2 squares forward from its starting position, and lands beside an opponent’s pawn, the opponent can capture as if it moved 1 square.

Must be done immediately on the next move.

👑 Promotion
If a pawn reaches the farthest rank, it is promoted to any other piece (usually a queen).

⚠️ 5. Check and Checkmate
✅ Check
A king is in check if it is under threat of capture.

You must respond by:

Moving the king

Blocking the check

Capturing the attacking piece

🔒 Checkmate
The king is in check and cannot escape.

Game over — the player delivering checkmate wins.

🔄 6. Draw (Tie) Conditions
Stalemate: A player has no legal moves but isn't in check.

Threefold repetition: Same position occurs 3 times.

50-move rule: No capture or pawn move in 50 consecutive moves.

Insufficient material: Not enough pieces left to checkmate.
