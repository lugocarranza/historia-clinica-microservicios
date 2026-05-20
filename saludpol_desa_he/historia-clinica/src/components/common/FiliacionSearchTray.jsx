import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react'
import { useBuscarAdmisiones } from '@/hooks/useAdmision'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDateTime } from '@/utils/date'
import styles from './FiliacionSearchTray.module.css'

const MAX_RESULTS = 20

const estadoVariant = (estado = '') => {
  const value = estado.toUpperCase()
  if (value.includes('ANUL')) return 'red'
  if (value.includes('COMPLET') || value.includes('CERR')) return 'blue'
  if (value.includes('ABIERT') || value.includes('ACTIV')) return 'green'
  if (value.includes('PEND')) return 'orange'
  return 'gray'
}

const tipoVariant = (tipo = '') => {
  const value = tipo.toUpperCase()
  if (value.includes('EMER')) return 'orange'
  if (value.includes('HOSP')) return 'green'
  if (value.includes('CONSULTA')) return 'blue'
  return 'gray'
}

export default function FiliacionSearchTray({
  notify,
  selectedContext,
  onSelect,
  debounceMs = 500,
  resultHint = 'Seleccione una fila para abrir la consulta externa',
}) {
  const [dni, setDni] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  const selectedKey = selectedContext?.atencionId ?? selectedContext?.id ?? null

  useEffect(() => {
    if (!selectedContext) return
    setDni(selectedContext.dniPaciente || '')
  }, [selectedKey, selectedContext])

  const { data, isFetching, isError } = useBuscarAdmisiones({
    dni,
    size: MAX_RESULTS,
    debounceMs,
  })

  const resultados = data?.content || []
  const filtrosActivos = Boolean(dni.trim())

  const handleSelect = (admision) => {
    if (onSelect) onSelect(admision)
    setDni(admision.dniPaciente || '')

    if (notify) {
      let nombreCompleto = admision.apellidosPaciente || ''
      if (admision.nombresPaciente) {
        nombreCompleto += `, ${admision.nombresPaciente}`
      }
      nombreCompleto = nombreCompleto.trim()
      notify(nombreCompleto ? `Cargado: ${nombreCompleto}` : 'Cargado', 'success')
      setIsOpen(false)
    }
  }

  const selectedRowKey = selectedKey ? String(selectedKey) : ''

  const renderResultsContent = () => {
    if (!filtrosActivos) {
      return (
        <div className="empty-state">
          <div className="empty-state-title">Aún no hay criterios de búsqueda</div>
          <div>Ingrese un DNI, un Nro de historia clínica o ambos para listar admisiones.</div>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="empty-state">
          <div className="empty-state-title">No fue posible consultar las admisiones</div>
          <div>Intente nuevamente en unos segundos.</div>
        </div>
      )
    }

    if (resultados.length === 0 && !isFetching) {
      return (
        <div className="empty-state">
          <div className="empty-state-title">No se encontraron coincidencias</div>
          <div>Revise los filtros y vuelva a intentar.</div>
        </div>
      )
    }

    return (
      <div style={{ position: 'relative' }}>
        {isFetching && (
          <div className={styles.loadingOverlay}>
            <LoadingSpinner />
          </div>
        )}
        <div className={styles.tableWrapper}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Nº Historia</th>
                <th style={{ width: 90 }}>DNI</th>
                <th>Paciente</th>
                <th style={{ width: 140 }}>Fecha</th>
                <th style={{ width: 120 }}>Servicio</th>
                <th style={{ width: 90 }}>Estado</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {resultados.map((admision) => {
                const rowKey = String(admision.atencionId ?? admision.id)
                const isSelected = selectedRowKey === rowKey

                return (
                  <tr
                    key={rowKey}
                    className={[styles.clickableRow, isSelected ? styles.selectedRow : ''].join(' ')}
                    onClick={() => handleSelect(admision)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSelect(admision)
                      }
                    }}
                  >
                    <td className={styles.mono}>{admision.nroHc || '—'}</td>
                    <td className={styles.mono}>{admision.dniPaciente || '—'}</td>
                    <td>
                      <div className={styles.patientName}>
                        {admision.apellidosPaciente}, {admision.nombresPaciente}
                      </div>
                    </td>
                    <td>{formatDateTime(admision.fechaAtencion)}</td>
                    <td>{admision.servicio || '—'}</td>
                    <td>
                      <Badge variant={estadoVariant(admision.estado)}>{admision.estado || '—'}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button variant={isSelected ? 'primary' : 'secondary'} size="xs" type="button">
                        <Search size={12} /> {isSelected ? 'Activo' : 'Abrir'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Búsqueda de filiación"
        actions={<>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen((value) => !value)}>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isOpen ? 'Ocultar' : 'Mostrar'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={!filtrosActivos || isFetching}>
            <RefreshCw size={14} className={isFetching ? styles.spin : ''} />
          </Button>
        </>}
      />
      {isOpen && (
        <CardBody>
          <div className={styles.searchForm}>
            <div className={styles.formGrid}>
              <FormField label="DNI">
                <Input
                  value={dni}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const soloDigitos = e.target.value.replaceAll(/\D/g, '').slice(0, 8)
                    setDni(soloDigitos)
                  }}
                  placeholder="Ej: 45123678"
                  maxLength={8}
                />
              </FormField>
            </div>

            <div className={styles.resultsSection}>
              <div className={styles.resultsHeader}>
                <div className={styles.resultsTitle}>Resultados</div>
                <div className={styles.resultsHint}>{resultHint}</div>
              </div>

              {renderResultsContent()}
            </div>
          </div>
        </CardBody>
      )}
    </Card>
  )
}

FiliacionSearchTray.propTypes = {
  notify: PropTypes.func,
  selectedContext: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    atencionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dniPaciente: PropTypes.string
  }),
  onSelect: PropTypes.func,
  debounceMs: PropTypes.number,
  resultHint: PropTypes.string,
}