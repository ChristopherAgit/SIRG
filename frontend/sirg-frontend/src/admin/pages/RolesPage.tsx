import { useMemo, useState } from 'react';
import type { Role } from '../models';
import { roleRepo } from '../lib/repo';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../components/toast/ToastContext';

export function RolesPage() {
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState<Role | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [confirmRole, setConfirmRole] = useState<Role | null>(null);
  const toast = useToast();

  const roles = useMemo(() => {
    const all = roleRepo.list();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q));
  }, [refresh, query]);

  function resetForm() {
    setForm({ name: '', description: '' });
    setEditing(null);
  }

  function submit() {
    const name = form.name.trim();
    if (!name) {
      toast.push({ type: 'error', title: 'Falta el nombre', message: 'Escribe un nombre de rol para continuar.' });
      return;
    }

    const exists = roleRepo.list().some((r) => r.name.toLowerCase() === name.toLowerCase() && r.id !== editing?.id);
    if (exists) {
      toast.push({ type: 'error', title: 'Rol duplicado', message: 'Ya existe un rol con ese nombre.' });
      return;
    }

    if (editing) {
      roleRepo.update(editing.id, { name, description: form.description });
      toast.push({ type: 'success', title: 'Rol actualizado', message: `Se actualizó "${name}".` });
    } else {
      roleRepo.create({ name, description: form.description });
      toast.push({ type: 'success', title: 'Rol creado', message: `Se creó "${name}".` });
    }
    setRefresh((x) => x + 1);
    resetForm();
    setIsEditorOpen(false);
  }

  function startEdit(role: Role) {
    setEditing(role);
    setForm({ name: role.name, description: role.description ?? '' });
    setIsEditorOpen(true);
  }

  function requestRemove(role: Role) {
    // Los roles del sistema se protegen para evitar que el panel quede inconsistente.
    if (role.isSystem) {
      toast.push({ type: 'info', title: 'Acción no permitida', message: 'Este rol es del sistema y no se puede eliminar.' });
      return;
    }
    setConfirmRole(role);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setIsEditorOpen(true);
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Roles</div>
          <div className="adminPageDesc">Administra roles del sistema (persistencia: localStorage).</div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={openCreate}>
            + Crear rol
          </button>
        </div>
      </div>

      <Modal
        open={isEditorOpen}
        title={editing ? 'Editar rol' : 'Crear rol'}
        description="Los roles definen permisos (por ahora solo se gestionan en frontend)."
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
              {editing ? 'Guardar cambios' : 'Crear rol'}
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col6">
            <label className="adminLabel">Nombre</label>
            <input
              className="adminInput"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Host"
            />
          </div>
          <div className="col12">
            <label className="adminLabel">Descripción (opcional)</label>
            <input
              className="adminInput"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ej: Recepción y confirmación de reservas"
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmRole}
        title="Eliminar rol"
        description={confirmRole ? `Se eliminará el rol "${confirmRole.name}". Esta acción no se puede deshacer.` : undefined}
        destructive
        confirmText="Eliminar"
        onConfirm={() => {
          if (!confirmRole) return;
          roleRepo.remove(confirmRole.id);
          setRefresh((x) => x + 1);
          toast.push({ type: 'success', title: 'Rol eliminado', message: `Se eliminó "${confirmRole.name}".` });
        }}
        onClose={() => setConfirmRole(null)}
      />

      <div className="adminCard">
        <div className="adminPageTitleRow" style={{ marginBottom: 10 }}>
          <div>
            <div className="adminCardLabel">Listado</div>
            <div className="adminPageDesc" style={{ marginTop: 4 }}>
              System roles vienen pre-cargados (Admin, Mesero, Cocinero, Host).
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
              <th>Descripción</th>
              <th>Tipo</th>
              <th style={{ width: 200 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin resultados.
                </td>
              </tr>
            ) : (
              roles.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td style={{ color: 'rgba(255,255,255,0.75)' }}>{r.description ?? '—'}</td>
                  <td>{r.isSystem ? 'Sistema' : 'Custom'}</td>
                  <td>
                    <div className="adminRowActions">
                      <button className="adminButton" type="button" onClick={() => startEdit(r)}>
                        Editar
                      </button>
                      <button className="adminButton danger" type="button" onClick={() => requestRemove(r)} disabled={!!r.isSystem}>
                        Eliminar
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

