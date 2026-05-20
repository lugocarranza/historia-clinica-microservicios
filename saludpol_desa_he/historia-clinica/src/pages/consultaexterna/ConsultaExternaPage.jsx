import PropTypes from 'prop-types'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { useResumenCE, useSaveCE } from '@/hooks/useConsultaExterna'
import PatientBanner from '@/components/layout/PatientBanner'
import { TabsBar } from '@/components/ui/Tabs'
import { Card, CardBody } from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import FiliacionSearchTray from '@/components/common/FiliacionSearchTray'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import TabMotivo from './tabs/TabMotivo'
import TabAntPersonal from './tabs/TabAntPersonal'
import TabAntFamiliares from './tabs/TabAntFamiliares'
import TabRevisionSistemas from './tabs/TabRevisionSistemas'
import TabExamenFisico from './tabs/TabExamenFisico'
import TabListaProblemas from './tabs/TabListaProblemas'
import TabDiagnostico from './tabs/TabDiagnostico'
import TabTratamiento from './tabs/TabTratamiento'
import TabSolicitudesApoyo from './tabs/TabSolicitudesApoyo'
import TabDecisionClinica from './tabs/TabDecisionClinica'

const TABS = [
  { key: 'motivo', label: '1. Motivo de Consulta' },
  { key: 'antPersonal', label: '2. Antecedentes Personales' },
  { key: 'antFamiliar', label: '3. Antecedentes Familiares' },
  { key: 'revSistemas', label: '4. Revisión por Sistemas' },
  { key: 'exFisico', label: '5. Examen Físico' },
  { key: 'listaProb', label: '6. Lista de Problemas' },
  { key: 'diagnostico', label: '7. Diagnóstico' },
  { key: 'tratamiento', label: '8. Tratamiento' },
  { key: 'apoyo', label: '9. Solicitudes Apoyo Dx' },
  { key: 'decision', label: '10. Decisión Clínica' },
]

function ConsultaExternaWorkspace({ contexto, notify }) {
  const [tab, setTab] = useState('motivo')
  const admisionId = contexto?.id
  const {
    data: resumen,
    isLoading: isResumenLoading,
    isError: isResumenError,
    isFetching: isResumenFetching,
  } = useResumenCE(admisionId)
  const saves = useSaveCE(admisionId)
  const atencionEstado = resumen?.atencionEstado || ''
  const isReadOnly = atencionEstado === 'COMPLETADA'

  const showToast = (msg, type = 'success') => {
    if (notify) notify(msg, type)
  }

  const handleSave = (tabIndex) => (saveMutation, data) => {
    if (isReadOnly) {
      showToast('La atención está completada y es de solo lectura', 'error')
      return
    }

    saveMutation.mutate(data, {
      onSuccess: () => {
        showToast('Guardado correctamente')
        const nextTab = TABS[tabIndex + 1]
        if (nextTab && !isReadOnly && tab === TABS[tabIndex].key) {
          setTab(nextTab.key)
        }
      },
      onError: (mutationError) => {
        let msg = 'Error al guardar'
        if (mutationError instanceof AxiosError && mutationError.response?.data?.message) {
          msg = mutationError.response.data.message
        }
        showToast(msg, 'error')
      },
    })
  }

  const isTabSaved = (index) => {
    if (isReadOnly) return true
    if (!resumen) return false
    switch (index) {
      case 0: return !!resumen.motivo?.id
      case 1: return !!resumen.antPersonal
      case 2: return Array.isArray(resumen.antFamiliares) && resumen.antFamiliares.length > 0
      case 3: return Array.isArray(resumen.revisionSistemas) && resumen.revisionSistemas.length > 0
      case 4: return !!resumen.examenFisico?.id
      case 5: return Array.isArray(resumen.listaProblemas) && resumen.listaProblemas.length > 0
      case 6: return Array.isArray(resumen.diagnosticos) && resumen.diagnosticos.length > 0
      case 7: return (Array.isArray(resumen.tratamientos) && resumen.tratamientos.length > 0) || !!resumen.indicacionesNoFarm
      case 8: return true // Apoyo es opcional
      case 9: return !!resumen.decisionClinica
      default: return false
    }
  }

  const enhancedTabs = TABS.map((t, i) => {
    let disabled = false
    if (!isReadOnly && i > 0) {
      for (let j = 0; j < i; j++) {
        if (!isTabSaved(j)) {
          disabled = true
          break
        }
      }
    }
    return { ...t, disabled }
  })

  const getProps = (index) => ({ onSave: handleSave(index), saves, isReadOnly })

  if (isResumenLoading) {
    return (
      <Card>
        <CardBody>
          <div className="empty-state">
            <LoadingSpinner />
            <div className="empty-state-title">Cargando consulta externa...</div>
            <div>Estamos recuperando la información de los tabs.</div>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (isResumenError) {
    return (
      <Card>
        <CardBody>
          <div className="empty-state">
            <div className="empty-state-title">No se pudo cargar la consulta externa</div>
            <div>Intente seleccionar nuevamente la admisión.</div>
          </div>
        </CardBody>
      </Card>
    )
  }

  const panels = [
    { key: 'motivo', element: <TabMotivo {...getProps(0)} initialData={resumen?.motivo} /> },
    { key: 'antPersonal', element: <TabAntPersonal {...getProps(1)} initialData={resumen?.antPersonal} /> },
    { key: 'antFamiliar', element: <TabAntFamiliares {...getProps(2)} initialData={resumen?.antFamiliares} /> },
    { key: 'revSistemas', element: <TabRevisionSistemas {...getProps(3)} initialData={resumen?.revisionSistemas} /> },
    { key: 'exFisico', element: <TabExamenFisico {...getProps(4)} initialData={resumen?.examenFisico} /> },
    { key: 'listaProb', element: <TabListaProblemas {...getProps(5)} initialData={resumen?.listaProblemas} /> },
    { key: 'diagnostico', element: <TabDiagnostico {...getProps(6)} initialData={resumen?.diagnosticos} /> },
    {
      key: 'tratamiento',
      element: (
        <TabTratamiento
          {...getProps(7)}
          initialData={{
            tratamientos: resumen?.tratamientos,
            indicacionesNoFarm: resumen?.indicacionesNoFarm,
          }}
        />
      ),
    },
    { key: 'apoyo', element: <TabSolicitudesApoyo {...getProps(8)} initialData={resumen?.solicitudesApoyo} /> },
    { key: 'decision', element: <TabDecisionClinica {...getProps(9)} initialData={resumen?.decisionClinica} /> },
  ]

  return (
    <div>
      <PatientBanner paciente={contexto} nroHc={contexto?.nroHc} tipoConsulta="Consulta Externa" />

      <div
        className="highlight-block"
        style={{
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: 'var(--c-primary)' }}>Estado de la atención</div>
          <div className="help-text" style={{ marginTop: 2 }}>
            {isReadOnly
              ? 'La atención está completada. Los formularios se muestran en modo solo lectura.'
              : 'La atención está abierta. Puede editar y guardar los formularios.'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isResumenFetching && <LoadingSpinner />}
          <Badge variant={isReadOnly ? 'blue' : 'green'}>{atencionEstado || 'ABIERTA'}</Badge>
        </div>
      </div>

      <TabsBar tabs={enhancedTabs} active={tab} onChange={setTab} />

      <div>
        {panels.map(({ key, element }) => (
          <div key={key} hidden={tab !== key}>
            {element}
          </div>
        ))}
      </div>
    </div>
  )
}

ConsultaExternaWorkspace.propTypes = {
  contexto: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nroHc: PropTypes.string,
  }),
  notify: PropTypes.func,
}

export default function ConsultaExternaPage() {
  const { toast, success, error, hideToast } = useToast()
  const [contextoSeleccionado, setContextoSeleccionado] = useState(null)

  const showToast = (msg, type = 'success') => {
    if (type === 'success') success(msg)
    else error(msg)
  }

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Consulta Externa</div>
          <div className="page-subtitle">Historia Clínica Electrónica &mdash; Atención ambulatoria</div>
        </div>
        {/* <div className="page-actions">
          <Button variant="secondary" size="sm">Imprimir</Button>
          <Button variant="secondary" size="sm">Exportar PDF</Button>
        </div> */}
      </div>

      <FiliacionSearchTray
        notify={showToast}
        selectedContext={contextoSeleccionado}
        onSelect={setContextoSeleccionado}
      />

      {contextoSeleccionado ? (
        <ConsultaExternaWorkspace
          key={contextoSeleccionado.id}
          contexto={contextoSeleccionado}
          notify={showToast}
        />
      ) : (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div className="empty-state-title">Seleccione una admisión para habilitar la consulta</div>
              <div>Use la bandeja superior para filtrar por DNI o Nro de Historia Clínica y luego seleccione una fila.</div>
            </div>
          </CardBody>
        </Card>
      )}

      {toast && <Toast message={toast.msg} type={toast.error === true ? 'error' : 'success'} onClose={hideToast} />}
    </div>
  )
}