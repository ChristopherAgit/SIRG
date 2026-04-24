import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../admin/styles/admin.css';
import '../../styles/staff-landing.css';
import { dishRepo, tableRepo } from '../../admin/lib/repo';
import apiFetch from '../../lib/api';
import { Modal } from '../../admin/components/Modal';
import { useToast } from '../../admin/components/toast/ToastContext';
import type { RestaurantTable } from '../../admin/models';
import { orderRepo } from '../../shared/orders';
import { listTables, listDishes, createOrderWithDetails } from '../api';
import type { ServiceSession } from '../lib/sessions';
import { sessionRepo } from '../lib/sessions';

type ItemDraft = { dishId: string; qty: string };

function shortId(id: string) {
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function NavActions() {
  const navigate = useNavigate();
  const userName = (() => {
    try {
      const raw = localStorage.getItem('sirg_auth');
      if (!raw) return '';
      const p = JSON.parse(raw);
      return p?.name ?? '';
    } catch {
      return '';
    }
  })();

  return (
    <>
      {userName ? <div style={{ color: 'rgba(255,255,255,0.7)', marginRight: 8 }}>{userName}</div> : null}
      <button
        className="adminButton"
        type="button"
        onClick={() => {
          navigate('/');
        }}
      >
        Volver
      </button>
      <button
        className="adminButton"
        type="button"
        onClick={() => {
          localStorage.removeItem('sirg_auth');
          navigate('/login');
        }}
      >
        Cerrar sesión
      </button>
    </>
  );
}

export function MeseroPage() {
  const toast = useToast();
  const [refresh, setRefresh] = useState(0);

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const openSessions = useMemo(() => sessionRepo.listOpen(), [refresh]);

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [walkInTableId, setWalkInTableId] = useState('');
  const [resForm, setResForm] = useState({ serviceId: '', tableId: '' });

  const [menuSession, setMenuSession] = useState<ServiceSession | null>(null);
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [loading, setLoading] = useState(false);

  function bump() {
    setRefresh((x) => x + 1);
  }

  // load remote data
  async function load() {
    try {
      const t = await listTables();
      setTables((t as any[]).filter((x) => x.isActive).map((x) => ({ id: x.id, number: x.number, seats: x.seats, isActive: x.isActive, createdAt: new Date().toISOString() })));
      const d = await listDishes();
      setDishes((d as any[]).filter((x) => x.isActive).map((x) => ({ id: x.id, name: x.name, price: x.price, isActive: x.isActive })));
    } catch (err) {
      // fallback to local repo if API fails
      setTables(tableRepo.list().filter((t: RestaurantTable) => t.isActive));
      setDishes(dishRepo.list().filter((d) => d.isActive));
    }
  }

  // initial load and on refresh
  useMemo(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  function openMenuForSession(s: ServiceSession) {
    setMenuSession(s);
    setItems(dishes[0]?.id ? [{ dishId: dishes[0].id, qty: '1' }] : []);
  }

  function closeMenu() {
    setMenuSession(null);
    setItems([]);
  }

  function submitWalkIn() {
    setLoading(true);
    try {
      const table = tables.find((t) => t.id === walkInTableId) ?? null;
      if (!table) {
        toast.push({ type: 'error', title: 'Mesa', message: 'Selecciona una mesa.' });
        return;
      }
      if (sessionRepo.findOpenByTableId(table.id)) {
        toast.push({ type: 'error', title: 'Mesa ocupada', message: `Ya hay un servicio abierto en mesa ${table.number}. Ciérralo o usa esa mesa para pedidos.` });
        return;
      }
      const s = sessionRepo.create({ tableId: table.id, tableNumber: table.number });
      setWalkInOpen(false);
      bump();
      toast.push({ type: 'success', title: 'Servicio abierto', message: `Walk-in · Mesa ${table.number} · ID ${shortId(s.serviceId)}` });
      openMenuForSession(s);
    } finally {
      setLoading(false);
    }
  }

  function submitWithServiceId() {
    setLoading(true);
    try {
      const sid = resForm.serviceId.trim();
      const table = tables.find((t) => t.id === resForm.tableId) ?? null;
      if (!sid) {
        toast.push({ type: 'error', title: 'ID de servicio', message: 'Pega el código que dio reservas (o el sistema); es el mismo ID que usará la base de datos.' });
        return;
      }
      if (!table) {
        toast.push({ type: 'error', title: 'Mesa', message: 'Selecciona la mesa asignada.' });
        return;
      }
      if (sessionRepo.findOpenByServiceId(sid)) {
        toast.push({ type: 'error', title: 'ID ya en uso', message: 'Ese servicio ya está abierto. Continúa desde la lista.' });
        return;
      }
      if (sessionRepo.findOpenByTableId(table.id)) {
        toast.push({ type: 'error', title: 'Mesa ocupada', message: `Ya hay otro servicio abierto en mesa ${table.number}.` });
        return;
      }
      const s = sessionRepo.create({ tableId: table.id, tableNumber: table.number, serviceId: sid });
      setReservationOpen(false);
      setResForm({ serviceId: '', tableId: '' });
      bump();
      toast.push({ type: 'success', title: 'Servicio abierto', message: `Mesa ${table.number} · ID ${shortId(s.serviceId)}` });
      openMenuForSession(s);
    } finally {
      setLoading(false);
    }
  }

  async function findReservationById() {
    const raw = resForm.serviceId.trim();
    if (!raw) {
      toast.push({ type: 'error', title: 'ID vacío', message: 'Escribe el ID de la reserva.' });
      return;
    }

    // intentar parsear como número (reservationID)
    const id = Number(raw);
    if (Number.isNaN(id)) {
      toast.push({ type: 'error', title: 'ID inválido', message: 'El ID debe ser un número de reserva.' });
      return;
    }

    try {
      const data = await apiFetch(`/reservations/${id}/details`);
      if (!data) {
        toast.push({ type: 'error', title: 'No encontrado', message: 'No se encontró la reserva.' });
        return;
      }

      const tableId = String(data.restaurantTablesDto?.tableID ?? data.tableID ?? '');
      const tableNumber = data.restaurantTablesDto?.tableNumber ?? data.tableID ?? '';
      setResForm({ serviceId: String(data.reservationID ?? id), tableId });
      toast.push({ type: 'success', title: 'Reserva encontrada', message: `Cliente: ${data.customersDto?.fullName ?? 'N/A'} · Mesa ${tableNumber}` });
    } catch (err) {
      toast.push({ type: 'error', title: 'Error', message: 'No se pudo buscar la reserva.' });
    }
  }

  function addItem() {
    const d0 = dishes[0]?.id ?? '';
    setItems((prev) => [...prev, { dishId: d0, qty: '1' }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function submitOrder() {
    if (!menuSession) return;
    if (items.length === 0) {
      toast.push({ type: 'error', title: 'Pedido vacío', message: 'Agrega al menos un plato.' });
      return;
    }

    const normalized = items
      .map((it) => {
        const dish = dishes.find((d) => d.id === it.dishId) ?? null;
        const qty = Number(it.qty);
        return dish && !Number.isNaN(qty) && qty > 0 ? { dish, qty } : null;
      })
      .filter((x): x is { dish: (typeof dishes)[0]; qty: number } => x !== null);

    if (normalized.length === 0) {
      toast.push({ type: 'error', title: 'Pedido inválido', message: 'Revisa cantidades (deben ser > 0).' });
      return;
    }

    const byDishId = new Map<string, { dish: (typeof dishes)[0]; qty: number }>();
    for (const it of normalized) {
      const prev = byDishId.get(it.dish.id);
      byDishId.set(it.dish.id, prev ? { ...prev, qty: prev.qty + it.qty } : it);
    }
    const merged = Array.from(byDishId.values());

    // Numeric serviceId = reservationID; svc_xxx = walk-in (no reservation)
    const reservationID = /^\d+$/.test(menuSession.serviceId) ? Number(menuSession.serviceId) : null;

    // Save locally for "recent orders" display
    orderRepo.create({
      serviceId: menuSession.serviceId,
      tableId: menuSession.tableId,
      tableNumber: menuSession.tableNumber,
      status: 'sent',
      items: merged.map((it) => ({ dishId: it.dish.id, dishName: it.dish.name, qty: it.qty })),
    });

    toast.push({ type: 'success', title: 'Pedido enviado a cocina', message: `Mesa ${menuSession.tableNumber}` });
    closeMenu();
    bump();

    // Persist to API (fire-and-forget)
    setLoading(true);
    createOrderWithDetails({
      reservationID,
      items: merged.map((it) => ({
        dishID: Number(it.dish.id),
        quantity: it.qty,
        unitPrice: it.dish.price ?? 0,
      })),
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function closeService(s: ServiceSession) {
    sessionRepo.close(s.serviceId);
    if (menuSession?.serviceId === s.serviceId) closeMenu();
    bump();
    toast.push({ type: 'info', title: 'Servicio cerrado', message: `Mesa ${s.tableNumber}. Podrás abrir otra cuenta en esa mesa.` });
  }

  const recentOrders = useMemo(() => orderRepo.list().slice(0, 15), [refresh]);

  return (
    <div className="sirgStaffViewport">
      <div className="sirgStaffShell">
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', zIndex: 40 }}>
            <div className="adminSpinner" aria-hidden />
          </div>
        ) : null}
        <div className="adminPageTitleRow">
          <div>
            <div className="adminPageTitle">Mesero</div>
            <div className="adminPageDesc">
              Un solo <b>ID de servicio</b> para todo: si hay reserva, es el código que devuelve reservas; si es walk-in, lo generamos aquí. Pedidos y cocina usan el mismo identificador para la base de datos.
            </div>
          </div>
          <div className="adminActions" style={{ flexWrap: 'wrap' }}>
            {/* navegación y logout */}
            <NavActions />
            <button
              className="adminButton primary"
              type="button"
              onClick={() => {
                setWalkInTableId(tables[0]?.id ?? '');
                setWalkInOpen(true);
              }}
              disabled={tables.length === 0}
            >
              + Walk-in (sin reserva)
            </button>
            <button
              className="adminButton"
              type="button"
              onClick={() => {
                setResForm({ serviceId: '', tableId: tables[0]?.id ?? '' });
                setReservationOpen(true);
              }}
              disabled={tables.length === 0}
            >
              + Ya tengo el ID (reserva)
            </button>
          </div>
        </div>

        <div className="adminCard" style={{ marginBottom: 14 }}>
          <div className="adminCardLabel">Servicios abiertos</div>
          <div className="adminPageDesc" style={{ marginTop: 6, marginBottom: 10 }}>
            Elige <b>Pedido</b> para cargar platos a la cuenta de ese servicio. <b>Cerrar</b> libera la mesa para otro cliente.
          </div>
          <table className="adminTable" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>ID servicio</th>
                <th>Mesa</th>
                <th style={{ width: 220 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {openSessions.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ color: 'rgba(255,255,255,0.7)' }}>
                    No hay mesas abiertas. Usa walk-in o pega el ID de reserva para comenzar.
                  </td>
                </tr>
              ) : (
                openSessions.map((s) => (
                  <tr key={s.serviceId}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }} title={s.serviceId}>
                      {shortId(s.serviceId)}
                    </td>
                    <td>Mesa {s.tableNumber}</td>
                    <td>
                      <div className="adminRowActions">
                        <button className="adminButton primary" type="button" onClick={() => openMenuForSession(s)}>
                          Pedido
                        </button>
                        <button className="adminButton danger" type="button" onClick={() => closeService(s)}>
                          Cerrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="adminCard">
          <div className="adminCardLabel">Últimos pedidos enviados</div>
          <table className="adminTable" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>ID servicio</th>
                <th>Mesa</th>
                <th>Estado</th>
                <th>Platos</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Sin pedidos todavía.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }} title={o.serviceId}>
                      {shortId(o.serviceId)}
                    </td>
                    <td>Mesa {o.tableNumber}</td>
                    <td>
                      <span className={`adminBadge ${o.status === 'sent' ? '' : 'low'}`}>{o.status}</span>
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.78)' }}>
                      {o.items.map((i) => `${i.qty}× ${i.dishName}`).join(', ')}
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.7)' }}>{new Date(o.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={walkInOpen}
          title="Walk-in (sin reserva)"
          description="Se genera un ID de servicio interno. Cocina y los pedidos quedarán enlazados a ese ID."
          onClose={() => setWalkInOpen(false)}
          footer={
            <>
              <button className="adminButton" type="button" onClick={() => setWalkInOpen(false)}>
                Cancelar
              </button>
              <button className="adminButton primary" type="button" onClick={submitWalkIn}>
                Abrir mesa y armar pedido
              </button>
            </>
          }
        >
          <div className="adminFormGrid" style={{ margin: 0 }}>
            <div className="col12">
              <label className="adminLabel">Mesa</label>
              <select className="adminSelect" value={walkInTableId || (tables[0]?.id ?? '')} onChange={(e) => setWalkInTableId(e.target.value)}>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Mesa {t.number} ({t.seats} sillas)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>

        <Modal
          open={reservationOpen}
          title="Abrir con ID existente"
          description="Es el mismo serviceId que guardará backend: el que devuelve reservas al confirmar (UUID, número, etc.)."
          onClose={() => setReservationOpen(false)}
          footer={
            <>
              <button className="adminButton" type="button" onClick={() => setReservationOpen(false)}>
                Cancelar
              </button>
              <button className="adminButton primary" type="button" onClick={submitWithServiceId}>
                Abrir y armar pedido
              </button>
            </>
          }
        >
          <div className="adminFormGrid" style={{ margin: 0 }}>
            <div className="col12">
              <label className="adminLabel">ID de servicio (desde reservas)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="adminInput"
                  value={resForm.serviceId}
                  onChange={(e) => setResForm((f) => ({ ...f, serviceId: e.target.value }))}
                  placeholder="Pega el ID de reserva (número) y presiona Buscar"
                />
                <button className="adminButton" type="button" onClick={() => void findReservationById()}>
                  Buscar
                </button>
              </div>
            </div>
            <div className="col12">
              <label className="adminLabel">Mesa</label>
              <select className="adminSelect" value={resForm.tableId || (tables[0]?.id ?? '')} onChange={(e) => setResForm((f) => ({ ...f, tableId: e.target.value }))}>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Mesa {t.number} ({t.seats} sillas)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>

        <Modal
          open={!!menuSession}
          title={menuSession ? `Pedido · Mesa ${menuSession.tableNumber}` : 'Pedido'}
          description={menuSession ? 'Todo el pedido queda bajo este único ID de servicio.' : undefined}
          onClose={closeMenu}
          footer={
            <>
              <button className="adminButton" type="button" onClick={closeMenu}>
                Cerrar
              </button>
              <button className="adminButton primary" type="button" onClick={submitOrder} disabled={dishes.length === 0}>
                Enviar a cocina
              </button>
            </>
          }
        >
          {menuSession ? (
            <div className="adminFormGrid" style={{ margin: 0 }}>
              <div className="col12" style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.82)' }}>
                <div>
                  <b>ID servicio:</b>{' '}
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{menuSession.serviceId}</span>
                </div>
              </div>
              <div className="col12">
                <div className="adminDivider" />
                <div className="adminActions" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>Menú</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Platos visibles en administración.</div>
                  </div>
                  <button className="adminButton" type="button" onClick={addItem} disabled={dishes.length === 0}>
                    + Plato
                  </button>
                </div>
              </div>

              <div className="col12">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Plato</th>
                      <th style={{ width: 180 }}>Cantidad</th>
                      <th style={{ width: 120 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ color: 'rgba(255,255,255,0.7)' }}>
                          Agrega platos al pedido.
                        </td>
                      </tr>
                    ) : (
                      items.map((it, idx) => (
                        <tr key={`${it.dishId}_${idx}`}>
                          <td>
                            <select
                              className="adminSelect"
                              value={it.dishId}
                              onChange={(e) => setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, dishId: e.target.value } : x)))}
                            >
                              {dishes.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              className="adminInput"
                              value={it.qty}
                              onChange={(e) => setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, qty: e.target.value } : x)))}
                              placeholder="Ej: 2"
                            />
                          </td>
                          <td>
                            <button className="adminButton danger" type="button" onClick={() => removeItem(idx)}>
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}
