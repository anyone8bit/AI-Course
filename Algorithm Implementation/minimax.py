def minimax(depth, index, maximizingPlayer, values):
    # Base case: leaf node reached
    if depth == 4:
        return values[index]

    if maximizingPlayer:
        best = float('-inf')
        # Recur for left and right children
        for i in range(2):
            val = minimax(depth + 1, index * 2 + i, False, values)
            best = max(best, val)
        return best
    else:
        best = float('inf')
        # Recur for left and right children
        for i in range(2):
            val = minimax(depth + 1, index * 2 + i, True, values)
            best = min(best, val)
        return best

# Driver code
values = [3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16]
print("The optimal value is:", minimax(0, 0, True, values))
