import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../styles/admin.css';
import { ensureAdminSeedData } from '../lib/seed';
import { useEffect, useState } from 'react';

const adminNavItems = [
  { to: '/admin', label: 'Panel', end: true },
  { to: '/admin/reservaciones', label: 'Reservaciones' },
  { to: '/admin/roles', label: 'Roles y personal' },
  { to: '/admin/ingredientes', label: 'Ingredientes' },
  { to: '/admin/menu', label: 'Menú' },
  { to: '/admin/mesas', label: 'Mesas' },
  { to: '/admin/inventario', label: 'Inventario' },
];

const recepcionistNavItems = [
  { to: '/admin', label: 'Panel', end: true },
  { to: '/admin/reservaciones', label: 'Reservaciones' },
];

export function AdminLayout() {
  useEffect(() => {
    ensureAdminSeedData();
  }, []);
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sirg_auth');
      const parsed = raw ? JSON.parse(raw) : null;
      setUserName(parsed?.name ?? null);
      setUserRole(parsed?.roles?.[0] ?? null);
    } catch {
      setUserName(null);
      setUserRole(null);
    }
  }, []);

  // Seleccionar items de navegación según rol
  const navItems = userRole === 'Recepcionista' ? recepcionistNavItems : adminNavItems;

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <div className="adminBrand">
          <div className="adminBrandTitle">Constantinopla</div>
          <div className="adminBrandSub">Administración</div>
        </div>

        <nav className="adminNav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end as boolean | undefined}
              className={({ isActive }) => `adminNavItem ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="adminMain">
        <header className="adminHeader">
          <div className="adminHeaderLeft">
            <div className="adminHeaderTitle">Panel</div>
            <div className="adminHeaderHint">{userRole === 'Recepcionista' ? 'Recepcionista' : 'Administración'}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            {userName ? <div style={{ color: 'var(--admin-muted)', fontSize: 13 }}>Hola, <b>{userName}</b></div> : null}
            <button
              className="adminButton"
              type="button"
              onClick={() => {
                navigate('/');
              }}
            >
              Volver
            </button>
            <button
              className="adminButton"
              type="button"
              onClick={() => {
                localStorage.removeItem('sirg_auth');
                navigate('/login');
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="adminContent">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

