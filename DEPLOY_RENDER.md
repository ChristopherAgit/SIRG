# Despliegue en Render (Guía rápida)

Esta guía explica cómo desplegar la aplicación SIRG en Render usando el `Dockerfile` incluido.

Resumen de cambios aplicados automáticamente:
- `Dockerfile`: ahora usa la variable de entorno `PORT` en tiempo de ejecución (necesario para Render).
- La aplicación lee `ApiBaseUrl` desde la configuración (puede ser provista como variable de entorno).

Pasos resumidos:

1) Subir el repositorio a GitHub
   - Crea un repo en GitHub y empuja la rama que quieras desplegar (ej. `main`).
   - Comandos estándar:

```bash
git remote add origin git@github.com:<usuario>/<repo>.git
git branch -M main
git push -u origin main
```

2) Crear servicio Web en Render
   - En Render: New → Web Service.
   - Conecta tu cuenta de GitHub y selecciona el repo y la rama (`main`).
   - En **Environment** elige **Docker**.
   - Dockerfile path: deja `Dockerfile` (raíz del repo).
   - Start Command: deja vacío (el `ENTRYPOINT` del Dockerfile arranca la app).
   - Render asignará una URL: `https://<tu-servicio>.onrender.com`.

3) Variables de entorno (obligatorias / recomendadas)
   - En la sección **Environment** del servicio en Render, añade variables (o Secrets) con estos nombres:

    - `ASPNETCORE_ENVIRONMENT` = `Production`
    - `ConnectionStrings__ConnectionDb` = `<cadena de conexión a tu SQL Server>`
      - Ejemplo para Azure SQL:
        `Server=tcp:<tu-servidor>.database.windows.net,1433;Initial Catalog=<tu-db>;Persist Security Info=False;User ID=<usuario>;Password=<contraseña>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;`
    - `MailSettings__EmailFrom` = `tu@correo.com`
    - `MailSettings__SmtpHost` = `smtp.tu-proveedor.com`
    - `MailSettings__SmtpPort` = `587`
    - `MailSettings__SmtpUser` = `<usuario-smtp>`
    - `MailSettings__SmtpPass` = `<password-smtp>`
    - `MailSettings__DisplayName` = `Constantinopla`
    - `ApiBaseUrl` = `https://<tu-servicio>.onrender.com` (opcional — la app ya funciona con rutas relativas `/api/v1`)

   - Nota sobre la base de datos: la solución está configurada para SQL Server (EF Core SQL Server). Render no ofrece SQL Server administrado; las opciones son:
     - Proveer un SQL Server accesible públicamente (por ejemplo Azure SQL) y configurar `ConnectionStrings__ConnectionDb` con esa cadena.
     - Migrar la capa de persistencia a PostgreSQL (`Npgsql`) y usar la base de datos administrada de Render (esto requiere cambios en proyectos y recrear migraciones).

4) Seguridad y red
   - Si usas Azure SQL, añade reglas de firewall que permitan la IP saliente de Render o habilita "Allow Azure services" (no ideal en producción).
   - Guarda credenciales en las Environment/Secrets del servicio en Render (no en el repositorio).

5) Despliegue y verificación
   - Al crear el servicio, Render construirá la imagen usando el `Dockerfile` y desplegará.
   - Revisa los logs en Render: si hay errores de conexión a la DB o SMTP, se verán en los logs.
   - La URL pública será `https://<tu-servicio>.onrender.com`.

6) Migrations
   - `Program.cs` en la solución intenta aplicar migraciones automáticamente en arranque (ver logs). Si prefieres controlar las migraciones manualmente, no lo habilites en producción.
   - Alternativa: ejecutar localmente `dotnet ef database update -s SIRG.Api -p SIRG.Persistences` apuntando a la cadena de producción, o añadir un job CI que ejecute migraciones.

7) Frontend
   - El `Dockerfile` construye el frontend y lo copia dentro de `wwwroot` del backend. El frontend usa rutas relativas por defecto (`/api/v1`) por lo que no necesitas cambiar `VITE_API_BASE` para despliegue cuando sirves todo desde el mismo dominio.

8) Opcional: `render.yaml`
   - Puedes usar `render.yaml` para definir el servicio como infra-as-code. Puedo añadir un `render.yaml` de ejemplo si quieres.

Soporte adicional
- Si quieres que migre la aplicación a PostgreSQL (para usar la base de datos administrada de Render), puedo hacerlo, pero implica cambios en `SIRG.Persistences`, `SIRG.Identity` y recrear migraciones. ¿Prefieres usar Azure SQL (mantener SQL Server) o migrar a Postgres?

Fin.
