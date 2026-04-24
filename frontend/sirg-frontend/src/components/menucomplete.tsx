import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../lib/api';
import '../admin/styles/admin.css';
import '../styles/hero.css';
import '../styles/menucomplete.css';
import '../styles/menu.css';

type ApiDish = {
  dishID: number;
  dishName: string;
  price: number | null;
  isActive: boolean;
  categoryDto?: { categoryName: string } | null;
};

const PREFERRED_ORDER = ['Entradas', 'Plato Principal', 'Ensaladas', 'Guarnición', 'Postres', 'Bebidas'];

function sortCategories(cats: string[]): string[] {
  const preferred = PREFERRED_ORDER.map((c) => c.toLowerCase());
  return [...cats].sort((a, b) => {
    const ai = preferred.indexOf(a.toLowerCase());
    const bi = preferred.indexOf(b.toLowerCase());
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b, 'es');
  });
}

export const Menucomplete = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/dishes')
      .then((data) => {
        if (Array.isArray(data)) setDishes(data.filter((d: ApiDish) => d.isActive));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, ApiDish[]>();
    for (const d of dishes) {
      const cat = d.categoryDto?.categoryName ?? 'Otros';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(d);
    }
    return map;
  }, [dishes]);

  const sortedCategories = useMemo(() => sortCategories([...grouped.keys()]), [grouped]);

  return (
    <div>
      <section className="menucomplete-hero">
        <div className="menucomplete-hero-inner">
          <div className="menucomplete-hero-sub">Nuestra Selección</div>
          <h1 className="menucomplete-hero-title">Menú</h1>
          <p className="menucomplete-hero-desc">Platos cuidadosamente preparados, descubre nuestras especialidades.</p>
          <div style={{ marginTop: 18 }}>
            <button className="hero-button" onClick={() => navigate('/reservas')}>Reservar Mesa</button>
            <button
              className="hero-button"
              style={{ marginLeft: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.14)' }}
              onClick={() => navigate('/')}
            >
              Volver
            </button>
          </div>
        </div>
      </section>

      <main className="menucomplete-main">
        <div style={{ width: '100%', maxWidth: 1100 }}>
          {loading ? (
            <div className="menucomplete-empty">Cargando menú…</div>
          ) : dishes.length === 0 ? (
            <div className="menucomplete-empty">No hay platos disponibles en este momento.</div>
          ) : (
            sortedCategories.map((cat) => (
              <section key={cat} className="menucomplete-category-section">
                <h2 className="menucomplete-category-title">{cat}</h2>
                <div className="menu-grid">
                  {(grouped.get(cat) ?? []).map((d) => (
                    <div key={d.dishID} className="menu-card">
                      <div className="menu-image" style={{ height: 200 }}>
                        <div className="menucomplete-card-placeholder" style={{ width: '100%', height: '100%', background: '#f3f3f3' }} />
                      </div>
                      <div className="menu-name">
                        <div style={{ fontWeight: 800 }}>{d.dishName}</div>
                        <div style={{ color: 'rgba(0,0,0,0.55)', fontSize: 13, marginTop: 2 }}>{cat}</div>
                        {d.price != null && (
                          <div style={{ marginTop: 8, fontWeight: 800, color: '#b91c1c' }}>
                            ${d.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Menucomplete;
