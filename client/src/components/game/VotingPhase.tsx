import React from 'react';
import { GameState, Input } from '../../types/game';
import { Header } from '../Header';
import { CircleTimer } from './CircleTimer';
import { GhostToolbar } from './GhostToolbar';
import { RoundFeed } from './RoundFeed';
import { FloatingEmojis } from './FloatingEmojis';
import { audioManager } from '../../services/audioManager';
import { socket } from '../../socket';

interface VotingPhaseProps {
    gameState: GameState;
    myId: string;
    isKicked: boolean;
    isHost: boolean;
    theme: 'dark' | 'light';
    votingTimerEnabled: boolean;
    votingExpiresAt: number | null;
    votingTotalTime: number;
    groupedInputs: Record<number, Input[]>;
    sortedRounds: number[];
    expandedRound: number | null;
    onToggleRound: (round: number) => void;
    onVote: (targetId: string) => void;
    onToggleTheme: () => void;
    onCloseRoom: () => void;
}

export const VotingPhase: React.FC<VotingPhaseProps> = ({
    gameState,
    myId,
    isKicked,
    isHost,
    theme,
    votingTimerEnabled,
    votingExpiresAt,
    votingTotalTime,
    groupedInputs,
    sortedRounds,
    expandedRound,
    onToggleRound,
    onVote,
    onToggleTheme,
    onCloseRoom
}) => {
    const hasVoted = gameState.votes[myId];

    const getVoteStatus = () => {
        if (gameState.state !== 'voting') return null;
        const players = gameState.players.filter(p => !gameState.kickedIds.includes(p.id));
        const voteCount = Object.keys(gameState.votes).length;
        return `${voteCount}/${players.length} votos`;
    };

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
        >
            <FloatingEmojis />

            <Header title="VOTACION" theme={theme} isHost={isHost} onToggleTheme={onToggleTheme} onCloseRoom={onCloseRoom} />

            {gameState.state === 'voting' && votingTimerEnabled && votingExpiresAt && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: '20px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tiempo restante:</span>
                        <CircleTimer expiresAt={votingExpiresAt} totalTime={votingTotalTime} />
                    </div>
                </div>
            )}

            {gameState.state === 'revealing' && (
                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold' }}>
                    📊 REVELANDO VOTOS...
                </div>
            )}

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                animation: 'fadeIn 0.3s ease-in',
                overflow: 'hidden'
            }}>
                <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '10px' }}>{getVoteStatus()}</p>

                {isKicked && <GhostToolbar code={gameState.code} />}

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {/* Voting List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>Vota al Impostor</h3>
                        {gameState.players.filter(p => !gameState.kickedIds.includes(p.id)).map(p => {
                            const ghostVoteCount = Object.values(gameState.ghostVotes || {}).filter(targetId => targetId === p.id).length;
                            const myGhostVote = gameState.ghostVotes?.[myId];
                            const isMyGhostTarget = myGhostVote === p.id;

                            const playerInput = gameState.inputs.find(i => i.playerName === p.name && (i.round === gameState.round || !i.round));
                            const playerTerm = playerInput ? playerInput.term : '...';

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        if (isKicked) {
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
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: p.color || 'gray',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        {p.avatar || '👤'}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 'bold' }}>{p.name} {p.id === myId ? '(Tú)' : ''}</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                            "{playerTerm}"
                                        </span>
                                    </div>

                                    {/* Ghost Votes Display */}
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {Array.from({ length: ghostVoteCount }).map((_, i) => (
                                            <span key={i} className="animate-pop" style={{ fontSize: '1.2rem', animationDelay: `${i * 0.1}s` }}>👻</span>
                                        ))}
                                    </div>

                                    {/* Reveal Votes */}
                                    {gameState.state === 'revealing' && (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {Object.entries(gameState.votes)
                                                .filter(([_, targetId]) => targetId === p.id)
                                                .map(([voterId]) => {
                                                    const voter = gameState.players.find(pl => pl.id === voterId);
                                                    return (
                                                        <div key={voterId} style={{
                                                            width: '24px', height: '24px', borderRadius: '50%',
                                                            background: voter?.color || 'gray',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '12px', border: '1px solid white'
                                                        }} title={voter?.name}>
                                                            {voter?.avatar || '👤'}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </button>
                            )
                        })}

                        {!isKicked && (
                            <button
                                onClick={() => !hasVoted && !isKicked && onVote('skip')}
                                disabled={!!hasVoted || isKicked || gameState.state === 'revealing'}
                                style={{
                                    marginTop: '10px',
                                    padding: '12px',
                                    background: 'rgba(139, 92, 246, 0.15)',
                                    border: '2px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-secondary)',
                                    opacity: hasVoted || isKicked || gameState.state === 'revealing' ? 0.5 : 1,
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}
                            >
                                <span>Saltar Votación {gameState.votes[myId] === 'skip' ? '(Seleccionado)' : ''}</span>
                                {gameState.state === 'revealing' && (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {Object.entries(gameState.votes)
                                            .filter(([_, targetId]) => targetId === 'skip')
                                            .map(([voterId]) => {
                                                const voter = gameState.players.find(pl => pl.id === voterId);
                                                return (
                                                    <div key={voterId} style={{
                                                        width: '24px', height: '24px', borderRadius: '50%',
                                                        background: voter?.color || 'gray',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '12px', border: '1px solid white'
                                                    }} title={voter?.name}>
                                                        {voter?.avatar || '👤'}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </button>
                        )}
                    </div>

                    {hasVoted && !isKicked && <p style={{ textAlign: 'center', marginTop: '10px' }}>Esperando a los demás...</p>}
                    {isKicked && <p style={{ textAlign: 'center', marginTop: '10px', color: 'var(--accent-secondary)' }}>👻 Vota para asustar a los vivos (Click en su nombre)</p>}

                    {/* Previous Rounds History using RoundFeed */}
                    <div style={{ marginTop: '10px', minHeight: '200px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--text-secondary)', opacity: 0.8 }}>Rondas Anteriores</h3>
                        <RoundFeed
                            gameState={gameState}
                            groupedInputs={groupedInputs}
                            sortedRounds={sortedRounds.filter(r => r < gameState.round)}
                            expandedRound={expandedRound}
                            onToggleRound={onToggleRound}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
