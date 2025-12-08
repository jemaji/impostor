---
description: Implementación de Interacción "Desde la Tumba" (Espectadores activos)
---

# Objetivo

Mantener a los jugadores eliminados (Fantasmas/Espectadores) involucrados en la partida permitiéndoles interactuar levemente sin romper el juego.

## Descripción de la Dinámica

Actualmente, un jugador expulsado solo mira. Con esta mejora:

1.  **Reacciones Espectrales:** Los fantasmas pueden pulsar botones de Emojis (👻, 😡, 😂, 👏) que flotan en la pantalla de los jugadores vivos.
2.  **La Apuesta Final:** Una vez muertos (y conociendo la verdad tras ser revelados), pueden "apostar" quién creen que ganará para ganar puntos de perfil (meta-game).
3.  **Sonidos de Ultratumba:** Pueden activar efectos de sonido sutiles (cadenas, abucheos) con un cooldown largo para asustar a los vivos.

## Cambios Necesarios

### 1. Sistema de Sockets

- Crear evento `ghost_action` en el servidor.
- Validar que el emisor está efectivamente en `kickedIds`.
- Reenviar evento `ghost_effect` a todos los clientes.

### 2. Client UI (`GameCanvas`)

- **Panel de Muerto:** Si `isKicked` es true, mostrar una botonera especial en lugar del input de palabras.
  - Botones: [👻 Boo] [😡 Abuchear] [👏 Aplaudir].
- **Visualizador (Vivos):** Implementar un layer de animación (CSS/Canvas overlay) que renderice estos emojis flotando hacia arriba y desapareciendo (fade out).
- **Sound:** Integrar nuevos sonidos en `audioManager` (`boo`, `claps`, `chains`).

### 3. Cooldowns

- Importante: Implementar Rate Limiting en el servidor/cliente para evitar spam masivo que impida leer a los vivos.
