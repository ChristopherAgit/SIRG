import { useMemo, useState } from 'react';
import '../../admin/styles/admin.css';
import '../cocina.css';
import { useToast } from '../../admin/components/toast/ToastContext';
import { orderRepo } from '../../shared/orders';

function shortId(id: string) {
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export function CocineroPage() {
  const toast = useToast();
  const [refresh, setRefresh] = useState(0);

  const orders = useMemo(() => orderRepo.list(), [refresh]);
  const pending = useMemo(
    () => orders.filter((o) => o.status === 'sent').sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [orders],
  );
  const done = useMemo(() => orders.filter((o) => o.status === 'done').slice(0, 12), [orders]);

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
    <div className="sirgCocinaViewport">
      <div className="sirgCocinaShell">
        <header className="sirgCocinaStickyBar">
          <div>
            <h1>Cocina</h1>
            <p>Pedidos en cola como tickets. La barra se mantiene visible al desplazarte.</p>
          </div>
          <div className="sirgCocinaStickyMeta">
            <div className="sirgCocinaPill">
              En cola: <strong>{pending.length}</strong>
            </div>
            <div className="sirgCocinaPill">
              Hora:{' '}
              <strong>
                {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
          </div>
        </header>

        <div className="sirgCocinaSectionTitle">Pendientes — armar y marcar listo</div>
        <div className="sirgCocinaTicketWall">
          {pending.length === 0 ? (
            <div className="sirgCocinaEmpty">No hay pedidos pendientes. Los nuevos aparecerán aquí como notas.</div>
          ) : (
            pending.map((o) => (
              <article key={o.id} className="sirgCocinaTicket" aria-label={`Pedido mesa ${o.tableNumber}`}>
                <div className="sirgCocinaTicketTape" aria-hidden />
                <div className="sirgCocinaTicketInner">
                  <div className="sirgCocinaTicketHead">
                    <div>
                      <div className="sirgCocinaTicketMesa">Mesa {o.tableNumber}</div>
                      {o.serviceId ? (
                        <div className="sirgCocinaTicketService">
                          ID servicio: <span title={o.serviceId}>{shortId(o.serviceId)}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="sirgCocinaTicketTime">{new Date(o.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <ul className="sirgCocinaTicketList">
                    {o.items.map((i) => (
                      <li key={`${o.id}-${i.dishId}`}>
                        <span className="sirgCocinaQty">{i.qty}×</span>
                        <span>{i.dishName}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="sirgCocinaTicketActions">
                    <button className="sirgCocinaBtn primary" type="button" onClick={() => markDone(o.id)}>
                      Marcar listo
                    </button>
                    <button className="sirgCocinaBtn ghost" type="button" onClick={() => cancel(o.id)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="sirgCocinaSectionTitle">Recientes listos</div>
        <div className="sirgCocinaDoneCard">
          {done.length === 0 ? (
            <div className="sirgCocinaEmpty" style={{ padding: 28, border: 'none', background: 'transparent' }}>
              Sin pedidos completados recientes.
            </div>
          ) : (
            done.map((o) => (
              <div key={o.id} className="sirgCocinaDoneRow">
                <div>
                  <strong>Mesa {o.tableNumber}</strong>
                  {o.serviceId ? (
                    <div className="meta" title={o.serviceId}>
                      {shortId(o.serviceId)}
                    </div>
                  ) : null}
                </div>
                <div>{o.items.map((i) => `${i.qty}× ${i.dishName}`).join(' · ')}</div>
                <span className="meta">{new Date(o.updatedAt).toLocaleTimeString()}</span>
                <span className="sirgCocinaBadge">Listo</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
