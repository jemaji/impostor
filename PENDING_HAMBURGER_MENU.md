# Implementación Pendiente: Menú Hamburguesa

## Estado Actual

### ✅ Completado en el Servidor:

- Transferencia automática de anfitrión cuando se desconecta
- Cierre automático de sala con 1 jugador o menos
- Pausa automática con menos de 3 jugadores
- Reconexión mejorada que marca jugadores como conectados

### ✅ Completado en el Cliente:

- Interfaces actualizadas con `paused`, `pauseReason`, `disconnected`
- Props añadidas a GameCanvas: `isHost`, `theme`, `onCloseRoom`, `onToggleTheme`
- Botones flotantes de tema eliminados

## 📝 Pendiente de Implementar

### 1. Crear el Menú Hamburguesa en GameCanvas

Añadir después de la línea 57 en `GameCanvas.tsx`:

```tsx
// Hamburger Menu Component
const renderHamburgerMenu = () => (
  <>
    {/* Hamburger Button */}
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "var(--glass-bg)",
        border: "2px solid var(--glass-border)",
        borderRadius: "8px",
        width: "44px",
        height: "44px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        cursor: "pointer",
        zIndex: 1001,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "2px",
          background: "var(--text-primary)",
          borderRadius: "2px",
        }}
      />
      <div
        style={{
          width: "20px",
          height: "2px",
          background: "var(--text-primary)",
          borderRadius: "2px",
        }}
      />
      <div
        style={{
          width: "20px",
          height: "2px",
          background: "var(--text-primary)",
          borderRadius: "2px",
        }}
      />
    </button>

    {/* Menu Dropdown */}
    {menuOpen && (
      <>
        {/* Overlay to close menu */}
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        />

        {/* Menu Content */}
        <div
          style={{
            position: "fixed",
            top: "75px",
            right: "20px",
            background: "var(--glass-bg)",
            border: "2px solid var(--glass-border)",
            borderRadius: "12px",
            padding: "12px",
            zIndex: 1002,
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            minWidth: "200px",
          }}
        >
          {/* Theme Toggle */}
          <button
            onClick={() => {
              onToggleTheme();
              setMenuOpen(false);
            }}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(139, 92, 246, 0.2)",
              border: "2px solid var(--glass-border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {theme === "dark" ? (
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
            <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>

          {/* Close Room (Host Only) */}
          {isHost && (
            <button
              onClick={() => {
                if (confirm("¿Estás seguro de que quieres cerrar la sala?")) {
                  onCloseRoom();
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "2px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "8px",
                color: "var(--error)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>🚪</span>
              <span>Cerrar Sala</span>
            </button>
          )}
        </div>
      </>
    )}
  </>
);
```

### 2. Añadir el menú en el render

Buscar el return principal de GameCanvas y añadir al inicio:

```tsx
return (
    <>
        {renderHamburgerMenu()}
        <div className="glass-panel animate-fade-in" ...>
            {/* resto del contenido */}
        </div>
    </>
);
```

### 3. Mostrar mensaje de pausa

Añadir después del menú hamburguesa:

```tsx
{
  gameState.paused && (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "var(--glass-bg)",
        border: "2px solid var(--accent-primary)",
        borderRadius: "16px",
        padding: "24px",
        zIndex: 999,
        backdropFilter: "blur(10px)",
        textAlign: "center",
        maxWidth: "80%",
      }}
    >
      <h3>⏸️ Juego Pausado</h3>
      <p>{gameState.pauseReason}</p>
    </div>
  );
}
```

### 4. Actualizar App.tsx para pasar las props

Buscar la llamada a `<GameCanvas` y actualizar:

```tsx
<GameCanvas
  gameState={gameState}
  myId={socket.id || ""}
  myRole={myRole}
  isMyTurn={isMyTurn}
  activePlayerName={activePlayer || ""}
  isKicked={isKicked}
  isHost={gameState.players.find((p) => p.id === socket.id)?.isHost || false}
  theme={theme}
  onSubmit={handleSubmit}
  onVote={handleVote}
  onRestart={handleRestart}
  onCloseRoom={handleLeave}
  onToggleTheme={toggleTheme}
/>
```

### 5. Indicar jugadores desconectados

En la lista de jugadores (votación/historial), añadir indicador:

```tsx
{
  p.disconnected && <span style={{ opacity: 0.5 }}> (Desconectado)</span>;
}
```

## Resultado Final

- ✅ Menú hamburguesa en esquina superior derecha
- ✅ Toggle de modo oscuro/claro dentro del menú
- ✅ Botón "Cerrar Sala" solo visible para el anfitrión
- ✅ Mensaje de pausa cuando hay menos de 3 jugadores
- ✅ Indicadores de jugadores desconectados
