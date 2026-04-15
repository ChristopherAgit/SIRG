import { useMemo, useState } from 'react';
import type { Dish, RecipeLine } from '../models';
import { dishRepo, ingredientRepo, recipeRepo } from '../lib/repo';
import { useToast } from '../components/toast/ToastContext';
import { Modal } from '../components/Modal';
import apiFetch from '../../lib/api';

type LineDraft = { ingredientId: string; qty: string };

type DishDraft = {
  name: string;
  category: string;
  price: string;
  image: string;
};

export function MenuPage() {
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState('');
  const toast = useToast();

  const allDishes = useMemo(() => dishRepo.list(), [refresh]);
  const dishes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allDishes;
    return allDishes.filter(
      (d) => d.name.toLowerCase().includes(q) || (d.category ?? '').toLowerCase().includes(q),
    );
  }, [allDishes, query]);

  const ingredients = useMemo(() => ingredientRepo.list().filter((i) => i.isActive), [refresh]);
  const recipes = useMemo(() => recipeRepo.list(), [refresh]);

  const recipeByDishId = useMemo(() => {
    const m = new Map<string, { dishId: string; lines: RecipeLine[]; updatedAt: string }>();
    for (const r of recipes) m.set(r.dishId, r);
    return m;
  }, [recipes]);

  const [viewDish, setViewDish] = useState<Dish | null>(null);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [dishForm, setDishForm] = useState<DishDraft>({ name: '', category: '', price: '', image: '' });
  const [lines, setLines] = useState<LineDraft[]>([]);

  function resetEditor() {
    setEditDish(null);
    setDishForm({ name: '', category: '', price: '', image: '' });
    setLines([]);
  }

  function ingredientName(id: string) {
    return ingredients.find((i) => i.id === id)?.name ?? '(Ingrediente)';
  }
  function ingredientUnit(id: string) {
    return ingredients.find((i) => i.id === id)?.unit ?? '';
  }

  function openCreate() {
    resetEditor();
    if (ingredients.length > 0) setLines([{ ingredientId: ingredients[0].id, qty: '0' }]);
    else setLines([]);
    setIsEditorOpen(true);
  }

  function openEdit(d: Dish) {
    setEditDish(d);
    setDishForm({
      name: d.name,
      category: d.category ?? '',
      price: String(d.price),
      image: d.image ?? '',
    });
    const r = recipeRepo.getByDishId(d.id);
    setLines(r ? r.lines.map((l) => ({ ingredientId: l.ingredientId, qty: String(l.qty) })) : []);
    setIsEditorOpen(true);
  }

  function openView(d: Dish) {
    setViewDish(d);
    setIsViewOpen(true);
  }

  function addLine() {
    const defaultIng = ingredients[0]?.id ?? '';
    setLines((prev) => [...prev, { ingredientId: defaultIng, qty: '0' }]);
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleActive(dish: Dish) {
    (async () => {
      try {
        await apiFetch(`/dishes/${dish.id}`, { method: 'PUT', body: JSON.stringify({ isActive: !dish.isActive }) });
        // actualizar repo local para mantener coherencia UI si la API responde correctamente
        dishRepo.update(dish.id, { isActive: !dish.isActive });
        toast.push({ type: 'info', title: dish.isActive ? 'Oculto del menú' : 'Visible en menú', message: dish.name });
      } catch {
        dishRepo.update(dish.id, { isActive: !dish.isActive });
        toast.push({ type: 'info', title: dish.isActive ? 'Oculto del menú' : 'Visible en menú', message: `${dish.name} (local)` });
      } finally {
        setRefresh((x) => x + 1);
      }
    })();
  }

  async function onPickImage(file: File) {
    const reader = new FileReader();
    const p = new Promise<string>((resolve, reject) => {
      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      reader.onload = () => resolve(String(reader.result ?? ''));
    });
    reader.readAsDataURL(file);
    const dataUrl = await p;
    setDishForm((f) => ({ ...f, image: dataUrl }));
    toast.push({ type: 'success', title: 'Imagen cargada', message: 'Se guardará junto al plato.' });
  }

  function saveDishAndRecipe() {
    const name = dishForm.name.trim();
    const category = dishForm.category.trim() || undefined;
    const price = Number(dishForm.price);
    const image = dishForm.image.trim() || undefined;

    if (!name) {
      toast.push({ type: 'error', title: 'Falta el nombre', message: 'Escribe el nombre del plato.' });
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast.push({ type: 'error', title: 'Precio inválido', message: 'Debe ser un número mayor o igual a 0.' });
      return;
    }

    const exists = dishRepo.list().some((d) => d.name.toLowerCase() === name.toLowerCase() && d.id !== editDish?.id);
    if (exists) {
      toast.push({ type: 'error', title: 'Plato duplicado', message: 'Ya existe un ítem con ese nombre en el menú.' });
      return;
    }

    const parsed: RecipeLine[] = [];
    for (const l of lines) {
      if (!l.ingredientId) continue;
      const raw = l.qty.trim();
      if (raw === '' || raw === '0') continue;
      const qty = Number(l.qty);
      if (Number.isNaN(qty) || qty <= 0) {
        toast.push({ type: 'error', title: 'Cantidad inválida', message: 'En receta, cada cantidad debe ser mayor que 0.' });
        return;
      }
      parsed.push({ ingredientId: l.ingredientId, qty });
    }

    if (parsed.length > 0 && ingredients.length === 0) {
      toast.push({ type: 'error', title: 'Sin insumos', message: 'Agrega productos en Inventario o en Ingredientes antes de armar una receta.' });
      return;
    }

    const unique = new Set(parsed.map((p) => p.ingredientId));
    if (unique.size !== parsed.length) {
      toast.push({ type: 'error', title: 'Ingrediente repetido', message: 'No repitas el mismo insumo en la receta.' });
      return;
    }

    let dishId: string;
    if (editDish) {
      dishId = editDish.id;
      (async () => {
        try {
          await apiFetch(`/dishes/${editDish.id}`, { method: 'PUT', body: JSON.stringify({ name, category, price, image }) });
          toast.push({ type: 'success', title: 'Ítem actualizado', message: name });
        } catch {
          dishRepo.update(editDish.id, { name, category: category ?? '', price, image });
          toast.push({ type: 'success', title: 'Ítem actualizado', message: `${name} (local)` });
        } finally {
          setRefresh((x) => x + 1);
        }
      })();
    } else {
      // create locally first (synchronous) then try server create
      const created = dishRepo.create({ name, category, price, image });
      dishId = created.id;
      (async () => {
        try {
          await apiFetch('/dishes', { method: 'POST', body: JSON.stringify({ name, category, price, image }) });
          toast.push({ type: 'success', title: 'Agregado al menú', message: name });
        } catch {
          toast.push({ type: 'success', title: 'Agregado al menú', message: `${name} (local)` });
        } finally {
          setRefresh((x) => x + 1);
        }
      })();
    }

    recipeRepo.upsert({ dishId, lines: parsed });
    if (parsed.length > 0) {
      toast.push({ type: 'success', title: 'Receta guardada', message: 'Así podrás enlazar consumo con inventario cuando registres ventas.' });
    }

    setIsEditorOpen(false);
    resetEditor();
    setRefresh((x) => x + 1);
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Menú</div>
          <div className="adminPageDesc">
            Todo lo que ofreces al cliente: agrega platos nuevos, precio y foto. La receta (insumos por porción) es opcional pero recomendada para
            descontar inventario cuando tengas ventas registradas. Cada restaurante define su propio catálogo.
          </div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={openCreate}>
            + Agregar al menú
          </button>
        </div>
      </div>

      <div className="adminCard" style={{ marginBottom: 14 }}>
        <div className="adminPageTitleRow" style={{ marginBottom: 0 }}>
          <div className="adminCardLabel" style={{ margin: 0 }}>
            Listado completo
          </div>
          <div style={{ width: '100%', maxWidth: 320 }}>
            <input className="adminInput" placeholder="Buscar por nombre o categoría..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="adminCard">
        <table className="adminTable" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ width: 72 }}>Imagen</th>
              <th>Plato</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Receta</th>
              <th style={{ width: 300 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dishes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  No hay ítems. Usa “Agregar al menú” para el primero.
                </td>
              </tr>
            ) : (
              dishes.map((d) => {
                const r = recipeByDishId.get(d.id) ?? null;
                const hasRecipe = !!r && r.lines.length > 0;
                return (
                  <tr key={d.id}>
                    <td>
                      {d.image ? (
                        <img
                          src={d.image}
                          alt={d.name}
                          style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}
                        />
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{d.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{d.isActive ? 'Visible' : 'Oculto'}</div>
                    </td>
                    <td>{d.category ?? '—'}</td>
                    <td>{d.price}</td>
                    <td>
                      <span className={`adminBadge ${hasRecipe ? '' : 'low'}`}>{hasRecipe ? 'Con insumos' : 'Solo menú'}</span>
                    </td>
                    <td>
                      <div className="adminRowActions" style={{ flexWrap: 'wrap' }}>
                        <button className="adminButton" type="button" onClick={() => openView(d)}>
                          Ver receta
                        </button>
                        <button className="adminButton" type="button" onClick={() => openEdit(d)}>
                          Editar
                        </button>
                        <button className="adminButton" type="button" onClick={() => toggleActive(d)}>
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

      <Modal
        open={isViewOpen}
        title="Receta del plato"
        description={viewDish ? viewDish.name : undefined}
        onClose={() => setIsViewOpen(false)}
        footer={
          <>
            <button className="adminButton" type="button" onClick={() => setIsViewOpen(false)}>
              Cerrar
            </button>
            {viewDish ? (
              <button
                className="adminButton primary"
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  openEdit(viewDish);
                }}
              >
                Editar
              </button>
            ) : null}
          </>
        }
      >
        {!viewDish ? (
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Selecciona un plato.</div>
        ) : (
          <>
            {viewDish.image ? (
              <img
                src={viewDish.image}
                alt={viewDish.name}
                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)' }}
              />
            ) : null}
            <div className="adminDivider" />
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Insumos por porción</div>
            {(() => {
              const r = recipeRepo.getByDishId(viewDish.id);
              if (!r || r.lines.length === 0) {
                return (
                  <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Este ítem está solo en menú (sin receta). Puedes editarlo y agregar insumos para vincular con inventario.
                  </div>
                );
              }
              return (
                <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
                  {r.lines.map((l) => (
                    <li key={l.ingredientId}>
                      {ingredientName(l.ingredientId)}: <b>{l.qty}</b> {ingredientUnit(l.ingredientId)}
                    </li>
                  ))}
                </ul>
              );
            })()}
          </>
        )}
      </Modal>

      <Modal
        open={isEditorOpen}
        title={editDish ? 'Editar ítem del menú' : 'Agregar al menú'}
        description="Datos del plato y, si quieres, la receta con insumos (opcional). Sin receta el plato igual aparece en el menú."
        onClose={() => {
          setIsEditorOpen(false);
          resetEditor();
        }}
        footer={
          <>
            <button
              className="adminButton"
              type="button"
              onClick={() => {
                setIsEditorOpen(false);
                resetEditor();
              }}
            >
              Cancelar
            </button>
            <button className="adminButton primary" type="button" onClick={saveDishAndRecipe}>
              {editDish ? 'Guardar' : 'Crear'}
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col12">
            <label className="adminLabel">Nombre del plato</label>
            <input className="adminInput" value={dishForm.name} onChange={(e) => setDishForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="col9">
            <label className="adminLabel">Categoría (opcional)</label>
            <input className="adminInput" value={dishForm.category} onChange={(e) => setDishForm((f) => ({ ...f, category: e.target.value }))} />
          </div>
          <div className="col3">
            <label className="adminLabel">Precio</label>
            <input className="adminInput" value={dishForm.price} onChange={(e) => setDishForm((f) => ({ ...f, price: e.target.value }))} placeholder="Ej: 350" />
          </div>

          <div className="col12">
            <label className="adminLabel">Imagen (opcional)</label>
            <div className="adminActions">
              <input
                className="adminInput"
                value={dishForm.image}
                onChange={(e) => setDishForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="URL o data:image/... (opcional)"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onPickImage(file);
                }}
              />
            </div>
          </div>

          <div className="col12">
            <div className="adminDivider" />
            <div className="adminActions" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800 }}>Receta (opcional)</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                  Cantidades por una porción vendida. Deja vacío o quita líneas si aún no defines insumos.
                </div>
              </div>
              <button className="adminButton" type="button" onClick={addLine} disabled={ingredients.length === 0}>
                + Insumo
              </button>
            </div>
            {ingredients.length === 0 ? (
              <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                No hay insumos activos. Regístralos en <b>Ingredientes</b> o desde <b>Inventario → Agregar producto</b>.
              </div>
            ) : null}
          </div>

          <div className="col12">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th style={{ width: 240 }}>Cantidad / porción</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Sin receta: el plato se guarda solo en el menú.
                    </td>
                  </tr>
                ) : (
                  lines.map((l, idx) => (
                    <tr key={`${l.ingredientId}_${idx}`}>
                      <td>
                        <select
                          className="adminSelect"
                          value={l.ingredientId}
                          onChange={(e) => setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, ingredientId: e.target.value } : x)))}
                        >
                          {ingredients.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10, alignItems: 'center' }}>
                          <input
                            className="adminInput"
                            value={l.qty}
                            onChange={(e) => setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, qty: e.target.value } : x)))}
                            placeholder="Ej: 180"
                          />
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{ingredientUnit(l.ingredientId)}</div>
                        </div>
                      </td>
                      <td>
                        <button className="adminButton danger" type="button" onClick={() => removeLine(idx)}>
                          Quitar
                        </button>
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
