import PropTypes from 'prop-types'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { useResumenCE, useSaveCE, useListarConsultasCE, useIniciarConsultaExterna } from '@/hooks/useConsultaExterna'
import { ESPECIALIDADES } from '@/constants/especialidades'
import { getRequiredRegions } from '@/utils/matrizHallazgosRegion'
import PatientBanner from '@/components/layout/PatientBanner'
import { TabsBar } from '@/components/ui/Tabs'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
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

const estadoBadgeVariant = (estado = '') => {
  const v = estado.toUpperCase()
  if (v.includes('COMPLET')) return 'blue'
  if (v.includes('ABIERT')) return 'green'
  if (v.includes('ANUL')) return 'red'
  return 'gray'
}

function ConsultaExternaSelector({ admision, onSelectAtencion, notify }) {
  const [servicioNuevo, setServicioNuevo] = useState(admision?.servicio || '')
  const [mostrarForm, setMostrarForm] = useState(false)
  const admisionId = admision?.id
  const { data: lista, isLoading } = useListarConsultasCE(admisionId)
  const iniciar = useIniciarConsultaExterna(admisionId)

  const handleNueva = () => {
    if (!servicioNuevo) return
    iniciar.mutate(
      { servicio: servicioNuevo, dniPaciente: admision?.dniPaciente || '' },
      {
        onSuccess: (ce) => {
          notify('Nueva consulta iniciada')
          onSelectAtencion(ce.id)
        },
        onError: (err) => {
          const msg = err instanceof Error && err.response?.data?.message
            ? err.response.data.message
            : 'Error al iniciar la consulta'
          notify(msg, 'error')
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader
        title="Consultas Externas"
        actions={
          <Button variant="primary" size="sm" type="button" onClick={() => setMostrarForm((v) => !v)}>
            + Nueva Consulta
          </Button>
        }
      />
      <CardBody>
        {mostrarForm && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Especialidad *</div>
              <Select
                value={servicioNuevo}
                onChange={(e) => setServicioNuevo(e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="">— Seleccionar —</option>
                {ESPECIALIDADES.map((e) => <option key={e}>{e}</option>)}
              </Select>
            </div>
            <Button
              variant="primary"
              size="sm"
              type="button"
              disabled={!servicioNuevo || iniciar.isPending}
              onClick={handleNueva}
            >
              {iniciar.isPending ? 'Iniciando...' : 'Iniciar'}
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => setMostrarForm(false)}>
              Cancelar
            </Button>
          </div>
        )}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <LoadingSpinner /> Cargando consultas...
          </div>
        )}

        {!isLoading && (!lista || lista.length === 0) && (
          <div className="empty-state">
            <div className="empty-state-title">Sin consultas externas</div>
            <div>Use el botón &ldquo;Nueva Consulta&rdquo; para registrar la primera atención.</div>
          </div>
        )}

        {!isLoading && lista && lista.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Especialidad</th>
                <th>Fecha</th>
                <th style={{ width: 110 }}>Estado</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {lista.map((ce) => (
                <tr key={ce.id}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{ce.servicio || '—'}</td>
                  <td style={{ fontSize: 13 }}>{ce.fechaAtencion ? new Date(ce.fechaAtencion).toLocaleString('es-PE') : '—'}</td>
                  <td>
                    <Badge variant={estadoBadgeVariant(ce.estado)}>{ce.estado || '—'}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button variant="secondary" size="xs" type="button" onClick={() => onSelectAtencion(ce.id)}>
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

ConsultaExternaSelector.propTypes = {
  admision: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dniPaciente: PropTypes.string,
    servicio: PropTypes.string,
  }),
  onSelectAtencion: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
}

function ConsultaExternaWorkspace({ contexto, atencionId, onVolverSelector, notify }) {
  const [tab, setTab] = useState('motivo')
  const {
    data: resumen,
    isLoading: isResumenLoading,
    isError: isResumenError,
    isFetching: isResumenFetching,
  } = useResumenCE(atencionId)
  const saves = useSaveCE(atencionId)
  const atencionEstado = resumen?.atencionEstado || ''
  const isReadOnly = atencionEstado === 'COMPLETADA'
  const requiredRegions = getRequiredRegions(resumen?.revisionSistemas)

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
    { key: 'exFisico', element: <TabExamenFisico {...getProps(4)} initialData={resumen?.examenFisico} requiredRegions={requiredRegions} /> },
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Button variant="ghost" size="sm" type="button" onClick={onVolverSelector}>
          ← Volver al listado
        </Button>
      </div>

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
    dniPaciente: PropTypes.string,
    servicio: PropTypes.string,
  }),
  atencionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onVolverSelector: PropTypes.func.isRequired,
  notify: PropTypes.func,
}

export default function ConsultaExternaPage() {
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
          <div className="page-title">Consulta Externa</div>
        </div>
      </div>

      <FiliacionSearchTray
        notify={showToast}
        selectedContext={admisionSeleccionada}
        onSelect={handleSelectAdmision}
      />

      {!admisionSeleccionada && (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div className="empty-state-title">Seleccione una admisión para habilitar la consulta</div>
              <div>Use la bandeja superior para filtrar por DNI o Nro de Historia Clínica y luego seleccione una fila.</div>
            </div>
          </CardBody>
        </Card>
      )}

      {admisionSeleccionada && !atencionId && (
        <ConsultaExternaSelector
          admision={admisionSeleccionada}
          onSelectAtencion={setAtencionId}
          notify={showToast}
        />
      )}

      {admisionSeleccionada && atencionId && (
        <ConsultaExternaWorkspace
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