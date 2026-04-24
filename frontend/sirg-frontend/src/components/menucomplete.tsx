import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dishRepo } from '../admin/lib/repo';
import '../admin/styles/admin.css';
import '../styles/hero.css';
import '../styles/menucomplete.css';
import '../styles/menu.css';

export const Menucomplete = () => {
    const navigate = useNavigate();
    const dishes = useMemo(() => dishRepo.list().filter((d) => d.isActive), []);

    const featured = useMemo(() => {
        // prefer dishes categorized as 'principal' (case-insensitive), fallback to first 5
        const byCat = dishes.filter((d) => (d.category ?? '').toLowerCase().includes('principal'));
        if (byCat.length > 0) return byCat.slice(0, 6);
        return dishes.slice(0, 6);
    }, [dishes]);

    const others = useMemo(() => dishes.filter((d) => !featured.some((f) => f.id === d.id)), [dishes, featured]);

    return (
        <div>
            <section className="menucomplete-hero">
                <div className="menucomplete-hero-inner">
                    <div className="menucomplete-hero-sub">Nuestra Selección</div>
                    <h1 className="menucomplete-hero-title">Menú</h1>
                    <p className="menucomplete-hero-desc">Platos cuidadosamente preparados, descubre nuestras especialidades.</p>
                    <div style={{ marginTop: 18 }}>
                        <button className="hero-button" onClick={() => navigate('/reservas')}>Reservar Mesa</button>
                        <button className="hero-button" style={{ marginLeft: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.14)' }} onClick={() => navigate('/')}>Volver</button>
                    </div>
                </div>
            </section>

            <main className="menucomplete-main">
                {/* Pasarela principal (horizontal) */}
                <section className="menucomplete-pasarela" aria-label="Platos principales">
                    {featured.length === 0 ? (
                        <div className="menucomplete-empty">No hay platos destacados.</div>
                    ) : (
                        <div className="menucomplete-pasarela-track">
                            {featured.map((d) => (
                                <div key={d.id} className="menu-card" style={{ minWidth: 260 }}>
                                    <div className="menu-image" style={{ height: 220 }}>
                                        {d.image ? <img src={d.image} alt={d.name} /> : <div className="menucomplete-card-placeholder" />}
                                    </div>
                                    <div className="menu-name" style={{ padding: 12 }}>
                                        <div style={{ fontWeight: 800 }}>{d.name}</div>
                                        <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13 }}>{d.category ?? '—'}</div>
                                        <div style={{ marginTop: 8, fontWeight: 800 }}>{d.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Galería debajo con los demás platos */}
                <section className="menucomplete-gallery" aria-label="Todos los platos">
                    {dishes.length === 0 ? (
                        <div className="menucomplete-empty">No hay platos.</div>
                    ) : others.length === 0 ? (
                        // Si hay platos pero no "otros", no mostrar mensaje de "No hay más platos"
                        <></>
                    ) : (
                        <div className="menu-grid" style={{ marginTop: 18 }}>
                            {others.map((d) => (
                                <div key={d.id} className="menu-card">
                                    <div className="menu-image" style={{ height: 220 }}>
                                        {d.image ? <img src={d.image} alt={d.name} /> : <div className="menucomplete-card-placeholder" />}
                                    </div>
                                    <div className="menu-name">
                                        <div style={{ fontWeight: 800 }}>{d.name}</div>
                                        <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13 }}>{d.category ?? '—'}</div>
                                        <div style={{ marginTop: 8, fontWeight: 800 }}>{d.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Menucomplete;