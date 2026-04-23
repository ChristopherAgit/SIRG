import { useMemo, useState } from 'react';
import type { RestaurantTable } from '../models';
import { tableRepo } from '../lib/repo';
import { Modal } from '../components/Modal';
import { useToast } from '../components/toast/ToastContext';
import apiFetch from '../../lib/api';

export function TablesPage() {
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState({ number: '', seats: '' });
  const toast = useToast();

  const tables = useMemo(() => {
    const all = tableRepo.list();
    const q = query.trim();
    if (!q) return all;
    const n = Number(q);
    if (!Number.isNaN(n)) return all.filter((t) => t.number === n || t.seats === n);
    return all;
  }, [refresh, query]);

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
    // attempt server update first
    (async () => {
      try {
        await apiFetch(`/tables/${t.id}`, { method: 'PUT', body: JSON.stringify({ isActive: !t.isActive }) });
        toast.push({ type: 'info', title: t.isActive ? 'Mesa desactivada' : 'Mesa activada', message: `Mesa ${t.number}` });
      } catch {
        // fallback local
        tableRepo.update(t.id, { isActive: !t.isActive });
        toast.push({ type: 'info', title: t.isActive ? 'Mesa desactivada' : 'Mesa activada', message: `Mesa ${t.number} (local)` });
      } finally {
        setRefresh((x) => x + 1);
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

    const exists = tableRepo.list().some((t) => t.number === number && t.id !== editing?.id);
    if (exists) {
      toast.push({ type: 'error', title: 'Mesa duplicada', message: `Ya existe la mesa ${number}.` });
      return;
    }

    if (editing) {
      (async () => {
        try {
          await apiFetch(`/tables/${editing.id}`, { method: 'PUT', body: JSON.stringify({ number, seats }) });
          toast.push({ type: 'success', title: 'Mesa actualizada', message: `Mesa ${number}` });
        } catch {
          tableRepo.update(editing.id, { number, seats });
          toast.push({ type: 'success', title: 'Mesa actualizada', message: `Mesa ${number} (local)` });
        } finally {
          setRefresh((x) => x + 1);
        }
      })();
    } else {
      (async () => {
        try {
          await apiFetch('/tables', { method: 'POST', body: JSON.stringify({ number, seats }) });
          toast.push({ type: 'success', title: 'Mesa creada', message: `Mesa ${number}` });
        } catch {
          tableRepo.create({ number, seats });
          toast.push({ type: 'success', title: 'Mesa creada', message: `Mesa ${number} (local)` });
        } finally {
          setRefresh((x) => x + 1);
        }
      })();
    }

    setRefresh((x) => x + 1);
    setIsEditorOpen(false);
    setEditing(null);
    setForm({ number: '', seats: '' });
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Mesas</div>
          <div className="adminPageDesc">Configura mesas del restaurante (número y sillas). Solo frontend.</div>
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
        description="Las mesas se usan en los módulos de mesero y cocina."
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
            <input className="adminInput" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} placeholder="Ej: 10" />
          </div>
          <div className="col6">
            <label className="adminLabel">Sillas</label>
            <input type="number" min={1} max={8} className="adminInput" value={form.seats} onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))} placeholder="Ej: 4" />
          </div>
        </div>
      </Modal>

      <div className="adminCard">
        <div className="adminPageTitleRow" style={{ marginBottom: 10 }}>
          <div>
            <div className="adminCardLabel">Listado</div>
            <div className="adminPageDesc" style={{ marginTop: 4 }}>
              Puedes desactivar mesas si dejan de estar disponibles.
            </div>
          </div>
          <div style={{ width: 320 }}>
            <input className="adminInput" placeholder="Buscar por número o sillas..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <table className="adminTable">
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Sillas</th>
              <th>Estado</th>
              <th style={{ width: 240 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tables.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin mesas.
                </td>
              </tr>
            ) : (
              tables.map((t) => (
                <tr key={t.id}>
                  <td>Mesa {t.number}</td>
                  <td>{t.seats}</td>
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

