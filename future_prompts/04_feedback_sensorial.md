# Prompt de Implementación: Feedback Sensorial (Sonido y Vibración)

**Rol:** UX/UI Frontend Developer.
**Contexto:** Juego web móvil en React.

**Objetivo:** Mejorar la inmersión y la usabilidad mediante feedback auditivo y háptico.

## Requisitos Funcionales

1.  **Efectos de Sonido (SFX):**
    - Integrar una librería ligera (como `use-sound` o nativo `Audio`).
    - **Eventos con sonido:**
      - `pop.mp3`: Al aparecer un nuevo mensaje en el chat.
      - `alert.mp3`: Cuando es TU turno.
      - `vote_start.mp3`: Transición a fase de votación (sonido tenso).
      - `win.mp3` / `lose.mp3`: Pantalla final.
    - **Control:** Botón de "Mute" en el Header.
2.  **Vibración (Haptics API):**
    - Usar `navigator.vibrate()` (API nativa del navegador).
    - **Patrones:**
      - Turno propio: Vibración doble fuerte (`[200, 100, 200]`).
      - Fase de votación: Vibración larga (`[500]`).
      - Al enviar mensaje: Vibración corta (`[50]`) para feedback táctil.

## Requisitos Técnicos

- **Assets:** Necesitarás archivos de audio cortos y optimizados (mp3/wav) en carpeta `public/sounds`.
- **Gestión de Estado:** Contexto o Estado global para el volumen (Mute ON/OFF) persistente en `localStorage`.
- **Manejo de Errores:** Los navegadores bloquean el audio si no hay interacción previa. Asegurar que los sonidos se inicializan tras el primer clic del usuario (ej. al pulsar "Crear/Unirse").

## Criterios de Aceptación

- El móvil vibra cuando me toca jugar.
- Se escuchan sonidos al jugar (si no está en silencio).
- Opción visible para desactivar sonido.
