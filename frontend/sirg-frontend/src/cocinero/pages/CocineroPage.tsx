import { useCallback, useEffect, useMemo, useState } from 'react';
import '../../admin/styles/admin.css';
import '../cocina.css';
import { useToast } from '../../admin/components/toast/ToastContext';
import apiFetch from '../../lib/api';

type DishDetail = {
  orderDetailsID: number;
  dishID: number;
  quantity: number;
  unitPrice: number;
  dishes?: { dishName: string };
};

type OrderDto = {
  orderID: number;
  reservationID: number | null;
  waiterID: number | null;
  statusID: number;
  orderDate: string;
  orderDetailsDto?: DishDetail[];
  orderStatusDto?: { statusID: number; statusName: string };
};

const STATUS_LABELS: Record<number, string> = {
  1: 'Pendiente',
  2: 'En preparación',
  3: 'Listo para servir',
  4: 'Entregado',
};

const NEXT_ACTION_LABEL: Record<number, string> = {
  1: 'Iniciar preparación',
  2: 'Listo para servir',
  3: 'Marcar entregado',
};

const STATUS_CLASS: Record<number, string> = {
  1: 'pendiente',
  2: 'preparacion',
  3: 'listo',
  4: 'entregado',
};

export function CocineroPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showDelivered, setShowDelivered] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/orders/details');
      if (Array.isArray(data)) setOrders(data);
    } catch {
      toast.push({ type: 'error', title: 'Error', message: 'No se pudieron cargar las órdenes.' });
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30_000);
    return () => clearInterval(timer);
  }, [load]);

  async function advanceStatus(orderId: number, currentStatus: number) {
    if (currentStatus >= 4) return;
    const nextStatus = currentStatus + 1;
    setUpdating(orderId);
    try {
      await apiFetch(`/orders/${orderId}/status/${nextStatus}`, { method: 'PUT' });
      setOrders((prev) =>
        prev.map((o) =>
          o.orderID === orderId
            ? { ...o, statusID: nextStatus, orderStatusDto: { statusID: nextStatus, statusName: STATUS_LABELS[nextStatus] } }
            : o,
        ),
      );
      toast.push({ type: 'success', title: 'Estado actualizado', message: `Orden #${orderId} → ${STATUS_LABELS[nextStatus]}` });
    } catch {
      toast.push({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado.' });
    } finally {
      setUpdating(null);
    }
  }

  const active = useMemo(
    () => orders.filter((o) => o.statusID < 4).sort((a, b) => a.orderDate.localeCompare(b.orderDate)),
    [orders],
  );
  const delivered = useMemo(() => orders.filter((o) => o.statusID === 4).slice(0, 12), [orders]);

  const countByStatus = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    orders.forEach((o) => { counts[o.statusID] = (counts[o.statusID] ?? 0) + 1; });
    return counts;
  }, [orders]);

  return (
    <div className="sirgCocinaViewport">
      <div className="sirgCocinaShell">
        <header className="sirgCocinaStickyBar">
          <div>
            <h1>Cocina</h1>
            <p>Órdenes activas por estado. Actualización automática cada 30 s.</p>
          </div>
          <div className="sirgCocinaStickyMeta">
            {([1, 2, 3] as const).map((s) => (
              <div key={s} className={`sirgCocinaPill sirgCocinaPill--${STATUS_CLASS[s]}`}>
                {STATUS_LABELS[s]}: <strong>{countByStatus[s]}</strong>
              </div>
            ))}
            <button
              className="sirgCocinaBtn ghost"
              type="button"
              onClick={load}
              disabled={loading}
              style={{ minWidth: 0, padding: '8px 14px', flex: 'none' }}
            >
              {loading ? '⟳' : '↺'} Actualizar
            </button>
          </div>
        </header>

        {loading && orders.length === 0 ? (
          <div className="sirgCocinaEmpty">Cargando órdenes…</div>
        ) : active.length === 0 ? (
          <div className="sirgCocinaEmpty">No hay órdenes activas en este momento.</div>
        ) : (
          ([1, 2, 3] as const).map((statusId) => {
            const group = active.filter((o) => o.statusID === statusId);
            if (group.length === 0) return null;
            return (
              <section key={statusId}>
                <div className={`sirgCocinaSectionTitle sirgCocinaSectionTitle--${STATUS_CLASS[statusId]}`}>
                  {STATUS_LABELS[statusId]} — {group.length} orden{group.length !== 1 ? 'es' : ''}
                </div>
                <div className="sirgCocinaTicketWall">
                  {group.map((o) => (
                    <article
                      key={o.orderID}
                      className={`sirgCocinaTicket sirgCocinaTicket--${STATUS_CLASS[o.statusID]}`}
                      aria-label={`Orden #${o.orderID}`}
                    >
                      <div className="sirgCocinaTicketTape" aria-hidden />
                      <div className="sirgCocinaTicketInner">
                        <div className="sirgCocinaTicketHead">
                          <div>
                            <div className="sirgCocinaTicketMesa">Orden #{o.orderID}</div>
                            <div className="sirgCocinaTicketService">
                              {new Date(o.orderDate).toLocaleString('es', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {o.reservationID ? ` · Reserva #${o.reservationID}` : ' · Walk-in'}
                              {o.waiterID ? ` · Mesero ${o.waiterID}` : ''}
                            </div>
                          </div>
                          <span className={`sirgCocinaBadge sirgCocinaBadge--${STATUS_CLASS[o.statusID]}`}>
                            {STATUS_LABELS[o.statusID]}
                          </span>
                        </div>

                        <ul className="sirgCocinaTicketList">
                          {(o.orderDetailsDto ?? []).length === 0 ? (
                            <li><span style={{ color: '#78716c' }}>Sin platos registrados</span></li>
                          ) : (
                            (o.orderDetailsDto ?? []).map((d) => (
                              <li key={d.orderDetailsID}>
                                <span className="sirgCocinaQty">{d.quantity}×</span>
                                <span>{d.dishes?.dishName ?? `Plato #${d.dishID}`}</span>
                              </li>
                            ))
                          )}
                        </ul>

                        <div className="sirgCocinaTicketActions">
                          <button
                            className="sirgCocinaBtn primary"
                            type="button"
                            disabled={updating === o.orderID}
                            onClick={() => advanceStatus(o.orderID, o.statusID)}
                          >
                            {updating === o.orderID ? 'Actualizando…' : NEXT_ACTION_LABEL[o.statusID]}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })
        )}

        <div className="sirgCocinaDeliveredHeader">
          <div className="sirgCocinaSectionTitle" style={{ margin: 0 }}>
            Entregados recientes ({delivered.length})
          </div>
          <button
            className="sirgCocinaBtn ghost"
            type="button"
            style={{ minWidth: 0, padding: '4px 12px', fontSize: '0.8rem', flex: 'none' }}
            onClick={() => setShowDelivered((v) => !v)}
          >
            {showDelivered ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {showDelivered && (
          <div className="sirgCocinaDoneCard">
            {delivered.length === 0 ? (
              <div className="sirgCocinaEmpty" style={{ padding: 28, border: 'none', background: 'transparent' }}>
                Sin pedidos entregados recientes.
              </div>
            ) : (
              delivered.map((o) => (
                <div key={o.orderID} className="sirgCocinaDoneRow">
                  <div>
                    <strong>Orden #{o.orderID}</strong>
                    <div className="meta">
                      {o.reservationID ? `Reserva #${o.reservationID}` : 'Walk-in'}
                    </div>
                  </div>
                  <div>
                    {(o.orderDetailsDto ?? []).map((d) => `${d.quantity}× ${d.dishes?.dishName ?? `#${d.dishID}`}`).join(' · ') || '—'}
                  </div>
                  <span className="meta">
                    {new Date(o.orderDate).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="sirgCocinaBadge">Entregado</span>
                </div>
              ))
            )}
          </div>
        )}

        <p className="sirgCocinaLastRefresh">
          Última actualización: {lastRefresh.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
