import { useMemo, useState } from 'react';
import '../../admin/styles/admin.css';
import '../../styles/staff-landing.css';
import { dishRepo, tableRepo } from '../../admin/lib/repo';
import { Modal } from '../../admin/components/Modal';
import { useToast } from '../../admin/components/toast/ToastContext';
import type { RestaurantTable } from '../../admin/models';
import { orderRepo } from '../../shared/orders';

type ItemDraft = { dishId: string; qty: string };

export function MeseroPage() {
  const toast = useToast();
  const [refresh, setRefresh] = useState(0);

  const tables = useMemo(() => tableRepo.list().filter((t: RestaurantTable) => t.isActive), [refresh]);
  const dishes = useMemo(() => dishRepo.list().filter((d) => d.isActive), [refresh]);

  const [tableId, setTableId] = useState<string>('');
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  function openNewOrder() {
    setTableId(tables[0]?.id ?? '');
    setItems(dishes[0]?.id ? [{ dishId: dishes[0].id, qty: '1' }] : []);
    setIsOpen(true);
  }

  function addItem() {
    const d0 = dishes[0]?.id ?? '';
    setItems((prev) => [...prev, { dishId: d0, qty: '1' }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function submit() {
    const table = tables.find((t: RestaurantTable) => t.id === tableId) ?? null;
    if (!table) {
      toast.push({ type: 'error', title: 'Mesa requerida', message: 'Selecciona una mesa.' });
      return;
    }
    if (items.length === 0) {
      toast.push({ type: 'error', title: 'Pedido vacío', message: 'Agrega al menos un plato.' });
      return;
    }

    const normalized = items
      .map((it) => {
        const dish = dishes.find((d) => d.id === it.dishId) ?? null;
        const qty = Number(it.qty);
        return dish && !Number.isNaN(qty) && qty > 0 ? { dishId: dish.id, dishName: dish.name, qty } : null;
      })
      .filter((x) => x !== null);

    if (normalized.length === 0) {
      toast.push({ type: 'error', title: 'Pedido inválido', message: 'Revisa cantidades (deben ser > 0).' });
      return;
    }

    const byDish = new Map<string, { dishId: string; dishName: string; qty: number }>();
    for (const it of normalized) {
      const prev = byDish.get(it.dishId);
      byDish.set(it.dishId, prev ? { ...prev, qty: prev.qty + it.qty } : it);
    }

    orderRepo.create({
      tableId: table.id,
      tableNumber: table.number,
      status: 'sent',
      items: Array.from(byDish.values()),
    });

    toast.push({ type: 'success', title: 'Pedido enviado', message: `Mesa ${table.number}` });
    setIsOpen(false);
    setRefresh((x) => x + 1);
  }

  const recentOrders = useMemo(() => orderRepo.list().slice(0, 12), [refresh]);

  return (
    <div className="sirgStaffViewport">
    <div className="sirgStaffShell">
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Mesero</div>
          <div className="adminPageDesc">Selecciona una mesa y agrega los platos del pedido.</div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={openNewOrder} disabled={tables.length === 0 || dishes.length === 0}>
            + Nuevo pedido
          </button>
        </div>
      </div>

      <div className="adminCard">
        <div className="adminCardLabel">Últimos pedidos</div>
        <table className="adminTable" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Estado</th>
              <th>Platos</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin pedidos todavía.
                </td>
              </tr>
            ) : (
              recentOrders.map((o) => (
                <tr key={o.id}>
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
        open={isOpen}
        title="Nuevo pedido"
        description="Selecciona mesa y agrega platos (puedes usar + para agregar más)."
        onClose={() => setIsOpen(false)}
        footer={
          <>
            <button className="adminButton" type="button" onClick={() => setIsOpen(false)}>
              Cancelar
            </button>
            <button className="adminButton primary" type="button" onClick={submit}>
              Enviar a cocina
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col12">
            <label className="adminLabel">Mesa</label>
            <select className="adminSelect" value={tableId} onChange={(e) => setTableId(e.target.value)}>
              {tables.map((t: RestaurantTable) => (
                <option key={t.id} value={t.id}>
                  Mesa {t.number} ({t.seats} sillas)
                </option>
              ))}
            </select>
          </div>

          <div className="col12">
            <div className="adminDivider" />
            <div className="adminActions" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800 }}>Platos</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Agrega tantos como necesites.</div>
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
                      No hay platos para agregar.
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
      </Modal>
    </div>
    </div>
  );
}
