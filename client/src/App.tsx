import { useEffect, useState } from 'react';
import { socket } from './socket';
import { CreateJoin } from './components/CreateJoin';
import { Lobby } from './components/Lobby';
import { GameCanvas } from './components/GameCanvas';
import './styles/index.css';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  color?: string;
  avatar?: string;
  disconnected?: boolean;
}

interface GameState {
  code: string;
  players: Player[];
  state: 'lobby' | 'playing' | 'voting' | 'game_over';
  difficulty: 'normal' | 'hard';
  word: string;
  impostorWord: string;
  impostorIds: string[];
  turnIndex: number;
  inputs: { playerName: string, term: string }[];
  votes: Record<string, string>;
  kickedIds: string[];
  winner: 'civilians' | 'impostors' | null;
  paused?: boolean;
  pauseReason?: string;
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myName, setMyName] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('impostor_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('impostor_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Permanent User ID for reconnection
  const [userId] = useState(() => {
    const stored = localStorage.getItem('impostor_uid');
    if (stored) return stored;
    const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('impostor_uid', newId);
    return newId;
  });

  useEffect(() => {
    socket.on('room_update', (room: GameState) => {
      setGameState(room);
      // Save code for reconnection
      if (room.code) {
        localStorage.setItem('impostor_room', room.code);
        // We prefer using the name from the room state if possible, as myName might be stale in closure
        // But for creating player, we need to ensure we save it.
        const me = room.players.find(p => p.id === socket.id);
        if (me) {
          localStorage.setItem('impostor_name', me.name);
        }
      }
    });

    socket.on('game_started', (room: GameState) => {
      setGameState(room);
    });

    socket.on('room_closed', () => {
      // Room was closed by host
      localStorage.removeItem('impostor_room');
      setGameState(null);
      alert('El anfitrión ha cerrado la sala');
    });

    // Reconnection logic
    socket.on('connect', () => {
      const savedCode = localStorage.getItem('impostor_room');
      const savedName = localStorage.getItem('impostor_name');
      const savedColor = localStorage.getItem('impostor_color') || '#8b5cf6';
      const savedAvatar = localStorage.getItem('impostor_avatar') || '👽';

      if (savedCode && savedName) {
        console.log("Attempting to reconnect...", savedCode);
        socket.emit('join_room', {
          name: savedName,
          code: savedCode,
          color: savedColor,
          avatar: savedAvatar,
          userId
        }, (res: any) => {
          if (res.error) {
            console.warn("Reconnection failed:", res.error);
            localStorage.removeItem('impostor_room'); // Clear if invalid
            setGameState(null);
          }
        });
      }
    });

    return () => {
      socket.off('room_update');
      socket.off('game_started');
      socket.off('room_closed');
      socket.off('connect');
    };
  }, [userId]);

  const handleCreate = (name: string, color: string, avatar: string) => {
    setMyName(name);
    // Persist details immediately
    localStorage.setItem('impostor_name', name);
    localStorage.setItem('impostor_color', color);
    localStorage.setItem('impostor_avatar', avatar);

    socket.emit('create_room', { name, color, avatar, userId }, () => { });
  };

  const handleJoin = (name: string, code: string, color: string, avatar: string) => {
    setMyName(name);
    // Persist details immediately
    localStorage.setItem('impostor_name', name);
    localStorage.setItem('impostor_color', color);
    localStorage.setItem('impostor_avatar', avatar);

    socket.emit('join_room', { name, code, color, avatar, userId }, (res: { error?: string }) => {
      if (res.error) alert(res.error);
    });
  };

  const handleStart = () => {
    if (gameState) {
      socket.emit('start_game', { code: gameState.code });
    }
  };

  const handleSubmit = (term: string) => {
    if (gameState) {
      // Find my actual name from gameState to rely on source of truth
      const me = gameState.players.find(p => p.id === socket.id);
      socket.emit('submit_term', { code: gameState.code, playerName: me?.name || myName, term });
    }
  };

  const handleVote = (targetId: string) => {
    if (gameState) {
      socket.emit('vote', { code: gameState.code, targetId });
    }
  };

  const handleRestart = () => {
    if (gameState) {
      socket.emit('restart_game', { code: gameState.code });
    }
  }

  const handleLeave = () => {
    // Clear room data from localStorage
    localStorage.removeItem('impostor_room');

    // If host, emit leave_room to close the room for everyone
    if (gameState) {
      const isHost = gameState.players.find(p => p.id === socket.id)?.isHost;
      socket.emit('leave_room', { code: gameState.code, isHost });
    }

    // Reset local state
    setGameState(null);
  }

  const handleDifficultyChange = (difficulty: 'normal' | 'hard') => {
    if (gameState) {
      socket.emit('set_difficulty', { code: gameState.code, difficulty });
      // If switching to normal, reset category to Mix (null) as requested
      if (difficulty === 'normal') {
        socket.emit('set_category', { code: gameState.code, category: null });
      }
    }
  }

  const handleCategoryChange = (category: string | null) => {
    if (gameState) {
      socket.emit('set_category', { code: gameState.code, category });
    }
  }

  // Rendering logic
  if (!gameState) {
    return <CreateJoin onCreate={handleCreate} onJoin={handleJoin} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (gameState.state === 'lobby') {
    return (
      <Lobby
        roomCode={gameState.code}
        players={gameState.players}
        isHost={gameState.players.find(p => p.id === socket.id)?.isHost || false}
        difficulty={gameState.difficulty || 'normal'}
        category={gameState.category || null}
        theme={theme}
        onStart={handleStart}
        onLeave={handleLeave}
        onDifficultyChange={handleDifficultyChange}
        onCategoryChange={handleCategoryChange}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Playing / Voting / GameOver state
  const myPlayerIndex = gameState.players.findIndex(p => p.id === socket.id);
  const myId = socket.id || '';
  const myRole = gameState.impostorIds.includes(myId) ? 'impostor' : 'civilian';
  const isMyTurn = gameState.turnIndex === myPlayerIndex && !gameState.kickedIds.includes(myId);
  const activePlayer = gameState.players[gameState.turnIndex]?.name || '';
  const isKicked = gameState.kickedIds.includes(myId);

  return (
    <GameCanvas
      gameState={gameState}
      myId={socket.id || ''}
      myRole={myRole}
      isMyTurn={isMyTurn}
      activePlayerName={activePlayer || ''}
      isKicked={isKicked}
      isHost={gameState.players.find(p => p.id === socket.id)?.isHost || false}
      theme={theme}
      onSubmit={handleSubmit}
      onVote={handleVote}
      onRestart={handleRestart}
      onCloseRoom={handleLeave}
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;
