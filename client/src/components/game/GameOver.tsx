import React from 'react';
import { Header } from '../Header';
import type { GameState } from '../../types/game';

interface GameOverProps {
    gameState: GameState;
    theme: 'dark' | 'light';
    isHost: boolean;
    onToggleTheme: () => void;
    onCloseRoom: () => void;
    onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
    gameState,
    theme,
    isHost,
    onToggleTheme,
    onCloseRoom,
    onRestart
}) => {
    return (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
            <Header title="GAME OVER" theme={theme} isHost={isHost} onToggleTheme={onToggleTheme} onCloseRoom={onCloseRoom} onRestart={onRestart} />
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

                {gameState.currentPunishment && (
                    <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--error)',
                        borderRadius: '12px',
                        maxWidth: '90%'
                    }}>
                        <h3 style={{ color: 'var(--error)', margin: '0 0 8px 0', fontSize: '1.2rem' }}>💀 CASTIGO 💀</h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                            {gameState.currentPunishment}
                        </p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px' }}>
                            (Opcional para los perdedores)
                        </p>
                    </div>
                )}
                <p>Palabra secreta: <strong>{gameState.word}</strong></p>
                <button className="btn-primary" onClick={onRestart}>Volver a la Sala</button>
            </div>
        </div>
    );
};
