import { useMemo, useState } from 'react';
import type { Dish } from '../models';
import { dishRepo } from '../lib/repo';
import { Modal } from '../components/Modal';
import { useToast } from '../components/toast/ToastContext';

export function DishesPage() {
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', image: '' });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const toast = useToast();

  const dishes = useMemo(() => {
    const all = dishRepo.list();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((d) => d.name.toLowerCase().includes(q) || (d.category ?? '').toLowerCase().includes(q));
  }, [refresh, query]);

  function resetForm() {
    setEditing(null);
    setForm({ name: '', category: '', price: '', image: '' });
  }

  function submit() {
    const name = form.name.trim();
    const category = form.category.trim() || undefined;
    const price = Number(form.price);
    const image = form.image.trim() || undefined;
    if (!name) {
      toast.push({ type: 'error', title: 'Falta el nombre', message: 'Escribe el nombre del plato.' });
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast.push({ type: 'error', title: 'Precio inválido', message: 'Debe ser un número mayor o igual a 0.' });
      return;
    }

    const exists = dishRepo
      .list()
      .some((d) => d.name.toLowerCase() === name.toLowerCase() && d.id !== editing?.id);
    if (exists) {
      toast.push({ type: 'error', title: 'Plato duplicado', message: 'Ya existe un plato con ese nombre.' });
      return;
    }

    if (editing) {
      dishRepo.update(editing.id, { name, category: category ?? '', price, image });
      toast.push({ type: 'success', title: 'Plato actualizado', message: `Se actualizó "${name}".` });
    } else {
      dishRepo.create({ name, category, price, image });
      toast.push({ type: 'success', title: 'Plato creado', message: `Se creó "${name}".` });
    }
    setRefresh((x) => x + 1);
    resetForm();
    setIsEditorOpen(false);
  }

  function toggleActive(dish: Dish) {
    dishRepo.update(dish.id, { isActive: !dish.isActive });
    setRefresh((x) => x + 1);
    toast.push({ type: 'info', title: dish.isActive ? 'Plato desactivado' : 'Plato activado', message: dish.name });
  }

  function startEdit(dish: Dish) {
    setEditing(dish);
    setForm({ name: dish.name, category: dish.category ?? '', price: String(dish.price), image: dish.image ?? '' });
    setIsEditorOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', category: '', price: '', image: '' });
    setIsEditorOpen(true);
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Platos</div>
          <div className="adminPageDesc">CRUD de platos del menú (persistencia: localStorage).</div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={openCreate}>
            + Crear plato
          </button>
        </div>
      </div>

      <Modal
        open={isEditorOpen}
        title={editing ? 'Editar plato' : 'Crear plato'}
        description="Los platos se usan para el menú y sus recetas definen el consumo de ingredientes."
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
              {editing ? 'Guardar cambios' : 'Crear plato'}
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col12">
            <label className="adminLabel">Nombre</label>
            <input className="adminInput" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="col12">
            <label className="adminLabel">Imagen (opcional: URL o DataURL)</label>
            <input
              className="adminInput"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://... o data:image/png;base64,..."
            />
          </div>
          <div className="col9">
            <label className="adminLabel">Categoría (opcional)</label>
            <input
              className="adminInput"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Ej: Comidas"
            />
          </div>
          <div className="col3">
            <label className="adminLabel">Precio</label>
            <input
              className="adminInput"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="Ej: 350"
            />
          </div>
        </div>
      </Modal>

      <div className="adminCard">
        <div className="adminPageTitleRow" style={{ marginBottom: 10 }}>
          <div>
            <div className="adminCardLabel">Listado</div>
            <div className="adminPageDesc" style={{ marginTop: 4 }}>
              Los platos se desactivan en vez de eliminarse.
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
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th style={{ width: 240 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dishes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin resultados.
                </td>
              </tr>
            ) : (
              dishes.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.category ?? '—'}</td>
                  <td>{d.price}</td>
                  <td>{d.isActive ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <div className="adminRowActions">
                      <button className="adminButton" type="button" onClick={() => startEdit(d)}>
                        Editar
                      </button>
                      <button className="adminButton" type="button" onClick={() => toggleActive(d)}>
                        {d.isActive ? 'Desactivar' : 'Activar'}
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

