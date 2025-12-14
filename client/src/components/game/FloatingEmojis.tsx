import React, { useState, useEffect } from 'react';
import { socket } from '../../socket';
import { audioManager } from '../../services/audioManager';

export const FloatingEmojis: React.FC = () => {
    const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, emoji: string, left: number }[]>([]);

    useEffect(() => {
        const handleGhostReaction = (data: { emoji: string, fromId: string }) => {
            const id = Date.now() + Math.random();
            const left = Math.random() * 80 + 10; // 10% to 90% horizontal position
            setFloatingEmojis(prev => [...prev, { id, emoji: data.emoji, left }]);

            // Audio feedback
            audioManager.play('pop');

            // Cleanup
            setTimeout(() => {
                setFloatingEmojis(prev => prev.filter(item => item.id !== id));
            }, 3000);
        };

        socket.on('ghost_reaction', handleGhostReaction);
        return () => { socket.off('ghost_reaction', handleGhostReaction); };
    }, []);

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 100 }}>
            {floatingEmojis.map(item => (
                <div key={item.id} className="floating-emoji" style={{ left: `${item.left}%`, bottom: '10%' }}>
                    {item.emoji}
                </div>
            ))}
        </div>
    );
};
