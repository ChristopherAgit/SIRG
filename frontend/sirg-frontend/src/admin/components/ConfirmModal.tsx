import { Modal } from './Modal';

export function ConfirmModal(props: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={props.open}
      title={props.title}
      description={props.description}
      onClose={props.onClose}
      footer={
        <>
          <button className="adminButton" type="button" onClick={props.onClose}>
            {props.cancelText ?? 'Cancelar'}
          </button>
          <button
            className={`adminButton ${props.destructive ? 'danger' : 'primary'}`}
            type="button"
            onClick={() => {
              props.onConfirm();
              props.onClose();
            }}
          >
            {props.confirmText ?? 'Confirmar'}
          </button>
        </>
      }
    >
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.5 }}>
        {props.description ?? '¿Estás seguro de continuar?'}
      </div>
    </Modal>
  );
}

