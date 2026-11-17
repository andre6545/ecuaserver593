# Administración de la galería — EcuaServer +593

La web pública está en https://ecuaserver593.vercel.app/#galeria y el panel en https://ecuaserver593.vercel.app/admin.html.

## Configuración

Se utiliza el proyecto de Supabase **ats-ecuaserver** (`oukgdzfhqeygocmxuiwt`), con tablas `ecuaserver_gallery_photos`, `ecuaserver_gallery_settings`, almacenamiento público `ecuaserver-galeria` y políticas RLS.

**No existe ningún administrador de galería preautorizado.** No se debe conceder el rol automáticamente a cualquier persona que se registre. Para habilitar una cuenta:

1. Abre el panel `/admin.html`, introduce un correo y una contraseña segura y pulsa **Crear cuenta**.
2. Confirma el correo si Supabase lo solicita.
3. Comprueba que se trata de la persona autorizada y que su correo ya está confirmado.
4. Desde **Supabase → SQL Editor** ejecuta el siguiente SQL, reemplazando el correo de ejemplo por el de la cuenta verificada:

```sql
insert into private.ecuaserver_gallery_admins (user_id)
select id
from auth.users
where lower(email) = lower('correo@ejemplo.com')
  and email_confirmed_at is not null
on conflict (user_id) do nothing;
```

5. Inicia sesión en el panel administrativo y administra las imágenes.

Para **revocar** el acceso:

```sql
delete from private.ecuaserver_gallery_admins
where user_id in (
  select id from auth.users where lower(email) = lower('correo@ejemplo.com')
);
```

## Funciones del panel

- Agregar fotos JPG, PNG, WebP o AVIF (máximo 8 MB).
- Editar descripción y orden de las fotografías, o sustituir su archivo.
- Retirar fotos y eliminarlas del almacenamiento.
- Cambiar el título público de la galería.
- En la web, las fotos se ordenan de izquierda a derecha por `sort_order` y fecha de creación.

## Seguridad

La lectura de fotografías es pública; cambiar el título y gestionar archivos requiere inicio de sesión **y** pertenecer a `private.ecuaserver_gallery_admins`. La clave incorporada al navegador es publicable (no `service_role`). No se debe publicar una clave secreta, ni almacenar contraseñas en GitHub ni en Vercel.
