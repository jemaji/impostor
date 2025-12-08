# Prompt de Implementación: Nuevo Rol "El Loco" (Jester)

**Rol:** Expert Game Developer.
**Contexto:** Juego de deducción social tipo Impostor/Among Us. Roles actuales: Civil e Impostor.

**Objetivo:** Introducir un tercer rol neutral llamado **"El Loco" (o Jester)**.

## Requisitos Funcionales

1.  **Mecánica del Rol:**
    - El Loco es un jugador solitario. No es ni Civil ni Impostor.
    - **Objetivo:** Su ÚNICO objetivo es **ser expulsado** (votado) por la mayoría durante la fase de votación.
    - Si El Loco es expulsado, la partida termina inmediatamente y **Gana El Loco** (derrotando a Civiles e Impostores).
    - Si los Impostores matan al Loco (en versiones futuras) o ganan por número, el Loco pierde. En esta versión de palabras, si los Impostores ganan la partida, el Loco pierde.
2.  **Visualización:**
    - El jugador con este rol debe ver su tarjeta de rol como "🤡 EL LOCO" (Color rosa/morado).
    - Su palabra secreta: Puede ser la misma que los Civiles (para confundir) o una tercera palabra totalmente distinta (modo Caos). Sugiero: **La misma que los civiles** para que tenga que _actuar_ mal a propósito sin ser demasiado obvio.
3.  **Configuración:**
    - Opcional: El Host debe poder activar/desactivar este rol en el Lobby.

## Requisitos Técnicos

- **Backend:**
  - Modificar lógica de asignación de roles (`assignRoles`).
  - Añadir `jesterId` al estado de la room.
  - Modificar lógica de `voting` y `checkGameOver`: Si el expulsado es `jesterId` -> `winner = 'jester'`.
- **Frontend:**
  - Soporte para mostrar el nuevo rol y pantalla de victoria específica ("🤡 EL LOCO HA GANADO").

## Criterios de Aceptación

- Si el grupo vota al Loco, sale pantalla de Game Over con victoria del Loco.
- El Loco ve su rol correctamente al inicio.
