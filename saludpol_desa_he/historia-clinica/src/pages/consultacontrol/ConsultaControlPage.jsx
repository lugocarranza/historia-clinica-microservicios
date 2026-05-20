import PropTypes from 'prop-types'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { useSaveCC, useResumenCC, useListarConsultasCS, useIniciarConsultaControl } from '@/hooks/useConsultaControl'
import PatientBanner from '@/components/layout/PatientBanner'
import { TabsBar } from '@/components/ui/Tabs'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import FiliacionSearchTray from '@/components/common/FiliacionSearchTray'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDateTime } from '@/utils/date'
import TabSoap from './tabs/TabSoap'
import TabListaProblemasCC from './tabs/TabListaProblemasCC'
import TabDiagnosticoCC from './tabs/TabDiagnosticoCC'
import TabPlanControl from './tabs/TabPlanControl'
import TabDecisionControl from './tabs/TabDecisionControl'
import HistorialPanel from './HistorialPanel'
import RegistroDetalleModal from './RegistroDetalleModal'

const TABS = [
  { key: 'soap', label: '1. Motivo SOAP' },
  { key: 'lista', label: '2. Lista de Problemas' },
  { key: 'diag', label: '3. Diagnóstico' },
  { key: 'plan', label: '4. Plan Global' },
  { key: 'decision', label: '5. Decisión Clínica' },
]

const estadoBadgeVariant = (estado = '') => {
  const v = estado.toUpperCase()
  if (v.includes('COMPLET')) return 'blue'
  if (v.includes('ABIERT')) return 'green'
  if (v.includes('ANUL')) return 'red'
  return 'gray'
}

function ConsultaControlSelector({ admision, onSelectAtencion, notify }) {
  const admisionId = admision.id
  const { data: lista, isLoading } = useListarConsultasCS(admisionId)
  const iniciar = useIniciarConsultaControl(admisionId)

  const handleNueva = () => {
    iniciar.mutate(undefined, {
      onSuccess: (atencionId) => {
        notify('Nueva consulta iniciada')
        onSelectAtencion(atencionId)
      },
      onError: (err) => notify(err instanceof AxiosError ? err.response?.data?.message || 'Error al iniciar la consulta' : 'Error al iniciar la consulta', 'error'),
    })
  }

  return (
    <Card>
      <CardHeader
        title="Consultas de Control / Seguimiento"
        actions={
          <Button variant="primary" size="sm" type="button" onClick={handleNueva} disabled={iniciar.isPending}>
            {iniciar.isPending ? 'Iniciando...' : '+ Nueva Consulta'}
          </Button>
        }
      />
      <CardBody>
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <LoadingSpinner /> Cargando consultas...
          </div>
        )}

        {!isLoading && (!lista || lista.length === 0) && (
          <div className="empty-state">
            <div className="empty-state-title">Sin consultas de control</div>
            <div>Use el botón "Nueva Consulta" para iniciar el primer registro de control para este paciente.</div>
          </div>
        )}

        {!isLoading && lista && lista.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th style={{ width: 110 }}>Estado</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {lista.map((at) => (
                <tr key={at.id}>
                  <td style={{ fontSize: 13 }}>{formatDateTime(at.fechaAtencion)}</td>
                  <td>
                    <Badge variant={estadoBadgeVariant(at.estado)}>{at.estado || '—'}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button variant="secondary" size="xs" type="button" onClick={() => onSelectAtencion(at.id)}>
                      Abrir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  )
}

ConsultaControlSelector.propTypes = {
  admision: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onSelectAtencion: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
}

function ConsultaControlWorkspace({ contexto, atencionId, onVolverSelector, notify }) {
  const [tab, setTab] = useState('soap')
  const [showHistorial, setShowHistorial] = useState(false)
  const [historialAtencion, setHistorialAtencion] = useState(null)

  const saves = useSaveCC(atencionId)
  const { data: resumen } = useResumenCC(atencionId)
  const isReadOnly = resumen?.atencionEstado === 'COMPLETADA'

  const handleSave = (saveMutation, data) => {
    if (isReadOnly) { notify('La atención está cerrada y no puede modificarse', 'error'); return }
    saveMutation.mutate(data, {
      onSuccess: () => notify('Guardado correctamente'),
      onError: (mutationError) => {
        let msg = 'Error al guardar'
        if (mutationError instanceof AxiosError && mutationError.response?.data?.message) {
          msg = mutationError.response.data.message
        }
        notify(msg, 'error')
      },
    })
  }

  const props = { onSave: handleSave, saves, isReadOnly }
  const panels = [
    { key: 'soap', element: <TabSoap {...props} initialData={{ subjetivo: resumen?.soapSubjetivo, objetivo: resumen?.soapObjetivo, analisis: resumen?.soapAnalisis, plan: resumen?.soapPlan }} /> },
    { key: 'lista', element: <TabListaProblemasCC {...props} initialData={resumen?.listaProblemas} /> },
    { key: 'diag', element: <TabDiagnosticoCC {...props} initialData={resumen?.diagnosticos} /> },
    { key: 'plan', element: <TabPlanControl {...props} initialData={resumen?.planControl} /> },
    { key: 'decision', element: <TabDecisionControl {...props} initialData={resumen?.decisionControl} /> },
  ]

  return (
    <div>
      <PatientBanner paciente={contexto} nroHc={contexto?.nroHc} tipoConsulta="Control / Seguimiento" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Button variant="ghost" size="sm" type="button" onClick={onVolverSelector}>
          ← Volver al listado
        </Button>
        <Button variant="secondary" size="sm" type="button" onClick={() => setShowHistorial(true)}>
          Ver Historial
        </Button>
      </div>

      {isReadOnly && (
        <div className="highlight-block blue" style={{ marginBottom: 12 }}>
          <strong>Atención COMPLETADA</strong> — Los formularios se muestran en modo solo lectura.
        </div>
      )}
      <TabsBar tabs={TABS} active={tab} onChange={setTab} />

      <div>
        {panels.map(({ key, element }) => (
          <div key={key} hidden={tab !== key}>
            {element}
          </div>
        ))}
      </div>

      {showHistorial && (
        <HistorialPanel
          historiaClinicaId={contexto.historiaClinicaId}
          onClose={() => setShowHistorial(false)}
          onSelectAtencion={(atencion) => setHistorialAtencion(atencion)}
        />
      )}

      {historialAtencion && (
        <RegistroDetalleModal
          atencion={historialAtencion}
          onClose={() => setHistorialAtencion(null)}
        />
      )}
    </div>
  )
}

ConsultaControlWorkspace.propTypes = {
  contexto: PropTypes.shape({
    nroHc: PropTypes.string,
    historiaClinicaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  atencionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onVolverSelector: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
}

export default function ConsultaControlPage() {
  const { toast, success, error, hideToast } = useToast()
  const [admisionSeleccionada, setAdmisionSeleccionada] = useState(null)
  const [atencionId, setAtencionId] = useState(null)

  const showToast = (msg, type = 'success') => {
    if (type === 'success') success(msg)
    else error(msg)
  }

  const handleSelectAdmision = (admision) => {
    setAdmisionSeleccionada(admision)
    setAtencionId(null)
  }

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Consulta Control / Seguimiento</div>
          <div className="page-subtitle">Historia Clínica Electrónica &mdash; Seguimiento y control</div>
        </div>
      </div>

      <FiliacionSearchTray
        notify={showToast}
        selectedContext={admisionSeleccionada}
        onSelect={handleSelectAdmision}
        resultHint="Seleccione una fila para gestionar las consultas de control"
      />

      {!admisionSeleccionada && (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div className="empty-state-title">Seleccione una admisión para continuar</div>
              <div>Use la bandeja superior para filtrar por DNI o Nro de Historia Clínica.</div>
            </div>
          </CardBody>
        </Card>
      )}

      {admisionSeleccionada && !atencionId && (
        <ConsultaControlSelector
          admision={admisionSeleccionada}
          onSelectAtencion={setAtencionId}
          notify={showToast}
        />
      )}

      {admisionSeleccionada && atencionId && (
        <ConsultaControlWorkspace
          key={atencionId}
          contexto={admisionSeleccionada}
          atencionId={atencionId}
          onVolverSelector={() => setAtencionId(null)}
          notify={showToast}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.error === true ? 'error' : 'success'} onClose={hideToast} />}
    </div>
  )
}
