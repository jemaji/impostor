---
description: Implementación del Sistema de "Fantasmas Interactivos" con Ruleta de Habilidades
---

# Objetivo

Transformar la experiencia del jugador eliminado (Fantasma) mediante un sistema de **Ruleta de Acciones** que se activa tras cada fase de votación, otorgando poderes temporales basados en la suerte.

## Mecánica Principal: La Ruleta de la Muerte

Al finalizar la fase de votación (y antes de empezar la ronda de escritura), cada fantasma tiene derecho a **una tirada** de ruleta (o dado). El servidor calcula el resultado basado en "Pesos de Suerte" y otorga una habilidad para usar en la siguiente ronda.

### Tabla de Habilidades y Probabilidades

| Habilidad                     | Acción            | Peso (Probabilidad) | Descripción                                                                                                                                                                                                                                                          |
| :---------------------------- | :---------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Reacción Espectral**     | `send_emoji`      | **6/10**            | Envía iconos flotantes (Boo 👻, Asco 🤮, Aplauso 👏) a la pantalla de un jugador vivo mientras escribe para distraerlo o animarlo.                                                                                                                                   |
| **2. Sabotaje (Poltergeist)** | `sabotage_player` | **5/10**            | Aplica un efecto negativo a un jugador vivo: <br>- **Hielo:** Congela el input 3s. <br>- **Terremoto:** Vibra y tiembla la pantalla. <br>- **Invisible:** El texto se vuelve invisible mientas escribe.                                                              |
| **3. Jurado de la Tumba**     | `ghost_opinion`   | **7/10**            | Permite marcar a jugadores como "Sospechoso" o "Inocente". El resultado agregado ("3 fantasmas creen que X es impostor") se muestra a los vivos.                                                                                                                     |
| **4. Voto de Ultratumba**     | `real_vote`       | **4/10**            | **Muy Poderoso.** El fantasma recupera su derecho a voto REAL para la próxima expulsión. Su voto cuenta como uno más en el recuento.                                                                                                                                 |
| **5. Posesión**               | `possess_player`  | **3/10**            | **Ultra Raro.** El fantasma elige a una víctima. En el turno de esa víctima, el jugador vivo es bloqueado ("ESTÁS POSEÍDO") y **es el fantasma quien escribe la palabra por él**. Solo la víctima y el fantasma saben la verdad; el resto cree que juega la víctima. |
| **6. Alma en Pena**           | `none`            | **4/10**            | Mala suerte. No puedes hacer nada esta ronda más que mirar.                                                                                                                                                                                                          |

_Total Peso:_ 29 (Probabilidades aproximadas: Reacción 20%, Sabotaje 17%, Jurado 24%, Voto 13%, Posesión 10%, Nada 14%).

---

## Implementación Técnica

### 1. Server Logic (`game_logic.js` / `ghost_system.js`)

- **Estado del Fantasma:** Añadir al `GameState` un objeto para cada fantasma: `{ id: 'xyz', currentPower: 'sabotage', powerCharges: 1 }`.
- **Trigger de Ruleta:** Al cambiar de `voting` a `playing`, ejecutar la función de probabilidad para cada `kickedId` y emitir eventos privados `your_ghost_power`.
- **Manejo de Acciones:**
  - `ghost_action`: Recibe la acción, valida que tiene el poder, lo consume y emite el efecto a la sala o víctima.
  - **Caso Posesión:** Requiere lógica especial en `submit_term`. Si el jugador activo está poseído, el input esperado viene del socket del fantasma, no del jugador.

### 2. Client UI (`GameCanvas.tsx`)

- **Panel de Ruleta:** Un modal o animación visual al iniciar la ronda que muestre qué te ha tocado.
- **Interfaz de Fantasma:**
  - Si tienes _Reacción_: Botonera de emojis.
  - Si tienes _Sabotaje/Posesión_: Lista de jugadores vivos para seleccionar víctima.
  - Si tienes _Voto_: Habilitar botón de voto en la fase correspondiente.
- **Feedback a Víctimas:**
  - Componentes visuales para `Ice` (input azul/disabled), `Earthquake` (clase `.shake`), `Invisible` (color text transparent).
  - Aviso de Posesión: Overlay "👻 ESTÁS SIENDO POSEÍDO" que bloquea el teclado.

### 3. Configuración

- Añadir Opción en Lobby: "Nivel de Actividad Fantasma" (Bajo/Medio/Caos Total) que podría ajustar los pesos o desactivar la Posesión si se desea algo más tranquilo.

## Notas de Diseño

- **Privacidad:** En la Posesión, es CRÍTICO que el servidor siga enviando el mensaje como si fuera del jugador vivo (`playerName: VictimsName`) para mantener la ilusión ante los demás.

---

## 🛑 Estado Actual de Implementación (WIP)

### ✅ Implementado

1. **Lógica de Servidor:**

   - Función `spinGhostRoulette` integrada en el cambio de fase.
   - Eventos `your_ghost_power` y `request_ghost_state`.
   - Manejadores para `sabotage`, `reaction`, `possession`.
   - Recuperación de estado (`activeSabotages`, `ghosts`) tras reconexión (socket ID migration).

2. **Cliente (GameCanvas):**
   - Panel "MODO FANTASMA" dinámico según el poder recibido.
   - Botón de sincronización manual (`↻ Sincronizar Poder`) para mitigar fallos de red.
   - Herramientas de DEBUG UI para probar visualmente los paneles.
   - Efectos visuales: Clase `.shake`, input transparente (invisible), placeholder para posesión (`🧟 Escribe como...`).

### 🚧 Pendiente / Problemas Conocidos

1. **Estabilidad de Sincronización:** A veces el cliente no recibe el evento automático de poder tras la expulsión y requiere pulsar "Sincronizar".
2. **Posesión:** El flujo funciona técnicamente (el fantasma envía el input), pero la experiencia de usuario (UX) para el fantasma podría ser más clara (feedback de "tu input ha sido enviado").
3. **Poderes Restantes:** "Jurado" (Opinión) y "Voto" tienen la UI básica pero falta refinar su impacto real en el juego (mostrar opiniones a todos, contar votos extra).
4. **Limpieza:** Refactorizar el código de `index.js` para separar la lógica de fantasmas en su propio módulo (`ghost_handler.js`) ya que el archivo principal ha crecido demasiado.
