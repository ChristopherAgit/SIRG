import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { roleRepo, staffRepo } from '../lib/repo';
import { useToast } from '../components/toast/ToastContext';
import apiFetch from '../../lib/api';

type Stats = {
  menuVisible: number; menuTotal: number;
  tablesActive: number; tablesTotal: number;
  insumosTotal: number;
  personalActivo: number; personalTotal: number;
  rolesCount: number;
};

export function AdminDashboardPage() {
  const toast = useToast();
  const staff = staffRepo.list();
  const roles = roleRepo.list();
  const [stats, setStats] = useState<Stats>({
    menuVisible: 0, menuTotal: 0,
    tablesActive: 0, tablesTotal: 0,
    insumosTotal: 0,
    personalActivo: staff.filter((s) => s.isActive).length,
    personalTotal: staff.length,
    rolesCount: roles.length,
  });

  useEffect(() => {
    Promise.all([apiFetch('/dishes'), apiFetch('/tables'), apiFetch('/ingredients')])
      .then(([dishes, tables, ingredients]) => {
        setStats((prev) => ({
          ...prev,
          menuVisible: Array.isArray(dishes) ? dishes.filter((d: any) => d.isActive).length : 0,
          menuTotal: Array.isArray(dishes) ? dishes.length : 0,
          tablesActive: Array.isArray(tables) ? tables.filter((t: any) => t.isActive).length : 0,
          tablesTotal: Array.isArray(tables) ? tables.length : 0,
          insumosTotal: Array.isArray(ingredients) ? ingredients.length : 0,
        }));
      })
      .catch(() => {});
  }, []);

  function onDownloadReport() {
    toast.push({
      type: 'info',
      title: 'Descargar reporte',
      message: 'Próximamente: este botón se conectará al bot de reportes de tu equipo.',
    });
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Panel</div>
          <div className="adminPageDesc">
            Resumen rápido del local: menú, mesas, inventario y equipo. Los datos los vas cargando tú según tu operación.
          </div>
        </div>
      </div>

      <div className="adminCardGrid">
        <div className="adminCard">
          <div className="adminCardLabel">Platos en menú (visibles)</div>
          <div className="adminCardKpi">{stats.menuVisible}</div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
            Total ítems: <b>{stats.menuTotal}</b> (incl. ocultos)
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/menu" className="adminButton primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Ir al menú
            </Link>
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCardLabel">Mesas activas</div>
          <div className="adminCardKpi">{stats.tablesActive}</div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
            Registradas: <b>{stats.tablesTotal}</b>
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/mesas" className="adminButton primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Gestionar mesas
            </Link>
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCardLabel">Insumos registrados</div>
          <div className="adminCardKpi">{stats.insumosTotal}</div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
            Total en catálogo
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/inventario" className="adminButton primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Ver inventario
            </Link>
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCardLabel">Personal activo</div>
          <div className="adminCardKpi">{stats.personalActivo}</div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
            Registrados: <b>{stats.personalTotal}</b> · Roles: <b>{stats.rolesCount}</b>
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/roles" className="adminButton primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Roles y horarios
            </Link>
          </div>
        </div>

        <div className="adminCard" style={{ gridColumn: 'span 12' }}>
          <div className="adminCardLabel">Reportes</div>
          <p style={{ margin: '10px 0 16px', color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.5, maxWidth: 640 }}>
            Cuando el servicio esté listo, aquí descargarás reportes generados por el bot de tu equipo.
          </p>
          <button className="adminButton primary" type="button" onClick={onDownloadReport} style={{ padding: '14px 22px', fontSize: 15 }}>
            Descargar reporte
          </button>
        </div>
      </div>
    </div>
  );
}
