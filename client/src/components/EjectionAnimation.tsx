import React, { useEffect, useState, useMemo } from 'react';
import { audioManager } from '../services/audioManager';

interface Props {
    name: string;
    isImpostor: boolean;
    avatar: string;
    color: string;
    onComplete: () => void;
}

export const EjectionAnimation: React.FC<Props> = ({ name, isImpostor, avatar, color, onComplete }) => {
    const [textVisible, setTextVisible] = useState(false);
    const [resultVisible, setResultVisible] = useState(false);

    useEffect(() => {
        // Start animation sequence
        audioManager.play('reveal');

        const t1 = setTimeout(() => setTextVisible(true), 1000);
        const t2 = setTimeout(() => {
            setResultVisible(true);
            audioManager.play(isImpostor ? 'success' : 'failure');
        }, 2500);
        const t3 = setTimeout(onComplete, 6000); // End after 6s

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    const stars = useMemo<{ id: number, top: number, left: number }[]>(() => [...Array(20)].map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100
    })), []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'black',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Stars Effect (CSS based) */}
            <div className="stars" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5 }}>
                {/* Creating stars via box-shadow or similar could be complex, simple dots for now */}
                {stars.map((star) => (
                    <div key={star.id} style={{
                        position: 'absolute',
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                        width: '2px',
                        height: '2px',
                        background: 'white',
                    }} />
                ))}
            </div>

            {/* Floating Character */}
            <div style={{
                fontSize: '5rem',
                animation: 'floatAndRotate 6s linear forwards',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid white'
                }}>
                    {avatar}
                </div>
            </div>

            <style>{`
                @keyframes floatAndRotate {
                    0% { transform: scale(0) rotate(0deg) translateX(-100px); opacity: 0; }
                    20% { transform: scale(1) rotate(120deg) translateX(0); opacity: 1; }
                    100% { transform: scale(0.5) rotate(720deg) translateX(300px); opacity: 0; }
                }
            `}</style>

            {/* Text Reveal */}
            <div style={{ marginTop: '2rem', textAlign: 'center', zIndex: 10, minHeight: '100px' }}>
                {textVisible && (
                    <h2 className="animate-fade-in" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {name}
                    </h2>
                )}

                {resultVisible && (
                    <h1 className="animate-fade-in" style={{
                        fontSize: '2.5rem',
                        color: isImpostor ? 'var(--success)' : 'var(--error)', // Green if impostor found (Civilian win logic), or Red? 
                        // Prompt says: "... ERA El Impostor" (Red text usually associated with Impostor, but for Civilians finding him is Good).
                        // Let's stick to standard Among Us: 
                        // "Juan was The Impostor" -> Text indicates truth.
                        marginTop: '1rem'
                    }}>
                        {isImpostor ? 'Era  El Impostor' : 'No era El Impostor'}
                    </h1>
                )}
            </div>
        </div>
    );
};
