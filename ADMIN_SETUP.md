# Administración de la galería — EcuaServer +593

- Sitio: https://ecuaserver593.vercel.app/
- Panel de administración: https://ecuaserver593.vercel.app/admin.html
- Usuario de acceso: `ANDRES`
- Registro público: deshabilitado en la interfaz.
- Autenticación: Supabase Auth, con control de acceso mediante RLS.
- Solo existe una cuenta autorizada en `private.ecuaserver_gallery_admins`.

## Inicio de sesión

El formulario muestra **Usuario** y **Contraseña**. El usuario debe ser `ANDRES`; la contraseña se valida en Supabase Auth. **No se debe incluir la contraseña en archivos del repositorio, en el frontend ni en documentos.**

La cuenta existente y confirmada está asociada en Supabase al usuario `ANDRES`. Si es necesario cambiar su contraseña, utiliza el procedimiento de recuperación/actualización de contraseña de Supabase Auth desde el correo de esa cuenta, o un método administrativo seguro. No es necesario crear otra cuenta.

## Funciones del panel

- Agregar imágenes JPG, PNG, WebP o AVIF (máximo 8 MB).
- Editar descripción y orden, o reemplazar una imagen.
- Eliminar imágenes de la galería y del almacenamiento.
- Editar el título visible de la galería.

## Seguridad

Los datos públicos de la galería son de solo lectura para visitantes. Las operaciones de escritura requieren una sesión de Auth válida **y** pertenencia a la tabla privada de administradores; la interfaz por sí sola no concede permisos. Las claves del frontend son publicables. Nunca publicar una clave `service_role` ni almacenar contraseñas en GitHub.
