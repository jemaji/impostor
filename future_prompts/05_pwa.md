# Prompt de Implementación: PWA (Progressive Web App)

**Rol:** Frontend Developer (Vite/React).
**Contexto:** Aplicación web React desplegada en Vercel.

**Objetivo:** Convertir la web en una PWA instalable para que los usuarios puedan tenerla como icono en su móvil, jugar a pantalla completa (sin barra de navegador) y mejorar el rendimiento.

## Requisitos Funcionales

1.  **Manifest `manifest.json`:**
    - Nombre: "Impostor Game"
    - Short Name: "Impostor"
    - Display: `standalone` (Pantalla completa).
    - Orientation: `portrait`.
    - Theme Color: El color de fondo oscuro de la app.
    - Iconos: Generar iconos de 192x192 y 512x512 (usar el emoji 👽 o generar uno).
2.  **Service Worker (Vite PWA Plugin):**
    - Usar `vite-plugin-pwa`.
    - Configurar caché básica para carga instantánea (estrategia Stale-While-Revalidate).
    - Permitir actualización automática de la app cuando hay nueva versión.

## Requisitos Técnicos

- **Instalación:** `npm install vite-plugin-pwa -D`.
- **Configuración:** Modificar `vite.config.ts` para incluir el plugin con la configuración del manifiesto.
- **HTML:** Asegurar meta tags de viewport y theme-color correctos en `index.html`.

## Criterios de Aceptación

- Al abrir la web en Android/iOS, el navegador sugiere "Añadir a pantalla de inicio".
- Al abrir desde el icono, la app se ve sin barra de URL (Full Screen).
- Lighthouse Audit de PWA en verde.
