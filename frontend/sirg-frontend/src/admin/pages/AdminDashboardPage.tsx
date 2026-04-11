import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { dishRepo, ingredientRepo, roleRepo, staffRepo, tableRepo } from '../lib/repo';
import { useToast } from '../components/toast/ToastContext';

export function AdminDashboardPage() {
  const toast = useToast();

  const stats = useMemo(() => {
    const dishes = dishRepo.list();
    const tables = tableRepo.list();
    const ingredients = ingredientRepo.list();
    const staff = staffRepo.list();
    const roles = roleRepo.list();

    const menuVisible = dishes.filter((d) => d.isActive).length;
    const tablesActive = tables.filter((t) => t.isActive).length;
    const insumosActivos = ingredients.filter((i) => i.isActive).length;
    const personalActivo = staff.filter((s) => s.isActive).length;
    const personalTotal = staff.length;

    return {
      menuVisible,
      menuTotal: dishes.length,
      tablesActive,
      tablesTotal: tables.length,
      insumosActivos,
      insumosTotal: ingredients.length,
      personalActivo,
      personalTotal,
      rolesCount: roles.length,
    };
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
          <div className="adminCardLabel">Insumos activos</div>
          <div className="adminCardKpi">{stats.insumosActivos}</div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
            Total en catálogo: <b>{stats.insumosTotal}</b>
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
