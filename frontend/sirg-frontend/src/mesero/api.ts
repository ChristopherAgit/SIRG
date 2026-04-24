import apiFetch from '../lib/api';

export type TableDto = { id: string; number: number; seats: number; isActive: boolean };
export type DishDto = { id: string; name: string; price: number; isActive: boolean };

export async function listTables(): Promise<TableDto[]> {
  const res = await apiFetch('/tables');
  if (!Array.isArray(res)) return [];
  return res.map((x: any) => ({
    id: String(x.tableID ?? x.id ?? ''),
    number: x.tableNumber ?? x.number ?? 0,
    seats: x.capacity ?? x.seats ?? 0,
    isActive: x.isActive ?? true,
  }));
}

export async function listDishes(): Promise<DishDto[]> {
  const res = await apiFetch('/dishes');
  if (!Array.isArray(res)) return [];
  return res.map((x: any) => ({
    id: String(x.dishID ?? x.id ?? ''),
    name: x.dishName ?? x.name ?? '',
    price: x.price ?? 0,
    isActive: x.isActive ?? true,
  }));
}

export type CreateOrderPayload = {
  serviceId: string;
  tableId: string;
  tableNumber: number;
  status: string;
  items: { dishId: string; dishName: string; qty: number }[];
};

export async function createOrder(payload: CreateOrderPayload) {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
}
