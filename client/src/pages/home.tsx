import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getBestMove, getBestMoveWithTree, checkWinner, TreeNode } from '@/lib/minimax';
import { ScrollArea } from '@/components/ui/scroll-area';

type Player = 'X' | 'O' | '';
type Board = Player[];
type GameStatus = 'playing' | 'won' | 'lost' | 'draw';

export default function Home() {
  const [board, setBoard] = useState<Board>(Array(9).fill(''));
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [computerGoesFirst, setComputerGoesFirst] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [decisionTree, setDecisionTree] = useState<TreeNode | null>(null);
  const [animatingPath, setAnimatingPath] = useState<number[]>([]);
  const [showTreeView, setShowTreeView] = useState(false);

  useEffect(() => {
    // Check for game end after each move
    const result = checkWinner(board);
    
    if (result.winner === 'X') {
      setGameStatus('lost');
      setWinningLine(result.line || []);
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
    } else if (result.winner === 'O') {
      setGameStatus('won');
      setWinningLine(result.line || []);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
    } else if (result.winner === 'draw') {
      setGameStatus('draw');
      setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  }, [board]);

  useEffect(() => {
    // Computer's turn
    if (isComputerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const result = getBestMoveWithTree([...board], 'X');
        if (result.move !== -1) {
          setDecisionTree(result.tree);
          
          // Animate the best path
          const path: number[] = [];
          let current: TreeNode | undefined = result.tree.bestChild;
          while (current) {
            path.push(current.move);
            current = current.bestChild;
          }
          setAnimatingPath(path);
          
          // Make the move after showing the tree
          setTimeout(() => {
            const newBoard = [...board];
            newBoard[result.move] = 'X';
            setBoard(newBoard);
            setIsComputerTurn(false);
          }, 1000);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isComputerTurn, board, gameStatus]);

  useEffect(() => {
    // Computer goes first if selected
    if (gameStarted && computerGoesFirst && board.every(cell => cell === '')) {
      setIsComputerTurn(true);
    }
  }, [gameStarted, computerGoesFirst, board]);

  const handleCellClick = (index: number) => {
    if (board[index] !== '' || gameStatus !== 'playing' || isComputerTurn) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'O';
    setBoard(newBoard);
    setIsComputerTurn(true);
  };

  const startGame = (computerFirst: boolean) => {
    setComputerGoesFirst(computerFirst);
    setGameStarted(true);
    setBoard(Array(9).fill(''));
    setGameStatus('playing');
    setWinningLine([]);
    setIsComputerTurn(false);
  };

  const resetGame = () => {
    setGameStarted(false);
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
    return 'Your turn! Place O';
  };

  const renderMiniBoard = (boardState: Board, size: 'small' | 'tiny' = 'small') => {
    const cellSize = size === 'small' ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs';
    return (
      <div className={`grid grid-cols-3 gap-1`}>
        {boardState.map((cell, idx) => (
          <div
            key={idx}
            className={`${cellSize} bg-muted rounded flex items-center justify-center font-bold border border-border`}
            style={{
              color: cell === 'X' ? 'var(--player-x)' : cell === 'O' ? 'var(--player-o)' : 'transparent'
            }}
          >
            {cell || ''}
          </div>
        ))}
      </div>
    );
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0, isOnBestPath: boolean = false): JSX.Element => {
    const isBest = isOnBestPath;
    const maxDepth = 3; // Limit depth to avoid too large tree
    
    if (depth > maxDepth) return <></>;

    return (
      <div className="ml-4 mt-2">
        <div className={`flex items-start gap-2 p-2 rounded border ${isBest ? 'border-primary bg-primary/10' : 'border-border'}`}>
          <div className="flex-shrink-0">
            {renderMiniBoard(node.board, 'tiny')}
          </div>
          <div className="text-xs">
            <div>Move: {node.move >= 0 ? node.move : 'Root'}</div>
            <div>Score: {node.score}</div>
            <div>Type: {node.isMaximizing ? 'MAX' : 'MIN'}</div>
          </div>
        </div>
        {node.children.length > 0 && depth < maxDepth && (
          <div className="ml-2 border-l-2 border-muted pl-2">
            {node.children.map((child, idx) => (
              <div key={idx}>
                {renderTreeNode(child, depth + 1, isBest && child === node.bestChild)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
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

        {/* First Player Selection */}
        {!gameStarted && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-center mb-4">Who goes first?</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => startGame(false)}
                  className="h-20"
                  data-testid="button-player-first"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">👤</div>
                    <div>You (O)</div>
                  </div>
                </Button>
                <Button 
                  onClick={() => startGame(true)}
                  className="h-20"
                  data-testid="button-computer-first"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🤖</div>
                    <div>Computer (X)</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player Info and Game Board - Only show after game started */}
        {gameStarted && (
          <>
            {/* Player Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl font-bold mb-2" style={{ color: 'var(--player-x)' }}>X</div>
                  <p className="text-sm text-muted-foreground">Computer (AI)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl font-bold mb-2" style={{ color: 'var(--player-o)' }}>O</div>
                  <p className="text-sm text-muted-foreground">You</p>
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
              {decisionTree && (
                <Button 
                  onClick={() => setShowTreeView(!showTreeView)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-toggle-tree"
                >
                  {showTreeView ? 'Hide' : 'Show'} Decision Tree
                </Button>
              )}
            </div>

            {/* Minimax Decision Tree Visualization */}
            {showTreeView && decisionTree && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">AI Decision Tree (Minimax Algorithm)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This shows all possible moves the computer evaluated. The highlighted path is the one it chose.
                  </p>
                  <ScrollArea className="h-[600px] w-full">
                    {renderTreeNode(decisionTree, 0, true)}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

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
          </>
        )}
      </div>
    </div>
  );
}
