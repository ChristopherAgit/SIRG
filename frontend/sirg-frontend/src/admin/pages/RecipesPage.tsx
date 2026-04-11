import { useMemo, useState } from 'react';
import type { Dish, RecipeLine } from '../models';
import { dishRepo, ingredientRepo, recipeRepo } from '../lib/repo';
import { useToast } from '../components/toast/ToastContext';
import { Modal } from '../components/Modal';

type LineDraft = { ingredientId: string; qty: string };

type DishDraft = {
  name: string;
  category: string;
  price: string;
  image: string;
};

export function RecipesPage() {
  const [refresh, setRefresh] = useState(0);
  const toast = useToast();

  const dishes = useMemo(() => dishRepo.list(), [refresh]);
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
    // Importante: setState es async; inicializamos líneas explícitamente aquí.
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
    if (ingredients.length === 0) {
      toast.push({ type: 'error', title: 'Sin ingredientes', message: 'Primero crea ingredientes para poder armar la receta.' });
      return;
    }

    const parsed: RecipeLine[] = [];
    for (const l of lines) {
      if (!l.ingredientId) continue;
      const qty = Number(l.qty);
      if (Number.isNaN(qty) || qty <= 0) {
        toast.push({ type: 'error', title: 'Cantidad inválida', message: 'Todas las cantidades deben ser números mayores que 0.' });
        return;
      }
      parsed.push({ ingredientId: l.ingredientId, qty });
    }
    const unique = new Set(parsed.map((p) => p.ingredientId));
    if (unique.size !== parsed.length) {
      toast.push({ type: 'error', title: 'Ingrediente repetido', message: 'No repitas el mismo ingrediente dentro de la receta.' });
      return;
    }

    let dishId: string;
    if (editDish) {
      dishRepo.update(editDish.id, { name, category: category ?? '', price, image });
      dishId = editDish.id;
      toast.push({ type: 'success', title: 'Plato actualizado', message: name });
    } else {
      const created = dishRepo.create({ name, category, price, image });
      dishId = created.id;
      toast.push({ type: 'success', title: 'Plato creado', message: name });
    }

    recipeRepo.upsert({ dishId, lines: parsed });
    toast.push({ type: 'success', title: 'Receta guardada', message: 'Se guardó la receta del plato.' });

    setIsEditorOpen(false);
    resetEditor();
    setRefresh((x) => x + 1);
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Recetas</div>
          <div className="adminPageDesc">Gestión de platos y sus recetas (ingredientes y cantidades). Solo frontend.</div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={openCreate}>
            + Crear plato con receta
          </button>
        </div>
      </div>

      <div className="adminCard">
        <div className="adminCardLabel">Platos</div>
        <table className="adminTable" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ width: 72 }}>Imagen</th>
              <th>Plato</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Receta</th>
              <th style={{ width: 260 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dishes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  No hay platos. Crea uno con receta para comenzar.
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
                      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{d.isActive ? 'Activo' : 'Inactivo'}</div>
                    </td>
                    <td>{d.category ?? '—'}</td>
                    <td>{d.price}</td>
                    <td>
                      <span className={`adminBadge ${hasRecipe ? '' : 'low'}`}>{hasRecipe ? 'Configurada' : 'Sin receta'}</span>
                    </td>
                    <td>
                      <div className="adminRowActions">
                        <button className="adminButton" type="button" onClick={() => openView(d)}>
                          Ver
                        </button>
                        <button className="adminButton" type="button" onClick={() => openEdit(d)}>
                          {hasRecipe ? 'Editar' : 'Completar'}
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
        title="Detalle de receta"
        description={viewDish ? `Plato: ${viewDish.name}` : undefined}
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
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Ingredientes</div>
            {(() => {
              const r = recipeRepo.getByDishId(viewDish.id);
              if (!r || r.lines.length === 0) return <div style={{ color: 'rgba(255,255,255,0.7)' }}>Este plato no tiene receta.</div>;
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
        title={editDish ? 'Editar plato y receta' : 'Crear plato con receta'}
        description="Completa los campos del plato, agrega ingredientes dinámicamente y guarda."
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
              {editDish ? 'Guardar cambios' : 'Crear'}
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
                <div style={{ fontWeight: 800 }}>Ingredientes de la receta</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Usa “+” para agregar más ingredientes.</div>
              </div>
              <button className="adminButton" type="button" onClick={addLine} disabled={ingredients.length === 0}>
                + Ingrediente
              </button>
            </div>
          </div>

          <div className="col12">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th style={{ width: 240 }}>Cantidad</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Agrega ingredientes para la receta.
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

