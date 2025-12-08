# Prompt de Implementación: Temporizador de Turnos (Tensión)

**Rol:** Eres un experto desarrollador Full Stack (React + Node.js).
**Contexto:** Juego web "Impostor". Actualmente los turnos son infinitos hasta que el jugador envía su palabra. Esto puede hacer que el juego se estanque si alguien piensa demasiado.

**Objetivo:** Añadir un límite de tiempo (ej. 15 o 30 segundos) por turno para aumentar la tensión y fluidez.

## Requisitos Funcionales

1.  **Temporizador Visual:**
    - Mostrar una barra de progreso o cuenta atrás circular en `GameCanvas.tsx` cuando `isMyTurn` es true.
    - La barra debe cambiar de color (Verde -> Amarillo -> Rojo) conforme se agota el tiempo.
2.  **Lógica Server-Side:**
    - El servidor debe controlar el tiempo real. Al cambiar de turno, iniciar un `setTimeout`.
    - Si el tiempo expira y el jugador no ha enviado palabra, el servidor debe:
      - Opción A (Suave): Pasar turno automáticamente enviando "..." o "Se durmió 😴".
      - Opción B (Castigo): Enviar una palabra vergonzosa aleatoria del sistema ("Soy tonto", "Me huelen los pies").
3.  **Sincronización:**
    - El servidor debe enviar `turnExpiresAt` (timestamp) en cada actualización de estado para que todos los clientes sincronicen sus barras de tiempo (no confiar solo en el reloj del cliente).

## Requisitos Técnicos

- **Backend:** Gestión de `timers` en el objeto `room`. Limpiar timers al recibir input válido o pausa.
- **Frontend:** Hook `useEffect` para animar la barra de tiempo basado en la diferencia entre `Date.now()` y `turnExpiresAt`.

## Criterios de Aceptación

- Al llegar a 0 el tiempo, el turno pasa automáticamente al siguiente jugador.
- La cuenta atrás es visible para todos (para presionar al jugador activo).
