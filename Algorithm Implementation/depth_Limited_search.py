def DFS(v, goal, limit, adj, path):
    # Add the current node to the path
    path.append(v)

    # Check if the current node is the goal
    if v == goal:
        return path  # Return the path to the goal

    # If we haven't reached the depth limit
    if limit > 0:
        for nbr in adj.get(v, []):  # Get neighbors of the current node
            result = DFS(nbr, goal, limit - 1, adj, path)
            if result is not None:  # If the goal was found in the recursive call
                return result  # Return the path found

    # If the goal was not found, remove the current node from the path and return None
    path.pop()
    return None

def main():
    n = int(input("Enter no of nodes in graph: "))
    adj = {}
    edge = int(input("Enter no of edges: "))
    for _ in range(edge):
        x, y = map(int, input().split())
        if x not in adj:
            adj[x] = []
        adj[x].append(y)
    
    goal = int(input("Enter the goal node: "))
    limit = int(input("Enter depth limit: "))

    path = []  # Initialize an empty path
    res = DFS(0, goal, limit, adj, path)

    if res is None:
        print("Goal node not found!")
    else:
        print("Goal node found & Path to goal:", res)

if __name__ == "__main__":
    main()