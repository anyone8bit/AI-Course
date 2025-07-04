
1. Bidirectional Search
Working: Runs two simultaneous searches — one forward from the start and one backward from the goal — until they meet.

Time Complexity: O(b^(d/2))

2. Depth-Limited Search (DLS)
Working: Performs DFS but stops when a predefined depth limit is reached.

Time Complexity: O(b^l) (where l is the depth limit)

3. Best-First Search
Working: Expands the node with the lowest heuristic value h(n) using a priority queue.

Time Complexity: O(b^d)

4. Breadth-First Search (BFS)
Working: Explores all nodes at current depth before moving to the next level.

Time Complexity: O(b^d)

5. Depth-First Search (DFS)
Working: Explores as deep as possible along a path before backtracking.

Time Complexity: O(b^d)

6. Beam Search
Working: Similar to Best-First Search, but only keeps the top k best nodes at each level (fixed beam width).

Time Complexity: O(k * d) (approximate; depends on beam width and depth)

7. Minimax Algorithm
Working: Constructs a game tree, evaluates leaf nodes, and backs up values using min/max decisions at each level.

Time Complexity: O(b^m) (where m is the depth of the game tree)

8. Alpha-Beta Pruning
Working: Improves Minimax by pruning branches that can't influence the final decision using alpha (max bound) and beta (min bound).

Time Complexity: O(b^(m/2)) (best case), O(b^m) (worst case)

9. Iterative Deepening Search (IDS)
Working: Repeatedly runs DLS with increasing depth limits until the goal is found.

Time Complexity: O(b^d)
