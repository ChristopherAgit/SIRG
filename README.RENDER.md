Preparación para despliegue en Render

Pasos rápidos:

1. Construir y comprobar localmente:

```bash
# desde la raíz del repo
docker build -t sirg:local .
# ejecutar
docker run --rm -p 8080:80 sirg:local
# abrir http://localhost:8080
```

2. En Render, crea un nuevo "Web Service" y selecciona `Docker` como método de despliegue, apuntando al repositorio.

3. Configura variables de entorno necesarias en Render (connection strings, JwtSettings en appsettings.json o variables de entorno). Ejemplos:

- `ConnectionDb` : cadena de conexión a SQL Server
- `JwtSettings__Issuer`
- `JwtSettings__Audience`
- `JwtSettings__SecretKey`
- `UseInMemoryDatabase` (opcional para pruebas)

4. Puertos: Render usará el puerto expuesto en el `Dockerfile` (80).

Notas:
- El `Dockerfile` copia la build del frontend en `wwwroot` del proyecto `SIRG.Api`, y `Program.cs` está configurado para servir archivos estáticos y usar `index.html` como fallback.
- Revisa las variables de entorno y secretos antes de desplegar.
