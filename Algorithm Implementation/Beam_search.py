import heapq

def beam_search(graph, start, goal, heuristic, beam_width):
   
    # Each beam element is a tuple: (f_score, path, current_node, g_score)
    # Initialize beam with the start node
    initial_g = 0
    initial_h = heuristic(start, goal)
    initial_f = initial_g + initial_h
    beam = [(initial_f, [start], start, initial_g)]
    
    while beam:
        next_beam = []
        
        for new_f, path, current_node, g_score in beam:
            if current_node == goal:
                return path  # Found the goal
            
            # Explore neighbors
            for neighbor, cost in graph.get(current_node, []):
                new_g = g_score + cost
                new_h = heuristic(neighbor, goal)
                new_f = new_g + new_h
                new_path = path + [neighbor]
                
                # Add to next beam candidates
                heapq.heappush(next_beam, (new_f, new_path, neighbor, new_g))
        
        # Keep only the top beam_width candidates
        beam = heapq.nsmallest(beam_width, next_beam, key=lambda x: x[0])
    
    return None  # No path found


# Example usage
if __name__ == "__main__":
    # Example graph (directed)
    graph = {
        'A': [('B', 1), ('C', 3)],
        'B': [('D', 2), ('E', 4)],
        'C': [('F', 2)],
        'D': [('G', 1)],
        'E': [('G', 3)],
        'F': [('G', 4)],
        'G': []
    }
    
    # Simple heuristic (straight-line distance or other estimate)
    def heuristic(node, goal):
        # In a real scenario, this would be domain-specific
        # For this simple example, we'll use arbitrary values
        h_values = {
            'A': 5, 'B': 4, 'C': 3,
            'D': 2, 'E': 3, 'F': 2,
            'G': 0
        }
        return h_values[node]
    
    # Run beam search
    path = beam_search(graph, 'A', 'G', heuristic,2)
    print("Founded path:", path)