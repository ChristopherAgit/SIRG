import { readJson, uid, writeJson } from '../../admin/lib/storage';

/**
 * Sesión en mesa: un solo `serviceId` (el mismo que usará reservas/pedidos en BD).
 */
export type ServiceSession = {
  serviceId: string;
  tableId: string;
  tableNumber: number;
  openedAt: string;
  status: 'open' | 'closed';
};

const KEY = 'sirg_service_sessions';

function normalizeSession(raw: Record<string, unknown>): ServiceSession | null {
  const legacyReservation = typeof raw.reservationId === 'string' && raw.reservationId ? String(raw.reservationId) : '';
  const serviceId =
    (typeof raw.serviceId === 'string' && raw.serviceId ? raw.serviceId : '') || legacyReservation;
  if (!serviceId) return null;
  return {
    serviceId,
    tableId: String(raw.tableId ?? ''),
    tableNumber: Number(raw.tableNumber ?? 0),
    openedAt: String(raw.openedAt ?? ''),
    status: raw.status === 'closed' ? 'closed' : 'open',
  };
}

export const sessionRepo = {
  listAll(): ServiceSession[] {
    const rows = readJson<Record<string, unknown>[]>(KEY, []);
    return rows.map(normalizeSession).filter((s): s is ServiceSession => s !== null);
  },
  listOpen(): ServiceSession[] {
    return sessionRepo
      .listAll()
      .filter((s) => s.status === 'open')
      .sort((a, b) => b.openedAt.localeCompare(a.openedAt));
  },
  findOpenByTableId(tableId: string): ServiceSession | null {
    return sessionRepo.listOpen().find((s) => s.tableId === tableId) ?? null;
  },
  findOpenByServiceId(serviceId: string): ServiceSession | null {
    const id = serviceId.trim();
    if (!id) return null;
    return sessionRepo.listOpen().find((s) => s.serviceId === id) ?? null;
  },
  /**
   * Si pasas `serviceId`, se usa tal cual (ej. código de reservas). Si no, se genera uno para walk-in.
   */
  create(input: { tableId: string; tableNumber: number; serviceId?: string }): ServiceSession {
    const all = readJson<Record<string, unknown>[]>(KEY, []);
    const now = new Date().toISOString();
    const serviceId = input.serviceId?.trim() || uid('svc');
    const session: ServiceSession = {
      serviceId,
      tableId: input.tableId,
      tableNumber: input.tableNumber,
      openedAt: now,
      status: 'open',
    };
    writeJson(KEY, [session as unknown as Record<string, unknown>, ...all]);
    return session;
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
