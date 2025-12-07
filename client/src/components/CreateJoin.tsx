import React, { useState } from 'react';
import { HamburgerMenu } from './HamburgerMenu';

interface Props {
    onCreate: (name: string, color: string, avatar: string) => void;
    onJoin: (name: string, code: string, color: string, avatar: string) => void;
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
}

export const CreateJoin: React.FC<Props> = ({ onCreate, onJoin, theme, onToggleTheme }) => {
    const [name, setName] = useState(() => localStorage.getItem('impostor_name') || '');
    const [code, setCode] = useState('');
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [color, setColor] = useState(() => localStorage.getItem('impostor_color') || '#3b82f6');
    const [avatar, setAvatar] = useState(() => localStorage.getItem('impostor_avatar') || '👽');

    // Swipe handling for mode selector
    const [touchStartX, setTouchStartX] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                // Swipe left - go to join
                setMode('join');
            } else {
                // Swipe right - go to create
                setMode('create');
            }
        }
    };

    return (
        <>
            <HamburgerMenu theme={theme} onToggleTheme={onToggleTheme} />
            <div className="glass-panel animate-fade-in" style={{ textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Impostor
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Descubre quién miente</p>

                <div
                    style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '16px' }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <button
                        onClick={() => setMode('create')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '12px',
                            background: mode === 'create' ? 'var(--accent-primary)' : 'transparent',
                            color: mode === 'create' ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: mode === 'create' ? 'bold' : 'normal'
                        }}
                    >
                        Crear Sala
                    </button>
                    <button
                        onClick={() => setMode('join')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '12px',
                            background: mode === 'join' ? 'var(--accent-primary)' : 'transparent',
                            color: mode === 'join' ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: mode === 'join' ? 'bold' : 'normal'
                        }}
                    >
                        Unirse
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        type="text"
                        placeholder="Tu Nombre"
                        className="input-field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {/* Avatar & Color Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left' }}>Elige tu Avatar</label>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {['👽', '🤠', '🤖', '🎃', '👻', '🤡', '🦄', '🐶', '🐱', '🐭'].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setAvatar(emoji)}
                                    style={{
                                        background: avatar === emoji ? 'var(--accent-primary)' : 'rgba(128,128,128,0.2)',
                                        border: '2px solid transparent',
                                        borderRadius: '8px',
                                        fontSize: '1.5rem',
                                        padding: '4px',
                                        margin: 0,
                                        cursor: 'pointer',
                                        minWidth: '40px',
                                        height: '40px',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left' }}>Elige tu Color</label>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        padding: 0,
                                        boxSizing: 'border-box',
                                        borderRadius: '50%',
                                        background: c,
                                        border: color === c ? '3px solid var(--accent-primary)' : '2px solid rgba(128,128,128,0.3)',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {mode === 'join' && (
                        <input
                            type="text"
                            placeholder="Código de Sala"
                            className="input-field"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={4}
                        />
                    )}

                    <button
                        className="btn-primary"
                        onClick={() => mode === 'create' ? onCreate(name, color, avatar) : onJoin(name, code, color, avatar)}
                        disabled={!name || (mode === 'join' && code.length !== 4)}
                        style={{ opacity: (!name || (mode === 'join' && code.length !== 4)) ? 0.5 : 1, marginTop: '8px' }}
                    >
                        {mode === 'create' ? 'Crear Partida' : 'Entrar'}
                    </button>
                </div>
            </div>
        </>
    );
};
