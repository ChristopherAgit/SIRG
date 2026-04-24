import { useEffect, useMemo, useState } from 'react';
import type { RestaurantTable } from '../models';
import { tableRepo } from '../lib/repo';
import { Modal } from '../components/Modal';
import { useToast } from '../components/toast/ToastContext';
import apiFetch from '../../lib/api';

function mapApiTable(x: any): RestaurantTable {
  return {
    id: String(x.tableID ?? x.id ?? ''),
    number: x.tableNumber ?? x.number ?? 0,
    seats: x.capacity ?? x.seats ?? 0,
    isActive: x.isActive ?? true,
    createdAt: x.createdAt ?? new Date().toISOString(),
  };
}

export function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState({ number: '', seats: '' });
  const toast = useToast();

  async function loadTables() {
    setLoadingTables(true);
    try {
      const res = await apiFetch('/tables');
      if (Array.isArray(res)) {
        setTables(res.map(mapApiTable));
      } else {
        setTables(tableRepo.list());
      }
    } catch {
      setTables(tableRepo.list());
    } finally {
      setLoadingTables(false);
    }
  }

  useEffect(() => {
    loadTables();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTables = useMemo(() => {
    const q = query.trim();
    if (!q) return tables;
    const n = Number(q);
    if (!Number.isNaN(n)) return tables.filter((t) => t.number === n || t.seats === n);
    return tables;
  }, [tables, query]);

  function openCreate() {
    setEditing(null);
    setForm({ number: '', seats: '' });
    setIsEditorOpen(true);
  }

  function startEdit(t: RestaurantTable) {
    setEditing(t);
    setForm({ number: String(t.number), seats: String(t.seats) });
    setIsEditorOpen(true);
  }

  function toggleActive(t: RestaurantTable) {
    (async () => {
      try {
        await apiFetch(`/tables/${t.id}`, {
          method: 'PUT',
          body: JSON.stringify({ tableID: Number(t.id), tableNumber: t.number, capacity: t.seats, isActive: !t.isActive }),
        });
        toast.push({ type: 'info', title: t.isActive ? 'Mesa desactivada' : 'Mesa activada', message: `Mesa ${t.number}` });
      } catch {
        tableRepo.update(t.id, { isActive: !t.isActive });
        toast.push({ type: 'info', title: t.isActive ? 'Mesa desactivada' : 'Mesa activada', message: `Mesa ${t.number} (local)` });
      } finally {
        await loadTables();
      }
    })();
  }

  function submit() {
    const number = Number(form.number);
    const seats = Number(form.seats);
    if (Number.isNaN(number) || number <= 0) {
      toast.push({ type: 'error', title: 'Número inválido', message: 'El número de mesa debe ser mayor que 0.' });
      return;
    }
    if (Number.isNaN(seats) || seats <= 0) {
      toast.push({ type: 'error', title: 'Sillas inválidas', message: 'La cantidad de sillas debe ser mayor que 0.' });
      return;
    }
    if (seats > 8) {
      toast.push({ type: 'error', title: 'Sillas inválidas', message: 'La cantidad máxima de sillas por mesa es 8.' });
      return;
    }

    const exists = tables.some((t) => t.number === number && t.id !== editing?.id);
    if (exists) {
      toast.push({ type: 'error', title: 'Mesa duplicada', message: `Ya existe la mesa ${number}.` });
      return;
    }

    setIsEditorOpen(false);
    setEditing(null);
    setForm({ number: '', seats: '' });

    if (editing) {
      (async () => {
        try {
          await apiFetch(`/tables/${editing.id}`, {
            method: 'PUT',
            body: JSON.stringify({ tableID: Number(editing.id), tableNumber: number, capacity: seats, isActive: editing.isActive }),
          });
          toast.push({ type: 'success', title: 'Mesa actualizada', message: `Mesa ${number}` });
        } catch {
          tableRepo.update(editing.id, { number, seats });
          toast.push({ type: 'success', title: 'Mesa actualizada', message: `Mesa ${number} (local)` });
        } finally {
          await loadTables();
        }
      })();
    } else {
      (async () => {
        try {
          await apiFetch('/tables', {
            method: 'POST',
            body: JSON.stringify({ tableID: 0, tableNumber: number, capacity: seats, isActive: true }),
          });
          toast.push({ type: 'success', title: 'Mesa creada', message: `Mesa ${number}` });
        } catch {
          tableRepo.create({ number, seats });
          toast.push({ type: 'success', title: 'Mesa creada', message: `Mesa ${number} (local)` });
        } finally {
          await loadTables();
        }
      })();
    }
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Mesas</div>
          <div className="adminPageDesc">Configura las mesas del restaurante (número y capacidad).</div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={openCreate}>
            + Crear mesa
          </button>
        </div>
      </div>

      <Modal
        open={isEditorOpen}
        title={editing ? 'Editar mesa' : 'Crear mesa'}
        description="Las mesas se usan en los módulos de reservaciones y mesero."
        onClose={() => {
          setIsEditorOpen(false);
          setEditing(null);
          setForm({ number: '', seats: '' });
        }}
        footer={
          <>
            <button
              className="adminButton"
              type="button"
              onClick={() => {
                setIsEditorOpen(false);
                setEditing(null);
                setForm({ number: '', seats: '' });
              }}
            >
              Cancelar
            </button>
            <button className="adminButton primary" type="button" onClick={submit}>
              {editing ? 'Guardar cambios' : 'Crear mesa'}
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col6">
            <label className="adminLabel">Número de mesa</label>
            <input
              className="adminInput"
              value={form.number}
              onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
              placeholder="Ej: 10"
            />
          </div>
          <div className="col6">
            <label className="adminLabel">Capacidad (personas)</label>
            <input
              type="number"
              min={1}
              max={8}
              className="adminInput"
              value={form.seats}
              onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))}
              placeholder="Ej: 4"
            />
          </div>
        </div>
      </Modal>

      <div className="adminCard">
        <div className="adminPageTitleRow" style={{ marginBottom: 10 }}>
          <div>
            <div className="adminCardLabel">Listado</div>
            <div className="adminPageDesc" style={{ marginTop: 4 }}>
              Puedes desactivar mesas si dejan de estar disponibles para reservas.
            </div>
          </div>
          <div style={{ width: 320 }}>
            <input
              className="adminInput"
              placeholder="Buscar por número o capacidad..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="adminTable">
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th style={{ width: 240 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingTables ? (
              <tr>
                <td colSpan={4} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Cargando mesas...
                </td>
              </tr>
            ) : filteredTables.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin mesas.
                </td>
              </tr>
            ) : (
              filteredTables.map((t) => (
                <tr key={t.id}>
                  <td>Mesa {t.number}</td>
                  <td>{t.seats} personas</td>
                  <td>{t.isActive ? 'Activa' : 'Inactiva'}</td>
                  <td>
                    <div className="adminRowActions">
                      <button className="adminButton" type="button" onClick={() => startEdit(t)}>
                        Editar
                      </button>
                      <button className="adminButton" type="button" onClick={() => toggleActive(t)}>
                        {t.isActive ? 'Desactivar' : 'Activar'}
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
