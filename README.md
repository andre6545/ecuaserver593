# EcuaServer +593 🇪🇨 🚛

Sitio público y responsive de la comunidad independiente de **American Truck Simulator** EcuaServer +593.

## Archivos

- `index.html` — contenido, accesibilidad y metadatos.
- `style.css` — interfaz, responsive y animaciones.
- `script.js` — navegación móvil, FAQ, botón copiar, animaciones y utilidades.
- `assets/` — imágenes ilustrativas originales, portada social y favicon.

## Uso local

No requiere instalación ni compilación. Ejecuta un servidor HTTP estático:

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080`. No se recomienda abrir el HTML por `file://` debido a las rutas absolutas de los recursos.

## Publicación

Preparado para Vercel, GitHub Pages (configurando raíz), Netlify o cualquier hosting estático. En Vercel usa **Framework Preset: Other**, directorio raíz `./`, sin comando de build ni variables de entorno.

## Personalización

- URLs de Discord: `https://discord.gg/cTk2V9feYF`
- Información del mapa: `https://wa.link/k18cir`
- ID del servidor: `85568392936670275/101`
- Paleta y tipografías: variables al inicio de `style.css`.
- Actividades: contenido de la sección `#convoyes`, sin fechas ni datos no verificados.
- SEO / Open Graph: etiquetas en `<head>` de `index.html`.

Las imágenes fueron creadas como ilustraciones para este proyecto; **no son capturas reales del servidor**. EcuaServer +593 es una comunidad independiente y no está afiliada con SCS Software.
