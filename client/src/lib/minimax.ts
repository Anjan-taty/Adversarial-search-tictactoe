type Player = 'X' | 'O' | '';
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export function checkWinner(board: Board): { winner: Player | 'draw' | null; line?: number[] } {
  // Check for winner
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }

  // Check for draw
  if (!board.includes('')) {
    return { winner: 'draw' };
  }

  // Game still ongoing
  return { winner: null };
}

function getAvailableMoves(board: Board): number[] {
  return board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
}

function minimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
  const result = checkWinner(board);

  // Terminal states
  if (result.winner === 'O') return 10 - depth; // AI wins (prefer faster wins)
  if (result.winner === 'X') return depth - 10; // Human wins (prefer slower losses)
  if (result.winner === 'draw') return 0; // Draw

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    // AI (O) is trying to maximize score
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      board[move] = 'O';
      const eval_ = minimax(board, depth + 1, false, alpha, beta);
      board[move] = '';
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    // Human (X) is trying to minimize score
    let minEval = Infinity;
    for (const move of availableMoves) {
      board[move] = 'X';
      const eval_ = minimax(board, depth + 1, true, alpha, beta);
      board[move] = '';
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}

export function getBestMove(board: Board): number {
  const availableMoves = getAvailableMoves(board);
  
  if (availableMoves.length === 0) return -1;
  
  // If it's the first move and center is available, take it
  if (availableMoves.length === 9 && board[4] === '') {
    return 4;
  }

  let bestMove = -1;
  let bestValue = -Infinity;

  for (const move of availableMoves) {
    board[move] = 'O';
    const moveValue = minimax(board, 0, false, -Infinity, Infinity);
    board[move] = '';

    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }

  return bestMove;
}
