# Prompt de Implementación: Animación de Expulsión Dramática

**Rol:** Frontend Animator (CSS/Framer Motion).
**Contexto:** Actualmente, cuando se vota a alguien, simplemente aparece la pantalla de Game Over o sigue el juego. Es muy anticlimático.

**Objetivo:** Crear una secuencia de animación dramática cuando un jugador es expulsado, similar al estilo "Among Us" pero con la estética de nuestra app.

## Requisitos Funcionales

1.  **Secuencia de Eventos:**
    - Al finalizar la votación, si alguien es expulsado -> Mostrar Overlay Negro.
    - **Animación:** El avatar del jugador expulsado flota desde el centro hacia el espacio exterior (o se desvanece con efecto glitch).
    - **Texto:** Aparece texto letra a letra:
      - "Juan..."
      - "... no era El Impostor." (Texto Verde)
      - O "... ERA El Impostor." (Texto Rojo y música dramática).
    - Tras 3-4 segundos, transición al siguiente estado (Game Over o Siguiente Ronda).

## Requisitos Técnicos

- **Estado Frontend:** Nuevo sub-estado visual `eject_animation` en `GameCanvas`.
- **CSS/Motion:** Usar CSS Keyframes o `framer-motion` para mover el avatar y fundido de texto.
- **Lógica:** Antes de procesar el resultado del servidor (`kickedIds`), mostrar esta animación interceptando la actualización o mediante un evento específico `player_ejected`.

## Criterios de Aceptación

- Animación fluida (60fps).
- Genera tensión antes de revelar la identidad.
