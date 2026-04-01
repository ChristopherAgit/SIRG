import { useEffect } from 'react';

export function Modal(props: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  return (
    <div className="adminModalOverlay" role="dialog" aria-modal="true" onMouseDown={props.onClose}>
      <div className="adminModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <div>
            <div className="adminModalTitle">{props.title}</div>
            {props.description ? <div className="adminModalDesc">{props.description}</div> : null}
          </div>
          <button className="adminButton ghost" type="button" onClick={props.onClose}>
            Cerrar
          </button>
        </div>
        <div className="adminModalBody">{props.children}</div>
        {props.footer ? <div className="adminModalFooter">{props.footer}</div> : null}
      </div>
    </div>
  );
}

