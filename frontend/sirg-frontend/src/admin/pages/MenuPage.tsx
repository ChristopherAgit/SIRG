import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RecipeLine } from '../models';
import { ingredientRepo, recipeRepo } from '../lib/repo';
import { useToast } from '../components/toast/ToastContext';
import { Modal } from '../components/Modal';
import apiFetch from '../../lib/api';

type ApiDish = {
  dishID: number;
  dishName: string;
  price: number | null;
  isActive: boolean;
  categoryID: number;
  categoryDto?: { categoryID: number; categoryName: string } | null;
};

type ApiCategory = { categoryID: number; categoryName: string };

type LineDraft = { ingredientId: string; qty: string };

type DishDraft = {
  dishName: string;
  categoryID: string;
  price: string;
  image: string;
};

export function MenuPage() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [saving, setSaving] = useState(false);

  const ingredients = useMemo(() => ingredientRepo.list().filter((i) => i.isActive), []);
  const recipes = useMemo(() => recipeRepo.list(), []);
  const recipeByDishId = useMemo(() => {
    const m = new Map<number, { lines: RecipeLine[] }>();
    for (const r of recipes) m.set(Number(r.dishId), r);
    return m;
  }, [recipes]);

  const load = useCallback(async () => {
    const [d, c] = await Promise.all([apiFetch('/dishes'), apiFetch('/categories')]);
    if (Array.isArray(d)) setDishes(d);
    if (Array.isArray(c)) setCategories(c);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dishes;
    return dishes.filter(
      (d) =>
        d.dishName.toLowerCase().includes(q) ||
        (d.categoryDto?.categoryName ?? '').toLowerCase().includes(q),
    );
  }, [dishes, query]);

  const [editDish, setEditDish] = useState<ApiDish | null>(null);
  const [viewDish, setViewDish] = useState<ApiDish | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [dishForm, setDishForm] = useState<DishDraft>({ dishName: '', categoryID: '', price: '', image: '' });
  const [lines, setLines] = useState<LineDraft[]>([]);

  function resetEditor() {
    setEditDish(null);
    setDishForm({ dishName: '', categoryID: String(categories[0]?.categoryID ?? ''), price: '', image: '' });
    setLines([]);
  }

  function openCreate() {
    resetEditor();
    if (ingredients.length > 0) setLines([{ ingredientId: ingredients[0].id, qty: '0' }]);
    setIsEditorOpen(true);
  }

  function openEdit(d: ApiDish) {
    setEditDish(d);
    setDishForm({
      dishName: d.dishName,
      categoryID: String(d.categoryID),
      price: String(d.price ?? ''),
      image: '',
    });
    const r = recipeRepo.getByDishId(String(d.dishID));
    setLines(r ? r.lines.map((l) => ({ ingredientId: l.ingredientId, qty: String(l.qty) })) : []);
    setIsEditorOpen(true);
  }

  function openView(d: ApiDish) {
    setViewDish(d);
    setIsViewOpen(true);
  }

  function ingredientName(id: string) { return ingredients.find((i) => i.id === id)?.name ?? '(Ingrediente)'; }
  function ingredientUnit(id: string) { return ingredients.find((i) => i.id === id)?.unit ?? ''; }

  async function toggleActive(dish: ApiDish) {
    try {
      await apiFetch(`/dishes/${dish.dishID}`, {
        method: 'PUT',
        body: JSON.stringify({
          dishID: dish.dishID,
          dishName: dish.dishName,
          categoryID: dish.categoryID,
          price: dish.price,
          isActive: !dish.isActive,
        }),
      });
      toast.push({ type: 'info', title: dish.isActive ? 'Oculto del menú' : 'Visible en menú', message: dish.dishName });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado.' });
    }
  }

  async function onPickImage(file: File) {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.readAsDataURL(file);
    });
    setDishForm((f) => ({ ...f, image: dataUrl }));
    toast.push({ type: 'success', title: 'Imagen cargada', message: 'Se guardará junto al plato.' });
  }

  async function saveDishAndRecipe() {
    const dishName = dishForm.dishName.trim();
    const categoryID = Number(dishForm.categoryID);
    const price = Number(dishForm.price);

    if (!dishName) {
      toast.push({ type: 'error', title: 'Falta el nombre', message: 'Escribe el nombre del plato.' });
      return;
    }
    if (!categoryID) {
      toast.push({ type: 'error', title: 'Falta la categoría', message: 'Selecciona una categoría.' });
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast.push({ type: 'error', title: 'Precio inválido', message: 'Debe ser un número mayor o igual a 0.' });
      return;
    }

    const parsed: RecipeLine[] = [];
    for (const l of lines) {
      if (!l.ingredientId) continue;
      const qty = Number(l.qty);
      if (l.qty.trim() === '' || l.qty.trim() === '0') continue;
      if (Number.isNaN(qty) || qty <= 0) {
        toast.push({ type: 'error', title: 'Cantidad inválida', message: 'Cada cantidad de receta debe ser mayor que 0.' });
        return;
      }
      parsed.push({ ingredientId: l.ingredientId, qty });
    }

    setSaving(true);
    try {
      if (editDish) {
        await apiFetch(`/dishes/${editDish.dishID}`, {
          method: 'PUT',
          body: JSON.stringify({ dishID: editDish.dishID, dishName, categoryID, price, isActive: editDish.isActive }),
        });
        recipeRepo.upsert({ dishId: String(editDish.dishID), lines: parsed });
        toast.push({ type: 'success', title: 'Plato actualizado', message: dishName });
      } else {
        const created = await apiFetch('/dishes', {
          method: 'POST',
          body: JSON.stringify({ dishID: 0, dishName, categoryID, price, isActive: true }),
        });
        if (created?.dishID) {
          recipeRepo.upsert({ dishId: String(created.dishID), lines: parsed });
        }
        toast.push({ type: 'success', title: 'Plato agregado al menú', message: dishName });
      }
      setIsEditorOpen(false);
      resetEditor();
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Error al guardar', message: 'Revisa los datos e intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Menú</div>
          <div className="adminPageDesc">
            Catálogo de platos del restaurante. Agrega, edita o activa/desactiva según la disponibilidad del día.
          </div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={openCreate} disabled={categories.length === 0}>
            + Agregar al menú
          </button>
        </div>
      </div>

      <div className="adminCard" style={{ marginBottom: 14 }}>
        <div className="adminPageTitleRow" style={{ marginBottom: 0 }}>
          <div className="adminCardLabel" style={{ margin: 0 }}>Listado completo</div>
          <div style={{ width: '100%', maxWidth: 320 }}>
            <input className="adminInput" placeholder="Buscar por nombre o categoría..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="adminCard">
        <table className="adminTable" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Plato</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Receta</th>
              <th style={{ width: 300 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {dishes.length === 0 ? 'No hay platos. Usa "Agregar al menú" para crear el primero.' : 'Sin resultados.'}
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const r = recipeByDishId.get(d.dishID) ?? null;
                const hasRecipe = !!r && r.lines.length > 0;
                return (
                  <tr key={d.dishID}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{d.dishName}</div>
                      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{d.isActive ? 'Visible' : 'Oculto'}</div>
                    </td>
                    <td>{d.categoryDto?.categoryName ?? '—'}</td>
                    <td>{d.price != null ? `$${Number(d.price).toFixed(2)}` : '—'}</td>
                    <td>
                      <span className={`adminBadge ${hasRecipe ? '' : 'low'}`}>{hasRecipe ? 'Con insumos' : 'Solo menú'}</span>
                    </td>
                    <td>
                      <div className="adminRowActions" style={{ flexWrap: 'wrap' }}>
                        <button className="adminButton" type="button" onClick={() => openView(d)}>Ver receta</button>
                        <button className="adminButton" type="button" onClick={() => openEdit(d)}>Editar</button>
                        <button className="adminButton" type="button" onClick={() => void toggleActive(d)}>
                          {d.isActive ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: ver receta */}
      <Modal
        open={isViewOpen}
        title="Receta del plato"
        description={viewDish ? viewDish.dishName : undefined}
        onClose={() => setIsViewOpen(false)}
        footer={
          <>
            <button className="adminButton" type="button" onClick={() => setIsViewOpen(false)}>Cerrar</button>
            {viewDish ? (
              <button className="adminButton primary" type="button" onClick={() => { setIsViewOpen(false); openEdit(viewDish); }}>
                Editar
              </button>
            ) : null}
          </>
        }
      >
        {!viewDish ? null : (
          <>
            <div className="adminDivider" />
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Insumos por porción</div>
            {(() => {
              const r = recipeRepo.getByDishId(String(viewDish.dishID));
              if (!r || r.lines.length === 0) {
                return <div style={{ color: 'rgba(255,255,255,0.7)' }}>Sin receta. Edita el plato para agregar insumos.</div>;
              }
              return (
                <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
                  {r.lines.map((l) => (
                    <li key={l.ingredientId}>{ingredientName(l.ingredientId)}: <b>{l.qty}</b> {ingredientUnit(l.ingredientId)}</li>
                  ))}
                </ul>
              );
            })()}
          </>
        )}
      </Modal>

      {/* Modal: crear / editar */}
      <Modal
        open={isEditorOpen}
        title={editDish ? 'Editar plato' : 'Agregar al menú'}
        description="Nombre, categoría, precio y receta opcional (insumos por porción)."
        onClose={() => { setIsEditorOpen(false); resetEditor(); }}
        footer={
          <>
            <button className="adminButton" type="button" onClick={() => { setIsEditorOpen(false); resetEditor(); }}>Cancelar</button>
            <button className="adminButton primary" type="button" onClick={() => void saveDishAndRecipe()} disabled={saving}>
              {saving ? 'Guardando…' : editDish ? 'Guardar' : 'Crear'}
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col12">
            <label className="adminLabel">Nombre del plato</label>
            <input className="adminInput" value={dishForm.dishName} onChange={(e) => setDishForm((f) => ({ ...f, dishName: e.target.value }))} placeholder="Ej: Pollo a la plancha" />
          </div>
          <div className="col9">
            <label className="adminLabel">Categoría</label>
            <select className="adminSelect" value={dishForm.categoryID} onChange={(e) => setDishForm((f) => ({ ...f, categoryID: e.target.value }))}>
              <option value="">— Selecciona —</option>
              {categories.map((c) => (
                <option key={c.categoryID} value={String(c.categoryID)}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <div className="col3">
            <label className="adminLabel">Precio</label>
            <input className="adminInput" value={dishForm.price} onChange={(e) => setDishForm((f) => ({ ...f, price: e.target.value }))} placeholder="Ej: 350" />
          </div>
          <div className="col12">
            <label className="adminLabel">Imagen (opcional — URL o sube archivo)</label>
            <div className="adminActions">
              <input className="adminInput" value={dishForm.image} onChange={(e) => setDishForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://... o data:image/..." />
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onPickImage(f); }} />
            </div>
          </div>

          <div className="col12">
            <div className="adminDivider" />
            <div className="adminActions" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800 }}>Receta (opcional)</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Cantidades por una porción vendida.</div>
              </div>
              <button className="adminButton" type="button" onClick={() => setLines((p) => [...p, { ingredientId: ingredients[0]?.id ?? '', qty: '0' }])} disabled={ingredients.length === 0}>
                + Insumo
              </button>
            </div>
            {ingredients.length === 0 && (
              <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                No hay insumos activos. Regístralos en <b>Ingredientes</b> o <b>Inventario</b>.
              </div>
            )}
          </div>

          <div className="col12">
            <table className="adminTable">
              <thead>
                <tr><th>Insumo</th><th style={{ width: 240 }}>Cantidad / porción</th><th style={{ width: 120 }}>Acciones</th></tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr><td colSpan={3} style={{ color: 'rgba(255,255,255,0.7)' }}>Sin receta: el plato se guarda solo en el menú.</td></tr>
                ) : (
                  lines.map((l, idx) => (
                    <tr key={`${l.ingredientId}_${idx}`}>
                      <td>
                        <select className="adminSelect" value={l.ingredientId} onChange={(e) => setLines((p) => p.map((x, i) => i === idx ? { ...x, ingredientId: e.target.value } : x))}>
                          {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10, alignItems: 'center' }}>
                          <input className="adminInput" value={l.qty} onChange={(e) => setLines((p) => p.map((x, i) => i === idx ? { ...x, qty: e.target.value } : x))} placeholder="Ej: 180" />
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{ingredientUnit(l.ingredientId)}</div>
                        </div>
                      </td>
                      <td>
                        <button className="adminButton danger" type="button" onClick={() => setLines((p) => p.filter((_, i) => i !== idx))}>Quitar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
