import { useToast } from './ToastContext';

export function ToastViewport() {
  const { toasts, remove } = useToast();
  return (
    <div className="adminToastStack" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((t) => (
        <div key={t.id} className={`adminToast ${t.type}`}>
          <div>
            <div className="adminToastTitle">{t.title}</div>
            {t.message ? <div className="adminToastMsg">{t.message}</div> : null}
          </div>
          <div>
            <button className="adminButton ghost" type="button" onClick={() => remove(t.id)}>
              Cerrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

