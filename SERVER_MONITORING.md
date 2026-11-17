# Monitor público ATS — EcuaServer +593

Estado publicado: https://ecuaserver593.vercel.app/#estado-servidor

## Implementación

Este módulo es independiente de los perfiles, la galería y el panel de imágenes, que se conservan.

- `GET /api/server-status`: consulta de solo lectura con datos de BisectHosting Starbase. Campos: `status`, `players`, `uptimeSeconds` (si Starbase proporciona `resources.uptime`, en milisegundos), `capacity` (solo si el hosting proporciona explícitamente el máximo de jugadores), `checkedAt`. Cache compartida de 60 segundos, 30 segundos con `?refresh=1`.
- `GET /api/server-snapshot`: endpoint **privado**, disponible solo para la tarea periódica que conoce `ECUA_MONITOR_SECRET`. Consulta el servidor y guarda una muestra; una petición sin autorización devuelve 401. **Nunca** colocar este secreto en código público.
- Tarea `cron.job` de Supabase `ecuaserver-status-every-five-minutes`: ejecuta cada cinco minutos la petición con un token protegido en Vault.
- Tabla `public.ecuaserver_server_samples`: un registro por intervalo de cinco minutos (se fusionan duplicados). Se retienen aproximadamente ocho días; la web presenta 24 horas o 7 días.
- Estadísticas derivadas únicamente de muestras verificadas: disponibilidad observada, número máximo de jugadores en un intervalo y promedio de jugadores. Los estados desconocidos y las horas sin muestras no cuentan como desconexiones.
- `public.ecuaserver_server_notice`: aviso editable desde `/admin.html` por el usuario administrativo ya autorizado. Puede activarse o desactivarse. Es independiente del indicador real del servidor.

## Permisos

- `BISECT_API_TOKEN` y `BISECT_SERVER_ID` están en Vercel, entorno Production, como variables sensibles.
- `ECUA_MONITOR_SECRET` es un secreto distinto y sensible en Vercel Production; su valor está cifrado en Supabase Vault y solamente el hash SHA-256 se almacena en una tabla privada para validar las inserciones.
- El navegador solo contiene la clave **publicable** de Supabase para leer el historial y los avisos. RLS impide insertar o editar datos públicos de estado sin el secreto del monitor.
- La modificación de avisos requiere sesión de Supabase Auth y pertenecer a `private.ecuaserver_gallery_admins` (la misma cuenta del panel de fotos).

## Limitaciones honestas

- El tiempo activo procede de `resources.uptime`; se muestra «—» si el hosting no devuelve el dato.
- La capacidad máxima de jugadores solo aparece si Starbase proporciona un campo explícito compatible. Si no, la barra queda oculta y muestra «Capacidad no disponible». Nunca se infiere la capacidad a partir de memoria o CPU.
- El historial comienza al activar la tarea; no se inventan registros anteriores.
- Las estadísticas agregadas de la última semana están basadas en muestras, no en vigilancia continua.
- Si Supabase se pausa o la API falla, aparecerán intervalos «Sin dato» y no falsos períodos de desconexión.

## Verificaciones

1. Comprobar `/api/server-status` (respuesta JSON con solo campos públicos).
2. Comprobar que `/api/server-snapshot` sin Authorization devuelve 401.
3. Confirmar `cron.job.active=true` y el registro de nuevas filas en `public.ecuaserver_server_samples`.
4. Abrir `#estado-servidor`, alternar 24 horas/7 días y usar «Actualizar»; no debe cambiar la galería ni las fichas de equipo.
5. Iniciar sesión en `/admin.html` y guardar un aviso de prueba, luego desactivarlo; mantener el resto del panel sin cambios.
