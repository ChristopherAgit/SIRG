import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { dishRepo, ingredientRepo, movementRepo, recipeRepo, roleRepo } from '../lib/repo';
import { computeStock } from '../lib/repo';

export function AdminDashboardPage() {
  const [refresh] = useState(0);

  const stats = useMemo(() => {
    const roles = roleRepo.list();
    const ingredients = ingredientRepo.list();
    const dishes = dishRepo.list();
    const recipes = recipeRepo.list();
    const movements = movementRepo.list();

    const activeIngredients = ingredients.filter((i) => i.isActive);
    const lowStockCount = activeIngredients.filter((i) => (i.minStock ?? null) !== null && computeStock(i.id) < (i.minStock as number)).length;

    const dishesWithRecipe = new Set(recipes.map((r) => r.dishId));
    const missingRecipeCount = dishes.filter((d) => d.isActive && !dishesWithRecipe.has(d.id)).length;

    return {
      roleCount: roles.length,
      dishCount: dishes.filter((d) => d.isActive).length,
      ingredientCount: activeIngredients.length,
      movementCount: movements.length,
      lowStockCount,
      missingRecipeCount,
    };
  }, [refresh]);

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Dashboard</div>
          <div className="adminPageDesc">Vista general (datos mock). Navega a los módulos del panel.</div>
        </div>
      </div>

      <div className="adminCardGrid">
        <div className="adminCard">
          <div className="adminCardLabel">Roles</div>
          <div className="adminCardKpi">{stats.roleCount}</div>
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/roles" className="adminButton primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Administrar roles
            </Link>
          </div>
        </div>
        <div className="adminCard">
          <div className="adminCardLabel">Platos (activos)</div>
          <div className="adminCardKpi">{stats.dishCount}</div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            Sin receta: <b>{stats.missingRecipeCount}</b>
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/platos" className="adminButton primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Administrar platos
            </Link>
          </div>
        </div>
        <div className="adminCard">
          <div className="adminCardLabel">Ingredientes (activos)</div>
          <div className="adminCardKpi">{stats.ingredientCount}</div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            Bajo stock: <b>{stats.lowStockCount}</b>
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/inventario" className="adminButton primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Ver inventario
            </Link>
          </div>
        </div>

        <div className="adminCard" style={{ gridColumn: 'span 12' }}>
          <div className="adminCardLabel">Accesos rápidos</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
            <Link to="/admin/ingredientes" className="adminButton" style={{ textDecoration: 'none' }}>
              Ingredientes
            </Link>
            <Link to="/admin/recetas" className="adminButton" style={{ textDecoration: 'none' }}>
              Recetas
            </Link>
            <Link to="/admin/analitica" className="adminButton" style={{ textDecoration: 'none' }}>
              Analítica
            </Link>
            <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.65)', fontSize: 12, alignSelf: 'center' }}>
              Movimientos registrados: <b>{stats.movementCount}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

