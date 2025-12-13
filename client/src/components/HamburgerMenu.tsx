import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Manual } from './Manual';

interface Props {
    theme: 'dark' | 'light';
    isHost?: boolean;
    onToggleTheme: () => void;
    onCloseRoom?: () => void;
}

export const HamburgerMenu: React.FC<Props> = ({ theme, isHost, onToggleTheme, onCloseRoom }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const { installPrompt, installApp, isAppInstalled } = usePWAInstall();

    // Simple iOS detection for showing the button even if no prompt (manual instructions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Show install button if customizable prompt exists OR it's iOS and not already installed
    const showInstallButton = (installPrompt || isIOS) && !isAppInstalled;

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                    /* position: 'fixed', removed for Header integration */
                    /* top: '20px', */
                    /* right: '20px', */
                    background: 'var(--glass-bg)',
                    border: '2px solid rgba(255, 255, 255, 0.5)', // More visible border
                    borderRadius: '8px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    zIndex: 1001,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', transition: 'all 0.3s' }} />
                <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', transition: 'all 0.3s' }} />
                <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', transition: 'all 0.3s' }} />
            </button>

            {/* Menu Dropdown */}
            {menuOpen && (
                <>
                    {/* Overlay to close menu */}
                    <div
                        onClick={() => setMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1000,
                            background: 'rgba(0,0,0,0.3)',
                            animation: 'fadeIn 0.2s ease-in'
                        }}
                    />

                    {/* Menu Content */}
                    <div style={{
                        position: 'fixed',
                        top: '75px',
                        right: '20px',
                        background: 'var(--glass-bg)',
                        border: '2px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '12px',
                        zIndex: 1002,
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        minWidth: '200px',
                        animation: 'fadeIn 0.2s ease-in'
                    }}>
                        {/* Theme Toggle */}
                        <button
                            onClick={() => {
                                onToggleTheme();
                                setMenuOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '2px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: isHost ? '8px' : '0',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                                e.currentTarget.style.transform = 'translateX(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {theme === 'dark' ? (
                                    <>
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </>
                                ) : (
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                )}
                            </svg>
                            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                        </button>

                        {/* Manual Button */}
                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                setShowManual(true);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginTop: '8px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '2px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>📖</span>
                            <span>Manual de Juego</span>
                        </button>

                        {/* Install PWA Button */}
                        {showInstallButton && (
                            <button
                                onClick={() => {
                                    installApp();
                                    setMenuOpen(false);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginTop: '8px',
                                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                    animation: 'pulse 2s infinite'
                                }}
                            >
                                <span>📲</span>
                                <span>Instalar App</span>
                            </button>
                        )}

                        {/* Close Room (Host Only) */}
                        {isHost && onCloseRoom && (
                            <button
                                onClick={() => {
                                    setMenuOpen(false); // Close menu first
                                    setShowModal(true); // Open custom modal
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '2px solid rgba(239, 68, 68, 0.5)',
                                    borderRadius: '8px',
                                    color: 'var(--error)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                                    e.currentTarget.style.transform = 'translateX(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <span>🚪</span>
                                <span>Cerrar Sala</span>
                            </button>
                        )}
                    </div>
                </>
            )}
            {/* Confirmation Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: '2px solid var(--glass-border)',
                        padding: '24px',
                        borderRadius: '16px',
                        width: '80%',
                        maxWidth: '320px',
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        color: 'var(--text-primary)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.4rem' }}>⚠️ Cerrar Sala</h3>
                        <p style={{ marginBottom: '24px', opacity: 0.8 }}>¿Estás seguro de que quieres cerrar la sala para todos?</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    if (onCloseRoom) onCloseRoom();
                                    setShowModal(false);
                                    setMenuOpen(false);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--error)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Manual Modal */}
            {showManual && (
                <Manual onClose={() => setShowManual(false)} />
            )}
        </>
    );
};
