import { useMemo, useState } from 'react';
import type { RecipeLine } from '../models';
import { dishRepo, ingredientRepo, recipeRepo } from '../lib/repo';
import { useToast } from '../components/toast/ToastContext';
import { Modal } from '../components/Modal';

type LineDraft = { ingredientId: string; qty: string };

export function RecipesPage() {
  const [refresh, setRefresh] = useState(0);
  const dishes = useMemo(() => dishRepo.list().filter((d) => d.isActive), [refresh]);
  const ingredients = useMemo(() => ingredientRepo.list().filter((i) => i.isActive), [refresh]);
  const toast = useToast();

  const [dishId, setDishId] = useState<string>('');
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const selectedDish = dishes.find((d) => d.id === dishId) ?? null;
  const existingRecipe = useMemo(() => (dishId ? recipeRepo.getByDishId(dishId) : null), [dishId, refresh]);

  function loadRecipe(dId: string) {
    setDishId(dId);
    const r = recipeRepo.getByDishId(dId);
    if (!r) {
      setLines([]);
      return;
    }
    setLines(r.lines.map((l) => ({ ingredientId: l.ingredientId, qty: String(l.qty) })));
  }

  function addLine() {
    // Agrega una línea de receta; por defecto el primer ingrediente activo.
    const defaultIng = ingredients[0]?.id ?? '';
    setLines((prev) => [...prev, { ingredientId: defaultIng, qty: '0' }]);
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function save() {
    if (!dishId) {
      toast.push({ type: 'error', title: 'Falta el plato', message: 'Selecciona un plato antes de guardar.' });
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
    recipeRepo.upsert({ dishId, lines: parsed });
    setRefresh((x) => x + 1);
    toast.push({ type: 'success', title: 'Receta guardada', message: 'Cambios guardados correctamente.' });
    setIsRecipeModalOpen(false);
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Recetas (Plato ↔ Ingredientes)</div>
          <div className="adminPageDesc">
            Define cantidades por plato (ej: 180 g de carne). Esto alimenta el inventario después.
          </div>
        </div>
      </div>

      <div className="adminCard" style={{ marginBottom: 14 }}>
        <div className="adminCardLabel">Seleccionar plato</div>
        <div className="adminFormGrid">
          <div className="col6">
            <label className="adminLabel">Plato</label>
            <select className="adminSelect" value={dishId} onChange={(e) => loadRecipe(e.target.value)}>
              <option value="">— Selecciona —</option>
              {dishes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col6">
            <label className="adminLabel">Estado receta</label>
            <input
              className="adminInput"
              readOnly
              value={!dishId ? 'Selecciona un plato' : existingRecipe ? `Configurada (${existingRecipe.lines.length} items)` : 'Sin receta'}
            />
          </div>
          <div className="col12">
            <div className="adminActions">
              <button
                className="adminButton primary"
                type="button"
                onClick={() => setIsRecipeModalOpen(true)}
                disabled={!dishId || ingredients.length === 0}
              >
                {existingRecipe ? 'Editar receta' : 'Crear receta'}
              </button>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                Edita ingredientes y cantidades dentro de un modal.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isRecipeModalOpen}
        title={existingRecipe ? 'Editar receta' : 'Crear receta'}
        description={selectedDish ? `Plato: ${selectedDish.name}` : 'Selecciona un plato para editar su receta.'}
        onClose={() => setIsRecipeModalOpen(false)}
        footer={
          <>
            <button className="adminButton" type="button" onClick={() => setIsRecipeModalOpen(false)}>
              Cerrar
            </button>
            <button className="adminButton" type="button" onClick={addLine} disabled={!dishId || ingredients.length === 0}>
              + Agregar ingrediente
            </button>
            <button className="adminButton primary" type="button" onClick={save} disabled={!dishId}>
              Guardar receta
            </button>
          </>
        }
      >
        {ingredients.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Primero crea ingredientes para poder armar recetas.</div>
        ) : !dishId ? (
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Selecciona un plato en la pantalla anterior.</div>
        ) : (
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
                    Sin ingredientes en la receta.
                  </td>
                </tr>
              ) : (
                lines.map((l, idx) => {
                  const ing = ingredients.find((i) => i.id === l.ingredientId) ?? null;
                  return (
                    <tr key={`${l.ingredientId}_${idx}`}>
                      <td>
                        <select
                          className="adminSelect"
                          value={l.ingredientId}
                          onChange={(e) =>
                            setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, ingredientId: e.target.value } : x)))
                          }
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
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{ing?.unit ?? '—'}</div>
                        </div>
                      </td>
                      <td>
                        <button className="adminButton danger" type="button" onClick={() => removeLine(idx)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}

