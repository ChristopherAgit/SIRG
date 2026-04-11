import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  push: (t: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
  toasts: Toast[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastId() {
  return `toast_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider(props: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = toastId();
      const toast: Toast = { ...t, id };
      setToasts((prev) => [toast, ...prev].slice(0, 4));
      window.setTimeout(() => remove(id), 3800);
    },
    [remove],
  );

  const value = useMemo(() => ({ push, remove, toasts }), [push, remove, toasts]);

  return <ToastContext.Provider value={value}>{props.children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

