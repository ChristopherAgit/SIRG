import { NavLink, Outlet } from 'react-router-dom';
import '../styles/admin.css';
import { ensureAdminSeedData } from '../lib/seed';
import { useEffect } from 'react';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/roles', label: 'Roles' },
  { to: '/admin/ingredientes', label: 'Ingredientes' },
  { to: '/admin/platos', label: 'Platos' },
  { to: '/admin/recetas', label: 'Recetas' },
  { to: '/admin/inventario', label: 'Inventario' },
  { to: '/admin/analitica', label: 'Analítica' },
];

export function AdminLayout() {
  useEffect(() => {
    ensureAdminSeedData();
  }, []);

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <div className="adminBrand">
          <div className="adminBrandTitle">SIRG</div>
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
            <div className="adminHeaderHint">Frontend only (mock/localStorage)</div>
          </div>
        </header>

        <section className="adminContent">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

