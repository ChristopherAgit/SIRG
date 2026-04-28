# Code-First Migrations Guide (SIRG)

This document explains how to create and apply EF Core code-first migrations for the SIRG solution.

Prerequisites
- .NET SDK installed (matching project SDKs). Use `dotnet --version`.
- Tooling: install EF tools globally if not present:

```powershell
dotnet tool install --global dotnet-ef
```

Common project layout
- `SIRG.Persistences` contains the EF `SIRGContext` and migrations folder.
- `SIRG.Api` is the startup project used when applying migrations to the runtime database.

Add a migration
1. Open a terminal at the repository root.
2. Run (example: adding MeseroSessions):

```powershell
dotnet ef migrations add AddMeseroSessions -p SIRG.Persistences -s SIRG.Api --context SIRG.Persistences.Context.SIRGContext
```

- `-p` points to the project that contains the DbContext and will contain the migration files (`SIRG.Persistences`).
- `-s` points to the startup project used to run the app for design-time services (`SIRG.Api`).
- `--context` optional when multiple contexts; use the fully qualified name if necessary.

Update the database
```powershell
dotnet ef database update -p SIRG.Persistences -s SIRG.Api --context SIRG.Persistences.Context.SIRGContext
```

Applying migrations in CI / Render
- In CI or Render build step, ensure the connection string is provided via environment variable (e.g. `ConnectionDb`).
- Run the `dotnet ef database update` command or call `context.Database.Migrate()` from startup (recommended) so the app migrates at launch.

Automate migrations at startup (optional)
In `Program.cs` you can run migrations automatically (useful in staging, but be careful in production):

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SIRG.Persistences.Context.SIRGContext>();
    db.Database.Migrate();
}
```

Notes & Best Practices
- Keep migrations small and focused; name them clearly.
- Review generated SQL in migrations before applying to production.
- Back up production DB before applying destructive migrations.
- Use feature flags or phased rollouts for large schema changes.

If you want, I can:
- Add an example migration file for `MeseroSessions` (requires running `dotnet ef migrations add` locally or in CI), or
- Add `context.Database.Migrate()` at startup (I can apply it to `Program.cs` if you want automatic migration on app start).

*** End of guide ***
