export function AnalyticsPage() {
  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Analítica</div>
          <div className="adminPageDesc">
            Placeholder para el futuro módulo de reportes (Python). Solo UI por ahora.
          </div>
        </div>
      </div>

      <div className="adminCard">
        <div className="adminCardLabel">Filtros (UI)</div>
        <div className="adminFormGrid">
          <div className="col4">
            <label className="adminLabel">Desde</label>
            <input className="adminInput" type="date" />
          </div>
          <div className="col4">
            <label className="adminLabel">Hasta</label>
            <input className="adminInput" type="date" />
          </div>
          <div className="col4">
            <label className="adminLabel">Tipo de reporte</label>
            <select className="adminSelect">
              <option>Ventas</option>
              <option>Inventario</option>
              <option>Platos más vendidos</option>
            </select>
          </div>
          <div className="col12">
            <button className="adminButton primary" type="button">
              Generar (placeholder)
            </button>
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)' }}>
          Cuando el módulo Python esté listo, aquí se mostrarán tablas/gráficas con resultados.
        </div>
      </div>
    </div>
  );
}

