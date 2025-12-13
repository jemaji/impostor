import React from 'react';

interface Props {
    onClose: () => void;
}

export const Manual: React.FC<Props> = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-primary)', // Uses theme background
            animation: 'slideIn 0.3s ease-out',
            overflow: 'hidden'
        }}>
            {/* Manual Header */}
            <div style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>📖 Manual de Juego</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Content Scrollable */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
                textAlign: 'left'
            }}>
                <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>
                    ¡Bienvenido a <strong>Impostor Mateos</strong>! Un juego de deducción social, engaño y risas donde la creatividad y la astucia son tus mejores armas.
                </p>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', display: 'inline-block', paddingBottom: '4px' }}>
                        🎯 Objetivo del Juego
                    </h3>
                    <p>El juego divide a los jugadores en dos bandos secretos:</p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px' }}><strong>😇 Civiles:</strong> Conocen la <strong>Palabra Secreta</strong>. Su objetivo es descubrir quién es el impostor sin revelar demasiado la palabra.</li>
                        <li><strong>😈 Impostores:</strong> <strong>NO</strong> conocen la palabra secreta (o tienen una palabra trampa en modo difícil). Su objetivo es pasar desapercibidos y sobrevivir hasta el final o adivinar la palabra.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', display: 'inline-block', paddingBottom: '4px' }}>
                        🎮 Cómo Jugar
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>1. Preparación (Lobby)</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>Un jugador crea la sala y comparte el <strong>Código de 4 letras</strong>.</li>
                            <li>Mínimo <strong>3 jugadores</strong> para comenzar.</li>
                            <li><strong>Configuración del Anfitrión:</strong>
                                <ul style={{ marginTop: '4px' }}>
                                    <li><strong>Dificultad:</strong> Normal o Difícil.</li>
                                    <li><strong>Categoría:</strong> Temas específicos o Mix.</li>
                                    <li><strong>Temporizador:</strong> Límite de tiempo opcional.</li>
                                    <li><strong>Castigos:</strong> Retos para perdedores.</li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>2. La Ronda</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>A cada jugador se le asigna un rol secreto.</li>
                            <li><strong>Turnos:</strong> Escribe una <strong>pista</strong> relacionada con tu palabra.</li>
                            <li><em>Ejemplo:</em> Si la palabra es "Sol", pistas buenas: "Calor", "Estrella".</li>
                            <li>El Impostor debe fingir leyendo a los demás.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>3. Votación</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>Al final de la ronda, ¡debate y vota!</li>
                            <li>El más votado es <strong>Expulsado</strong>.</li>
                            <li>Si es Impostor: <strong>¡Ganan Civiles!</strong> 🎉</li>
                            <li>Si es Civil: Seguimos jugando (el civil se hace Fantasma).</li>
                        </ul>
                    </div>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', display: 'inline-block', paddingBottom: '4px' }}>
                        👻 Modo Fantasma
                    </h3>
                    <p>¡La muerte no es el final! Si te expulsan:</p>
                    <ol style={{ paddingLeft: '20px' }}>
                        <li><strong>Observa:</strong> Sigues viendo la partida.</li>
                        <li><strong>Reacciona:</strong> Envía emojis flotantes.</li>
                        <li><strong>Vota:</strong> Tu voto aparece como 👻 (presión psicológica).</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', display: 'inline-block', paddingBottom: '4px' }}>
                        🔥 Modos de Juego
                    </h3>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Modo Normal (Clásico)</strong><br />
                        Civiles ven la palabra. Impostor no sabe nada.
                    </div>
                    <div>
                        <strong>Modo Difícil (Caos Total)</strong><br />
                        Impostor ve una palabra <strong>muy parecida</strong> (ej: Pizza vs Hamburguesa). ¡Confusión total!
                    </div>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', display: 'inline-block', paddingBottom: '4px' }}>
                        🤡 Castigos
                    </h3>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li><strong>Game Over:</strong> El perdedor recibe un reto aleatorio.</li>
                        <li><strong>Timeout:</strong> Si se acaba el tiempo, el juego envía un mensaje vergonzoso por ti.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', display: 'inline-block', paddingBottom: '4px' }}>
                        📱 Instalación (App)
                    </h3>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li><strong>Android:</strong> Menú Chrome → Instalar aplicación.</li>
                        <li><strong>iOS:</strong> Safari Compartir → Añadir a Pantalla de Inicio.</li>
                    </ul>
                </section>

                <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', marginTop: '20px', paddingBottom: '20px' }}>
                    Impostor Mateos v1.5.0
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div >
    );
};
