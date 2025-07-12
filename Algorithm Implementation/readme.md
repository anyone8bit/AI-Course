## 🧠 Algorithms: Working, Time Complexity & Applications

| # | Algorithm                  | Working Description                                                                 | Time Complexity                 | Applications |
|---|----------------------------|-------------------------------------------------------------------------------------|----------------------------------|--------------|
| 1 | **Bidirectional Search**   | Runs two simultaneous searches — forward from start and backward from goal — until they meet. | O(b<sup>d/2</sup>)              | Pathfinding in maps, robot navigation, route planning |
| 2 | **Depth-Limited Search (DLS)** | Performs DFS but stops when a predefined depth limit is reached.                   | O(b<sup>l</sup>) *(l = limit)* | Game tree exploration, puzzles with known depth |
| 3 | **Best-First Search**      | Expands the node with the lowest heuristic value *h(n)* using a priority queue.     | O(b<sup>d</sup>)                | Route optimization, AI planning, decision systems |
| 4 | **Breadth-First Search (BFS)** | Explores all nodes at the current depth before moving to the next level.           | O(b<sup>d</sup>)                | Shortest path in unweighted graphs, web crawlers, peer-to-peer networks |
| 5 | **Depth-First Search (DFS)** | Explores as deep as possible along a path before backtracking.                     | O(b<sup>d</sup>)                | Maze solving, topological sorting, scheduling |
| 6 | **Beam Search**            | Like Best-First Search but only keeps top *k* best nodes at each level.            | O(k × d) *(approximate)*        | Speech recognition, machine translation, NLP decoding |
| 7 | **Minimax Algorithm**      | Constructs a game tree, evaluates leaf nodes, and backs up values using min/max.   | O(b<sup>m</sup>) *(m = depth)* | Two-player games (e.g., Tic Tac Toe, Chess, Connect 4) |
| 8 | **Alpha-Beta Pruning**     | Optimized Minimax by pruning branches that don't affect final decision.            | O(b<sup>m/2</sup>) *(best)*<br>O(b<sup>m</sup>) *(worst)* | Efficient game AI, Chess engines, strategic decision-making |
| 9 | **Iterative Deepening Search (IDS)** | Repeatedly applies DLS with increasing depth limits until the goal is found.    | O(b<sup>d</sup>)                | Memory-efficient pathfinding, hybrid of DFS and BFS in AI agents |
