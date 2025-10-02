import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getBestMove, checkWinner } from '@/lib/minimax';

type Player = 'X' | 'O' | '';
type Board = Player[];
type GameStatus = 'playing' | 'won' | 'lost' | 'draw';

export default function Home() {
  const [board, setBoard] = useState<Board>(Array(9).fill(''));
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  useEffect(() => {
    // Check for game end after each move
    const result = checkWinner(board);
    
    if (result.winner === 'X') {
      setGameStatus('won');
      setWinningLine(result.line || []);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
    } else if (result.winner === 'O') {
      setGameStatus('lost');
      setWinningLine(result.line || []);
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
    } else if (result.winner === 'draw') {
      setGameStatus('draw');
      setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  }, [board]);

  useEffect(() => {
    // Computer's turn
    if (isComputerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...board]);
        if (bestMove !== -1) {
          const newBoard = [...board];
          newBoard[bestMove] = 'O';
          setBoard(newBoard);
          setIsComputerTurn(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isComputerTurn, board, gameStatus]);

  const handleCellClick = (index: number) => {
    if (board[index] !== '' || gameStatus !== 'playing' || isComputerTurn) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsComputerTurn(true);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setGameStatus('playing');
    setWinningLine([]);
    setIsComputerTurn(false);
  };

  const getStatusMessage = () => {
    if (gameStatus === 'won') return '🎉 You Win!';
    if (gameStatus === 'lost') return '😔 Computer Wins!';
    if (gameStatus === 'draw') return '🤝 It\'s a Draw!';
    if (isComputerTurn) return 'Computer is thinking...';
    return 'Your turn! Place X';
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Game Header */}
        <Card className="mb-6 fade-in">
          <CardContent className="pt-6 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">Tic Tac Toe</h1>
            <p className="text-muted-foreground">Challenge the AI with perfect strategy</p>
          </CardContent>
        </Card>

        {/* Player Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: 'var(--player-x)' }}>X</div>
              <p className="text-sm text-muted-foreground">You</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: 'var(--player-o)' }}>O</div>
              <p className="text-sm text-muted-foreground">Computer (AI)</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Status */}
        <Card className="mb-6">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-semibold" data-testid="status-message">
              {getStatusMessage()}
            </p>
          </CardContent>
        </Card>

        {/* Game Board */}
        <Card className="mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto" data-testid="game-board">
              {board.map((cell, index) => (
                <button
                  key={index}
                  data-testid={`cell-${index}`}
                  onClick={() => handleCellClick(index)}
                  disabled={cell !== '' || gameStatus !== 'playing' || isComputerTurn}
                  className={`
                    aspect-square bg-muted rounded-lg flex items-center justify-center 
                    text-6xl font-bold border-2 border-border transition-all
                    ${cell === '' && gameStatus === 'playing' && !isComputerTurn ? 'hover:border-primary hover:bg-card cursor-pointer game-box-hover' : ''}
                    ${cell !== '' ? 'filled' : ''}
                    ${winningLine.includes(index) ? 'winning' : ''}
                  `}
                  style={{
                    color: cell === 'X' ? 'var(--player-x)' : cell === 'O' ? 'var(--player-o)' : 'transparent'
                  }}
                >
                  {cell}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={resetGame}
            className="flex-1"
            data-testid="button-reset"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Game
          </Button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="text-wins">{stats.wins}</p>
              <p className="text-sm text-muted-foreground">Wins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="text-losses">{stats.losses}</p>
              <p className="text-sm text-muted-foreground">Losses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="text-draws">{stats.draws}</p>
              <p className="text-sm text-muted-foreground">Draws</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
