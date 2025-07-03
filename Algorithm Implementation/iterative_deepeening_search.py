def iterative_deepening_search(graph, start, target):
    depth = 0
    while True:
        print(f"\nTrying depth limit: {depth}")
        found = depth_limited_search(graph, start, target, depth)
        if found == target:
            return found
        if found == "Not found at this depth":
            depth += 1
        else:
            return None  # Target not in graph

def depth_limited_search(graph, node, target, depth):
    print(f"Checking node {node} at depth {depth}")
    if node == target:
        return node
    if depth == 0:
        return "Not found at this depth"
    
    for neighbor in graph.get(node, []):
        found = depth_limited_search(graph, neighbor, target, depth - 1)
        if found == target:
            return found
    return "Not found at this depth"

# Example usage
if __name__ == "__main__":
    graph = {
        5: [3, 7],
        7: [8],
        3: [2, 4],
        4: [8],
        8: [],
        2: []
    }
    
    start = 5
    target = 8
    
    result = iterative_deepening_search(graph, start, target)
    if result:
        print(f"\nFound target {result}!")
    else:
        print("\nTarget not found in the graph")