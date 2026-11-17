# Identidad visual de EcuaServer +593

Rediseño editorial de noviembre de 2026, construido con las imágenes oficiales proporcionadas por el propietario. Conserva la información y los componentes funcionales originales.

## Dirección de diseño

- Fondo carbón profundo, superficies antracita y tipografía neutra; el amarillo de Ecuador se utiliza como acento cálido, no como efecto de neón continuo.
- Composición editorial: cabecera pequeña, portada panorámica a ancho completo, presentación e información del servidor en dos columnas y separaciones generosas entre secciones.
- Los gráficos de identidad oficial constituyen el foco visual; las tarjetas informativas y los controles tienen bordes discretos y radios reducidos.
- Fuentes: **Barlow Condensed** para títulos y **Manrope** para interfaz y texto.
- Se mantiene la bandera ecuatoriana y el contenido original de EcuaServer.

## Imágenes del propietario incorporadas

| Imagen recibida | Recurso local publicado | Uso |
|---|---|---|
| Logo ecuatoriano ECUASERVER 24_7(1).png | `assets/brand/logo.webp` | Logotipo de cabecera y panel administrativo |
| ECUASERVER BANNER(1).png | `assets/brand/hero-banner.webp` | Portada panorámica principal |
| Camión rojo con visera cromada al atardecer(1).png | `assets/brand/road-scene.webp` | Imagen editorial junto a información del servidor |
| Animación de anillos neón ECUASERVER 593 (0.5x).gif | `assets/brand/animated-logo.gif` | Emblema secundario del pie de página |

Se generan además `assets/brand/social-card.jpg` (vista previa para redes sociales) y `assets/brand/favicon.png`.

Los recursos son **autohospedados dentro del repositorio GitHub y publicados por Vercel**: la página no depende de los enlaces temporales utilizados para importarlos. El flujo `.github/workflows/import-brand-images.yml` permite reproducir la optimización solo si es necesario.

## Consideraciones funcionales

No se ha cambiado ninguno de estos identificadores/integraciones: `#estado-servidor`, `#equipo`, `#galeria`, `#server-status-players`, `#server-history-track`, `#copy-id`, `/api/server-status`, `/admin.html`, Supabase Auth, galería, monitor automático ni soporte por Discord.

El pie de página muestra el GIF en dispositivos compatibles y sustituye la animación por una imagen estática cuando el usuario prefiere movimiento reducido (`prefers-reduced-motion`).

## Mantenimiento

Las reglas del nuevo diseño están agrupadas al final de la hoja CSS de `index.html` y `admin.html`, para permitir reemplazar estilos sin tocar la lógica. Antes de publicar nuevos cambios, comprobar las versiones móvil y escritorio, la carga de imágenes, la galería, el panel administrativo y los datos de BisectHosting.
