import React, { useState } from 'react';
import type { GameState, Input } from '../../types/game';
import { Header } from '../Header';
import { CircleTimer } from './CircleTimer';
import { GhostToolbar } from './GhostToolbar';
import { RoundFeed } from './RoundFeed';
import { FloatingEmojis } from './FloatingEmojis';

interface PlayingPhaseProps {
    gameState: GameState;
    myId: string;
    myRole: string;
    isKicked: boolean;
    isHost: boolean;
    theme: 'dark' | 'light';
    roundTimerEnabled: boolean;
    roundExpiresAt?: number | null;
    roundTotalTime: number;
    groupedInputs: Record<number, Input[]>;
    sortedRounds: number[];
    expandedRound: number | null;
    onToggleRound: (round: number) => void;
    onSubmit: (term: string) => void;
    onToggleTheme: () => void;
    onCloseRoom: () => void;
    onRestart?: () => void;
}

export const PlayingPhase: React.FC<PlayingPhaseProps> = ({
    gameState,
    myId,
    myRole,
    isKicked,
    isHost,
    theme,
    roundTimerEnabled,
    roundExpiresAt,
    roundTotalTime,
    groupedInputs,
    sortedRounds,
    expandedRound,
    onToggleRound,
    onSubmit,
    onToggleTheme,
    onCloseRoom,
    onRestart
}) => {
    const [term, setTerm] = useState('');
    const [holdingRole, setHoldingRole] = useState(false);
    const [holdingWord, setHoldingWord] = useState(false);

    const myPlayer = gameState.players.find(p => p.id === myId);
    const myName = myPlayer?.name ?? '';
    const hasSubmitted = gameState.inputs.some(i => i.playerName === myName && i.round === gameState.round);

    // Handlers
    const handleTouchStartRole = () => setHoldingRole(true);
    const handleTouchEndRole = () => setHoldingRole(false);

    const handleTouchStartWord = () => setHoldingWord(true);
    const handleTouchEndWord = () => setHoldingWord(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim()) {
            onSubmit(term);
            setTerm('');
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', position: 'relative' }}>
            <FloatingEmojis />

            <Header title="RONDA" theme={theme} isHost={isHost} onToggleTheme={onToggleTheme} onCloseRoom={onCloseRoom} onRestart={onRestart} />

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

            {isKicked && <GhostToolbar code={gameState.code} />}

            {/* Turn Indicator */}
            <div style={{ textAlign: 'center', padding: '10px 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {/* Global Round Timer */}
                    {roundTimerEnabled && roundExpiresAt && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>RONDA</span>
                            <CircleTimer expiresAt={roundExpiresAt} totalTime={roundTotalTime} />
                        </div>
                    )}

                    {/* Simultaneous Writing Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estado</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
                            {hasSubmitted ? 'Esperando...' : 'Escribe tu palabra'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            {!isKicked && !hasSubmitted ? (
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
                    {isKicked ? 'Observando partida...' : 'Esperando a los demás jugadores...'}
                </div>
            )}

            {/* Feed */}
            <RoundFeed
                gameState={gameState}
                groupedInputs={groupedInputs}
                sortedRounds={sortedRounds}
                expandedRound={expandedRound}
                onToggleRound={onToggleRound}
            />
        </div>
    );
};
