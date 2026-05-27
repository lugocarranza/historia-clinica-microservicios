import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { AxiosError } from 'axios'
import {
  useListarEmergenciasPorDni,
  useIniciarEmergenciaDirecta,
  useResumenEmerg,
  useSaveEmerg,
} from '@/hooks/useEmergencia'
import { obtenerUltimaAdmisionPorDni } from '@/api/admision'
import { buscarAsegurado } from '@/api/padron'
import PatientBanner from '@/components/layout/PatientBanner'
import { TabsBar } from '@/components/ui/Tabs'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import TabIngreso from './tabs/TabIngreso'
import TabAseguramiento from './tabs/TabAseguramiento'
import TabTriage from './tabs/TabTriage'
import TabAnamnesis from './tabs/TabAnamnesis'
import TabExamenFisico from './tabs/TabExamenFisico'
import TabDiagnostico from './tabs/TabDiagnostico'
import TabDecision from './tabs/TabDecision'
import TabApoyoDiag from './tabs/TabApoyoDiag'
import TabProcedimiento from './tabs/TabProcedimiento'
import TabTratamiento from './tabs/TabTratamiento'
import TabCriterio from './tabs/TabCriterio'
import TabEvolucion from './tabs/TabEvolucion'
import TabCierre from './tabs/TabCierre'
import TabAuditoria from './tabs/TabAuditoria'

const TABS = [
  { key: 'ingreso',       label: 'I-II. Ingreso' },
  { key: 'asegura',       label: 'III. Aseguramiento' },
  { key: 'triage',        label: 'IV. Triage' },
  { key: 'anamnesis',     label: 'V. Anamnesis' },
  { key: 'exFisico',      label: 'VI. Examen Fisico' },
  { key: 'diagnostico',   label: 'VII. Diagnostico' },
  { key: 'decision',      label: 'VIII. Decision' },
  { key: 'apoyo',         label: 'IX. Apoyo Dx' },
  { key: 'procedimiento', label: 'X. Procedimientos' },
  { key: 'tratamiento',   label: 'XI. Tratamiento' },
  { key: 'criterio',      label: 'XII. Criterio' },
  { key: 'evolucion',     label: 'XIII. Evolucion' },
  { key: 'cierre',        label: 'XIV. Cierre' },
  { key: 'auditoria',     label: 'XV. Auditoria' },
]

const estadoBadgeVariant = (estado = '') => {
  const v = estado.toUpperCase()
  if (v.includes('COMPLET')) return 'blue'
  if (v.includes('ABIERT')) return 'green'
  if (v.includes('ANUL')) return 'red'
  return 'gray'
}

// ── DNI search panel ──────────────────────────────────────────────────────────

const normalizeCondicion = (v) => {
  if (!v) return ''
  const u = v.toUpperCase().trim()
  if (u === 'TITULAR') return 'Titular'
  if (u === 'DERECHOHABIENTE') return 'Derechohabiente'
  return v
}

function DniBuscador({ onEncontrado }) {
  const [dni, setDni] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleBuscar = async (e) => {
    e.preventDefault()
    const dniTrimmed = dni.trim()
    if (!/^\d{8}$/.test(dniTrimmed)) {
      setError('Ingrese un DNI válido de 8 dígitos')
      return
    }
    setError(null)
    setBuscando(true)
    try {
      // 1. Buscar en admision/HCE
      const admision = await obtenerUltimaAdmisionPorDni(dniTrimmed).catch(() => null)
      if (admision) {
        onEncontrado({
          dniPaciente: admision.dniPaciente ?? dniTrimmed,
          apellidosPaciente: admision.apellidosPaciente ?? '',
          nombresPaciente: admision.nombresPaciente ?? '',
          fechaNac: admision.fechaNac ?? '',
          sexo: admision.sexo ?? '',
          condicionSeguro: normalizeCondicion(admision.condicion),
          admisionId: admision.id ?? null,
          historiaClinicaId: admision.historiaClinicaId ?? null,
          nroHc: admision.nroHc ?? '',
          filiacionOrigen: 'HCE',
        })
        return
      }

      // 2. Buscar en padrón
      const padron = await buscarAsegurado(dniTrimmed).catch(() => null)
      if (padron) {
        onEncontrado({
          dniPaciente: padron.dniPaciente ?? dniTrimmed,
          apellidosPaciente: padron.apellidosPaciente ?? '',
          nombresPaciente: padron.nombresPaciente ?? '',
          fechaNac: padron.fechaNac ?? '',
          sexo: padron.sexo ?? '',
          condicionSeguro: normalizeCondicion(padron.condicion),
          admisionId: null,
          historiaClinicaId: null,
          nroHc: '',
          filiacionOrigen: 'PADRON',
        })
        return
      }

      // 3. Entrada manual
      onEncontrado({
        dniPaciente: dniTrimmed,
        apellidosPaciente: '',
        nombresPaciente: '',
        fechaNac: '',
        sexo: '',
        condicionSeguro: '',
        admisionId: null,
        historiaClinicaId: null,
        nroHc: '',
        filiacionOrigen: 'MANUAL',
      })
    } finally {
      setBuscando(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Buscar paciente por DNI" />
      <CardBody>
        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: 420 }}>
          <div style={{ flex: 1 }}>
            <Input
              ref={inputRef}
              placeholder="DNI (8 dígitos)"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
              maxLength={8}
              disabled={buscando}
            />
            {error && <div className="field-error" style={{ marginTop: 4 }}>{error}</div>}
          </div>
          <Button variant="primary" type="submit" disabled={buscando || dni.length !== 8}>
            {buscando ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
        <div className="help-text" style={{ marginTop: 10 }}>
          Si el paciente tiene admisión en el sistema los datos se cargarán automáticamente.
          Si solo está en el padrón se pre-llenarán para confirmación.
          De lo contrario se habilitará ingreso manual.
        </div>
      </CardBody>
    </Card>
  )
}

DniBuscador.propTypes = {
  onEncontrado: PropTypes.func.isRequired,
}

// ── Selector de atenciones ────────────────────────────────────────────────────

function EmergenciaSelector({ filiacion, lista, onSelectAtencion, notify }) {
  const iniciar = useIniciarEmergenciaDirecta(filiacion.dniPaciente)

  const handleNueva = () => {
    iniciar.mutate(
      {
        dniPaciente: filiacion.dniPaciente,
        admisionId: filiacion.admisionId ?? null,
        historiaClinicaId: filiacion.historiaClinicaId ?? null,
      },
      {
        onSuccess: (data) => {
          notify('Nueva atencion de emergencia iniciada')
          onSelectAtencion(data.id)
        },
        onError: () => notify('Error al iniciar la atencion', 'error'),
      }
    )
  }

  const origenLabel = { HCE: 'HCE', PADRON: 'Padrón', MANUAL: 'Manual' }
  const origenVariant = { HCE: 'blue', PADRON: 'green', MANUAL: 'gray' }

  return (
    <Card>
      <CardHeader
        title="Atenciones de Emergencia"
        actions={
          <Button variant="primary" size="sm" type="button" onClick={handleNueva} disabled={iniciar.isPending}>
            {iniciar.isPending ? 'Iniciando...' : '+ Nueva Atencion de Emergencia'}
          </Button>
        }
      />
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>{filiacion.apellidosPaciente} {filiacion.nombresPaciente}</span>
          <span className="help-text">DNI: {filiacion.dniPaciente}</span>
          <Badge variant={origenVariant[filiacion.filiacionOrigen] ?? 'gray'}>
            {origenLabel[filiacion.filiacionOrigen] ?? filiacion.filiacionOrigen}
          </Badge>
        </div>
        {(!lista || lista.length === 0) && (
          <div className="empty-state">
            <div className="empty-state-title">Sin atenciones registradas</div>
            <div>Use el botón &quot;Nueva Atencion&quot; para iniciar el primer registro de emergencia.</div>
          </div>
        )}
        {lista && lista.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th style={{ width: 120 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((at) => (
                <tr key={at.id} style={{ cursor: 'pointer' }} onClick={() => onSelectAtencion(at.id)}>
                  <td style={{ fontSize: 13 }}>{at.fechaAtencion || '—'}</td>
                  <td><Badge variant={estadoBadgeVariant(at.estado)}>{at.estado || '—'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  )
}

EmergenciaSelector.propTypes = {
  filiacion: PropTypes.shape({
    dniPaciente: PropTypes.string.isRequired,
    apellidosPaciente: PropTypes.string,
    nombresPaciente: PropTypes.string,
    admisionId: PropTypes.number,
    historiaClinicaId: PropTypes.number,
    filiacionOrigen: PropTypes.string,
  }).isRequired,
  lista: PropTypes.array,
  onSelectAtencion: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
}

// ── Workspace de tabs ─────────────────────────────────────────────────────────

function EmergenciaWorkspace({ filiacion, atencionId, onVolver, notify }) {
  const [tab, setTab] = useState('ingreso')
  const {
    data: resumen,
    isLoading: isResumenLoading,
    isError: isResumenError,
    isFetching: isResumenFetching,
  } = useResumenEmerg(atencionId)
  const saves = useSaveEmerg(atencionId)
  const atencionEstado = resumen?.atencionEstado || ''
  const isReadOnly = atencionEstado === 'COMPLETADA'

  // DNI desde la filiacion inicial o desde lo ya guardado en ingreso
  const dniPaciente = resumen?.ingreso?.dniPaciente || filiacion?.dniPaciente

  const handleSave = (tabIndex) => (saveMutation, data) => {
    if (isReadOnly) {
      notify('La atencion esta completada y es de solo lectura', 'error')
      return
    }
    saveMutation.mutate(data, {
      onSuccess: () => {
        notify('Guardado correctamente')
        const nextTab = TABS[tabIndex + 1]
        if (nextTab && !isReadOnly && tab === TABS[tabIndex].key) {
          setTab(nextTab.key)
        }
      },
      onError: (mutationError) => {
        let msg = 'Error al guardar'
        if (mutationError instanceof AxiosError && mutationError.response?.data?.message) {
          msg = mutationError.response.data.message

          if (Array.isArray(mutationError.response.data.subErrors)) {
            msg += `, ${mutationError.response.data.subErrors[0].message}`
          }
        }
        notify(msg, 'error')
      },
    })
  }

  const isTabSaved = (index) => {
    if (isReadOnly) return true
    if (!resumen) return false
    switch (index) {
      case 0:  return !!resumen.ingreso?.id
      case 1:  return !!resumen.aseguramiento?.id
      case 2:  return !!resumen.triage?.id
      case 3:  return !!resumen.anamnesis?.id
      case 4:  return !!resumen.examenFisico?.id
      case 5:  return Array.isArray(resumen.diagnosticos) && resumen.diagnosticos.length > 0
      case 6:  return !!resumen.decision?.id
      case 7:  return true
      case 8:  return !!resumen.procedimiento?.id
      case 9:  return Array.isArray(resumen.tratamiento) && resumen.tratamiento.length > 0
      case 10: return !!resumen.criterio?.id
      case 11: return Array.isArray(resumen.evolucion) && resumen.evolucion.length > 0
      case 12: return !!resumen.destino
      case 13: return !!resumen.auditoria?.id
      default: return false
    }
  }

  const enhancedTabs = TABS.map((t, i) => {
    let disabled = false
    if (!isReadOnly && i > 0) {
      for (let j = 0; j < i; j++) {
        if (!isTabSaved(j)) { disabled = true; break }
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
            <div className="empty-state-title">Cargando atencion de emergencia...</div>
          </div>
        </CardBody>
      </Card>
    )
  }

  const panels = [
    { key: 'ingreso',       element: <TabIngreso {...getProps(0)} initialData={resumen?.ingreso} filiacion={filiacion} /> },
    { key: 'asegura',       element: <TabAseguramiento {...getProps(1)} initialData={resumen?.aseguramiento} dniPaciente={dniPaciente} /> },
    { key: 'triage',        element: <TabTriage {...getProps(2)} initialData={resumen?.triage} /> },
    { key: 'anamnesis',     element: <TabAnamnesis {...getProps(3)} initialData={resumen?.anamnesis} /> },
    { key: 'exFisico',      element: <TabExamenFisico {...getProps(4)} initialData={resumen?.examenFisico} /> },
    { key: 'diagnostico',   element: <TabDiagnostico {...getProps(5)} initialData={resumen?.diagnosticos} condicion={resumen?.condicion} /> },
    { key: 'decision',      element: <TabDecision {...getProps(6)} initialData={resumen?.decision} /> },
    { key: 'apoyo',         element: <TabApoyoDiag {...getProps(7)} initialData={resumen?.apoyoDiag} /> },
    { key: 'procedimiento', element: <TabProcedimiento {...getProps(8)} initialData={resumen?.procedimiento} /> },
    { key: 'tratamiento',   element: <TabTratamiento {...getProps(9)} initialData={resumen?.tratamiento} /> },
    { key: 'criterio',      element: <TabCriterio {...getProps(10)} initialData={resumen?.criterio} /> },
    { key: 'evolucion',     element: <TabEvolucion {...getProps(11)} initialData={resumen?.evolucion} /> },
    { key: 'cierre',        element: <TabCierre {...getProps(12)} condicion={resumen?.condicion} destino={resumen?.destino} /> },
    { key: 'auditoria',     element: <TabAuditoria {...getProps(13)} initialData={resumen?.auditoria} /> },
  ]

  // contexto para PatientBanner: mezclar filiacion con lo guardado en ingreso
  const pacienteBanner = {
    dniPaciente: filiacion?.dniPaciente,
    nroHc: filiacion?.nroHc || '',
    apellidosPaciente: resumen?.ingreso?.apellidosPaciente || filiacion?.apellidosPaciente || '',
    nombresPaciente: resumen?.ingreso?.nombresPaciente || filiacion?.nombresPaciente || '',
  }

  return (
    <div>
      <PatientBanner paciente={pacienteBanner} nroHc={pacienteBanner.nroHc} tipoConsulta="Emergencia" />

      {isResumenError && (
        <div className="highlight-block" style={{ marginBottom: 10, borderLeft: '4px solid var(--c-warning, #f59e0b)' }}>
          <div className="help-text">
            No se pudo cargar el resumen de la atencion. El formulario esta disponible para ingreso de datos.
          </div>
        </div>
      )}

      <div
        className="highlight-block"
        style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
      >
        <div>
          <div style={{ fontWeight: 700, color: 'var(--c-primary)' }}>Estado de la atencion</div>
          <div className="help-text" style={{ marginTop: 2 }}>
            {isReadOnly
              ? 'La atencion esta completada. Los formularios se muestran en modo solo lectura.'
              : 'La atencion esta abierta. Puede editar y guardar los formularios.'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onVolver && (
            <Button variant="secondary" size="sm" type="button" onClick={onVolver}>
              ← Volver al listado
            </Button>
          )}
          {isResumenFetching && <LoadingSpinner />}
          <Badge variant={isReadOnly ? 'blue' : 'green'}>{atencionEstado || 'ABIERTA'}</Badge>
        </div>
      </div>

      <TabsBar tabs={enhancedTabs} active={tab} onChange={setTab} />

      <div>
        {panels.map(({ key, element }) => (
          <div key={key} hidden={tab !== key}>{element}</div>
        ))}
      </div>
    </div>
  )
}

EmergenciaWorkspace.propTypes = {
  filiacion: PropTypes.shape({
    dniPaciente: PropTypes.string.isRequired,
    apellidosPaciente: PropTypes.string,
    nombresPaciente: PropTypes.string,
    filiacionOrigen: PropTypes.string,
    nroHc: PropTypes.string,
  }).isRequired,
  atencionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onVolver: PropTypes.func,
  notify: PropTypes.func,
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function EmergenciaPage() {
  const { toast, success, error, hideToast } = useToast()
  const [filiacion, setFiliacion] = useState(null)   // datos del paciente encontrado
  const [atencionId, setAtencionId] = useState(null)

  const dni = filiacion?.dniPaciente
  const { data: listaAtenciones, isLoading: isListaLoading } = useListarEmergenciasPorDni(dni)

  useEffect(() => {
    if (!listaAtenciones) return
    const abierta = listaAtenciones.find((a) => a.estado === 'ABIERTA')
    if (abierta) setAtencionId(abierta.id)
  }, [listaAtenciones])

  const handleEncontrado = (datos) => {
    setAtencionId(null)
    setFiliacion(datos)
  }

  const showToast = (msg, type = 'success') => {
    if (type === 'success') success(msg)
    else error(msg)
  }

  const renderBody = () => {
    if (!filiacion) {
      return <DniBuscador onEncontrado={handleEncontrado} />
    }

    if (isListaLoading) {
      return (
        <Card>
          <CardBody>
            <div className="empty-state">
              <LoadingSpinner />
              <div className="empty-state-title">Cargando atenciones...</div>
            </div>
          </CardBody>
        </Card>
      )
    }

    if (atencionId) {
      return (
        <EmergenciaWorkspace
          key={atencionId}
          filiacion={filiacion}
          atencionId={atencionId}
          onVolver={() => setAtencionId(null)}
          notify={showToast}
        />
      )
    }

    return (
      <EmergenciaSelector
        filiacion={filiacion}
        lista={listaAtenciones}
        onSelectAtencion={setAtencionId}
        notify={showToast}
      />
    )
  }

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Emergencia</div>
        </div>
        {filiacion && (
          <Button variant="secondary" size="sm" type="button" onClick={() => { setFiliacion(null); setAtencionId(null) }}>
            ← Cambiar paciente
          </Button>
        )}
      </div>

      {renderBody()}

      {toast && <Toast message={toast.msg} type={toast.error === true ? 'error' : 'success'} onClose={hideToast} />}
    </div>
  )
}
