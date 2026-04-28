export type ApiOptions = {
  prefix?: string;
};

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('sirg_auth');
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}, opts: ApiOptions = {}) {
  // prefer explicit prefix, otherwise use VITE_API_BASE (set in .env) or default to relative '/api/v1'
  // Vite exposes import.meta.env at build time — use it directly
  const envBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || '';
  const base = opts.prefix ?? (envBase ? envBase.replace(/\/$/, '') + '/api/v1' : '/api/v1');
  const token = getToken();
  const headers = new Headers(init.headers as HeadersInit || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default apiFetch;
