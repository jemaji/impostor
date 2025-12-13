import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';

export function ReloadPrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    useEffect(() => {
        if (needRefresh) {
            // Auto-update if preferred, or show UI
            // For a game, forcing update might be jarring, but better than being out of sync.
            // Let's show a toast or button.
            // For now, let's just log it or auto-reload if safer?
            // Let's render a non-intrusive prompt at bottom right.
        }
    }, [needRefresh]);

    if (!needRefresh) return null;

    return (
        <div className="pwa-reload-prompt">
            <div className="pwa-toast">
                <span>Nueva versión disponible.</span>
                <button onClick={() => updateServiceWorker(true)}>Actualizar</button>
            </div>
            <style>{`
        .pwa-reload-prompt {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
        }
        .pwa-toast {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(10px);
            padding: 12px;
            border-radius: 8px;
            display: flex;
            gap: 12px;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            color: var(--text-primary);
        }
        .pwa-toast button {
            background: var(--accent-primary);
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-weight: bold;
        }
      `}</style>
        </div>
    );
}
