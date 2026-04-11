import { readJson, uid, writeJson } from '../../admin/lib/storage';

export type ServiceSession = {
  serviceId: string;
  tableId: string;
  tableNumber: number;
  openedAt: string;
  status: 'open' | 'closed';
};

const KEY = 'sirg_mesero_sessions';

function normalizeSession(raw: Record<string, unknown>): ServiceSession | null {
  const legacyReservation =
    typeof raw.reservationId === 'string' && raw.reservationId ? String(raw.reservationId) : '';
  const sid =
    typeof raw.serviceId === 'string' && raw.serviceId ? raw.serviceId : legacyReservation || '';
  const tableId = typeof raw.tableId === 'string' ? raw.tableId : '';
  const tn = raw.tableNumber;
  const tableNumber = typeof tn === 'number' ? tn : Number(tn);
  const openedAt = typeof raw.openedAt === 'string' ? raw.openedAt : '';
  const status = raw.status === 'closed' || raw.status === 'open' ? raw.status : 'open';
  if (!sid || !tableId || !openedAt || Number.isNaN(tableNumber)) return null;
  return { serviceId: sid, tableId, tableNumber, openedAt, status };
}

export const sessionRepo = {
  listOpen(): ServiceSession[] {
    const all = readJson<Record<string, unknown>[]>(KEY, []);
    return all
      .map((r) => normalizeSession(r))
      .filter((s): s is ServiceSession => s !== null && s.status === 'open');
  },

  create(input: { tableId: string; tableNumber: number; serviceId?: string }): ServiceSession {
    const all = readJson<Record<string, unknown>[]>(KEY, []);
    const now = new Date().toISOString();
    const serviceId = (input.serviceId?.trim() || '') || uid('svc');
    const row: ServiceSession = {
      serviceId,
      tableId: input.tableId,
      tableNumber: input.tableNumber,
      openedAt: now,
      status: 'open',
    };
    writeJson(KEY, [row, ...all]);
    return row;
  },

  findOpenByTableId(tableId: string): ServiceSession | null {
    return sessionRepo.listOpen().find((s) => s.tableId === tableId) ?? null;
  },

  findOpenByServiceId(serviceId: string): ServiceSession | null {
    return sessionRepo.listOpen().find((s) => s.serviceId === serviceId) ?? null;
  },

  close(serviceId: string): boolean {
    const all = readJson<Record<string, unknown>[]>(KEY, []);
    const idx = all.findIndex((r) => {
      const s = normalizeSession(r);
      return s?.serviceId === serviceId;
    });
    if (idx < 0) return false;
    all[idx] = { ...all[idx], status: 'closed' };
    writeJson(KEY, all);
    return true;
  },
};
