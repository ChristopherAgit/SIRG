# SIRG

Sistema de información para la gestión de un restaurante (API + Frontend).

Descripción
-----------
SIRG es una aplicación full‑stack compuesta por una API REST escrita en ASP.NET Core (.NET 10) y un frontend en React (Vite). Utiliza una Arquitectura ONION.

Instancia en producción
-----------------------
La aplicación está desplegada y accesible en: https://constantinopla.onrender.com/

Tecnologías principales
- Backend: .NET 10, ASP.NET Core, Entity Framework Core
- Base de datos: PostgreSQL (configurable) / InMemory para pruebas
- Autenticación: JWT (configurable vía `JwtSettings`)
- Frontend: React + Vite, TypeScript, Tailwind CSS
- Contenedores: Docker

Estructura del repositorio (resumen)
- `SIRG.Api` – API ASP.NET Core (entrada: `Program.cs`)
- `frontend/sirg-frontend` – Frontend React + Vite
- `SIRG.Persistences` – Contexto EF Core, migraciones y repositorios
- `SIRG.Identity` – Entidades y semillas relacionadas con identidad
- `SIRG.Application` – Lógica de aplicación, DTOs y servicios
- `SIRG.IOC` – Registro de dependencias e implementación de IoC

Requisitos previos
- .NET SDK 10.0 o superior
- Node.js v18+ y `npm` (o `pnpm`/`yarn`) para el frontend
- PostgreSQL (u otro proveedor relacional si se configura)
- Docker (opcional, para empaquetado/despliegue)

Configuración
- La configuración principal de la API está en `SIRG.Api/appsettings.json`. Para entornos de despliegue se recomienda usar variables de entorno en lugar de dejar secretos en archivos de configuración.
- Hay un ejemplo de variables para Render en `render.env.example` (útil como plantilla para secretos/variables de entorno).
- Variables importantes:
	- `ConnectionStrings__ConnectionDb` – Cadena de conexión a la base de datos
	- `JwtSettings__SecretKey` – Clave secreta para firmar tokens JWT
	- `MailSettings__*` – Configuración SMTP para envíos de correo
	- `ApiBaseUrl`, `FrontendUrl` – URLs públicas según despliegue

Ejecución local (desarrollo)

Backend (API)
1. Establecer variables de entorno o editar `SIRG.Api/appsettings.Development.json` según convenga.
2. Restaurar y ejecutar desde la solución o el proyecto API:

```bash
dotnet restore
dotnet run --project SIRG.Api
```

3. La API expone Swagger en `/swagger` (cuando esté habilitado según entorno).

Frontend
1. Entrar en la carpeta del frontend:

```bash
cd frontend/sirg-frontend
npm install
npm run dev
```

2. Vite mostrará la URL local (por defecto `http://localhost:5173`). En modo `Development`, la política CORS permite orígenes sin restricciones.

Base de datos y migraciones
- `Program.cs` aplica automáticamente las migraciones al arrancar cuando el proveedor es relacional. Esto es conveniente en desarrollo, pero tenga cuidado en producción.
- Para administrar migraciones manualmente (EF Core CLI):

```bash
dotnet tool install --global dotnet-ef
dotnet ef migrations add NombreMigracion --project SIRG.Persistences --startup-project SIRG.Api
dotnet ef database update --project SIRG.Persistences --startup-project SIRG.Api
```

Seeds
- Al inicializar la aplicación se ejecuta `RunSeedAsync()` (revisar la implementación de semillas en `SIRG.Persistences/Seeds` o `SIRG.Identity/Seeds`).

Docker
- Imagen combinada (frontend + backend):

```bash
docker build -t sirg:latest .
docker run -e ConnectionStrings__ConnectionDb="<cadena>" -p 8080:80 sirg:latest
```

- Imagen del backend sola (usa `Dockerfile.backend`):

```bash
docker build -f Dockerfile.backend -t sirg-backend:latest .
docker run -e ConnectionStrings__ConnectionDb="<cadena>" -p 8080:80 sirg-backend:latest
```

Despliegue
- Para despliegues en Render u otros proveedores, use `render.env.example` como plantilla para definir variables y secretos en el panel del servicio.

Seguridad y buenas prácticas
- No comitear secretos ni credenciales en repositorios públicos. Use variables de entorno o servicios de secretos.
- Revise `SIRG.Api/appsettings.json` si contiene valores de ejemplo y reemplace/rotee credenciales antes de desplegar.

Contribuir
- Fork → feature branch → Pull Request.
- Es recomendable seguir convenciones de estilo y ejecutar linters antes de enviar PRs.

Contacto y referencias
- Para configuración de despliegue vea `Dockerfile`, `Dockerfile.backend` y `render.env.example`.

Licencia
- No se especificó una licencia en este repositorio.

