import React from 'react';
import { GameState, Input } from '../../types/game';

interface RoundFeedProps {
    gameState: GameState;
    groupedInputs: Record<number, Input[]>;
    sortedRounds: number[];
    expandedRound: number | null;
    onToggleRound: (round: number) => void;
}

export const RoundFeed: React.FC<RoundFeedProps> = ({
    gameState,
    groupedInputs,
    sortedRounds,
    expandedRound,
    onToggleRound
}) => {
    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedRounds.length > 0 ? (
                sortedRounds.map(roundNum => {
                    const isCurrentRound = roundNum === gameState.round;
                    const isExpanded = roundNum === expandedRound;
                    const roundInputs = groupedInputs[roundNum];

                    return (
                        <div key={roundNum} className="glass-panel" style={{ padding: '0', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                            <button
                                onClick={() => onToggleRound(roundNum)}
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
                                                className="animate-fade-in"
                                                style={{
                                                    padding: '12px',
                                                    background: 'rgba(255,255,255,0.03)',
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
                                                    <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '2px' }}>{input.playerName}</div>
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
    );
};
