import React, { useMemo, useState } from 'react';

const SIZE = 5;
const CENTER_START = 1;
const CENTER_END = 3;

type Cell = 'X' | 'O' | null;
type Board = Cell[][];
type Screen = 'home' | 'game';

function createBoard(): Board {
  return Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null));
}

function isCenterCell(row: number, col: number): boolean {
  return row >= CENTER_START && row <= CENTER_END && col >= CENTER_START && col <= CENTER_END;
}

function checkWin(board: Board, player: 'X' | 'O'): boolean {
  const directions: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] !== player) continue;

      for (const [dr, dc] of directions) {
        let streak = true;

        for (let step = 1; step < 3; step++) {
          const nextRow = row + dr * step;
          const nextCol = col + dc * step;

          if (
            nextRow < 0 ||
            nextRow >= SIZE ||
            nextCol < 0 ||
            nextCol >= SIZE ||
            board[nextRow][nextCol] !== player
          ) {
            streak = false;
            break;
          }
        }

        if (streak) return true;
      }
    }
  }

  return false;
}

function getBotMove(board: Board): [number, number] | null {
  const choices: [number, number][] = [];

  for (let row = CENTER_START; row <= CENTER_END; row++) {
    for (let col = CENTER_START; col <= CENTER_END; col++) {
      if (board[row][col] === null) {
        choices.push([row, col]);
      }
    }
  }

  if (choices.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

function getEmptyCount(board: Board): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === null) count += 1;
    }
  }
  return count;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [board, setBoard] = useState<Board>(createBoard());
  const [status, setStatus] = useState('Birthday privileges are active. You can place X anywhere.');
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const [score, setScore] = useState({ player: 0, bot: 0 });

  const filledCount = useMemo(() => SIZE * SIZE - getEmptyCount(board), [board]);

  function resetBoard() {
    setBoard(createBoard());
    setWinner(null);
    setStatus('Birthday privileges are active. You can place X anywhere.');
  }

  function goToGame() {
    setScreen('game');
  }

  function goHome() {
    setScreen('home');
  }

  function handleCellClick(row: number, col: number) {
    if (screen !== 'game') return;
    if (winner) return;
    if (board[row][col] !== null) return;

    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = 'X';

    if (checkWin(nextBoard, 'X')) {
      setBoard(nextBoard);
      setWinner('player');
      setScore((current) => ({ ...current, player: current.player + 1 }));
      setStatus('You found a line that should not exist. Happy Birthday.');
      return;
    }

    const botMove = getBotMove(nextBoard);

    if (!botMove) {
      setBoard(nextBoard);
      setStatus('Draw. The bot is confused by your reality-warping powers.');
      return;
    }

    const [botRow, botCol] = botMove;
    nextBoard[botRow][botCol] = 'O';

    if (checkWin(nextBoard, 'O')) {
      setBoard(nextBoard);
      setWinner('bot');
      setScore((current) => ({ ...current, bot: current.bot + 1 }));
      setStatus('The bot won somehow. This will be patched in a future update.');
      return;
    }

    setBoard(nextBoard);
    setStatus('Still your universe. Keep bending the board.');
  }

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 45%, #f5f3ff 100%)',
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
    },
    shell: {
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'grid',
      gap: '20px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px',
      flexWrap: 'wrap',
    },
    badges: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '12px',
    },
    badgePink: {
      background: '#ffe4e6',
      color: '#be123c',
      padding: '6px 12px',
      borderRadius: '999px',
      fontSize: '13px',
      fontWeight: 'bold',
    },
    badgeOutline: {
      border: '1px solid #cbd5e1',
      color: '#334155',
      padding: '6px 12px',
      borderRadius: '999px',
      fontSize: '13px',
      fontWeight: 'bold',
      background: 'white',
    },
    title: {
      fontSize: 'clamp(32px, 5vw, 52px)',
      margin: '0 0 8px 0',
    },
    subtitle: {
      margin: 0,
      color: '#475569',
      maxWidth: '700px',
      lineHeight: 1.5,
    },
    buttonRow: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
    },
    buttonPrimary: {
      background: '#111827',
      color: 'white',
      border: 'none',
      padding: '12px 18px',
      borderRadius: '16px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    buttonSecondary: {
      background: 'white',
      color: '#111827',
      border: '1px solid #cbd5e1',
      padding: '12px 18px',
      borderRadius: '16px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px',
    },
    card: {
      background: 'rgba(255,255,255,0.9)',
      borderRadius: '28px',
      padding: '24px',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
      border: '1px solid rgba(255,255,255,0.9)',
    },
    sectionTitle: {
      margin: '0 0 6px 0',
      fontSize: '28px',
    },
    sectionText: {
      margin: 0,
      color: '#64748b',
      lineHeight: 1.5,
    },
    hero: {
      background: 'linear-gradient(90deg, #ffe4e6 0%, #ede9fe 100%)',
      borderRadius: '24px',
      padding: '24px',
      marginTop: '18px',
    },
    heroTitle: {
      margin: '0 0 10px 0',
      fontSize: '24px',
    },
    heroText: {
      margin: 0,
      color: '#334155',
      lineHeight: 1.6,
    },
    miniGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px',
      marginTop: '16px',
    },
    miniCard: {
      background: '#ffffff',
      borderRadius: '22px',
      padding: '18px',
      border: '2px dashed #e2e8f0',
    },
    miniTitle: {
      margin: '0 0 8px 0',
      fontSize: '18px',
    },
    statusBox: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: '16px',
    },
    scoreboard: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    scorePillPink: {
      background: '#ffe4e6',
      color: '#be123c',
      borderRadius: '999px',
      padding: '8px 14px',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    scorePillGray: {
      background: '#e2e8f0',
      color: '#334155',
      borderRadius: '999px',
      padding: '8px 14px',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    boardWrap: {
      maxWidth: '430px',
      margin: '0 auto',
    },
    board: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '8px',
      background: '#e2e8f0',
      padding: '12px',
      borderRadius: '24px',
    },
    cell: {
      aspectRatio: '1 / 1',
      borderRadius: '18px',
      border: 'none',
      fontSize: '28px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    footerText: {
      textAlign: 'center',
      color: '#64748b',
      fontSize: '13px',
      marginTop: '12px',
      lineHeight: 1.5,
    },
    sideBox: {
      background: '#f8fafc',
      borderRadius: '20px',
      padding: '16px',
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.badges}>
              <span style={styles.badgePink}>Birthday Arcade v1</span>
              <span style={styles.badgeOutline}>Rigged in your favor</span>
            </div>
            <h1 style={styles.title}>A tiny birthday arcade</h1>
            <p style={styles.subtitle}>
              One playable game now, more chaos later. This version is built to be easy to finish,
              easy to test, and easy to expand later.
            </p>
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.buttonSecondary} onClick={goHome}>Home</button>
            <button style={styles.buttonPrimary} onClick={goToGame}>Play Now</button>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Rigged Tic-Tac-Toe</h2>
            <p style={styles.sectionText}>
              The center 3x3 is the normal board. The birthday player can place pieces anywhere on the full 5x5 board.
            </p>

            {screen === 'home' ? (
              <>
                <div style={styles.hero}>
                  <h3 style={styles.heroTitle}>Birthday privileges unlocked</h3>
                  <p style={styles.heroText}>
                    In this totally fair version of tic-tac-toe, you are allowed to place your moves outside the box.
                    The bot is limited to the normal 3x3 area because birthdays outrank game balance.
                  </p>
                  <div style={{ ...styles.buttonRow, marginTop: '16px' }}>
                    <button style={styles.buttonPrimary} onClick={goToGame}>Start Game</button>
                    <button style={styles.buttonSecondary} onClick={resetBoard}>Reset Board</button>
                  </div>
                </div>

                <div style={styles.miniGrid}>
                  <div style={styles.miniCard}>
                    <h4 style={styles.miniTitle}>🧠 Memory Quiz</h4>
                    <p style={styles.sectionText}>Work in progress. Future expansion slot.</p>
                  </div>
                  <div style={styles.miniCard}>
                    <h4 style={styles.miniTitle}>🎡 Sweet Fortune Wheel</h4>
                    <p style={styles.sectionText}>Work in progress. Future expansion slot.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.statusBox}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Status</div>
                    <div style={{ fontWeight: 'bold', lineHeight: 1.5 }}>{status}</div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Moves played: {filledCount}</div>
                  </div>
                  <div style={styles.scoreboard}>
                    <span style={styles.scorePillPink}>You: {score.player}</span>
                    <span style={styles.scorePillGray}>Bot: {score.bot}</span>
                  </div>
                </div>

                <div style={styles.boardWrap}>
                  <div style={styles.board}>
                    {board.map((boardRow, rowIndex) =>
                      boardRow.map((cell, colIndex) => {
                        const center = isCenterCell(rowIndex, colIndex);
                        const background = center ? '#ffffff' : '#fff1f2';
                        const color = cell === 'X' ? '#e11d48' : cell === 'O' ? '#334155' : '#cbd5e1';

                        return (
                          <button
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            style={{
                              ...styles.cell,
                              background,
                              color,
                              boxShadow: center
                                ? 'inset 0 0 0 2px #cbd5e1'
                                : 'inset 0 0 0 2px #fecdd3',
                            }}
                          >
                            {cell || '·'}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div style={styles.footerText}>
                    Gray center = normal board. Pink border = birthday-only bonus zone.
                  </div>
                </div>

                <div style={{ ...styles.buttonRow, justifyContent: 'center', marginTop: '18px' }}>
                  <button style={styles.buttonSecondary} onClick={resetBoard}>Reset</button>
                  <button style={styles.buttonPrimary} onClick={goHome}>Back to Arcade</button>
                </div>
              </>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '6px' }}>Why this works</h3>
            <p style={styles.sectionText}>A simple gift that already feels like a tiny product.</p>

            <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
              <div style={styles.sideBox}>
                <strong>Fast to finish</strong>
                <div>One working game + two placeholders already creates the arcade feeling.</div>
              </div>
              <div style={styles.sideBox}>
                <strong>Easy to share</strong>
                <div>Perfect for sending as a link later. No installer required.</div>
              </div>
              <div style={styles.sideBox}>
                <strong>Easy to expand</strong>
                <div>Add future games without redesigning the whole project.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}