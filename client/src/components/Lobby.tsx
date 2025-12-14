import React from 'react';
import { Header } from './Header';
import {
    DEFAULT_ROUND_TIME,
    DEFAULT_VOTING_TIME,
    MIN_ROUND_TIME,
    MAX_ROUND_TIME,
    MIN_VOTING_TIME,
    MAX_VOTING_TIME,
    SWIPE_THRESHOLD
} from '../constants';

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
    category: string | null;
    theme: 'dark' | 'light';
    onStart: () => void;
    onLeave: () => void;
    onDifficultyChange: (difficulty: 'normal' | 'hard') => void;
    onCategoryChange: (category: string | null) => void;
    onToggleTheme: () => void;
    settings?: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
}

export interface Settings {

    punishment: boolean;
    customPunishment: string;
    roundTimer: boolean;
    roundTimeLimit: number;
    votingTimer: boolean;
    votingTimeLimit: number;
    voteDisclosure: 'privacy' | 'reveal' | 'realtime';
}

const CATEGORIES = [
    "Animales", "Comida", "Lugares", "Casa", "Cine/TV",
    "Profesiones", "Deportes", "Cuerpo", "Ropa", "Tecnología",
    "Música", "Transporte", "Naturaleza", "Videojuegos/Geek", "Adultos (+18)"
];

export const Lobby: React.FC<Props> = ({ roomCode, players, isHost, difficulty, category, theme, onStart, onLeave, onDifficultyChange, onCategoryChange, onToggleTheme, settings, onUpdateSettings }) => {
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

        if (Math.abs(diff) > SWIPE_THRESHOLD && isHost) {
            if (diff > 0) onDifficultyChange('hard');
            else onDifficultyChange('normal');
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <Header title="SALA" theme={theme} onToggleTheme={onToggleTheme} isHost={isHost} onCloseRoom={isHost ? onLeave : undefined} />

            {/* Room Code */}
            <div style={{ textAlign: 'center' }}>
                <div
                    onClick={copyCode}
                    style={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        letterSpacing: '4px',
                        cursor: 'pointer',
                        textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
                        transition: 'transform 0.2s',
                        fontFamily: 'monospace'
                    }}
                    id="room-code"
                >
                    {roomCode}
                </div>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '-5px' }}>Toca para copiar código</p>
            </div>
            {/* Action Buttons (Host Start / Waiting) */}
            {isHost ? (
                <button
                    className="btn-primary"
                    onClick={onStart}
                    disabled={players.length < 3}
                    style={{ opacity: (players.length < 3) ? 0.5 : 1 }}
                >
                    {players.length < 3 ? 'Esperando jugadores (mín 3)...' : 'Comenzar Partida'}
                </button>
            ) : (
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Esperando al anfitrión...
                </div>
            )}

            {/* Players List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Jugadores ({players.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {players.map(p => (
                        <div key={p.id} className="animate-fade-in" style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: p.isHost ? '1px solid var(--accent-primary)' : '1px solid transparent'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: p.color || 'var(--accent-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                border: '2px solid rgba(255,255,255,0.2)'
                            }}>
                                {p.avatar || '👤'}
                            </div>
                            <div style={{ flex: 1, textAlign: 'left', fontWeight: 'bold' }}>
                                {p.name} {p.isHost && '👑'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Settings Area */}
            <div style={{
                background: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.2)',
                padding: '16px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>

                {/* Difficulty Slider */}
                <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'left' }}>Dificultad {isHost ? '(Desliza)' : ''}</p>
                    <div
                        style={{
                            display: 'flex',
                            background: theme === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)',
                            borderRadius: '12px',
                            padding: '4px',
                            position: 'relative'
                        }}
                        onTouchStart={handleDifficultyTouchStart}
                        onTouchEnd={handleDifficultyTouchEnd}
                    >
                        <button
                            onClick={() => isHost && onDifficultyChange('normal')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: difficulty === 'normal' ? 'var(--success)' : 'transparent',
                                color: difficulty === 'normal' ? 'white' : 'var(--text-secondary)',
                                fontWeight: difficulty === 'normal' ? 'bold' : 'normal',
                                transition: 'all 0.3s ease',
                                opacity: isHost ? 1 : (difficulty === 'normal' ? 1 : 0.5)
                            }}
                        >
                            Normal
                        </button>
                        <button
                            onClick={() => isHost && onDifficultyChange('hard')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: difficulty === 'hard' ? 'var(--error)' : 'transparent',
                                color: difficulty === 'hard' ? 'white' : 'var(--text-secondary)',
                                fontWeight: difficulty === 'hard' ? 'bold' : 'normal',
                                transition: 'all 0.3s ease',
                                opacity: isHost ? 1 : (difficulty === 'hard' ? 1 : 0.5)
                            }}
                        >
                            Difícil
                        </button>
                    </div>
                </div>

                {/* Category Selector - Only visible in Hard Mode */}
                {difficulty === 'hard' && (
                    <div className="animate-fade-in">
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'left' }}>Categoría {isHost ? '(Desliza)' : ''}</p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Left Arrow */}
                            <button
                                onClick={(e) => {
                                    const container = e.currentTarget.nextElementSibling as HTMLDivElement;
                                    container.scrollBy({ left: -150, behavior: 'smooth' });
                                }}
                                style={{
                                    background: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: theme === 'light' ? 'var(--text-primary)' : 'white',
                                    flexShrink: 0
                                }}
                            >
                                &#9664;
                            </button>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '8px',
                                    overflowX: 'auto',
                                    paddingBottom: '8px',
                                    whiteSpace: 'nowrap',
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    flex: 1,
                                    scrollBehavior: 'smooth'
                                }}
                                onWheel={(e) => {
                                    e.currentTarget.scrollLeft += e.deltaY;
                                }}
                            >
                                <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                                <button
                                    onClick={() => isHost && onCategoryChange(null)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '20px', border: 'none',
                                        background: category === null ? 'var(--accent-primary)' : (theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'),
                                        color: category === null ? 'white' : (theme === 'light' ? 'var(--text-primary)' : 'white'),
                                        fontWeight: category === null ? 'bold' : 'normal',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        opacity: isHost ? 1 : (category === null ? 1 : 0.5),
                                        cursor: isHost ? 'pointer' : 'default',
                                        transition: 'transform 0.1s active'
                                    }}
                                >
                                    🎲 Mix
                                </button>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => isHost && onCategoryChange(cat)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '20px', border: 'none',
                                            background: category === cat ? 'var(--accent-primary)' : (theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'),
                                            color: category === cat ? 'white' : (theme === 'light' ? 'var(--text-primary)' : 'white'),
                                            fontWeight: category === cat ? 'bold' : 'normal',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            opacity: isHost ? 1 : (category === cat ? 1 : 0.5),
                                            cursor: isHost ? 'pointer' : 'default',
                                            transition: 'transform 0.1s active'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={(e) => {
                                    const container = e.currentTarget.previousElementSibling as HTMLDivElement;
                                    container.scrollBy({ left: 150, behavior: 'smooth' });
                                }}
                                style={{
                                    background: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: theme === 'light' ? 'var(--text-primary)' : 'white',
                                    flexShrink: 0
                                }}
                            >
                                &#9654;
                            </button>
                        </div>
                    </div>
                )}



                {/* Round Timer Settings */}
                <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', cursor: isHost ? 'pointer' : 'default' }}>
                        <span style={{ color: theme === 'light' ? 'var(--text-primary)' : 'white' }}>⏳ Tiempo Global (Ronda)</span>
                        <input
                            type="checkbox"
                            checked={settings?.roundTimer || false}
                            onChange={(e) => isHost && onUpdateSettings({ roundTimer: e.target.checked })}
                            disabled={!isHost}
                            style={{ transform: 'scale(1.2)' }}
                        />
                    </label>

                    {settings?.roundTimer && (
                        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '10px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Segundos:</span>
                            {isHost ? (
                                <input
                                    type="number"
                                    min={MIN_ROUND_TIME}
                                    max={MAX_ROUND_TIME}
                                    value={settings.roundTimeLimit || DEFAULT_ROUND_TIME}
                                    onChange={(e) => onUpdateSettings({ roundTimeLimit: Math.max(MIN_ROUND_TIME, Math.min(MAX_ROUND_TIME, Number(e.target.value))) })}
                                    style={{
                                        width: '60px', padding: '4px', borderRadius: '4px',
                                        border: '1px solid var(--text-secondary)',
                                        background: 'transparent',
                                        color: theme === 'light' ? 'black' : 'white',
                                        textAlign: 'center'
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme === 'light' ? 'black' : 'white' }}>{settings.roundTimeLimit || DEFAULT_ROUND_TIME}s</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Punishment Settings */}
                <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', cursor: isHost ? 'pointer' : 'default' }}>
                        <span style={{ color: theme === 'light' ? 'var(--text-primary)' : 'white' }}>😈 Castigos</span>
                        <input
                            type="checkbox"
                            checked={settings?.punishment || false}
                            onChange={(e) => isHost && onUpdateSettings({ punishment: e.target.checked })}
                            disabled={!isHost}
                            style={{ transform: 'scale(1.2)' }}
                        />
                    </label>
                    {settings?.punishment && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-5px', marginBottom: '10px' }}>
                            Se asignará un castigo al perdedor.
                        </p>
                    )}
                </div>

                {/* Voting Timer Settings */}
                <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', cursor: isHost ? 'pointer' : 'default' }}>
                        <span style={{ color: theme === 'light' ? 'var(--text-primary)' : 'white' }}>🗳️ Tiempo Votación</span>
                        <input
                            type="checkbox"
                            checked={settings?.votingTimer || false}
                            onChange={(e) => isHost && onUpdateSettings({ votingTimer: e.target.checked })}
                            disabled={!isHost}
                            style={{ transform: 'scale(1.2)' }}
                        />
                    </label>

                    {settings?.votingTimer && (
                        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '10px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Segundos:</span>
                            {isHost ? (
                                <input
                                    type="number"
                                    min={MIN_VOTING_TIME}
                                    max={MAX_VOTING_TIME}
                                    value={settings.votingTimeLimit || DEFAULT_VOTING_TIME}
                                    onChange={(e) => onUpdateSettings({ votingTimeLimit: Math.max(MIN_VOTING_TIME, Math.min(MAX_VOTING_TIME, Number(e.target.value))) })}
                                    style={{
                                        width: '60px', padding: '4px', borderRadius: '4px',
                                        border: '1px solid var(--text-secondary)',
                                        background: 'transparent',
                                        color: theme === 'light' ? 'black' : 'white',
                                        textAlign: 'center'
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme === 'light' ? 'black' : 'white' }}>{settings.votingTimeLimit || DEFAULT_VOTING_TIME}s</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Vote Disclosure Settings */}
                <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
                }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: theme === 'light' ? 'var(--text-primary)' : 'white' }}>
                        👁️ Revelación de Votos
                    </label>
                    {isHost ? (
                        <select
                            value={settings?.voteDisclosure || 'reveal'}
                            onChange={(e) => onUpdateSettings({ voteDisclosure: e.target.value as any })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--text-secondary)',
                                background: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)',
                                color: theme === 'light' ? 'black' : 'white',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="privacy">🔒 Oculto (Nadie ve quién votó a quién)</option>
                            <option value="reveal">⏱️ Al final (Revelar tras todos votar)</option>
                            <option value="realtime">⚡ En vivo (Ver votos al instante)</option>
                        </select>
                    ) : (
                        <div style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            padding: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px'
                        }}>
                            {settings?.voteDisclosure === 'privacy' && '🔒 Oculto (Nadie ve quién votó a quién)'}
                            {(settings?.voteDisclosure === 'reveal' || !settings?.voteDisclosure) && '⏱️ Al final (Revelar tras todos votar)'}
                            {settings?.voteDisclosure === 'realtime' && '⚡ En vivo (Ver votos al instante)'}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}


            {!isHost && (
                <button
                    className="btn-secondary"
                    onClick={onLeave}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)', color: 'var(--error)' }}
                >
                    🚪 Salir de la Sala
                </button>
            )}
        </div>
    );
};
