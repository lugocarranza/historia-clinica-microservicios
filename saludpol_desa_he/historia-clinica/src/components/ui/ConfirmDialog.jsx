import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'

const KEYFRAMES = `
  @keyframes hce-overlay-in { from { opacity: 0 } to { opacity: 1 } }
  @keyframes hce-dialog-in { from { opacity: 0; transform: translate(-50%, -50%) scale(0.88) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
  dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: none;
    border-radius: 10px;
    padding: 28px 32px;
    max-width: 420px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    animation: hce-dialog-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  dialog::backdrop { animation: hce-overlay-in 0.18s ease; background: rgba(15, 23, 42, 0.45); }
`

export default function ConfirmDialog({ message, detail, onConfirm, onCancel, confirmLabel = 'Confirmar', isLoading = false }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const handleClose = (callback) => {
    dialogRef.current?.close()
    callback()
  }

  return createPortal(
    <>
      <style>{KEYFRAMES}</style>
      <dialog
        ref={dialogRef}
        onCancel={() => handleClose(onCancel)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{ flexShrink: 0, background: '#fef3c7', borderRadius: '50%', padding: 10, display: 'flex' }}>
            <AlertTriangle size={22} color="#d97706" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 6 }}>{message}</div>
            {detail && <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{detail}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" variant="secondary" onClick={() => handleClose(onCancel)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => handleClose(onConfirm)} disabled={isLoading}>
            {isLoading ? 'Procesando...' : confirmLabel}
          </Button>
        </div>
      </dialog>
    </>,
    document.body
  )
}

ConfirmDialog.propTypes = {
  message: PropTypes.string.isRequired,
  detail: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
  isLoading: PropTypes.bool,
}
