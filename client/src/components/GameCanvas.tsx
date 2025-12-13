import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { audioManager } from '../services/audioManager';
import { useRef } from 'react';
import { socket } from '../socket';

const GHOST_EMOJIS = ['👻', '💩', '🤮', '💀', '🤡', '🤥', '👏', '🤣', '😡', '🥶', '❤️', '👀'];

const CircleTimer = ({ expiresAt, totalTime }: { expiresAt: number, totalTime: number }) => {
    const [timeLeft, setTimeLeft] = useState(totalTime);

    const lastTickRef = useRef<number>(totalTime);
    const hasTimedOutRef = useRef<boolean>(false);

    useEffect(() => {
        // Reset refs when timer restarts (expiresAt changes)
        lastTickRef.current = Math.ceil((expiresAt - Date.now()) / 1000);
        hasTimedOutRef.current = false;
    }, [expiresAt]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
            setTimeLeft(remaining);

            // Audio/Haptic Tick (Last 5 seconds)
            if (remaining <= 5 && remaining > 0 && lastTickRef.current !== remaining) {
                audioManager.play('tick');
                audioManager.vibrate(50);
                lastTickRef.current = remaining;
            }

            // Timeout Sound
            if (remaining === 0 && !hasTimedOutRef.current) {
                audioManager.play('timeout');
                audioManager.vibrate(500); // Long vibration
                hasTimedOutRef.current = true;
            }

            if (remaining <= 0) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const percentage = Math.max(0, (timeLeft / totalTime) * 100);
    const strokeDasharray = `${percentage}, 100`;

    // Color logic: Green > 50%, Yellow > 20%, Red <= 20%
    const color = percentage > 50 ? '#4ade80' : percentage > 20 ? '#facc15' : '#ef4444';

    return (
        <div className="animate-pulse-slow" style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--glass-border)"
                    strokeWidth="3"
                />
                <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    style={{ transition: 'stroke-dasharray 0.5s linear, stroke 0.5s ease' }}
                />
            </svg>
            <span style={{ position: 'absolute', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{timeLeft}</span>
        </div>
    );
};

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
    round: number;
    inputs: { playerName: string, term: string, round?: number }[];
    votes: Record<string, string>;
    ghostVotes?: Record<string, string>;
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

export const GameCanvas: React.FC<Props> = ({
    gameState,
    myId,
    myRole,
    isMyTurn,
    activePlayerName,
    isKicked,
    isHost,
    theme,
    onSubmit,
    onVote,
    onRestart,
    onCloseRoom,
    onToggleTheme,
    turnExpiresAt,
    totalTime,
    timerEnabled
}) => {
    const [term, setTerm] = useState('');
    const [holdingRole, setHoldingRole] = useState(false);
    const [holdingWord, setHoldingWord] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [touchStart, setTouchStart] = useState(0);

    // Ghost Mode State
    const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, emoji: string, left: number }[]>([]);
    const [expandedRound, setExpandedRound] = useState<number | null>(gameState.round || 1);

    // Auto-expand using derived state pattern
    const [prevGameRound, setPrevGameRound] = useState(gameState.round);
    if (gameState.round !== prevGameRound) {
        setPrevGameRound(gameState.round);
        setExpandedRound(gameState.round);
    }

    const toggleRound = (r: number) => {
        setExpandedRound(prev => (prev === r ? null : r));
    };

    // Group inputs by round
    const groupedInputs = gameState.inputs.reduce((acc, input) => {
        const r = input.round || 1;
        if (!acc[r]) acc[r] = [];
        acc[r].push(input);
        return acc;
    }, {} as Record<number, typeof gameState.inputs>);

    const sortedRounds = Object.keys(groupedInputs).map(Number).sort((a, b) => b - a);

    useEffect(() => {
        const handleGhostReaction = (data: { emoji: string, fromId: string }) => {
            const id = Date.now() + Math.random();
            const left = Math.random() * 80 + 10; // 10% to 90% horizontal position
            setFloatingEmojis(prev => [...prev, { id, emoji: data.emoji, left }]);

            // Audio feedback
            audioManager.play('pop'); // Assuming pop exists or fallback

            // Cleanup
            setTimeout(() => {
                setFloatingEmojis(prev => prev.filter(item => item.id !== id));
            }, 3000);
        };

        socket.on('ghost_reaction', handleGhostReaction);
        return () => { socket.off('ghost_reaction', handleGhostReaction); };
    }, []);

    const sendGhostReaction = (emoji: string) => {
        if (!gameState) return;
        socket.emit('ghost_action', { code: gameState.code, emoji });
        audioManager.vibrate(20);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim()) {
            onSubmit(term);
            setTerm('');
        }
    };

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
                    <button className="btn-primary" onClick={onRestart}>Volver a la Sala</button>
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
                {/* Floating Emojis Layer */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 100 }}>
                    {floatingEmojis.map(item => (
                        <div key={item.id} className="floating-emoji" style={{ left: `${item.left}%`, bottom: '10%' }}>
                            {item.emoji}
                        </div>
                    ))}
                </div>
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

                        {isKicked && (
                            <div style={{
                                marginBottom: '10px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                padding: '10px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                border: '1px solid var(--accent-secondary)',
                                backdropFilter: 'blur(4px)'
                            }}>
                                <div className="ghost-toolbar" style={{ justifyContent: 'center' }}>
                                    {GHOST_EMOJIS.map(emoji => (
                                        <button key={emoji} className="ghost-btn" onClick={() => sendGhostReaction(emoji)}>
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {gameState.players.filter(p => !gameState.kickedIds.includes(p.id)).map(p => {
                                // Count ghost votes for this player
                                const ghostVoteCount = Object.values(gameState.ghostVotes || {}).filter(targetId => targetId === p.id).length;
                                const myGhostVote = gameState.ghostVotes?.[myId];
                                const isMyGhostTarget = myGhostVote === p.id;

                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            if (isKicked) {
                                                // Ghost Vote
                                                socket.emit('ghost_vote', { code: gameState.code, targetId: p.id });
                                                audioManager.play('pop');
                                            } else if (!hasVoted) {
                                                onVote(p.id);
                                            }
                                        }}
                                        disabled={!isKicked && !!hasVoted}
                                        style={{
                                            padding: '12px',
                                            background: (!isKicked && gameState.votes[myId] === p.id) || (isKicked && isMyGhostTarget) ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                            border: (isKicked && isMyGhostTarget) ? '2px solid white' : '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            textAlign: 'left',
                                            color: 'var(--text-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            justifyContent: 'flex-start',
                                            opacity: (!isKicked && hasVoted && gameState.votes[myId] !== p.id) ? 0.5 : 1,
                                            cursor: (isKicked || (!hasVoted)) ? 'pointer' : 'default',
                                            position: 'relative',
                                            transition: 'all 0.2s ease'
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

                                        {/* Ghost Votes Display */}
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {Array.from({ length: ghostVoteCount }).map((_, i) => (
                                                <span key={i} className="animate-pop" style={{ fontSize: '1.2rem', animationDelay: `${i * 0.1}s` }}>👻</span>
                                            ))}
                                        </div>
                                    </button>
                                )
                            })}


                            {/* Skip Button - Only for alive players */}
                            {!isKicked && (
                                <button
                                    onClick={() => !hasVoted && onVote('skip')}
                                    disabled={!!hasVoted}
                                    style={{
                                        marginTop: '10px',
                                        padding: '12px',
                                        background: 'rgba(139, 92, 246, 0.15)',
                                        border: '2px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'var(--text-secondary)',
                                        opacity: hasVoted ? 0.5 : 1,
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Saltar Votación {gameState.votes[myId] === 'skip' ? '(Seleccionado)' : ''}
                                </button>
                            )}

                        </div>
                        {hasVoted && !isKicked && <p style={{ textAlign: 'center', marginTop: '10px' }}>Esperando a los demás...</p>}
                        {isKicked && <p style={{ textAlign: 'center', marginTop: '10px', color: 'var(--accent-secondary)' }}>👻 Vota para asustar a los vivos (Click en su nombre)</p>}


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

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sortedRounds.length > 0 ? (
                                sortedRounds.map(roundNum => {
                                    const isCurrentRound = roundNum === gameState.round;
                                    // In Voting/History, gameState.round is still the "just finished" round usually, 
                                    // or checking against expandedRound is enough.
                                    const isExpanded = roundNum === expandedRound;
                                    const roundInputs = groupedInputs[roundNum];

                                    return (
                                        <div key={roundNum} className="glass-panel" style={{ padding: '0', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                                            <button
                                                onClick={() => toggleRound(roundNum)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: isCurrentRound ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                                                    border: 'none',
                                                    borderBottom: isExpanded ? '1px solid var(--glass-border)' : 'none',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    color: isCurrentRound ? 'var(--accent-secondary)' : 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    WebkitTapHighlightColor: 'transparent'
                                                }}
                                            >
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {isCurrentRound ? `Ronda Actual (${roundNum})` : `Ronda ${roundNum}`}
                                                </span>
                                                <span>{isExpanded ? '▲' : '▼'}</span>
                                            </button>

                                            {isExpanded && (
                                                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {roundInputs.slice().reverse().map((input, idx) => {
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
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ textAlign: 'center', opacity: 0.3, marginTop: '20px' }}>No hay historial aún.</p>
                            )}
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
            {/* Floating Emojis Layer */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 100 }}>
                {floatingEmojis.map(item => (
                    <div key={item.id} className="floating-emoji" style={{ left: `${item.left}%`, bottom: '10%' }}>
                        {item.emoji}
                    </div>
                ))}
            </div>
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
                <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    padding: '10px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid var(--accent-secondary)',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent-secondary)' }}>👻 MODO FANTASMA 👻</div>
                    <div className="ghost-toolbar">
                        {GHOST_EMOJIS.map(emoji => (
                            <button key={emoji} className="ghost-btn" onClick={() => sendGhostReaction(emoji)}>
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Turn Indicator */}
            <div style={{ textAlign: 'center', padding: '10px 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Turno de</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isMyTurn ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
                        {isMyTurn ? 'TI' : activePlayerName}
                    </div>
                </div>
                {timerEnabled && turnExpiresAt && (
                    <CircleTimer expiresAt={turnExpiresAt} totalTime={totalTime} />
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

            {/* Feed */}
            {/* Feed */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedRounds.length > 0 ? (
                    sortedRounds.map(roundNum => {
                        const isCurrentRound = roundNum === gameState.round;
                        const isExpanded = roundNum === expandedRound;
                        const roundInputs = groupedInputs[roundNum];

                        return (
                            <div key={roundNum} className="glass-panel" style={{ padding: '0', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                                {/* Round Header */}
                                <button
                                    onClick={() => toggleRound(roundNum)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: isCurrentRound ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        borderBottom: isExpanded ? '1px solid var(--glass-border)' : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: isCurrentRound ? 'var(--accent-secondary)' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        boxShadow: 'none',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}
                                >
                                    <span style={{ fontWeight: 'bold' }}>
                                        {isCurrentRound ? `Ronda Actual (${roundNum})` : `Ronda ${roundNum}`}
                                    </span>
                                    <span>{isExpanded ? '▲' : '▼'}</span>
                                </button>

                                {/* Round Inputs */}
                                {isExpanded && (
                                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {roundInputs.slice().reverse().map((input, i) => {
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
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p style={{ textAlign: 'center', opacity: 0.3, marginTop: '20px' }}>Esperando el primer término...</p>
                )}
            </div>

            {/* Input Area */}

        </div>

    );
};
