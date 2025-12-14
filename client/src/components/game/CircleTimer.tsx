import React, { useState, useEffect, useRef } from 'react';
import { audioManager } from '../../services/audioManager';

interface CircleTimerProps {
    expiresAt: number;
    totalTime: number;
}

export const CircleTimer: React.FC<CircleTimerProps> = ({ expiresAt, totalTime }) => {
    const [timeLeft, setTimeLeft] = useState(totalTime);

    const lastTickRef = useRef<number>(totalTime);
    const hasTimedOutRef = useRef<boolean>(false);

    useEffect(() => {
        // Reset refs when timer restarts (expiresAt changes)
        lastTickRef.current = Math.ceil((expiresAt - Date.now()) / 1000);
        hasTimedOutRef.current = false;
    }, [expiresAt]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
            setTimeLeft(remaining);

            // Audio/Haptic Tick (Last 5 seconds)
            if (remaining <= 5 && remaining > 0 && lastTickRef.current !== remaining) {
                audioManager.play('tick');
                audioManager.vibrate(50);
                lastTickRef.current = remaining;
            }

            // Timeout Sound
            if (remaining === 0 && !hasTimedOutRef.current) {
                audioManager.play('timeout');
                audioManager.vibrate(500); // Long vibration
                hasTimedOutRef.current = true;
            }

            if (remaining <= 0) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const percentage = Math.max(0, (timeLeft / totalTime) * 100);
    const strokeDasharray = `${percentage}, 100`;

    // Color logic: Green > 50%, Yellow > 20%, Red <= 20%
    const color = percentage > 50 ? '#4ade80' : percentage > 20 ? '#facc15' : '#ef4444';

    return (
        <div className="animate-pulse-slow" style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--glass-border)"
                    strokeWidth="3"
                />
                <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    style={{ transition: 'stroke-dasharray 0.5s linear, stroke 0.5s ease' }}
                />
            </svg>
            <span style={{ position: 'absolute', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{timeLeft}</span>
        </div>
    );
};
