from collections import deque

def bfs(graph, start_node):
    """
    Performs a Breadth-First Search (BFS) on a given graph.

    Args:
        graph (dict): An adjacency list representation of the graph,
                      where keys are nodes and values are lists of their neighbors.
        start_node: The node from which to start the BFS traversal.

    Returns:
        list: A list of nodes in the order they were visited during the BFS.
    """
    visited = set()  # To keep track of visited nodes to avoid cycles and redundant processing
    queue = deque([start_node])  # Initialize the queue with the starting node
    bfs_traversal_order = []

    visited.add(start_node)  # Mark the start node as visited

    while queue:
        current_node = queue.popleft()  # Dequeue the front node
        bfs_traversal_order.append(current_node)  # Add to the traversal order

        # Explore neighbors of the current node
        for neighbor in graph.get(current_node, []):  # Use .get() to handle nodes with no neighbors
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return bfs_traversal_order

# Example Usage:
if __name__ == "__main__":
    # Representing a graph using an adjacency list
    graph_example = {
        'A': ['B', 'C'],
        'B': ['A', 'D', 'E'],
        'C': ['A', 'F'],
        'D': ['B'],
        'E': ['B', 'F'],
        'F': ['C', 'E']
    }

    print("BFS traversal starting from 'A':")
    traversal_result = bfs(graph_example, 'A')
    print(traversal_result)
