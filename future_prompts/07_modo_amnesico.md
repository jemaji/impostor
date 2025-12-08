---
description: Implementación del Modo "El Amnésico" (Rol sin palabra)
---

# Objetivo

Añadir un nuevo rol especial llamado "Amnésico" (The Amnesiac) para aumentar la confusión y las risas.

## Descripción de la Dinámica

El Amnésico es, técnicamente, un **Civil** (gana si echan al Impostor), pero con una peculiaridad crítica: **No recibe la palabra secreta**.

- En su lugar, ve signos de interrogación `???` o un mensaje "¡Tienes Amnesia!".
- Debe deducir la palabra basándose en lo que dicen los demás para encajar y no parecer el Impostor.
- Si el Amnésico es expulsado, se revela su rol ("Era un Amnésico, no el Impostor") y los Civiles pierden un turno o sufren una penalización, pero el juego sigue (a menos que queden pocos).

## Cambios Necesarios

### 1. Server (`server/index.js`, `server/game_logic.js`)

- Modificar la lógica de asignación de roles en `startGame`.
- Introducir un % de probabilidad (configurable en Settings) de que haya un Amnésico si hay más de 4 jugadores.
- Asegurar que el Amnésico NO es contado como Impostor en la condición de victoria "Impostors win", pero tampoco conoce la palabra.

### 2. Client (`GameCanvas.tsx`)

- Actualizar la visualización de la palabra oculta.
- Si `myRole === 'amnesiac'`, mostrar `???` y un icono distintivo (ej: 🤕).
- Mostrar un tutorial/tooltip breve al inicio: "No sabes la palabra. Finge ser normal y descubre la palabra antes de que te echen o gane el Impostor."

### 3. Settings (`Lobby.tsx`)

- Añadir toggle "Incluir Amnésico" en la configuración de la sala.
