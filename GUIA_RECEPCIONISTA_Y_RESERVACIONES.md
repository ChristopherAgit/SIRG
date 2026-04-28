# 📋 Guía - Nuevo Rol Recepcionista y Página de Reservaciones

## Resumen de Cambios

Se ha implementado un nuevo rol **Recepcionista** con una página moderna para gestionar todas las reservaciones del restaurante **Constantinopla**.

---

## 🎯 Features Nuevas

### 1. **Nuevo Rol: Recepcionista**
- Los recepcionistas pueden acceder al panel de administración limitado
- Solo ven: **Panel** y **Reservaciones**
- Los administradores tienen acceso a todas las opciones (roles, ingredientes, menú, mesas, inventario)

### 2. **Nueva Página: Reservaciones**
Ubicada en: `/admin/reservaciones`

**Funcionalidades:**
- 📊 **Vista de Tabla Modernas**: Visualiza todas las reservaciones con información clara
- 🔍 **Búsqueda Avanzada**: Filtra por:
  - Nombre del cliente
  - Teléfono del cliente
  - Email
  - Estado (Pendiente, Confirmada, Cancelada)
  - Fecha específica

- 👁️ **Ver Detalles**: Abre un modal con información completa:
  - Datos del cliente (nombre, teléfono, email)
  - Detalles de la reservación (fecha, hora, personas)
  - Mesa asignada y su capacidad
  - Estado actual
  - Fecha de creación

- 🔄 **Cambiar Estado**: Desde el modal puedes cambiar el estado de la reservación:
  - ⏳ Pendiente (naranja) - Reserva inicial
  - ✅ Confirmada (verde) - Reserva confirmada
  - ❌ Cancelada (rojo) - Reserva cancelada

- 💅 **Diseño Coherente**: Completamente integrado con la estética moderna de Constantinopla

---

## 👥 Cómo Crear un Recepcionista

### Opción 1: Desde la Web (Recomendado)

1. Inicia sesión como **Administrador**
2. Ve a `/admin/roles` (Roles y personal)
3. Crea un nuevo usuario
4. Asigna el rol **"Recepcionista"**

### Opción 2: Desde la BD (Directo)

Ejecuta estos comandos en SQL Server:

```sql
-- Crear usuario recepcionista
INSERT INTO AspNetUsers (Id, UserName, Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber, TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount, FirstName, LastName, Cedula, Status)
VALUES (
    NEWID(),
    'recepcionista@constantinopla.com',
    'recepcionista@constantinopla.com',
    'RECEPCIONISTA@CONSTANTINOPLA.COM',
    1,
    'HASH_AQUI', -- Hash de contraseña (ver más abajo)
    NEWID(),
    NEWID(),
    '809-000-0000',
    0,
    NULL,
    0,
    0,
    'Recepcionista',
    'Constantinopla',
    '00000000001',
    'Active'
);

-- Obtener el ID que acabas de crear
SELECT Id FROM AspNetUsers WHERE UserName = 'recepcionista@constantinopla.com';

-- Asignar rol Recepcionista (reemplaza {USER_ID} con el ID anterior)
INSERT INTO AspNetUserRoles (UserId, RoleId)
SELECT '{USER_ID}', Id FROM AspNetRoles WHERE Name = 'Recepcionista';
```

**Nota**: Para el hash de contraseña, usa `dotnet user-secrets` o un generador de hash seguro.

---

## 🔐 Permisos y Acceso

### Administrador
- ✅ Acceso completo: Panel, Reservaciones, Roles, Ingredientes, Menú, Mesas, Inventario
- ✅ Puede cambiar estado de reservaciones
- ✅ Puede crear/editar/eliminar contenido

### Recepcionista
- ✅ Solo acceso a: Panel y Reservaciones
- ✅ Puede ver todas las reservaciones
- ✅ Puede cambiar estado de reservaciones (Pendiente → Confirmada → Cancelada)
- ❌ No puede acceder a roles, ingredientes, menú, mesas o inventario

---

## 📲 Dashboard de Reservaciones

### Interfaz Principal
```
┌─────────────────────────────────────────────────────────────┐
│  RESERVACIONES - Gestiona las reservaciones del restaurante │
└─────────────────────────────────────────────────────────────┘

┌─ FILTROS ─────────────────────────────────────────────────┐
│ [🔍 Buscar cliente] [📊 Estado] [📅 Fecha] [Limpiar]     │
└──────────────────────────────────────────────────────────┘

┌─ TABLA DE RESERVACIONES ──────────────────────────────────┐
│ Cliente  │ Fecha   │ Hora  │ Personas │ Mesa │ Estado │ ver│
├──────────┼─────────┼───────┼──────────┼──────┼────────┼────┤
│ Juan P.  │20/04/26 │14:00  │    4     │Mesa 5│ ✅     │ 👁️ │
│ María S. │21/04/26 │19:30  │    2     │Mesa 2│ ⏳     │ 👁️ │
│ Pedro L. │19/04/26 │12:00  │    6     │Mesa 8│ ❌     │ 👁️ │
└──────────┴─────────┴───────┴──────────┴──────┴────────┴────┘
```

### Vista de Detalles (Modal)

```
┌─ DETALLES DE LA RESERVACIÓN ──────────────────────────────┐
│
│ 📋 Información del Cliente
│    Nombre:    Juan Pérez
│    Teléfono:  849-1234567
│    Email:     juan@email.com
│
│ 📅 Detalles de la Reservación
│    Fecha:             20/04/2026 (viernes)
│    Hora:              14:00
│    Número de Personas: 4
│    Mesa Asignada:      Mesa #5 (Capacidad: 6)
│    Estado:             ✅ Confirmada
│    Creada:            15/04/2026 10:30:45
│
│ 🔄 Cambiar Estado
│    [⏳ Pendiente]  [✅ Confirmada]  [❌ Cancelada]
│
│                           [Cerrar]
└───────────────────────────────────────────────────────────┘
```

---

## 🎨 Branding: Constantinopla

Todos los elementos visuales han sido actualizados:
- ✅ Título de la pestaña: "Constantinopla - Restaurante"
- ✅ Logo en panel: "Constantinopla"
- ✅ Emails: "Confirmación de Reserva - Constantinopla"
- ✅ Colores: Tema rojo corporativo (#b22222)
- ✅ Contacto: consta@tinopla.com

---

## 🚀 Cómo Usar

### Para Recepcionista:

1. **Inicia sesión**: `/login` con usuario recepcionista
2. **Accede a panel**: Verás solo Reservaciones
3. **Filtra reservaciones**:
   - Busca por nombre del cliente
   - Filtra por estado (Pendiente, Confirmada, Cancelada)
   - Filtra por fecha específica
4. **Ver detalles**: Haz click en "Ver" para abrir modal
5. **Actualizar estado**: Desde modal, elige nuevo estado y guarda

### Para Administrador:

Tiene acceso a todo lo que el recepcionista ve, **más**:
- Administrar roles y personal
- Gestionar ingredientes
- Crear/editar menú
- Configurar mesas
- Gestionar inventario

---

## 🔧 Cambios en el Código

### Backend (C# .NET)
- ✅ Rol "Recepcionista" agregado en `DefaultRoles.cs`
- ✅ Rol "Cocinero" también fue agregado para uso futuro
- ✅ Acceso público a endpoints GET de reservaciones (ya existía)
- ✅ Acceso privado a endpoints POST/PUT de cambio de estado (requiere auth)

### Frontend (React + TypeScript)
- ✅ Nueva página: `ReservationsPage.tsx`
- ✅ Nuevos estilos: `reservations.css`
- ✅ Actualizada: `AdminLayout.tsx` (muestra roles diferenciados)
- ✅ Actualizado: `App.tsx` (nueva ruta y permisos)
- ✅ Actualizado: Logo "SIRG" → "Constantinopla"

---

## 📋 Checklist de Verificación

- [ ] Backend reiniciado (migrations ejecutadas)
- [ ] Rol "Recepcionista" creado en BD
- [ ] Usuario Recepcionista creado con ese rol
- [ ] Frontend recargado
- [ ] Inicia sesión como Recepcionista
- [ ] Verifica que solo ve "Panel" y "Reservaciones"
- [ ] Haz click en "Reservaciones"
- [ ] Verifica que carga la lista de reservaciones
- [ ] Prueba búsqueda y filtros
- [ ] Abre un modal de detalles
- [ ] Cambia el estado de una reservación
- [ ] Verifica que se guarda el cambio

---

## 🐛 Troubleshooting

**Q: "Error 404" cuando intento acceder a `/admin/reservaciones`**
A: Asegúrate de que:
- Recargaste el frontend (npm run dev)
- El backend está corriendo
- Iniciaste sesión con credenciales válidas

**Q: "No soy Recepcionista, ¿cómo creo uno?"**
A: Inicia sesión como Administrador → `/admin/roles` → Crea usuario con rol Recepcionista

**Q: "¿Puedo cambiar permisos del Recepcionista?"**
A: Sí, modifica `App.tsx` línea con `<PrivateRoute roles={["Administrador", "Recepcionista"]}>` para agregar/quitar roles

**Q: "Las reservaciones no aparecen"**
A: Verifica:
- Hay reservaciones en BD
- Backend está en `/api/v1/reservations/all`
- La consola no muestra errores (F12)

---

## 📞 Soporte

Para cambios futuros:
- Agregar más campos a la vista de detalles
- Exportar reservaciones a Excel
- Enviar reminders por email
- Integrar reservaciones con facturación

Contacta al equipo de desarrollo para solicitudes adicionales.

---

**Versión**: 1.0  
**Fecha**: 15 Abril 2026  
**Equipo**: Constantinopla
