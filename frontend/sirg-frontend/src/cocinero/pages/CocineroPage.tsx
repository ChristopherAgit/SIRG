import { useMemo, useState } from 'react';
import '../../admin/styles/admin.css';
import '../../styles/staff-landing.css';
import { useToast } from '../../admin/components/toast/ToastContext';
import { orderRepo } from '../../shared/orders';

export function CocineroPage() {
  const toast = useToast();
  const [refresh, setRefresh] = useState(0);

  const orders = useMemo(() => orderRepo.list(), [refresh]);
  const pending = orders.filter((o) => o.status === 'sent');
  const done = orders.filter((o) => o.status === 'done').slice(0, 10);

  function markDone(id: string) {
    orderRepo.update(id, { status: 'done' });
    toast.push({ type: 'success', title: 'Pedido completado', message: 'Se marcó como listo.' });
    setRefresh((x) => x + 1);
  }

  function cancel(id: string) {
    orderRepo.update(id, { status: 'cancelled' });
    toast.push({ type: 'info', title: 'Pedido cancelado', message: 'Se marcó como cancelado.' });
    setRefresh((x) => x + 1);
  }

  return (
    <div className="sirgStaffViewport">
    <div className="sirgStaffShell">
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Cocina</div>
          <div className="adminPageDesc">Pedidos entrantes por mesa y platos solicitados.</div>
        </div>
      </div>

      <div className="adminCard">
        <div className="adminCardLabel">Pendientes</div>
        <table className="adminTable" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Platos</th>
              <th>Hora</th>
              <th style={{ width: 260 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  No hay pedidos pendientes.
                </td>
              </tr>
            ) : (
              pending.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 800 }}>Mesa {o.tableNumber}</td>
                  <td style={{ color: 'rgba(255,255,255,0.78)' }}>
                    {o.items.map((i) => `${i.qty}× ${i.dishName}`).join(', ')}
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.7)' }}>{new Date(o.createdAt).toLocaleTimeString()}</td>
                  <td>
                    <div className="adminRowActions">
                      <button className="adminButton primary" type="button" onClick={() => markDone(o.id)}>
                        Marcar listo
                      </button>
                      <button className="adminButton danger" type="button" onClick={() => cancel(o.id)}>
                        Cancelar
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
        <div className="adminCardLabel">Recientes (listos)</div>
        <table className="adminTable" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Platos</th>
              <th>Hora</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {done.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin pedidos listos todavía.
                </td>
              </tr>
            ) : (
              done.map((o) => (
                <tr key={o.id}>
                  <td>Mesa {o.tableNumber}</td>
                  <td style={{ color: 'rgba(255,255,255,0.78)' }}>{o.items.map((i) => `${i.qty}× ${i.dishName}`).join(', ')}</td>
                  <td style={{ color: 'rgba(255,255,255,0.7)' }}>{new Date(o.updatedAt).toLocaleTimeString()}</td>
                  <td>
                    <span className="adminBadge">done</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
