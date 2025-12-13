---
description: Implementación del Modo "Guerra Civil" (Team Deathmatch)
---

# Objetivo

Transformar el juego de "Todos vs Uno" a "Equipo A vs Equipo B" con palabras casi idénticas, donde la confusión reina hasta el final.

## Descripción de la Dinámica

En lugar de 1 Impostor, la sala se divide en **dos equipos equitativos** (Team Red vs Team Blue).

- **Palabras Gemelas:** Ejemplo: El Equipo Rojo tiene "Playa" y el Equipo Azul tiene "Piscina".
- **Desconocimiento:** Nadie sabe quién está en qué equipo, ni siquiera saben qué palabra tiene el equipo contrario.
- **Votación:** Se mantiene la votación para expulsar.
- **Victoria:**
  - Gana el equipo que logre eliminar a la mayoría del equipo contrario.
  - O, gana el equipo que tenga más miembros vivos cuando el contador de rondas acabe.

## Cambios Necesarios

### 1. Dictionary

- Necesitamos pares de palabras muy confusos (ya tenemos `dictionary.js`, pero habría que revisar que sean pares válidos para este modo, o usar la misma lógica de "Impostor Word" vs "Normal Word").

### 2. Server Logic (`game_logic.js`)

- **Assign Roles:** Dividir `players` en 2 arrays. Asignar `wordA` a mitad, `wordB` a mitad.
- **GameState:** Eliminar `impostorIds` y reemplazar con `teamA_Ids` y `teamB_Ids`.
- **Win Condition:** Revisar tras cada expulsión. Si `teamA_alive > teamB_alive` + `teamB_alive == 0` -> Gana A.

### 3. Client UI

- Al "Ver Rol", mostrar "ERES EQUIPO ROJO/AZUL" y tu palabra.
- Al final de la partida (Game Over), revelar quién estaba en cada bando claramente.
- Ajustar textos: ya no es "Encontrar al impostor", sino "Eliminar al bando rival".
