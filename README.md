# Migue Strategy - Landing Page

Esta es la landing page B2B de Migue Strategy, optimizada y lista para publicarse en la web.

## 📁 Estructura del Proyecto

Tu proyecto está desarrollado con tecnología web moderna (Angular y Tailwind CSS). En esta plataforma, la estructura original está optimizada para el desarrollo, pero **ya he configurado todo para que se traduzca automáticamente a HTML, CSS y JavaScript puros** al subirlo a GitHub.

- `src/index.html` -> Aquí vive el cascarón de tu HTML principal.
- `src/styles.css` -> Aquí está todo el CSS.
- `src/app/` -> Aquí se encuentra toda la lógica y animaciones (JavaScript/TypeScript).
- `.github/workflows/deploy.yml` -> *¡Nuevo!* Añadí este archivo especial para que tu página se publique automáticamente en internet en cuanto la exportes.

## 🚀 Cómo exportar y publicar en GitHub Pages (¡Fácil!)

He automatizado el proceso para que no tengas que mover archivos de forma manual. Sigue estos pasos dentro de esta misma plataforma de AI Studio:

1. Ve a la esquina superior derecha y haz clic en el ícono de **Configuración (Engrane)**.
2. Selecciona la opción **"Export to GitHub"**.
3. Sigue los pasos para que la plataforma conecte con tu cuenta y cree un repositorio nuevo.
4. **¡Listo!** Gracias a la configuración que acabo de añadir (`deploy.yml`), GitHub procesará tu código, generará las carpetas finales (`css`, `js`, `index.html`) y publicará tu web de forma gratuita en GitHub Pages en un par de minutos. Podrás ver el enlace en la pestaña "Settings -> Pages" de tu repositorio en GitHub.

### ¿Prefieres hacerlo manualmente con archivos puros?
Si tu objetivo es descargar los archivos estáticos tradicionales (`index.html`, `archivos css` y `archivos js`):

1. En tu computadora o en una terminal, corre el comando: `npm run build`
2. Esto creará una carpeta llamada `dist/app/browser/`.
3. Dentro de esa carpeta encontrarás exactamente la web estática que buscas. Puedes subir solo esos archivos a cualquier servicio de hosting (Hostinger, cPanel, Vercel, Netlify o GitHub Pages) y funcionará perfectamente.
