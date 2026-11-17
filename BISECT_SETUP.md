# Estado de EcuaServer +593 — Conexión con BisectHosting

Esta integración únicamente consulta información: no permite ejecutar comandos, reiniciar ni modificar el servidor de juego.

- Web: https://ecuaserver593.vercel.app/#estado-servidor
- Endpoint público filtrado: https://ecuaserver593.vercel.app/api/server-status
- Proyecto Vercel: `ecuaserver593` (equipo `andre6545s-projects`).
- Hosting: BisectHosting Starbase en `https://games.bisecthosting.com`.
- Documentación oficial: https://www.bisecthosting.com/docs/ (Starbase API).

## Antes de activar

1. En el panel **Starbase** de BisectHosting, abre **Account → API Credentials** y crea una clave API nueva destinada únicamente a esta integración. Es un token que comienza por `ptlc_`. Si es posible, limita sus permisos a solo lectura; si el panel no permite eso, protege la clave como credencial privilegiada y evita compartirla.
2. Identifica el **UUID o identificador interno de servidor Starbase** (no el ID de sesión ATS `85568392936670275/101`; no es intercambiable). Normalmente se puede encontrar en el panel, en la ficha del servidor o en su URL. La ruta de consulta oficial es `/api/client/servers/{uuid}/resources`.
3. En **Vercel → ecuaserver593 → Settings → Environment Variables**, configura SOLO en **Production**:
   - `BISECT_API_TOKEN`: el token privado `ptlc_...` generado por Starbase. Selecciona tipo **Sensitive** cuando esté disponible.
   - `BISECT_SERVER_ID`: UUID o identificador interno del servidor Starbase (sin URL ni barra).
4. Tras guardar, realiza un **redeploy de Production** para aplicar las variables (las variables nuevas no afectan a despliegues ya ejecutados).
5. Comprueba `/api/server-status`. Respuestas previstas:
   - `status: "online"` — Starbase informa que está en ejecución.
   - `status: "offline"` — Starbase informa que está detenido.
   - `status: "transitioning"` — cambio de estado en curso.
   - `status: "unavailable"` — API, permisos, datos o red no disponibles. No implica que el servidor esté apagado.
   - `status: "unconfigured"` — faltan variables privadas.
   - `players: null` — BisectHosting no pudo confirmar el número; **NO equivale a 0**.

## Datos utilizados

- `GET /api/client/servers/{uuid}/resources`: estado.
- `GET /api/client/servers/{uuid}/player/online`: jugadores, **solo si el servidor ATS/egg admite esta función**. Consultas no soportadas muestran “—”.
- Las llamadas se hacen **solo desde Vercel**, nunca desde el navegador.
- Caché compartida de 60 segundos. La web actualiza la tarjeta aproximadamente cada minuto.
- No compartir tokens por chat, capturas, GitHub ni en HTML/JavaScript.

## Resolución de problemas

Si la tarjeta muestra `No disponible`:
- Confirma que la clave sea una API key de **Starbase**, no una clave de Steam o la contraseña del panel.
- Comprueba el identificador interno y los permisos de lectura de la clave.
- Verifica que las variables estén asignadas a **Production** y vuelve a desplegar.
- Consulta las funciones disponibles de la instalación ATS con soporte de BisectHosting; no todos los juegos permiten leer jugadores desde `/player/online`.
- Para restringir la API key a IPs, recuerda que Vercel puede usar IP de salida variable salvo que se configure salida estática adecuada.

## Seguridad

El token es secreto. Si se filtra, revócalo en BisectHosting y reemplázalo en Vercel. Nunca concedas a la web controles para iniciar, detener o reiniciar el servidor de juego.
