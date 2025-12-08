import React, { useState } from 'react';
import { Header } from './Header';

// Input interface removed as it was unused


interface GameState {
    code: string;
    players: { id: string, name: string, color?: string, avatar?: string, disconnected?: boolean }[];
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

interface Props {
    gameState: GameState;
    myId: string;
    myRole: string;
    isMyTurn: boolean;
    activePlayerName: string;
    isKicked: boolean;
    isHost: boolean;
    theme: 'dark' | 'light';
    onSubmit: (term: string) => void;
    onVote: (targetId: string) => void;
    onRestart: () => void;
    onCloseRoom: () => void;
    onToggleTheme: () => void;
    turnExpiresAt?: number | null;
    totalTime: number;
    timerEnabled: boolean;
}

const CircleTimer = ({ expiresAt, totalDuration }: { expiresAt: number, totalDuration: number }) => {
    const [timeLeftPercent, setTimeLeftPercent] = React.useState(100);
    const [secondsLeft, setSecondsLeft] = React.useState(totalDuration);

    React.useEffect(() => {
        let frameId: number;
        const update = () => {
            const now = Date.now();
            const remain = Math.max(0, expiresAt - now);
            const totalMs = totalDuration * 1000;
            const p = Math.min(100, Math.max(0, (remain / totalMs) * 100));
            setTimeLeftPercent(p);
            setSecondsLeft(Math.ceil(remain / 1000));

            if (remain > 0) {
                frameId = requestAnimationFrame(update);
            }
        };
        update();
        return () => cancelAnimationFrame(frameId);
    }, [expiresAt, totalDuration]);

    const color = timeLeftPercent > 50 ? 'var(--success)' : timeLeftPercent > 20 ? '#eab308' : 'var(--error)';

    return (
        <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="50" height="50" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
                <circle cx="25" cy="25" r="20" stroke={color} strokeWidth="4" fill="transparent"
                    strokeDasharray={126}
                    strokeDashoffset={126 - (126 * timeLeftPercent) / 100}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
            </svg>
            <span style={{ position: 'absolute', fontWeight: 'bold', fontSize: '1rem', color: color }}>{secondsLeft}</span>
        </div>
    );
};

export const GameCanvas: React.FC<Props> = ({
    gameState,
    myId,
    myRole,
    isMyTurn,
    activePlayerName,
    isKicked,
    isHost,
    theme,
    turnExpiresAt,
    totalTime,
    timerEnabled,
    onSubmit,
    onVote,
    onRestart,
    onCloseRoom,
    onToggleTheme
}) => {
    const [term, setTerm] = useState('');
    const [holdingRole, setHoldingRole] = useState(false);
    const [holdingWord, setHoldingWord] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [touchStart, setTouchStart] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim()) {
            onSubmit(term);
            setTerm('');
        }
    };
    // ... (rest of functions)

    const getVoteStatus = () => {
        if (gameState.state !== 'voting') return null;
        const players = gameState.players.filter(p => !gameState.kickedIds.includes(p.id));
        const voteCount = Object.keys(gameState.votes).length;
        return `${voteCount}/${players.length} votos`;
    };

    const hasVoted = gameState.votes[myId];

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        // Swipe left (show history) or right (show voting)
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                setShowHistory(true);
            } else {
                setShowHistory(false);
            }
        }
    };

    // Game Over Screen
    if (gameState.state === 'game_over') {
        const resetGame = () => {
            // Reset UI state if needed
            setShowHistory(false);
            onRestart();
        };

        return (
            <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                <Header title="GAME OVER" theme={theme} isHost={isHost} onToggleTheme={onToggleTheme} onCloseRoom={onCloseRoom} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', gap: '20px' }}>
                    <h1 style={{ fontSize: '3rem', margin: 0 }}>
                        {gameState.winner === 'civilians' ? '🎉 CIVILES GANAN' : '😈 IMPOSTORES GANAN'}
                    </h1>
                    <p>Los impostores eran:</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {gameState.impostorIds.map(id => {
                            const p = gameState.players.find(pl => pl.id === id);
                            return (
                                <div key={id} style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50px',
                                    border: `2px solid ${p?.color || 'var(--text-primary)'}`
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>{p?.avatar || '👤'}</span>
                                    <span style={{ fontWeight: 'bold' }}>{p?.name}</span>
                                </div>
                            );
                        })}
                    </div>
                    <p>Palabra secreta: <strong>{gameState.word}</strong></p>
                    <button className="btn-primary" onClick={resetGame}>Volver a la Sala</button>
                </div>
            </div>
        );
    }

    // Voting Screen with Flip Card
    if (gameState.state === 'voting') {
        return (
            <div
                className="glass-panel animate-fade-in"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <Header title="VOTACION" theme={theme} isHost={isHost} onToggleTheme={onToggleTheme} onCloseRoom={onCloseRoom} />
                {!showHistory ? (
                    // Front: Voting
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        animation: showHistory ? 'none' : 'fadeIn 0.3s ease-in'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '10px' }}>

                            <button
                                onClick={() => setShowHistory(true)}
                                style={{
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '2px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                📜 Ver Historial
                            </button>
                        </div>
                        <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '20px' }}>{getVoteStatus()}</p>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {gameState.players.filter(p => !gameState.kickedIds.includes(p.id)).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => !hasVoted && !isKicked && onVote(p.id)}
                                    disabled={!!hasVoted || isKicked}
                                    style={{
                                        padding: '12px',
                                        background: gameState.votes[myId] === p.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        textAlign: 'left',
                                        color: 'var(--text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        justifyContent: 'flex-start',
                                        opacity: (hasVoted || isKicked) && gameState.votes[myId] !== p.id ? 0.5 : 1
                                    }}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: p.color || 'gray',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '18px'
                                    }}>
                                        {p.avatar || '👤'}
                                    </div>
                                    <span style={{ flex: 1 }}>{p.name} {p.id === myId ? '(Tú)' : ''}</span>
                                </button>
                            ))}

                            <button
                                onClick={() => !hasVoted && !isKicked && onVote('skip')}
                                disabled={!!hasVoted || isKicked}
                                style={{
                                    marginTop: '10px',
                                    padding: '12px',
                                    background: 'rgba(139, 92, 246, 0.15)',
                                    border: '2px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-secondary)',
                                    opacity: hasVoted || isKicked ? 0.5 : 1,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                Saltar Votación {gameState.votes[myId] === 'skip' ? '(Seleccionado)' : ''}
                            </button>
                        </div>
                        {hasVoted && <p style={{ textAlign: 'center', marginTop: '10px' }}>Esperando a los demás...</p>}
                    </div>
                ) : (
                    // Back: Conversation History
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        animation: 'fadeIn 0.3s ease-in'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '10px' }}>

                            <button
                                onClick={() => setShowHistory(false)}
                                style={{
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '2px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                ← Volver a Votar
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {gameState.inputs.map((input, idx) => {
                                const p = gameState.players.find(pl => pl.name === input.playerName);
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            borderLeft: `4px solid ${p?.color || 'transparent'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: p?.color || 'gray',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '18px',
                                            flexShrink: 0
                                        }}>
                                            {p?.avatar || '👤'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '4px' }}>{input.playerName}</div>
                                            <div style={{ fontWeight: 'bold' }}>{input.term}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

        );
    }

    // Playing Handlers
    const handleTouchStartRole = () => setHoldingRole(true);
    const handleTouchEndRole = () => setHoldingRole(false);

    const handleTouchStartWord = () => setHoldingWord(true);
    const handleTouchEndWord = () => setHoldingWord(false);

    return (
        <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', position: 'relative' }}>
            <Header title="RONDA" theme={theme} isHost={isHost} onToggleTheme={onToggleTheme} onCloseRoom={onCloseRoom} />
            {/* Top Header with Secure Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {gameState.difficulty === 'normal' && (
                    <button
                        className="btn-secondary"
                        onMouseDown={handleTouchStartRole}
                        onMouseUp={handleTouchEndRole}
                        onMouseLeave={handleTouchEndRole}
                        onTouchStart={handleTouchStartRole}
                        onTouchEnd={handleTouchEndRole}
                        style={{
                            flex: 1,
                            userSelect: 'none',
                            background: holdingRole ? 'var(--accent-primary)' : 'transparent',
                            fontWeight: 'bold',
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            lineHeight: '1.2',
                            padding: '4px'
                        }}
                    >
                        {holdingRole ? (myRole === 'impostor' ? 'IMPOSTOR' : 'CIVIL') : '👆 Pulsa ver ROL'}
                    </button>
                )}

                <button
                    className="btn-secondary"
                    onMouseDown={handleTouchStartWord}
                    onMouseUp={handleTouchEndWord}
                    onMouseLeave={handleTouchEndWord}
                    onTouchStart={handleTouchStartWord}
                    onTouchEnd={handleTouchEndWord}
                    style={{
                        flex: 1,
                        userSelect: 'none',
                        background: holdingWord ? (gameState.difficulty === 'hard' ? 'var(--success)' : (myRole === 'impostor' ? 'var(--error)' : 'var(--success)')) : 'transparent',
                        fontWeight: 'bold',
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        lineHeight: '1.2',
                        padding: '4px'
                    }}
                >
                    {holdingWord ? (
                        gameState.difficulty === 'hard'
                            ? (myRole === 'impostor' ? gameState.impostorWord : gameState.word)
                            : (myRole === 'impostor' ? 'IMPOSTOR 🤫' : gameState.word)
                    ) : '👆 Pulsa ver PALABRA'}
                </button>
            </div>

            {isKicked && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--error)' }}>
                    👻 Has sido expulsado (Espectador)
                </div>
            )}

            {/* Turn Indicator */}
            <div style={{
                textAlign: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
            }}>
                <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Turno de</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isMyTurn ? 'var(--accent-secondary)' : 'white' }}>
                        {isMyTurn ? 'TI' : activePlayerName}
                    </div>
                </div>

                {timerEnabled && turnExpiresAt && (
                    <CircleTimer expiresAt={turnExpiresAt} totalDuration={totalTime} />
                )}
            </div>

            {/* Feed */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {gameState.inputs.map((input, i) => {
                    const p = gameState.players.find(pl => pl.name === input.playerName);
                    return (
                        <div key={i} className="animate-fade-in" style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${p?.color || 'transparent'}`
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: p?.color || 'gray',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px', flexShrink: 0
                            }}>
                                {p?.avatar || '👤'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>{input.playerName}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{input.term}</div>
                            </div>
                        </div>
                    );
                })}
                {gameState.inputs.length === 0 && (
                    <p style={{ textAlign: 'center', opacity: 0.3, marginTop: '20px' }}>Esperando el primer término...</p>
                )}
            </div>

            {/* Input Area */}
            {!isKicked && isMyTurn ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        className="input-field"
                        placeholder="Escribe tu término..."
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                        Enviar
                    </button>
                </form>
            ) : (
                <div style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', opacity: 0.7 }}>
                    {isKicked ? 'Observando partida...' : `Esperando a ${activePlayerName}...`}
                </div>
            )}
        </div>

    );
};
