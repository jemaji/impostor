import React from 'react';
import { HamburgerMenu } from './HamburgerMenu';

interface HeaderProps {
    title: string;
    theme?: 'dark' | 'light';
    isHost?: boolean;
    onToggleTheme?: () => void;
    onCloseRoom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, theme, isHost, onToggleTheme, onCloseRoom }) => {
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
            {onToggleTheme && theme && (
                <HamburgerMenu theme={theme} isHost={isHost} onToggleTheme={onToggleTheme} onCloseRoom={onCloseRoom} />
            )}
        </div>
    );
};
