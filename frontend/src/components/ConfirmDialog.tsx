import { Modal } from './Modal';
import { Button } from './ui';

interface ConfirmDialogProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  confirmando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  confirmando,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal aberto={aberto} titulo={titulo} onFechar={onCancelar} largura="sm">
      <p className="text-sm text-[var(--color-text-muted)]">{mensagem}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirmar} disabled={confirmando}>
          {confirmando ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    </Modal>
  );
}
