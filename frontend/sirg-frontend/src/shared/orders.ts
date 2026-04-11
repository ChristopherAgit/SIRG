import { readJson, uid, writeJson } from '../admin/lib/storage';

export type OrderStatus = 'sent' | 'cancelled' | 'done';

export type OrderItem = {
  dishId: string;
  dishName: string;
  qty: number;
};

/**
 * Un solo identificador de negocio para backend: `serviceId`.
 * - Walk-in: lo genera el front al abrir mesa.
 * - Con reserva: es el mismo ID que emite el módulo de reservas (un solo código en BD).
 */
export type Order = {
  id: string;
  serviceId: string;
  tableId: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

const KEY = 'sirg_orders';

function normalizeRow(raw: Record<string, unknown>): Order {
  const id = String(raw.id ?? '');
  const legacyReservation = typeof raw.reservationId === 'string' && raw.reservationId ? raw.reservationId : '';
  const sid =
    (typeof raw.serviceId === 'string' && raw.serviceId ? raw.serviceId : '') || legacyReservation || `legacy_${id}`;
  return {
    id,
    serviceId: sid,
    tableId: String(raw.tableId ?? ''),
    tableNumber: Number(raw.tableNumber ?? 0),
    status: (raw.status as OrderStatus) ?? 'sent',
    items: Array.isArray(raw.items) ? (raw.items as OrderItem[]) : [],
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? ''),
  };
}

export const orderRepo = {
  list(): Order[] {
    const raw = readJson<Record<string, unknown>[]>(KEY, []);
    return raw.map(normalizeRow).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  create(input: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const all = readJson<Record<string, unknown>[]>(KEY, []);
    const now = new Date().toISOString();
    const order: Order = { ...input, id: uid('order'), createdAt: now, updatedAt: now };
    writeJson(KEY, [order as unknown as Record<string, unknown>, ...all]);
    return order;
  },
  update(id: string, patch: Partial<Pick<Order, 'status' | 'items'>>): Order | null {
    const all = readJson<Record<string, unknown>[]>(KEY, []);
    const idx = all.findIndex((o) => String(o.id) === id);
    if (idx < 0) return null;
    const now = new Date().toISOString();
    const cur = normalizeRow(all[idx]);
    const next: Order = {
      ...cur,
      status: patch.status !== undefined ? patch.status : cur.status,
      items: patch.items !== undefined ? patch.items : cur.items,
      updatedAt: now,
    };
    all[idx] = next as unknown as Record<string, unknown>;
    writeJson(KEY, all);
    return next;
  },
};
