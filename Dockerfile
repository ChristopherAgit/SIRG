# Build frontend
FROM node:18-alpine AS build-frontend
WORKDIR /src/frontend/sirg-frontend
COPY frontend/sirg-frontend/package*.json ./
COPY frontend/sirg-frontend/ .
RUN npm ci --silent && npm run build

# Build backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore SIRG.sln
RUN dotnet publish SIRG.sln -c Release -o /app/publish

# Final image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
# Copy frontend build into wwwroot so ASP.NET can serve it
COPY --from=build-frontend /src/frontend/sirg-frontend/dist ./wwwroot

EXPOSE 80
# Use the PORT env var provided by Render at runtime. The shell form allows
# expanding ${PORT} at container start so Kestrel listens on the correct port.
ENTRYPOINT ["sh", "-c", "dotnet SIRG.Api.dll --urls http://*:${PORT:-80}"]
