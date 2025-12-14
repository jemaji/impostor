import React from 'react';
import { GHOST_EMOJIS } from '../../types/game';
import { socket } from '../../socket';
import { audioManager } from '../../services/audioManager';

interface GhostToolbarProps {
    code: string;
}

export const GhostToolbar: React.FC<GhostToolbarProps> = ({ code }) => {
    const sendGhostReaction = (emoji: string) => {
        socket.emit('ghost_action', { code, emoji });
        audioManager.vibrate(20);
    };

    return (
        <div style={{
            marginBottom: '10px',
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
    );
};
