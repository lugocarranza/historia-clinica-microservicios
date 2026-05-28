import PropTypes from 'prop-types'
import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDateTime } from '@/utils/date'
import { useListarOrdenesMedica } from '@/hooks/useOrdenMedica'
import OrdenMedicaDetallePanel from './OrdenMedicaDetallePanel'

const estadoVariant = (estado = '') => {
  const value = estado.toUpperCase()
  if (value.includes('ANUL')) return 'red'
  if (value.includes('ATEND')) return 'blue'
  if (value.includes('OBSERV')) return 'orange'
  return 'green'
}

export default function OrdenMedicaListaPanel({ dniPaciente }) {
  const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState(null)
  const { data: ordenes = [], isLoading, isError, isFetching } = useListarOrdenesMedica(dniPaciente)

  if (ordenSeleccionadaId) {
    const ordenIndex = ordenes.findIndex((orden) => String(orden.id) === String(ordenSeleccionadaId))
    const ordenAnterior = ordenIndex > 0 ? ordenes[ordenIndex - 1] : null
    const ordenSiguiente = ordenIndex >= 0 && ordenIndex < ordenes.length - 1 ? ordenes[ordenIndex + 1] : null

    return (
      <OrdenMedicaDetallePanel
        ordenId={ordenSeleccionadaId}
        onVolver={() => setOrdenSeleccionadaId(null)}
        onAnterior={ordenAnterior ? () => setOrdenSeleccionadaId(ordenAnterior.id) : null}
        onSiguiente={ordenSiguiente ? () => setOrdenSeleccionadaId(ordenSiguiente.id) : null}
        posicionActual={ordenIndex >= 0 ? ordenIndex + 1 : null}
        totalOrdenes={ordenes.length}
      />
    )
  }

  return (
    <Card>
      <CardHeader
        title={`Órdenes médicas del paciente ${dniPaciente}`}
        actions={isFetching ? <span style={{ fontSize: 12, color: '#64748b' }}>Actualizando...</span> : null}
      />
      <CardBody noPadding>
        {isLoading ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <LoadingSpinner />
            <div className="empty-state-title">Cargando órdenes...</div>
          </div>
        ) : isError ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-state-title">Error al consultar órdenes médicas</div>
            <div>Verifique que el servicio hce-orden-medica esté activo en el gateway.</div>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-state-title">Sin órdenes médicas registradas</div>
            <div>No hay órdenes para el DNI consultado.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>OAP Nro.</th>
                <th>Paciente</th>
                <th>Fecha emisión</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>APS Nro.</th>
                <th>Carta garantía</th>
                <th style={{ width: 90 }}>Detalle</th>
                <th style={{ width: 80 }}>Items</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td className="mono">{orden.nroOap}</td>
                  <td>{orden.paciente || orden.dniPaciente || '-'}</td>
                  <td>{formatDateTime(orden.fechaEmision)}</td>
                  <td>
                    <Badge variant={estadoVariant(orden.estado)}>{orden.estado}</Badge>
                  </td>
                  <td>{orden.tipoOrden?.nombre || orden.tipoOrden?.codigo || '-'}</td>
                  <td className="mono">{orden.nroAps || '-'}</td>
                  <td className="mono">{orden.nroCartaGarantia || '-'}</td>
                  <td>
                    <Button
                      variant="secondary"
                      size="xs"
                      type="button"
                      onClick={() => setOrdenSeleccionadaId(orden.id)}
                    >
                      <Eye size={12} /> Ver
                    </Button>
                  </td>
                  <td style={{ textAlign: 'center' }}>{orden.cantidadDetalles ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  )
}

OrdenMedicaListaPanel.propTypes = {
  dniPaciente: PropTypes.string.isRequired,
}
