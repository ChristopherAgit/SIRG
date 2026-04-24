import { useMemo, useState } from 'react';
import type { Role, StaffMember } from '../models';
import { roleRepo, staffRepo } from '../lib/repo';
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

  const [staffQuery, setStaffQuery] = useState('');
  const [staffForm, setStaffForm] = useState({ name: '', roleId: '', schedule: '', isActive: true });
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isStaffEditorOpen, setIsStaffEditorOpen] = useState(false);
  const [confirmStaff, setConfirmStaff] = useState<StaffMember | null>(null);

  const toast = useToast();

  const roles = useMemo(() => {
    const all = roleRepo.list();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q));
  }, [refresh, query]);

  const allRoles = useMemo(() => roleRepo.list(), [refresh]);

  const staffList = useMemo(() => {
    const all = staffRepo.list();
    const q = staffQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((s) => {
      const roleName = allRoles.find((r) => r.id === s.roleId)?.name ?? '';
      return (
        s.name.toLowerCase().includes(q) ||
        s.schedule.toLowerCase().includes(q) ||
        roleName.toLowerCase().includes(q)
      );
    });
  }, [refresh, staffQuery, allRoles]);

  function roleLabel(id?: string) {
    if (!id) return '—';
    return allRoles.find((r) => r.id === id)?.name ?? '(Rol)';
  }

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

  function resetStaffForm() {
    setStaffForm({ name: '', roleId: '', schedule: '', isActive: true });
    setEditingStaff(null);
  }

  function openCreateStaff() {
    resetStaffForm();
    setIsStaffEditorOpen(true);
  }

  function startEditStaff(s: StaffMember) {
    setEditingStaff(s);
    setStaffForm({
      name: s.name,
      roleId: s.roleId ?? '',
      schedule: s.schedule,
      isActive: s.isActive,
    });
    setIsStaffEditorOpen(true);
  }

  function submitStaff() {
    const name = staffForm.name.trim();
    const schedule = staffForm.schedule.trim();
    if (!name) {
      toast.push({ type: 'error', title: 'Falta el nombre', message: 'Indica el nombre del empleado.' });
      return;
    }

    const roleId = staffForm.roleId.trim() || undefined;

    if (editingStaff) {
      staffRepo.update(editingStaff.id, {
        name,
        roleId,
        schedule,
        isActive: staffForm.isActive,
      });
      toast.push({ type: 'success', title: 'Empleado actualizado', message: name });
    } else {
      staffRepo.create({ name, roleId, schedule, isActive: staffForm.isActive });
      toast.push({ type: 'success', title: 'Empleado registrado', message: name });
    }
    setRefresh((x) => x + 1);
    resetStaffForm();
    setIsStaffEditorOpen(false);
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Roles y personal</div>
          <div className="adminPageDesc">
            Define roles del negocio y registra empleados con su <b>horario</b> (texto libre: días y franja, turnos, etc.). El panel principal muestra cuántos están activos.
          </div>
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
        description="Los roles agrupan permisos (la app seguirá creciendo)."
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

      <Modal
        open={isStaffEditorOpen}
        title={editingStaff ? 'Editar empleado' : 'Agregar empleado'}
        description="Horario en texto libre (ej: Lun–Vie 10:00–18:00, o turno noche)."
        onClose={() => {
          setIsStaffEditorOpen(false);
          resetStaffForm();
        }}
        footer={
          <>
            <button
              className="adminButton"
              type="button"
              onClick={() => {
                setIsStaffEditorOpen(false);
                resetStaffForm();
              }}
            >
              Cancelar
            </button>
            <button className="adminButton primary" type="button" onClick={submitStaff}>
              {editingStaff ? 'Guardar' : 'Registrar'}
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col12">
            <label className="adminLabel">Nombre</label>
            <input className="adminInput" value={staffForm.name} onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: María López" />
          </div>
          <div className="col12">
            <label className="adminLabel">Rol (opcional)</label>
            <select className="adminSelect" value={staffForm.roleId} onChange={(e) => setStaffForm((f) => ({ ...f, roleId: e.target.value }))}>
              <option value="">— Sin asignar —</option>
              {allRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col12">
            <label className="adminLabel">Horario</label>
            <textarea
              className="adminInput"
              rows={3}
              value={staffForm.schedule}
              onChange={(e) => setStaffForm((f) => ({ ...f, schedule: e.target.value }))}
              placeholder="Ej: Lun a Sáb 9:00–17:00 · Descanso domingo"
              style={{ resize: 'vertical', minHeight: 72 }}
            />
          </div>
          <div className="col12">
            <label className="adminLabel">Estado</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`adminButton${staffForm.isActive ? ' primary' : ''}`}
                onClick={() => setStaffForm((f) => ({ ...f, isActive: true }))}
              >
                Activo
              </button>
              <button
                type="button"
                className={`adminButton${!staffForm.isActive ? ' danger' : ''}`}
                onClick={() => setStaffForm((f) => ({ ...f, isActive: false }))}
              >
                Inactivo
              </button>
            </div>
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

      <ConfirmModal
        open={!!confirmStaff}
        title="Eliminar empleado"
        description={confirmStaff ? `Se eliminará del registro a "${confirmStaff.name}".` : undefined}
        destructive
        confirmText="Eliminar"
        onConfirm={() => {
          if (!confirmStaff) return;
          staffRepo.remove(confirmStaff.id);
          setRefresh((x) => x + 1);
          toast.push({ type: 'success', title: 'Empleado eliminado', message: confirmStaff.name });
        }}
        onClose={() => setConfirmStaff(null)}
      />

      <div className="adminCard">
        <div className="adminPageTitleRow" style={{ marginBottom: 10 }}>
          <div>
            <div className="adminCardLabel">Roles</div>
            <div className="adminPageDesc" style={{ marginTop: 4 }}>
              Roles predefinidos: Admin, Mesero, Cocinero, Host. Puedes añadir los que necesites.
            </div>
          </div>
          <div style={{ width: 320 }}>
            <input className="adminInput" placeholder="Buscar rol..." value={query} onChange={(e) => setQuery(e.target.value)} />
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

      <div className="adminCard" style={{ marginTop: 16 }}>
        <div className="adminPageTitleRow" style={{ marginBottom: 10 }}>
          <div>
            <div className="adminCardLabel">Personal y horarios</div>
            <div className="adminPageDesc" style={{ marginTop: 4 }}>
              Cada restaurante registra a su equipo. El horario es libre (como lo trabajes en tu local).
            </div>
          </div>
          <div className="adminActions" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div style={{ width: 280 }}>
              <input
                className="adminInput"
                placeholder="Buscar empleado u horario..."
                value={staffQuery}
                onChange={(e) => setStaffQuery(e.target.value)}
              />
            </div>
            <button className="adminButton primary" type="button" onClick={openCreateStaff}>
              + Agregar empleado
            </button>
          </div>
        </div>

        <table className="adminTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Horario</th>
              <th>Estado</th>
              <th style={{ width: 200 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Aún no hay empleados. Usa “Agregar empleado” para el primero.
                </td>
              </tr>
            ) : (
              staffList.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.name}</td>
                  <td>{roleLabel(s.roleId)}</td>
                  <td style={{ color: 'rgba(255,255,255,0.78)', whiteSpace: 'pre-wrap' }}>{s.schedule || '—'}</td>
                  <td>{s.isActive ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <div className="adminRowActions">
                      <button className="adminButton" type="button" onClick={() => startEditStaff(s)}>
                        Editar
                      </button>
                      <button className="adminButton danger" type="button" onClick={() => setConfirmStaff(s)}>
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
