---
description: Implementación de Eventos de Ronda "Caos" (Restricciones de juego)
---

# Objetivo

Introducir modificadores aleatorios ("Eventos de Caos") al inicio de cada partida o ronda para romper la monotonía de las estrategias habituales.

## Descripción de la Dinámica

El sistema seleccionará una regla especial que se aplicará durante toda la partida o cambiará en cada turno.

### Ejemplos de Eventos:

1.  **Modo Mudo:** Solo se pueden usar Emojis en el input.
2.  **Modo Tacaño:** Máximo 4 caracteres por palabra.
3.  **Twitch Speak:** Solo palabras en mayúsculas gritando.
4.  **Poeta:** (Difícil de validar auto, pero regla social) Intentar que rime.
5.  **Censura:** Prohibido usar la letra "E" o "A".
6.  **Velocidad:** El temporizador dura la mitad.

## Cambios Necesarios

### 1. Server

- Crear un archivo `chaos_events.js` con la lista de eventos y sus parámetros (ej: `validationRegex`, `maxLen`, `description`).
- Al iniciar `start_game`, seleccionar un evento aleatorio si la opción "Modo Caos" está activa.
- Enviar el evento activo en el payload de `game_started` y `room_update`.
- Validar en `submit_term` si la palabra cumple la restricción (ej: longitud, regex). Si no, devolver error al cliente.

### 2. Client

- **UI:** Mostrar un cartel llamativo al iniciar: "EVENTO DE CAOS: [DESCRIPCIÓN]".
- **Validation:** Impedir enviar el formulario si no cumple la regla localmente (ej: bloquear input de letras prohibidas).
- Visualmente destacar la regla activa en el Header permanentemente.

### 3. Settings

- Checkbox "Habilitar Eventos de Caos".
