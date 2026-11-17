# EcuaServer +593 — Checklist de lanzamiento público

**Sitio de producción:** https://ecuaserver593.vercel.app/
**Administrador:** https://ecuaserver593.vercel.app/admin.html
**Repositorio:** https://github.com/andre6545/ecuaserver593

## Cambios aplicados

- Menú de navegación directo a Estado del servidor, Equipo, Fotografías y Discord.
- Pie de página con los enlaces ya existentes (sin inventar servicios).
- Galería con ampliación en pantalla completa, navegación con flechas y tecla Escape, descripciones y controles accesibles.
- Identidad visual: favicon SVG, portada social SVG, metadatos Open Graph/Twitter, canonical, robots.txt y sitemap.xml.
- Inicio de sesión administrativo mediante `POST /api/admin-login`; el correo interno ahora es una variable de entorno cifrada `ECUA_ADMIN_EMAIL` en Vercel Production, no aparece en `admin.html`. Se conserva el alias ANDRES, la contraseña se verifica por Supabase Auth y las operaciones de edición siguen sujetas a RLS y al administrador autorizado.
- Cabeceras HTTP de seguridad (anti-iframe, nosniff, política de referencia y permisos de navegador), además de noindex y no-store en administración.
- Se revocó la ejecución pública de la función auxiliar `public.rls_auto_enable()` sin cambiar las políticas de las tablas.

## Verificado automáticamente

- Despliegue Production en Vercel READY.
- `/`, `/admin.html`, `/favicon.svg`, `/social-cover.svg`, `/robots.txt`, `/sitemap.xml`, `/api/server-status` devuelven HTTP 200.
- Usuario de inicio de sesión inválido: HTTP 401.
- Captura privada del monitor sin token: HTTP 401.
- JavaScript de la página principal, administración, API y panel del servidor: sintaxis correcta.
- Enlaces Steam: HTTP 200; enlaces Discord y WhatsApp: redirección HTTP 301 al servicio oficial (la comprobación de destino final requiere navegación del propietario).
- Se mantienen galería, perfiles, historial, avisos, y registro de estado automático de BisectHosting.

## Pendientes que requieren intervención o confirmación humana

1. **Seguridad de credenciales:** cambiar la contraseña administrativa que se compartió anteriormente y conservarla en un gestor de contraseñas. No enviarla por chat ni subirla al repositorio.
2. **Supabase Auth:** activar la protección de contraseñas filtradas desde el panel de autenticación si el plan permite la función. Documentación: https://supabase.com/docs/guides/auth/password-security
3. **Auditoría de seguridad:** la función `ecuaserver_record_server_sample` sigue siendo `SECURITY DEFINER` accesible a `anon` *intencionalmente*, porque valida un secreto privado de alta entropía antes de escribir una muestra; el linter sigue mostrando advertencia. La función `ecuaserver_can_manage_gallery` requiere ejecución de usuarios autenticados para las políticas RLS; el linter la marca como función privilegiada. Revisar estas excepciones si se cambia la arquitectura.
4. **Prueba con cuenta real:** iniciar sesión como ANDRES, comprobar lectura del panel, editar temporalmente un aviso y revertirlo, subir una foto de prueba y retirarla; comprobar que no cambia la galería real.
5. **Comprobar enlaces reales:** abrir Discord, WhatsApp y Steam en navegador habitual; confirmar que el enlace de invitación no caducó y que los perfiles corresponden al equipo.
6. **Móvil y accesibilidad:** revisar en un teléfono real la navegación, ampliación de fotografías, contraste, rendimiento y panel administrativo. El código tiene estilos adaptativos y navegación por teclado, pero no sustituye una prueba física.
7. **Vista previa social:** el recurso `social-cover.svg` es SVG; algunos servicios de vista previa (incluidos determinados clientes de Discord/WhatsApp) exigen PNG/JPG. Convertir a PNG 1200x630 y actualizar `og:image` y `twitter:image` si no aparece la miniatura.
8. **Información de compra:** confirmar con el propietario qué producto se vende, precio, compatibilidad y condiciones antes de publicarlo; no se añadieron datos no proporcionados.
9. **Dominio propio:** opcional. El dominio vercel.app actual funciona con HTTPS; no es necesario comprar un dominio para lanzar.
10. **Respaldo:** exportar una copia de las fotos y del esquema/base de datos antes de cambios mayores. Mantener un despliegue READY anterior como opción de reversión.

## Criterio de publicación

El sitio ya está públicamente accesible. Para anunciarlo oficialmente se recomienda completar los puntos 1, 2, 4, 5 y 6 y comprobar la vista previa social. No hay necesidad de instalar un sistema nuevo ni modificar el servidor de ATS.
