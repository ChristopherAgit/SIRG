import { readJson, uid, writeJson } from '../admin/lib/storage';

export type OrderStatus = 'sent' | 'cancelled' | 'done';

export type OrderItem = {
  dishId: string;
  dishName: string;
  qty: number;
};

export type Order = {
  id: string;
  /** Mismo identificador que sesión/reserva en API. */
  serviceId?: string;
  tableId: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

const KEY = 'sirg_orders';

export const orderRepo = {
  list(): Order[] {
    return readJson<Order[]>(KEY, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  create(input: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const all = readJson<Order[]>(KEY, []);
    const now = new Date().toISOString();
    const order: Order = { ...input, id: uid('order'), createdAt: now, updatedAt: now };
    writeJson(KEY, [order, ...all]);
    return order;
  },
  update(id: string, patch: Partial<Pick<Order, 'status' | 'items'>>): Order | null {
    const all = readJson<Order[]>(KEY, []);
    const idx = all.findIndex((o) => o.id === id);
    if (idx < 0) return null;
    const now = new Date().toISOString();
    const next: Order = {
      ...all[idx],
      status: patch.status !== undefined ? patch.status : all[idx].status,
      items: patch.items !== undefined ? patch.items : all[idx].items,
      updatedAt: now,
    };
    all[idx] = next;
    writeJson(KEY, all);
    return next;
  },
};
