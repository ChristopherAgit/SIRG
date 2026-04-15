import apiFetch from '../lib/api';

export type TableDto = { id: string; number: number; seats: number; isActive: boolean };
export type DishDto = { id: string; name: string; price: number; isActive: boolean };

export async function listTables(): Promise<TableDto[]> {
  const res = await apiFetch('/tables');
  return Array.isArray(res) ? res : [];
}

export async function listDishes(): Promise<DishDto[]> {
  const res = await apiFetch('/dishes');
  return Array.isArray(res) ? res : [];
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
