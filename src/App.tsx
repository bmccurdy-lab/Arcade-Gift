// Birthday Arcade App.tsx v4.4a
// Fixes from v4.4:
// - Restores working render (removed bad LIVE_NOW_BODY reference)
// - Keeps requested bullet under Live now section
// - Removes the "Made for Likhitha" line under the title and leaves subtle spacing instead
// - Keeps v4.3 copy and v4.2 gameplay logic intact

import React, { useEffect, useMemo, useState } from 'react';

const SIZE = 5;
const CENTER_START = 1;
const CENTER_END = 3;

// Core personalization constants
const HER_NAME = 'Likhitha';
const ARCADE_TITLE = "Likki's World";
const PERSONAL_NOTE =
  "Built with love and based around realistic properties of the universe. It's Likhitha's world, we are all just living in it!";
const BUILD_LABEL = 'v1.0 2026 Birthday Build';
const FOOTER_NOTE =
  'More games and tiny surprises coming soon. Please let me know of any requests (looking for a challenge).';

// Main copy constants
const HEADER_SUBTITLE = 'One playable game now, more chaos later.';
const HOME_HERO_TITLE = `Behold the power of ${HER_NAME}!`;
const HOME_HERO_BODY = `${HER_NAME} does not simply play tic-tac-toe. She bends the shape of the board, changes what counts as possible, and somehow makes breaking the rules feel completely correct.`;

const SELECT_TITLE = 'Choose your character';
const SELECT_BODY = 'Pick who is playing this round. The rules shift depending on who gets the controller.';

const LIKHITHA_OPTION_TITLE = `Play as ${HER_NAME}`;
const LIKHITHA_OPTION_BODY = `Full 5x5 board. Full birthday privileges. A world built exactly the way ${HER_NAME} deserves.`;
const CUSTOM_OPTION_TITLE = 'Play as someone else';
const CUSTOM_OPTION_BODY = `Visible board is classic 3x3 only. Opponent becomes ${HER_NAME} Bot.`;

const SPECIAL_PLAYER_WIN_TITLE = `${HER_NAME} Rewrites Reality`;
const SPECIAL_PLAYER_WIN_BODY = `${HER_NAME} just reminded the universe whose world this really is.`;
const STANDARD_PLAYER_WIN_BODY = 'A clean classic win — graceful, clever, and impossible not to admire.';
const SPECIAL_BOT_WIN_TITLE = `${HER_NAME} Bot Bends Reality`;
const SPECIAL_BOT_WIN_BODY = `${HER_NAME} Bot followed the classic rules right up until the final moment... and then remembered this is still ${HER_NAME}'s world.`;

const CLASSIC_BOARD_FOOTER = `Classic mode shows the center 3x3 only. But if ${HER_NAME} decides the rules need help, reality may quietly adjust.`;
const ARCADE_STATUS_TITLE = 'A few more things';
const ARCADE_STATUS_SUBTITLE = `A tiny birthday arcade made with love, mischief, and a fully justified bias toward ${HER_NAME}.`;
const LIVE_NOW_TITLE = 'Live now';
const LIVE_NOW_ITEMS = ['Rigged Tic-Tac-Toe game.'];
const COMING_SOON_TITLE = 'Coming soon';
const COMING_SOON_ITEMS = ['Memory Quiz', 'Sweet Fortune Wheel', 'Tiny extra surprises'];

type Cell = 'X' | 'O' | null;
type Board = Cell[][];
type Screen = 'home' | 'select' | 'game';
type Mode = 'birthday' | 'classic';
type PendingChoice = 'classic' | null;

type WinnerInfo = {
  winner: 'player' | 'bot';
  cells: [number, number][];
  isBirthdayWin: boolean;
};

type SavedState = {
  mode: Mode;
  playerName: string;
  score: {
    player: number;
    bot: number;
  };
};

const CHEAT_LINES: [number, number][][] = [
  [[0, 0], [1, 1], [2, 2]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 3], [1, 3], [2, 3]],
  [[0, 4], [1, 3], [2, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[3, 0], [3, 1], [3, 2]],
  [[1, 4], [1, 3], [1, 2]],
  [[2, 4], [2, 3], [2, 2]],
  [[3, 4], [3, 3], [3, 2]],
  [[4, 0], [3, 1], [2, 2]],
  [[4, 1], [3, 1], [2, 1]],
  [[4, 2], [3, 2], [2, 2]],
  [[4, 3], [3, 3], [2, 3]],
  [[4, 4], [3, 3], [2, 2]],
];

function createBoard(): Board {
  return Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null));
}

function createClassicBoard(): Board {
  return createBoard();
}

function isCenterCell(row: number, col: number): boolean {
  return row >= CENTER_START && row <= CENTER_END && col >= CENTER_START && col <= CENTER_END;
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

function getCenterEmptyCells(board: Board): [number, number][] {
  const cells: [number, number][] = [];
  for (let row = CENTER_START; row <= CENTER_END; row++) {
    for (let col = CENTER_START; col <= CENTER_END; col++) {
      if (board[row][col] === null) {
        cells.push([row, col]);
      }
    }
  }
  return cells;
}

function checkWinDetailed(board: Board, player: 'X' | 'O'): [number, number][] | null {
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
        const cells: [number, number][] = [[row, col]];
        let valid = true;

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
            valid = false;
            break;
          }

          cells.push([nextRow, nextCol]);
        }

        if (valid) return cells;
      }
    }
  }

  return null;
}

function isBirthdayWin(cells: [number, number][]): boolean {
  return cells.some(([row, col]) => !isCenterCell(row, col));
}

function checkCenterWinner(board: Board, player: 'X' | 'O'): boolean {
  for (let row = CENTER_START; row <= CENTER_END; row++) {
    if (
      board[row][CENTER_START] === player &&
      board[row][CENTER_START + 1] === player &&
      board[row][CENTER_START + 2] === player
    ) {
      return true;
    }
  }

  for (let col = CENTER_START; col <= CENTER_END; col++) {
    if (
      board[CENTER_START][col] === player &&
      board[CENTER_START + 1][col] === player &&
      board[CENTER_START + 2][col] === player
    ) {
      return true;
    }
  }

  if (
    board[CENTER_START][CENTER_START] === player &&
    board[CENTER_START + 1][CENTER_START + 1] === player &&
    board[CENTER_START + 2][CENTER_START + 2] === player
  ) {
    return true;
  }

  if (
    board[CENTER_START][CENTER_START + 2] === player &&
    board[CENTER_START + 1][CENTER_START + 1] === player &&
    board[CENTER_START + 2][CENTER_START] === player
  ) {
    return true;
  }

  return false;
}

function getBirthdayBotMove(board: Board): [number, number] | null {
  const centerEmpties = getCenterEmptyCells(board);

  for (const [row, col] of centerEmpties) {
    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = 'O';
    if (checkWinDetailed(nextBoard, 'O')) return [row, col];
  }

  for (const [row, col] of centerEmpties) {
    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = 'X';
    if (checkWinDetailed(nextBoard, 'X')) return [row, col];
  }

  if (board[2][2] === null) return [2, 2];

  const preferred: [number, number][] = [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
    [1, 2],
    [2, 1],
    [2, 3],
    [3, 2],
  ];

  for (const [row, col] of preferred) {
    if (board[row][col] === null) return [row, col];
  }

  return null;
}

function evaluateClassicBoard(board: Board): number {
  if (checkCenterWinner(board, 'O')) return 10;
  if (checkCenterWinner(board, 'X')) return -10;
  if (getCenterEmptyCells(board).length === 0) return 1;
  return 99;
}

function minimaxClassic(board: Board, isBotTurn: boolean): number {
  const evaluation = evaluateClassicBoard(board);
  if (evaluation !== 99) return evaluation;

  const empties = getCenterEmptyCells(board);

  if (isBotTurn) {
    let bestScore = -Infinity;
    for (const [row, col] of empties) {
      const nextBoard = board.map((boardRow) => [...boardRow]);
      nextBoard[row][col] = 'O';
      const score = minimaxClassic(nextBoard, false);
      if (score > bestScore) bestScore = score;
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const [row, col] of empties) {
    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = 'X';
    const score = minimaxClassic(nextBoard, true);
    if (score < bestScore) bestScore = score;
  }
  return bestScore;
}

function getCheatFutureScore(board: Board): number {
  let ready = 0;
  let future = 0;

  for (const line of CHEAT_LINES) {
    let oCount = 0;
    let xCount = 0;
    let outerEmpty = 0;
    let centerEmpty = 0;

    for (const [row, col] of line) {
      const value = board[row][col];
      if (value === 'O') oCount += 1;
      if (value === 'X') xCount += 1;
      if (value === null && isCenterCell(row, col)) centerEmpty += 1;
      if (value === null && !isCenterCell(row, col)) outerEmpty += 1;
    }

    if (xCount === 0) {
      if (oCount === 2 && outerEmpty === 1) ready += 1;
      if (oCount >= 1 && outerEmpty === 1 && centerEmpty >= 1) future += 1;
    }
  }

  return ready * 100 + future * 10;
}

function getClassicBotCenterMove(board: Board): [number, number] | null {
  const empties = getCenterEmptyCells(board);

  for (const [row, col] of empties) {
    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = 'O';
    if (checkCenterWinner(nextBoard, 'O')) return [row, col];
  }

  for (const [row, col] of empties) {
    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = 'X';
    if (checkCenterWinner(nextBoard, 'X')) return [row, col];
  }

  let bestMove: [number, number] | null = null;
  let bestScore = -Infinity;
  let bestCheatScore = -Infinity;

  for (const [row, col] of empties) {
    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = 'O';
    const score = minimaxClassic(nextBoard, false);
    const cheatScore = getCheatFutureScore(nextBoard);

    if (score > bestScore || (score === bestScore && cheatScore > bestCheatScore)) {
      bestScore = score;
      bestCheatScore = cheatScore;
      bestMove = [row, col];
    }
  }

  return bestMove;
}

function findClassicCheatWin(board: Board): { move: [number, number]; cells: [number, number][] } | null {
  for (const line of CHEAT_LINES) {
    let oCount = 0;
    let xCount = 0;
    let outerEmptyCell: [number, number] | null = null;

    for (const [row, col] of line) {
      const value = board[row][col];
      if (value === 'O') oCount += 1;
      if (value === 'X') xCount += 1;
      if (value === null && !isCenterCell(row, col)) outerEmptyCell = [row, col];
    }

    if (xCount === 0 && oCount === 2 && outerEmptyCell) {
      return { move: outerEmptyCell, cells: line };
    }
  }

  return null;
}

function getResultCopy(
  winnerInfo: WinnerInfo | null,
  playerName: string,
  botName: string
): { title: string; text: string; emoji: string; isSpecial: boolean } | null {
  if (!winnerInfo) return null;

  if (winnerInfo.winner === 'player') {
    if (winnerInfo.isBirthdayWin) {
      return {
        title: SPECIAL_PLAYER_WIN_TITLE,
        text: SPECIAL_PLAYER_WIN_BODY,
        emoji: '🎉 ✨ 🎂 ✨ 🎉',
        isSpecial: true,
      };
    }

    return {
      title: `${playerName} Wins`,
      text: STANDARD_PLAYER_WIN_BODY,
      emoji: '🏆',
      isSpecial: false,
    };
  }

  if (winnerInfo.isBirthdayWin) {
    return {
      title: SPECIAL_BOT_WIN_TITLE,
      text: SPECIAL_BOT_WIN_BODY,
      emoji: '👑 ✨',
      isSpecial: true,
    };
  }

  return {
    title: `${botName} Wins`,
    text: 'Classic result. Solid fundamentals, no hidden dimensions involved.',
    emoji: '🤖',
    isSpecial: false,
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<Mode>('birthday');
  const [playerName, setPlayerName] = useState(HER_NAME);
  const [customNameInput, setCustomNameInput] = useState('');
  const [pendingChoice, setPendingChoice] = useState<PendingChoice>(null);
  const [board, setBoard] = useState<Board>(createBoard());
  const [status, setStatus] = useState(`${HER_NAME}'s birthday privileges are active. You can place X anywhere.`);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);
  const [score, setScore] = useState({ player: 0, bot: 0 });
  const [showNote, setShowNote] = useState(false);

  const botName = mode === 'classic' ? `${HER_NAME} Bot` : 'Bot';
  const filledCount = useMemo(() => SIZE * SIZE - getEmptyCount(board), [board]);
  const resultCopy = getResultCopy(winnerInfo, playerName, botName);
  const revealFullBoard =
    mode === 'birthday' || (mode === 'classic' && winnerInfo?.winner === 'bot' && winnerInfo.isBirthdayWin);

  useEffect(() => {
    const saved = localStorage.getItem('birthdayArcadeStateV4');
    if (!saved) return;

    try {
      const parsed: SavedState = JSON.parse(saved);
      if (
        (parsed.mode === 'birthday' || parsed.mode === 'classic') &&
        typeof parsed.playerName === 'string' &&
        typeof parsed.score?.player === 'number' &&
        typeof parsed.score?.bot === 'number'
      ) {
        setMode(parsed.mode);
        setPlayerName(parsed.playerName);
        setScore(parsed.score);
      }
    } catch {
      // ignore bad local storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('birthdayArcadeStateV4', JSON.stringify({ mode, playerName, score }));
  }, [mode, playerName, score]);

  function resetBoardForCurrentMode() {
    const freshBoard = mode === 'classic' ? createClassicBoard() : createBoard();
    setBoard(freshBoard);
    setWinnerInfo(null);
    setStatus(
      mode === 'classic'
        ? `${botName} is playing it cool... for now.`
        : `${HER_NAME}'s birthday privileges are active. You can place X anywhere.`
    );
  }

  function resetScoreOnly() {
    resetBoardForCurrentMode();
    setScore({ player: 0, bot: 0 });
  }

  function goHome() {
    setScreen('home');
  }

  function goToSelect() {
    setPendingChoice(null);
    setCustomNameInput('');
    setScreen('select');
  }

  function startBirthdayMatch() {
    setMode('birthday');
    setPlayerName(HER_NAME);
    setScore({ player: 0, bot: 0 });
    setBoard(createBoard());
    setWinnerInfo(null);
    setStatus(`${HER_NAME}'s birthday privileges are active. You can place X anywhere.`);
    setScreen('game');
  }

  function startClassicMatch() {
    const trimmedName = customNameInput.trim();
    if (!trimmedName) return;

    setMode('classic');
    setPlayerName(trimmedName);
    setScore({ player: 0, bot: 0 });
    setBoard(createClassicBoard());
    setWinnerInfo(null);
    setStatus(`${HER_NAME} Bot is following the classic rules... probably.`);
    setScreen('game');
  }

  function finishGame(nextBoard: Board, winner: 'player' | 'bot', cells: [number, number][]) {
    setBoard(nextBoard);
    setWinnerInfo({ winner, cells, isBirthdayWin: isBirthdayWin(cells) });
    setScore((current) => ({ ...current, [winner]: current[winner] + 1 }));

    if (winner === 'player') {
      setStatus(
        isBirthdayWin(cells)
          ? `${playerName} found a line that definitely should not exist.`
          : `${playerName} wins the classic way.`
      );
    } else {
      setStatus(
        isBirthdayWin(cells)
          ? `${botName} found a very convenient extra square at the last second.`
          : `${botName} wins the classic way.`
      );
    }
  }

  function handleBotTurn(nextBoard: Board) {
    if (mode === 'classic') {
      const centerEmptyCount = getCenterEmptyCells(nextBoard).length;

      if (centerEmptyCount === 2) {
        const cheat = findClassicCheatWin(nextBoard);
        if (cheat) {
          const [cheatRow, cheatCol] = cheat.move;
          nextBoard[cheatRow][cheatCol] = 'O';
          finishGame(nextBoard, 'bot', cheat.cells);
          return;
        }
      }

      const botMove = getClassicBotCenterMove(nextBoard);
      if (!botMove) {
        setBoard(nextBoard);
        setStatus('Draw. Somehow both sides stayed almost suspiciously reasonable.');
        return;
      }

      const [botRow, botCol] = botMove;
      nextBoard[botRow][botCol] = 'O';

      const botWin = checkWinDetailed(nextBoard, 'O');
      if (botWin) {
        finishGame(nextBoard, 'bot', botWin);
        return;
      }

      setBoard(nextBoard);
      setStatus(`${botName} is still pretending this is a normal game.`);
      return;
    }

    const botMove = getBirthdayBotMove(nextBoard);
    if (!botMove) {
      setBoard(nextBoard);
      setStatus('Draw. The bot is confused by your reality-warping powers.');
      return;
    }

    const [botRow, botCol] = botMove;
    nextBoard[botRow][botCol] = 'O';

    const botWin = checkWinDetailed(nextBoard, 'O');
    if (botWin) {
      finishGame(nextBoard, 'bot', botWin);
      return;
    }

    setBoard(nextBoard);
    setStatus(`Still ${playerName}'s universe. Keep bending the board.`);
  }

  function handleCellClick(row: number, col: number) {
    if (screen !== 'game') return;
    if (winnerInfo) return;
    if (board[row][col] !== null) return;
    if (mode === 'classic' && !isCenterCell(row, col)) return;

    const nextBoard = board.map((boardRow) => [...boardRow]);
    nextBoard[row][col] = 'X';

    const playerWin = checkWinDetailed(nextBoard, 'X');
    if (playerWin) {
      finishGame(nextBoard, 'player', playerWin);
      return;
    }

    handleBotTurn(nextBoard);
  }

  const visibleCells = useMemo(() => {
    if (revealFullBoard) {
      const cells: { row: number; col: number }[] = [];
      for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
          cells.push({ row, col });
        }
      }
      return cells;
    }

    const cells: { row: number; col: number }[] = [];
    for (let row = CENTER_START; row <= CENTER_END; row++) {
      for (let col = CENTER_START; col <= CENTER_END; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  }, [revealFullBoard]);

  const winningCellSet = useMemo(() => {
    const keySet = new Set<string>();
    if (!winnerInfo) return keySet;
    for (const [row, col] of winnerInfo.cells) keySet.add(`${row}-${col}`);
    return keySet;
  }, [winnerInfo]);

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
    headerSpacer: {
      height: '8px',
    },
    subtitle: {
      margin: 0,
      color: '#475569',
      maxWidth: '760px',
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
    buttonSoft: {
      background: '#ffe4e6',
      color: '#9f1239',
      border: 'none',
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
    noteBox: {
      marginTop: '16px',
      padding: '16px',
      borderRadius: '18px',
      background: '#fff7ed',
      color: '#7c2d12',
      lineHeight: 1.6,
      border: '1px solid #fed7aa',
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
    selectGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginTop: '18px',
    },
    selectCard: {
      background: '#ffffff',
      borderRadius: '22px',
      padding: '18px',
      border: '1px solid #e2e8f0',
      display: 'grid',
      gap: '10px',
    },
    input: {
      padding: '12px 14px',
      borderRadius: '14px',
      border: '1px solid #cbd5e1',
      fontSize: '15px',
      outline: 'none',
    },
    helper: {
      color: '#64748b',
      fontSize: '14px',
      lineHeight: 1.5,
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
    resultBoxSpecial: {
      marginBottom: '18px',
      padding: '18px',
      borderRadius: '22px',
      background: 'linear-gradient(90deg, #fdf2f8 0%, #fef3c7 50%, #ede9fe 100%)',
      border: '1px solid #fbcfe8',
      boxShadow: '0 10px 30px rgba(244, 114, 182, 0.15)',
      animation: 'popIn 0.35s ease-out',
    },
    resultBoxStandard: {
      marginBottom: '18px',
      padding: '18px',
      borderRadius: '22px',
      background: '#f8fafc',
      border: '1px solid #dbeafe',
      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
      animation: 'popIn 0.35s ease-out',
    },
    resultEmoji: {
      fontSize: '28px',
      textAlign: 'center',
      marginBottom: '8px',
    },
    resultTitle: {
      margin: '0 0 8px 0',
      textAlign: 'center',
      fontSize: '24px',
      color: '#9f1239',
    },
    resultTitleStandard: {
      margin: '0 0 8px 0',
      textAlign: 'center',
      fontSize: '24px',
      color: '#1e293b',
    },
    resultText: {
      margin: '0 0 14px 0',
      textAlign: 'center',
      color: '#7c2d12',
      lineHeight: 1.6,
    },
    resultTextStandard: {
      margin: '0 0 14px 0',
      textAlign: 'center',
      color: '#475569',
      lineHeight: 1.6,
    },
    boardWrap: {
      maxWidth: revealFullBoard ? '430px' : '300px',
      margin: '0 auto',
    },
    board: {
      display: 'grid',
      gridTemplateColumns: `repeat(${revealFullBoard ? 5 : 3}, 1fr)`,
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
    sideList: {
      margin: '10px 0 0 18px',
      padding: 0,
      color: '#475569',
      lineHeight: 1.8,
    },
    footerBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      background: 'rgba(255,255,255,0.72)',
      border: '1px solid rgba(255,255,255,0.9)',
      borderRadius: '20px',
      padding: '14px 18px',
      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
    },
    footerBuild: {
      fontWeight: 'bold',
      color: '#9f1239',
      fontSize: '14px',
    },
    footerNote: {
      color: '#475569',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes popIn {
            0% {
              transform: scale(0.96);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.badges}>
              <span style={styles.badgePink}>Birthday Arcade v4.4a</span>
              <span style={styles.badgeOutline}>Made with love, mischief, and a slight bias toward {HER_NAME}</span>
            </div>
            <div style={styles.headerSpacer}></div>
            <h1 style={styles.title}>{ARCADE_TITLE}</h1>
            <p style={styles.subtitle}>{HEADER_SUBTITLE}</p>
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.buttonSecondary} onClick={goHome}>Home</button>
            <button style={styles.buttonPrimary} onClick={goToSelect}>Play Now</button>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Rigged Tic-Tac-Toe</h2>
            <p style={styles.sectionText}>
              Pick your character first. {HER_NAME} gets the full 5x5 board. Everyone else gets a normal 3x3 view and discovers that {HER_NAME} Bot has a talent for dramatic timing.
            </p>

            {screen === 'home' && (
              <>
                <div style={styles.hero}>
                  <h3 style={styles.heroTitle}>{HOME_HERO_TITLE}</h3>
                  <p style={styles.heroText}>{HOME_HERO_BODY}</p>

                  <div style={{ ...styles.buttonRow, marginTop: '16px' }}>
                    <button style={styles.buttonPrimary} onClick={goToSelect}>Choose Character</button>
                    <button style={styles.buttonSecondary} onClick={resetBoardForCurrentMode}>Reset Board</button>
                    <button style={styles.buttonSoft} onClick={() => setShowNote((current) => !current)}>
                      {showNote ? 'Hide Note' : 'Open Birthday Note'}
                    </button>
                  </div>

                  {showNote && (
                    <div style={styles.noteBox}>
                      <strong>For {HER_NAME}:</strong>
                      <div style={{ marginTop: '8px' }}>{PERSONAL_NOTE}</div>
                    </div>
                  )}
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
            )}

            {screen === 'select' && (
              <>
                <div style={styles.hero}>
                  <h3 style={styles.heroTitle}>{SELECT_TITLE}</h3>
                  <p style={styles.heroText}>{SELECT_BODY}</p>
                </div>

                <div style={styles.selectGrid}>
                  <div style={styles.selectCard}>
                    <h4 style={{ margin: 0, fontSize: '20px' }}>{LIKHITHA_OPTION_TITLE}</h4>
                    <p style={styles.helper}>{LIKHITHA_OPTION_BODY}</p>
                    <button style={styles.buttonPrimary} onClick={startBirthdayMatch}>Start as {HER_NAME}</button>
                  </div>

                  <div style={styles.selectCard}>
                    <h4 style={{ margin: 0, fontSize: '20px' }}>{CUSTOM_OPTION_TITLE}</h4>
                    <p style={styles.helper}>{CUSTOM_OPTION_BODY}</p>
                    <button
                      style={styles.buttonSecondary}
                      onClick={() => setPendingChoice((current) => (current === 'classic' ? null : 'classic'))}
                    >
                      {pendingChoice === 'classic' ? 'Hide Name Input' : 'Use Custom Name'}
                    </button>

                    {pendingChoice === 'classic' && (
                      <>
                        <input
                          style={styles.input}
                          type="text"
                          placeholder="Enter player name"
                          value={customNameInput}
                          onChange={(event) => setCustomNameInput(event.target.value)}
                        />
                        <button
                          style={{
                            ...styles.buttonPrimary,
                            opacity: customNameInput.trim() ? 1 : 0.6,
                            cursor: customNameInput.trim() ? 'pointer' : 'not-allowed',
                          }}
                          onClick={startClassicMatch}
                          disabled={!customNameInput.trim()}
                        >
                          Start Classic Match
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ ...styles.buttonRow, justifyContent: 'center', marginTop: '18px' }}>
                  <button style={styles.buttonSecondary} onClick={goHome}>Back to Home</button>
                </div>
              </>
            )}

            {screen === 'game' && (
              <>
                <div style={styles.statusBox}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Status</div>
                    <div style={{ fontWeight: 'bold', lineHeight: 1.5 }}>{status}</div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Moves played: {filledCount}</div>
                  </div>
                  <div style={styles.scoreboard}>
                    <span style={styles.scorePillPink}>{playerName}: {score.player}</span>
                    <span style={styles.scorePillGray}>{botName}: {score.bot}</span>
                  </div>
                </div>

                {resultCopy && (
                  <div style={resultCopy.isSpecial ? styles.resultBoxSpecial : styles.resultBoxStandard}>
                    <div style={styles.resultEmoji}>{resultCopy.emoji}</div>
                    <h3 style={resultCopy.isSpecial ? styles.resultTitle : styles.resultTitleStandard}>{resultCopy.title}</h3>
                    <p style={resultCopy.isSpecial ? styles.resultText : styles.resultTextStandard}>{resultCopy.text}</p>
                    <div style={{ ...styles.buttonRow, justifyContent: 'center' }}>
                      <button style={styles.buttonPrimary} onClick={resetBoardForCurrentMode}>Play Again</button>
                      <button style={styles.buttonSecondary} onClick={goHome}>Back to Arcade</button>
                    </div>
                  </div>
                )}

                <div style={styles.boardWrap}>
                  <div style={styles.board}>
                    {visibleCells.map(({ row, col }) => {
                      const center = isCenterCell(row, col);
                      const key = `${row}-${col}`;
                      const isWinningCell = winningCellSet.has(key);
                      const cell = board[row][col];
                      const background = center ? '#ffffff' : '#fff1f2';
                      const color = cell === 'X' ? '#e11d48' : cell === 'O' ? '#334155' : '#cbd5e1';

                      return (
                        <button
                          key={key}
                          onClick={() => handleCellClick(row, col)}
                          style={{
                            ...styles.cell,
                            background,
                            color,
                            boxShadow: isWinningCell
                              ? 'inset 0 0 0 3px #f59e0b'
                              : center
                              ? 'inset 0 0 0 2px #cbd5e1'
                              : 'inset 0 0 0 2px #fecdd3',
                          }}
                        >
                          {cell || '·'}
                        </button>
                      );
                    })}
                  </div>
                  <div style={styles.footerText}>
                    {revealFullBoard
                      ? 'Gray center = normal board. Pink border = birthday-only bonus zone.'
                      : CLASSIC_BOARD_FOOTER}
                  </div>
                </div>

                <div style={{ ...styles.buttonRow, justifyContent: 'center', marginTop: '18px' }}>
                  <button style={styles.buttonSecondary} onClick={resetBoardForCurrentMode}>Reset Board</button>
                  <button style={styles.buttonSoft} onClick={resetScoreOnly}>Reset Score</button>
                  <button style={styles.buttonPrimary} onClick={goToSelect}>Change Character</button>
                </div>
              </>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '6px' }}>{ARCADE_STATUS_TITLE}</h3>
            <p style={styles.sectionText}>{ARCADE_STATUS_SUBTITLE}</p>

            <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
              <div style={styles.sideBox}>
                <strong>{LIVE_NOW_TITLE}</strong>
                <ul style={styles.sideList}>
                  {LIVE_NOW_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div style={styles.sideBox}>
                <strong>{COMING_SOON_TITLE}</strong>
                <ul style={styles.sideList}>
                  {COMING_SOON_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footerBar}>
          <div style={styles.footerBuild}>{BUILD_LABEL}</div>
          <div style={styles.footerNote}>{FOOTER_NOTE}</div>
        </div>
      </div>
    </div>
  );
}
