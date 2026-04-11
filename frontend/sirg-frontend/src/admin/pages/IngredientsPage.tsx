import { useMemo, useState } from 'react';
import type { Ingredient } from '../models';
import { ingredientRepo } from '../lib/repo';
import { Modal } from '../components/Modal';
import { useToast } from '../components/toast/ToastContext';

export function IngredientsPage() {
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [form, setForm] = useState({ name: '', unit: 'g', minStock: '' });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const toast = useToast();

  const ingredients = useMemo(() => {
    const all = ingredientRepo.list();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((i) => i.name.toLowerCase().includes(q) || i.unit.toLowerCase().includes(q));
  }, [refresh, query]);

  function resetForm() {
    setEditing(null);
    setForm({ name: '', unit: 'g', minStock: '' });
  }

  function submit() {
    const name = form.name.trim();
    const unit = form.unit.trim();
    const minStock = form.minStock.trim() ? Number(form.minStock) : undefined;
    if (!name || !unit) {
      toast.push({ type: 'error', title: 'Datos incompletos', message: 'Nombre y unidad son obligatorios.' });
      return;
    }
    if (minStock !== undefined && (Number.isNaN(minStock) || minStock < 0)) {
      toast.push({ type: 'error', title: 'Stock mínimo inválido', message: 'Debe ser un número mayor o igual a 0.' });
      return;
    }

    const exists = ingredientRepo
      .list()
      .some((i) => i.name.toLowerCase() === name.toLowerCase() && i.id !== editing?.id);
    if (exists) {
      toast.push({ type: 'error', title: 'Ingrediente duplicado', message: 'Ya existe un ingrediente con ese nombre.' });
      return;
    }

    if (editing) {
      ingredientRepo.update(editing.id, { name, unit, minStock });
      toast.push({ type: 'success', title: 'Ingrediente actualizado', message: `Se actualizó "${name}".` });
    } else {
      ingredientRepo.create({ name, unit, minStock });
      toast.push({ type: 'success', title: 'Ingrediente creado', message: `Se creó "${name}".` });
    }
    setRefresh((x) => x + 1);
    resetForm();
    setIsEditorOpen(false);
  }

  function toggleActive(ing: Ingredient) {
    ingredientRepo.update(ing.id, { isActive: !ing.isActive });
    setRefresh((x) => x + 1);
    toast.push({
      type: 'info',
      title: ing.isActive ? 'Ingrediente desactivado' : 'Ingrediente activado',
      message: ing.name,
    });
  }

  function startEdit(ing: Ingredient) {
    setEditing(ing);
    setForm({ name: ing.name, unit: ing.unit, minStock: ing.minStock !== undefined ? String(ing.minStock) : '' });
    setIsEditorOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', unit: 'g', minStock: '' });
    setIsEditorOpen(true);
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Ingredientes</div>
          <div className="adminPageDesc">CRUD de ingredientes (persistencia: localStorage).</div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={openCreate}>
            + Crear ingrediente
          </button>
        </div>
      </div>

      <Modal
        open={isEditorOpen}
        title={editing ? 'Editar ingrediente' : 'Crear ingrediente'}
        description="Los ingredientes alimentan recetas e inventario. Recomendado: desactivar en vez de borrar."
        onClose={() => {
          setIsEditorOpen(false);
          resetForm();
        }}
        footer={
          <>
            <button
              className="adminButton"
              type="button"
              onClick={() => {
                setIsEditorOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </button>
            <button className="adminButton primary" type="button" onClick={submit}>
              {editing ? 'Guardar cambios' : 'Crear ingrediente'}
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col12">
            <label className="adminLabel">Nombre</label>
            <input className="adminInput" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="col3">
            <label className="adminLabel">Unidad</label>
            <select className="adminSelect" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="unidad">unidad</option>
            </select>
          </div>
          <div className="col9">
            <label className="adminLabel">Stock mínimo (opcional)</label>
            <input
              className="adminInput"
              value={form.minStock}
              onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
              placeholder="Ej: 500"
            />
          </div>
        </div>
      </Modal>

      <div className="adminCard">
        <div className="adminPageTitleRow" style={{ marginBottom: 10 }}>
          <div>
            <div className="adminCardLabel">Listado</div>
            <div className="adminPageDesc" style={{ marginTop: 4 }}>
              Desactiva ingredientes en vez de eliminarlos (para no romper recetas).
            </div>
          </div>
          <div style={{ width: 320 }}>
            <input className="adminInput" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <table className="adminTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Stock mínimo</th>
              <th>Estado</th>
              <th style={{ width: 220 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin resultados.
                </td>
              </tr>
            ) : (
              ingredients.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.unit}</td>
                  <td>{i.minStock ?? '—'}</td>
                  <td>{i.isActive ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <div className="adminRowActions">
                      <button className="adminButton" type="button" onClick={() => startEdit(i)}>
                        Editar
                      </button>
                      <button className="adminButton" type="button" onClick={() => toggleActive(i)}>
                        {i.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

