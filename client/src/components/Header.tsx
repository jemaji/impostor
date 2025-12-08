import React, { useState } from 'react';
import { HamburgerMenu } from './HamburgerMenu';
import { audioManager } from '../services/audioManager';

interface HeaderProps {
    title: string;
    theme?: 'dark' | 'light';
    isHost?: boolean;
    onToggleTheme?: () => void;
    onCloseRoom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, theme, isHost, onToggleTheme, onCloseRoom }) => {
    const [muted, setMuted] = useState(audioManager.getMuteState());

    const toggleMute = () => {
        const newState = audioManager.toggleMute();
        setMuted(newState);
        audioManager.init(); // Ensure init
        if (!newState) audioManager.play('click');
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            width: '100%',
            height: '70px',
            marginBottom: '10px',
            boxSizing: 'border-box'
        }}>
            <h1 style={{
                margin: 0,
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 900,
                letterSpacing: '1px'
            }}>
                {title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={toggleMute}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.8
                    }}
                >
                    {muted ? '🔇' : '🔊'}
                </button>

                {onToggleTheme && theme && (
                    <HamburgerMenu theme={theme} isHost={isHost} onToggleTheme={onToggleTheme} onCloseRoom={onCloseRoom} />
                )}
            </div>
        </div>
    );
};
