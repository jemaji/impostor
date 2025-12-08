# Prompt de Implementación: Categorías Temáticas de Palabras

**Rol:** Eres un experto desarrollador Full Stack (React + Node.js).
**Contexto:** Estamos trabajando en un juego web tipo "Impostor" (React + Vite en frontend, Node.js + Socket.IO en backend). Actualmente, el juego selecciona un par de palabras al azar de un único diccionario global cuando se inicia la partida.

**Objetivo:** Implementar un sistema de selección de **Categorías Temáticas** en el Lobby para que el Host pueda elegir de qué tema serán las palabras de la partida.

## Requisitos Funcionales

1.  **Refactorizar Diccionario:** Convertir el array plano de palabras en el servidor en un objeto organizado por categorías.
    - Ejemplo: `{ "Animales": [...], "Cine": [...], "Lugares": [...], "Mix": [...] }`
2.  **UI del Lobby (Solo Host):**
    - Añadir un selector (dropdown o botones tipo "chips") en la pantalla `Lobby.tsx` para elegir la categoría.
    - Por defecto debe estar seleccionada "Mix" (o "Aleatorio").
    - Solo el Host puede ver y cambiar este control.
    - El cambio debe reflejarse en tiempo real para todos los jugadores en el Lobby (evento de socket).
3.  **Lógica de Inicio de Juego:**
    - Al darle a "Iniciar Partida", el servidor debe seleccionar el par de palabras (civil/impostor) ÚNICAMENTE de la categoría seleccionada.

## Requisitos Técnicos

- **Backend (`server/index.js` & `dictionary.js`):** Modificar la estructura de datos y la función `getWordPair` para aceptar un parámetro `category`.
- **Socket Events:**
  - Nuevo evento (o actualizado) `update_settings` para que el Host envíe la categoría elegida.
  - El evento `room_update` debe propagar esta configuración a todos los clientes.
- **Frontend (`Lobby.tsx`):** Componente visual para la selección.

## Criterios de Aceptación

- El Host puede cambiar la categoría y los demás jugadores ven el cambio.
- Al iniciar la partida, las palabras secretas pertenecen temáticamente a la categoría elegida.
- Si se elige "Mix", se cogen palabras de cualquier lado.
