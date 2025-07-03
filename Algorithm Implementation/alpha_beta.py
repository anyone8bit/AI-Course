MAX,MIN = 10000000,-10000000
def minimax(depth, index, maximizingPlayer, values, alpha, beta):
    if depth == 4:
        return values[index]

    if maximizingPlayer:
        optimum = MIN
        for i in range(2):
            val = minimax(depth + 1, index * 2 + i, False, values, alpha, beta)
            optimum = max(optimum, val)
            alpha = max(alpha, optimum)
            if beta <= alpha:
                break
        return optimum
    else:
        optimum = MAX
        for i in range(2):
            val = minimax(depth + 1, index * 2 + i, True, values, alpha, beta)
            optimum = min(optimum, val)
            beta = min(beta, optimum)
            if beta <= alpha:
                break
        return optimum

# Driver code
values = [3,4,2,1,7,8,9,10,2,11,1,12,14,9,13,16]
print("The value is:", minimax(0, 0, True, values, MIN, MAX))
