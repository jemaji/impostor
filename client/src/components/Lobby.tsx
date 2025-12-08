import React from 'react';
import { Header } from './Header';

interface Player {
    id: string;
    name: string;
    isHost: boolean;
    color?: string;
    avatar?: string;
}

interface Props {
    roomCode: string;
    players: Player[];
    isHost: boolean;
    difficulty: 'normal' | 'hard';
    theme: 'dark' | 'light';
    onStart: () => void;
    onLeave: () => void;
    onDifficultyChange: (difficulty: 'normal' | 'hard') => void;
    onToggleTheme: () => void;
}

export const Lobby: React.FC<Props> = ({ roomCode, players, isHost, difficulty, theme, onStart, onLeave, onDifficultyChange, onToggleTheme }) => {
    const [touchStartX, setTouchStartX] = React.useState(0);

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
    };

    const handleDifficultyTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleDifficultyTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                // Swipe left - go to hard
                onDifficultyChange('hard');
            } else {
                // Swipe right - go to normal
                onDifficultyChange('normal');
            }
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <Header title="SALA" theme={theme} onToggleTheme={onToggleTheme} isHost={isHost} onCloseRoom={isHost ? onLeave : undefined} />
            <div style={{ textAlign: 'center' }}>
                <div
                    onClick={copyCode}
                    style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        letterSpacing: '0.2em',
                        cursor: 'pointer',
                        lineHeight: 1
                    }}>
                    {roomCode}
                </div>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '8px' }}>Toca para copiar</p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <h3 style={{ paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '12px' }}>
                    Jugadores ({players.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {players.map((p) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{
                                width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%',
                                background: p.color || 'linear-gradient(135deg, #6d28d9, #4c1d95)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', fontWeight: 'bold', flexShrink: 0
                            }}>
                                {p.avatar || p.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{p.name} {p.isHost && '👑'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {isHost && (
                <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Dificultad</h3>
                    <div
                        style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '16px' }}
                        onTouchStart={handleDifficultyTouchStart}
                        onTouchEnd={handleDifficultyTouchEnd}
                    >
                        <button
                            onClick={() => onDifficultyChange('normal')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '12px',
                                background: difficulty === 'normal' ? 'var(--accent-primary)' : 'transparent',
                                color: difficulty === 'normal' ? '#fff' : 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: difficulty === 'normal' ? 'bold' : 'normal'
                            }}
                        >
                            😊 Normal
                        </button>
                        <button
                            onClick={() => onDifficultyChange('hard')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '12px',
                                background: difficulty === 'hard' ? 'var(--accent-primary)' : 'transparent',
                                color: difficulty === 'hard' ? '#fff' : 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: difficulty === 'hard' ? 'bold' : 'normal'
                            }}
                        >
                            🔥 Difícil
                        </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '6px', textAlign: 'center' }}>
                        {difficulty === 'hard' ? 'Palabras relacionadas - Ni el impostor sabe que es impostor' : 'Modo clásico - Impostores sin palabra'}
                    </p>
                </div>
            )}
            {!isHost && difficulty && (
                <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>
                        Dificultad: <strong>{difficulty === 'hard' ? '🔥 Difícil' : '😊 Normal'}</strong>
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isHost && (
                    <button
                        className="btn-primary"
                        onClick={onStart}
                        disabled={players.length < 3}
                        style={{ opacity: players.length < 3 ? 0.5 : 1 }}
                    >
                        {players.length < 3 ? 'Esperando jugadores (mín 3)...' : 'Empezar Partida'}
                    </button>
                )}
                {!isHost && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Esperando a que el anfitrión inicie...
                    </p>
                )}

                <button
                    className="btn-secondary"
                    onClick={onLeave}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)', color: 'var(--error)' }}
                >
                    {isHost ? '🚪 Cerrar Sala (Todos saldrán)' : '🚪 Salir de la Sala'}
                </button>
            </div>
        </div>

    );
};
