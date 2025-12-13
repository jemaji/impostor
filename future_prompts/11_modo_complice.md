---
description: Implementación del Rol "El Cómplice" (Ayudante del Impostor)
---

# Objetivo

Añadir una capa de complejidad al juego estándar de impostor introduciendo un rol informado pero vulnerable.

## Descripción de la Dinámica

El "Cómplice" (Minion) es un jugador que recibe la carta de **Civil** (con la palabra correcta) PERO también se le dice **quién es el Impostor**.

- **Objetivo:** Debe ayudar a ganar al Impostor desviando las sospechas o confundiendo a los demás, sin ser descubierto.
- **Condición de Victoria:** Gana si el Impostor gana. Pierde si el Impostor es descubierto.
- **Riesgo:** Si el Cómplice es demasiado obvio defendiendo al Impostor, ambos caerán.

## Cambios Necesarios

### 1. Server Logic

- En `startGame`, seleccionar 1 Impostor Y 1 Cómplice (si hay suficientes jugadores, ej: >5).
- Enviar al Cómplice un payload especial: `role: 'accomplice'`, `impostorId: 'xyz'`, `word: 'palabra_real'`.

### 2. Client UI

- Al revelar rol:
  - Mostrar: "ERES EL CÓMPLICE. AYUDA A [NombreImpostor]".
  - Mostrar la palabra correcta (Civil).
- El Impostor NO sabe quién es el Cómplice (esto es clave para el equilibrio). Opcionalmente, se podría configurar para que sí lo sepa (Modo Fácil para Impostores).

### 3. Settings

- Toggle "Habilitar Cómplice" en Lobby.
