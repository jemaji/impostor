# Guía de Despliegue Gratuito (Render + Vercel)

Para publicar tu juego **Impostor** totalmente gratis, usaremos:

1.  **Render.com** para el **Backend** (Node.js/Socket.IO).
2.  **Vercel.com** para el **Frontend** (React).

---

## Paso 1: Backend en Render

1.  Regístrate en [render.com](https://render.com/) (puedes usar tu cuenta de GitHub).
2.  Haz clic en **"New +"** y selecciona **"Web Service"**.
3.  Conecta tu repositorio de GitHub (`jemaji/impostor`).
4.  Render detectará que tienes una carpeta `server`. Configura lo siguiente:
    - **Root Directory**: `server` (¡Importante!)
    - **Name**: `impostor-server` (o lo que quieras).
    - **Environment**: `Node`
    - **Build Command**: `npm install` (se rellenará solo a veces, verifica que sea este).
    - **Start Command**: `node index.js` (o `npm start`).
    - **Plan**: Free.
5.  Haz clic en **"Create Web Service"**.
6.  Espera a que termine el despliegue.
7.  **COPIA LA URL** que te da Render (ej: `https://impostor-server-xyz.onrender.com`). _La necesitarás para el paso 2._

> **Nota:** El plan gratuito de Render "duerme" el servidor tras 15 minutos sin uso. La primera vez que entres tardará unos 30-50 segundos en despertar.

---

## Paso 2: Frontend en Vercel

1.  Regístrate en [vercel.com](https://vercel.com/) (usa tu cuenta de GitHub).
2.  Haz clic en **"Add New..."** -> **"Project"**.
3.  Importa tu repositorio `jemaji/impostor`.
4.  Configura el proyecto:
    - **Framework Preset**: Vite (lo detectará automáticamente).
    - **Root Directory**: Haz clic en "Edit" y selecciona la carpeta `client`.
    - **Environment Variables**:
      - Clave: `VITE_SERVER_URL`
      - Valor: _Pega aquí la URL de Render del Paso 1_ "https://impostor-sever.onrender.com"
5.  Haz clic en **"Deploy"**.

---

## Paso 3: ¡Jugar!

Vercel te dará una URL (ej: `https://impostor-app.vercel.app`).
¡Entra desde tu móvil y compártela con tus amigos para jugar!

---

### Solución de Problemas Comunes

- **"No conecta al servidor"**: Verifica que en Vercel, la variable `VITE_SERVER_URL` no tenga una barra `/` al final (aunque normalmente da igual, mejor sin ella) y que sea correcta. Si cambias la variable, debes **redesplegar** en Vercel (Redeploy) para que surta efecto.
- **"Tarda en conectar"**: Recuerda que el servidor gratuito de Render tarda en despertar. Ten paciencia en la primera carga.

---

## Actualizaciones Automáticas

Una vez configurado, **no necesitas volver a tocar Render ni Vercel**.
Cada vez que hagas cambios en tu código y ejecutes:

```bash
git add .
git commit -m "Descripción de tus cambios"
git push
```

Tanto Vercel como Render detectarán automáticamente el nuevo código en GitHub y actualizarán tu juego en unos minutos. ¡Magia! ✨

---

## Paso 4: Configurar Google Analytics (Opcional)

Si quieres medir cuánta gente juega a tu juego:

1.  Entra en [Google Analytics](https://analytics.google.com/).
2.  Ve a **Admin** ( ⚙️ ) -> **Crear propiedad**.
3.  Ponle nombre (ej: "Impostor") y selecciona tu zona horaria.
4.  En "Elegir plataforma", selecciona **Web**.
5.  Pon la URL de tu juego (la de Vercel) y un nombre.
6.  Al crear el flujo, verás un **"ID DE MEDICIÓN"** que empieza por `G-NTSRXPXG98`. **Cópialo.**
7.  **En Local:**
    - Abre el archivo `client/.env`.
    - Pega tu ID: `VITE_GA_ID=G-NTSRXPXG98`
8.  **En Producción (Vercel):**
    - Ve a tu proyecto en Vercel.
    - Settings -> Environment Variables.
    - Añade una nueva variable:
      - Key: `VITE_GA_ID`
      - Value: `G-NTSRXPXG98`
    - Haz un "Redeploy" para que se apliquen los cambios.
