import PropTypes from 'prop-types'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useListarAtenciones } from '@/hooks/useAdmision'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDateTime } from '@/utils/date'

const FILTROS = ['Todos', /*'CONTROL', 'EXTERNA'*/]

const tipoBadgeVariant = (tipo = '') => {
  if (tipo === 'CS') return 'green'
  if (tipo === 'CE') return 'blue'
  return 'gray'
}

const tipoLabel = (tipo) => {
  if (tipo === 'CS') return 'Control'
  if (tipo === 'CE') return 'Consulta Externa'
  return tipo || '—'
}

const estadoBadgeVariant = (estado = '') => {
  const v = estado.toUpperCase()
  if (v.includes('COMPLET')) return 'blue'
  if (v.includes('ABIERT')) return 'green'
  if (v.includes('ANUL')) return 'red'
  return 'gray'
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.30)',
  zIndex: 200,
}

const panelStyle = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: 440,
  background: 'var(--white)',
  boxShadow: 'var(--shadow-lg)',
  zIndex: 201,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderBottom: '1px solid var(--border-light)',
  flexShrink: 0,
}

const filterBarStyle = {
  display: 'flex',
  gap: 6,
  padding: '10px 16px',
  borderBottom: '1px solid var(--border-light)',
  flexShrink: 0,
}

const filterBtnStyle = (active) => ({
  padding: '3px 12px',
  borderRadius: 20,
  border: active ? '1.5px solid var(--c-primary-mid)' : '1.5px solid var(--border)',
  background: active ? 'var(--c-primary-pale)' : 'var(--white)',
  color: active ? 'var(--c-primary-mid)' : 'var(--text-muted)',
  fontWeight: active ? 600 : 400,
  fontSize: 12,
  cursor: 'pointer',
})

export default function HistorialPanel({ historiaClinicaId, onClose, onSelectAtencion }) {
  const [filtro, setFiltro] = useState('Todos')

  const { data: atenciones, isLoading, isError } = useListarAtenciones(historiaClinicaId)

  const lista = (atenciones || []).filter((a) => {
    if (filtro === 'Todos') return true
    return a.tipoAtencion?.toUpperCase() === filtro
  })

  return (
    <>
      <button type="button" style={{ ...overlayStyle, border: 'none', padding: 0, cursor: 'default' }} onClick={onClose} aria-label="Cerrar panel" />
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>Historial del Paciente</span>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div style={filterBarStyle}>
          {FILTROS.map((f) => (
            <button key={f} style={filterBtnStyle(filtro === f)} type="button" onClick={() => setFiltro(f)}>
              {f}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '24px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
              <LoadingSpinner /> Cargando historial...
            </div>
          )}

          {isError && (
            <div className="empty-state" style={{ margin: 16 }}>
              <div className="empty-state-title">No fue posible cargar el historial</div>
              <div>Intente nuevamente en unos segundos.</div>
            </div>
          )}

          {isLoading === false && isError === false && lista.length === 0 && (
            <div className="empty-state" style={{ margin: 16 }}>
              <div className="empty-state-title">Sin registros</div>
              <div>No hay atenciones {filtro === 'Todos' ? '' : `de tipo ${filtro}`} para este paciente.</div>
            </div>
          )}

          {isLoading === false && isError === false && lista.length > 0 && (
            <table className="data-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th style={{ width: 90 }}>Tipo</th>
                  <th style={{ width: 100 }}>Estado</th>
                  <th style={{ width: 52 }} />
                </tr>
              </thead>
              <tbody>
                {lista.map((atencion) => (
                  <tr key={atencion.id}>
                    <td style={{ fontSize: 12 }}>{formatDateTime(atencion.fechaAtencion)}</td>
                    <td>
                      <Badge variant={tipoBadgeVariant(atencion.tipoAtencion)}>
                        {tipoLabel(atencion.tipoAtencion)}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={estadoBadgeVariant(atencion.estado)}>
                        {atencion.estado || '—'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="xs"
                        type="button"
                        onClick={() => onSelectAtencion(atencion)}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

HistorialPanel.propTypes = {
  historiaClinicaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func.isRequired,
  onSelectAtencion: PropTypes.func.isRequired,
}
