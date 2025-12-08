import { useEffect, useState } from 'react';
import { socket } from './socket';
import { CreateJoin } from './components/CreateJoin';
import { Lobby } from './components/Lobby';
import { GameCanvas } from './components/GameCanvas';
import { EjectionAnimation } from './components/EjectionAnimation';
import { audioManager } from './services/audioManager';
import { GoogleAnalytics } from './components/GoogleAnalytics';
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
  category?: string | null; // Added category
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
  settings?: {
    timer: boolean;
    timeLimit: number;
    punishment: boolean;
    customPunishment: string;
  };
  turnExpiresAt?: number | null;
}

interface EjectionData {
  name: string;
  isImpostor: boolean;
  color: string;
  avatar: string;
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ejectionData, setEjectionData] = useState<EjectionData | null>(null);
  const [showWakeUpMessage, setShowWakeUpMessage] = useState(false);
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

  // Audio Initialization
  useEffect(() => {
    const handleInit = () => audioManager.init();
    window.addEventListener('click', handleInit, { once: true });
    window.addEventListener('touchstart', handleInit, { once: true });
    return () => {
      window.removeEventListener('click', handleInit);
      window.removeEventListener('touchstart', handleInit);
    };
  }, []);

  // Audio Effects System
  useEffect(() => {
    if (!gameState) return;

    // Detect My Turn
    const isMyTurn = gameState.turnIndex !== -1 &&
      gameState.players[gameState.turnIndex]?.id === socket.id &&
      !gameState.kickedIds.includes(socket.id);

    if (isMyTurn && gameState.state === 'playing') {
      audioManager.play('turn');
      audioManager.vibrate([200, 100, 200]);
    }

    // Detect Voting Phase Start
    if (gameState.state === 'voting') {
      // Simple distinct voting sound (only once per state change ideally)
      // Here it might re-trigger if gameState changes internally, but 'voting' state usually is static until votes come in.
      // To be safe, we rely on the fact that this effect runs on dependency change.
      audioManager.play('vote');
      audioManager.vibrate(500);
    }
  }, [gameState?.turnIndex, gameState?.state]);

  useEffect(() => {
    socket.on('room_update', (room: GameState) => {
      setGameState(currentRoom => {
        // Detect if someone was newly kicked to trigger animation
        if (currentRoom) {
          const newKicks = room.kickedIds.filter(id => !currentRoom.kickedIds.includes(id));
          if (newKicks.length > 0) {
            const kickedId = newKicks[0];
            const kickedPlayer = room.players.find(p => p.id === kickedId);
            const isImpostor = room.impostorIds.includes(kickedId);

            if (kickedPlayer) {
              setEjectionData({
                name: kickedPlayer.name,
                color: kickedPlayer.color || '#fff',
                avatar: kickedPlayer.avatar || '💀',
                isImpostor
              });
            }
          }
        }
        if (currentRoom && currentRoom.state !== 'game_over' && room.state === 'game_over') {
          if (window.gtag) {
            window.gtag('event', 'game_end', {
              winner: room.winner,
              difficulty: room.difficulty
            });
          }
        }
        return room;
      });

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
      if (window.gtag) {
        window.gtag('event', 'game_start', {
          difficulty: room.difficulty,
          category: room.category || 'mixed'
        });
      }
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

  // Cold Start Detection for Free Tier Hosting
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!socket.connected) {
      timeout = setTimeout(() => {
        if (!socket.connected) {
          setShowWakeUpMessage(true);
        }
      }, 2000); // Wait 2s before showing "Waking up" message
    }

    const onConnect = () => {
      setShowWakeUpMessage(false);
      if (timeout) clearTimeout(timeout);
    };

    socket.on('connect', onConnect);

    return () => {
      socket.off('connect', onConnect);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

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

  const handleUpdateSettings = (settings: any) => {
    if (gameState) {
      socket.emit('update_settings', { code: gameState.code, settings });
    }
  }

  // Rendering logic
  return (
    <>
      <GoogleAnalytics />

      {showWakeUpMessage && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div className="glass-panel" style={{
            padding: '30px', maxWidth: '350px', textAlign: 'center', margin: '20px',
            border: '1px solid var(--accent-secondary)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💤 ➜ 🚀</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
              Despertando Servidor...
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              El servidor gratuito entra en reposo por inactividad.
              <br /><br />
              Por favor, <strong>espera un minutito</strong> mientras se inicia. ¡Gracias por la paciencia!
            </p>
            <div style={{
              width: '40px', height: '40px',
              border: '4px solid rgba(255,255,255,0.1)',
              borderTop: '4px solid var(--accent-primary)',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}

      {!gameState ? (
        <CreateJoin onCreate={handleCreate} onJoin={handleJoin} theme={theme} onToggleTheme={toggleTheme} />
      ) : (
        <>
          {ejectionData && (
            <EjectionAnimation
              name={ejectionData.name}
              isImpostor={ejectionData.isImpostor}
              color={ejectionData.color}
              avatar={ejectionData.avatar}
              onComplete={() => setEjectionData(null)}
            />
          )}

          {gameState.state === 'lobby' ? (
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
              settings={gameState.settings}
              onUpdateSettings={handleUpdateSettings}
            />
          ) : (
            <GameCanvas
              gameState={gameState}
              myId={socket.id || ''}
              myRole={gameState.impostorIds.includes(socket.id || '') ? 'impostor' : 'civilian'}
              isMyTurn={gameState.turnIndex !== -1 && gameState.players[gameState.turnIndex]?.id === socket.id && !gameState.kickedIds.includes(socket.id || '')}
              activePlayerName={gameState.players[gameState.turnIndex]?.name || ''}
              isKicked={gameState.kickedIds.includes(socket.id || '')}
              isHost={gameState.players.find(p => p.id === socket.id)?.isHost || false}
              theme={theme}
              onSubmit={handleSubmit}
              onVote={handleVote}
              onRestart={handleRestart}
              onCloseRoom={handleLeave}
              onToggleTheme={toggleTheme}
              turnExpiresAt={gameState.turnExpiresAt}
              totalTime={gameState.settings?.timeLimit || 15}
              timerEnabled={gameState.settings?.timer || false}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;
