import PropTypes from 'prop-types'
import { useState } from 'react'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { X, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { useListarAtencionesPorDni } from '@/hooks/useAdmision'
import { useResumenCE } from '@/hooks/useConsultaExterna'
import { useResumenCC } from '@/hooks/useConsultaControl'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDate, formatDateTime } from '@/utils/date'

// Helpers de visualización
const campo = (v, fb = '—') => (v != null && v !== '' ? String(v) : fb)
function sn(v) {
  if (v === 'S') return 'Sí'
  if (v === 'N') return 'No'
  return '—'
}

function ReadField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text)', minHeight: 16 }}>{campo(value)}</div>
    </div>
  )
}

function TextBlock({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 1 }}>{label}</div>
      <div style={{
        fontSize: 12,
        color: 'var(--text)',
        background: 'var(--bg)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius)',
        padding: '4px 8px',
        minHeight: 34,
        whiteSpace: 'pre-wrap',
      }}>
        {campo(value)}
      </div>
    </div>
  )
}

function FieldGrid({ cols = 1, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '6px 10px', marginBottom: 6 }}>
      {children}
    </div>
  )
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 2 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          width: '100%',
          background: open ? 'var(--c-primary-faint)' : 'transparent',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '6px 8px',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--c-primary-mid)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textAlign: 'left',
          marginTop: 8,
          transition: 'background .1s',
        }}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        {title}
      </button>
      {open && <div style={{ padding: '6px 4px 2px' }}>{children}</div>}
    </div>
  )
}

function ProblemasTable({ problemas }) {
  if (!problemas?.length) return null
  return (
    <table className="data-table" style={{ marginBottom: 4 }}>
      <thead>
        <tr>
          <th style={{ width: 36 }}>Nro</th>
          <th>Descripción</th>
          <th style={{ width: 86 }}>Estado</th>
          <th style={{ width: 82 }}>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {problemas.map((lp) => (
          <tr key={lp.nroProblema}>
            <td>{lp.nroProblema}</td>
            <td>{lp.descripcion || '—'}</td>
            <td>{lp.estado || '—'}</td>
            <td>{lp.fechaIdentificacion ? formatDate(lp.fechaIdentificacion) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DiagnosTable({ diagnosticos }) {
  if (!diagnosticos?.length) return null
  return (
    <table className="data-table" style={{ marginBottom: 4 }}>
      <thead>
        <tr>
          <th style={{ width: 66 }}>CIE-10</th>
          <th>Descripción</th>
          <th style={{ width: 80 }}>Tipo</th>
          <th style={{ width: 70 }}>Caso</th>
        </tr>
      </thead>
      <tbody>
        {diagnosticos.map((d, i) => (
          <tr key={i}> {/* NOSONAR */}
            <td>{d.codigoCie10 || '—'}</td>
            <td>{d.descripcion || '—'}</td>
            <td>{d.tipo || '—'}</td>
            <td>{d.caso || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const prioridadBg = (p) => {
  if (p === 'Urgente') return '#fff3e8'
  if (p === 'Emergencia') return '#fdeef0'
  return 'transparent'
}

const prioridadBorder = (p) => {
  if (p === 'Emergencia') return '#f87171'
  if (p === 'Urgente') return '#fb923c'
  return 'var(--border)'
}

function SolicitudesApoyoTable({ solicitudes }) {
  if (!solicitudes?.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 }}>
      {solicitudes.map((s, i) => (
        <div key={i} style={{ /* NOSONAR */
          borderLeft: `3px solid ${prioridadBorder(s.prioridad)}`,
          paddingLeft: 8,
          paddingTop: 3,
          paddingBottom: 3,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>
            {s.tipo && <><span style={{ fontWeight: 600 }}>{s.tipo}</span>{' › '}</>}
            {s.descripcion || '—'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 10px', marginTop: 3 }}>
            {(s.codigoCpms || s.codigoSegus) && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {s.codigoCpms || '—'} / {s.codigoSegus || '—'}
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: prioridadBg(s.prioridad),
              borderRadius: 3,
              padding: '0 4px',
            }}>
              {s.prioridad || 'Normal'}
            </span>
            {s.observaciones && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {s.observaciones}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ResumenControlPanel({ resumen }) {
  const s = resumen?.soapSubjetivo
  const o = resumen?.soapObjetivo
  const a = resumen?.soapAnalisis
  const p = resumen?.soapPlan
  const pc = resumen?.planControl
  const dc = resumen?.decisionControl

  return (
    <>
      <CollapsibleSection title="SOAP Subjetivo" defaultOpen>
        <FieldGrid cols={1}>
          <TextBlock label="Evolución / Motivo de consulta" value={s?.evolucion} />
          <TextBlock label="Persistencia de síntomas" value={s?.persistencia} />
          <TextBlock label="Adherencia al tratamiento" value={s?.adherencia} />
          <TextBlock label="Eventos adversos" value={s?.eventosAdversos} />
        </FieldGrid>
      </CollapsibleSection>

      <CollapsibleSection title="SOAP Objetivo — Signos Vitales">
        <FieldGrid cols={3}>
          <ReadField label="PA Sistólica (mmHg)" value={o?.paSistolica} />
          <ReadField label="PA Diastólica (mmHg)" value={o?.paDiastolica} />
          <ReadField label="FC (lpm)" value={o?.fc} />
          <ReadField label="FR (rpm)" value={o?.fr} />
          <ReadField label="Temperatura (°C)" value={o?.temperatura} />
          <ReadField label="Sat O₂ (%)" value={o?.satO2} />
          <ReadField label="Peso (kg)" value={o?.peso} />
          <ReadField label="Talla (cm)" value={o?.talla} />
          <ReadField label="IMC (kg/m²)" value={o?.imc} />
        </FieldGrid>
        <FieldGrid cols={1}>
          <TextBlock label="Hallazgos físicos" value={o?.hallazgosFisicos} />
          <TextBlock label="Resultados de estudios" value={o?.resultEstudios} />
          {o?.comparacionPrevia && <TextBlock label="Comparación con registro previo" value={o?.comparacionPrevia} />}
        </FieldGrid>
      </CollapsibleSection>

      <CollapsibleSection title="SOAP Análisis">
        <FieldGrid cols={2}>
          <ReadField label="Evolución del estado" value={a?.evolucionEstado} />
        </FieldGrid>
        <FieldGrid cols={1}>
          <TextBlock label="Diagnóstico actualizado" value={a?.diagActualizado} />
          <TextBlock label="Cambios de severidad" value={a?.cambiosSeveridad} />
          <TextBlock label="Evaluación terapéutica" value={a?.evalTerapeutica} />
        </FieldGrid>
      </CollapsibleSection>

      <CollapsibleSection title="SOAP Plan">
        <FieldGrid cols={3}>
          <ReadField label="Mantener tratamiento" value={sn(p?.mantenerTrat)} />
          <ReadField label="Ajustar dosis" value={sn(p?.ajustarDosis)} />
          <ReadField label="Cambiar esquema" value={sn(p?.cambiarEsquema)} />
          <ReadField label="Suspender tratamiento" value={sn(p?.suspenderTrat)} />
          <ReadField label="Nuevos estudios" value={sn(p?.nuevosEstudios)} />
          <ReadField label="Interconsulta" value={sn(p?.interconsulta)} />
          <ReadField label="Alta de problema" value={sn(p?.altaProblema)} />
        </FieldGrid>
        <FieldGrid cols={1}>
          <TextBlock label="Detalles del plan" value={p?.detallesPlan} />
        </FieldGrid>
      </CollapsibleSection>

      {resumen?.listaProblemas?.length > 0 && (
        <CollapsibleSection title="Lista de Problemas">
          <ProblemasTable problemas={resumen.listaProblemas} />
        </CollapsibleSection>
      )}

      {resumen?.diagnosticos?.length > 0 && (
        <CollapsibleSection title="Diagnósticos">
          <DiagnosTable diagnosticos={resumen.diagnosticos} />
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Plan de Control">
        <FieldGrid cols={2}>
          <ReadField label="Próxima cita" value={pc?.proximaCita ? formatDate(pc.proximaCita) : null} />
        </FieldGrid>
        {pc?.medicacion?.length > 0 && (
          <table className="data-table" style={{ marginBottom: 6 }}>
            <thead>
              <tr>
                <th>Fármaco</th>
                <th style={{ width: 56 }}>Dosis</th>
                <th style={{ width: 56 }}>Vía</th>
                <th style={{ width: 80 }}>Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {pc.medicacion.map((m, i) => (
                <tr key={i}> {/* NOSONAR */}
                  <td>{m.farmaco || '—'}</td>
                  <td>{m.dosis || '—'}</td>
                  <td>{m.via || '—'}</td>
                  <td>{m.frecuencia || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <FieldGrid cols={1}>
          <TextBlock label="Indicaciones generales" value={pc?.indicaciones} />
          <TextBlock label="Criterios de alarma" value={pc?.criteriosAlarma} />
        </FieldGrid>
      </CollapsibleSection>

      {resumen?.solicitudesApoyo?.length > 0 && (
        <CollapsibleSection title="Solicitudes de Apoyo Diagnóstico">
          <SolicitudesApoyoTable solicitudes={resumen.solicitudesApoyo} />
        </CollapsibleSection>
      )}

      {dc && (
        <CollapsibleSection title="Decisión de Control" defaultOpen>
          <FieldGrid cols={2}>
            <ReadField label="Decisión" value={dc.decision} />
            {dc.fechaCierre && <ReadField label="Fecha de cierre" value={formatDateTime(dc.fechaCierre)} />}
            {dc.refPnpIpress && <ReadField label="Ref. PNP — IPRESS" value={dc.refPnpIpress} />}
            {dc.refNopnpIpress && <ReadField label="Ref. No PNP — IPRESS" value={dc.refNopnpIpress} />}
          </FieldGrid>
          <FieldGrid cols={3}>
            <ReadField label="Profesional" value={dc.profNombres} />
            <ReadField label="Documento" value={dc.profDocIdent} />
            <ReadField label="Colegiatura" value={dc.profColegiatura} />
          </FieldGrid>
        </CollapsibleSection>
      )}
    </>
  )
}

const FAMILIARES_KEYS = ['padre', 'madre', 'hermanos', 'abuelos', 'otros']
const FAMILIARES_LABELS = ['Padre', 'Madre', 'Hermanos', 'Abuelos', 'Otros']

function ResumenExternaPanel({ resumen }) {
  const m = resumen?.motivo
  const dc = resumen?.decisionClinica

  const antFamPositivos = (resumen?.antFamiliares || []).filter((r) =>
    FAMILIARES_KEYS.some((k) => r[k] === 'S')
  )
  const antFamNoRefiere =
    resumen?.antFamiliares?.length > 0 &&
    resumen.antFamiliares.every((r) => FAMILIARES_KEYS.every((k) => r[k] === 'N') && !r.observaciones)

  let antecedentesFamiliaresContent = null
  if (antFamNoRefiere) {
    antecedentesFamiliaresContent = (
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
        No refiere antecedentes familiares
      </div>
    )
  } else if (antFamPositivos.length > 0) {
    antecedentesFamiliaresContent = (
      <table className="data-table" style={{ marginBottom: 4 }}>
        <thead>
          <tr>
            <th>Enfermedad</th>
            {FAMILIARES_LABELS.map((f) => <th key={f} style={{ width: 50 }}>{f}</th>)}
            <th>Obs.</th>
          </tr>
        </thead>
        <tbody>
          {antFamPositivos.map((row) => (
            <tr key={row.enfermedad}>
              <td style={{ fontWeight: 500 }}>{row.enfermedad}</td>
              {FAMILIARES_KEYS.map((k) => (
                <td key={k} style={{ textAlign: 'center' }}>{row[k] === 'S' ? 'Sí' : '—'}</td>
              ))}
              <td>{row.observaciones || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <>
      {m && (
        <CollapsibleSection title="Motivo de Consulta" defaultOpen>
          <FieldGrid cols={2}>
            <ReadField label="Tiempo de enfermedad" value={m.tiempoEnfermedad} />
            <ReadField label="Forma de inicio" value={m.formaInicio} />
            <ReadField label="Curso" value={m.curso} />
          </FieldGrid>
          <FieldGrid cols={1}>
            <TextBlock label="Motivo" value={m.motivo} />
            <TextBlock label="Enfermedad actual" value={m.enfermedadActual} />
            <TextBlock label="Síntomas y signos" value={m.sintomasSignos} />
            <TextBlock label="Relato cronológico" value={m.relatoCronologico} />
            <TextBlock label="Factores modificadores" value={m.factoresMod} />
            <TextBlock label="Tratamientos previos" value={m.tratamientosPrevios} />
          </FieldGrid>
        </CollapsibleSection>
      )}

      {resumen?.antFamiliares?.length > 0 && (
        <CollapsibleSection title="Antecedentes Familiares">
          {antecedentesFamiliaresContent}
        </CollapsibleSection>
      )}

      {resumen?.listaProblemas?.length > 0 && (
        <CollapsibleSection title="Lista de Problemas">
          <ProblemasTable problemas={resumen.listaProblemas} />
        </CollapsibleSection>
      )}

      {resumen?.diagnosticos?.length > 0 && (
        <CollapsibleSection title="Diagnósticos">
          <DiagnosTable diagnosticos={resumen.diagnosticos} />
        </CollapsibleSection>
      )}

      {resumen?.tratamientos?.length > 0 && (
        <CollapsibleSection title="Tratamiento">
          <table className="data-table" style={{ marginBottom: 6 }}>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th style={{ width: 56 }}>Dosis</th>
                <th style={{ width: 56 }}>Vía</th>
                <th style={{ width: 80 }}>Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {resumen.tratamientos.map((t, i) => (
                <tr key={i}> {/* NOSONAR */}
                  <td>{t.medicamento || '—'}</td>
                  <td>{t.dosis || '—'}</td>
                  <td>{t.via || '—'}</td>
                  <td>{t.frecuencia || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {resumen.indicacionesNoFarm && (
            <FieldGrid cols={1}>
              <TextBlock label="Indicaciones no farmacológicas" value={resumen.indicacionesNoFarm} />
            </FieldGrid>
          )}
        </CollapsibleSection>
      )}

      {resumen?.solicitudesApoyo?.length > 0 && (
        <CollapsibleSection title="Solicitudes de Apoyo Diagnóstico">
          <SolicitudesApoyoTable solicitudes={resumen.solicitudesApoyo} />
        </CollapsibleSection>
      )}

      {dc && (
        <CollapsibleSection title="Decisión Clínica" defaultOpen>
          <FieldGrid cols={2}>
            <ReadField label="Decisión" value={dc.decision || dc.decisionAlta} />
            {dc.especialidadRef && <ReadField label="Especialidad de Referencia" value={dc.especialidadRef} />}
          </FieldGrid>
          <FieldGrid cols={1}>
            {dc.planManejo && <TextBlock label="Plan de Manejo" value={dc.planManejo} />}
            {dc.pronostico && <TextBlock label="Pronóstico" value={dc.pronostico} />}
            {dc.observaciones && <TextBlock label="Observaciones" value={dc.observaciones} />}
          </FieldGrid>
          <FieldGrid cols={2}>
            <ReadField label="Profesional" value={dc.profNombres || dc.medicoNombre} />
            <ReadField label="Colegiatura" value={dc.profColegiatura || dc.medicoCmp} />
          </FieldGrid>
        </CollapsibleSection>
      )}
    </>
  )
}

// ── Badge helpers ──────────────────────────────────────────────────────────────

const tipoBadgeVariant = (tipo = '') => {
  if (tipo === 'CS') return 'green'
  if (tipo === 'CE') return 'blue'
  return 'gray'
}

const estadoBadgeVariant = (estado = '') => {
  const v = estado.toUpperCase()
  if (v.includes('COMPLET')) return 'blue'
  if (v.includes('ABIERT')) return 'green'
  if (v.includes('ANUL')) return 'red'
  return 'gray'
}

function buildCeMap(lista) {
  return new Map((lista || []).filter((a) => a.tipoAtencion === 'CE').map((a) => [a.id, a]))
}

function resolveServicioEnLista(atencion, ceMap) {
  if (atencion.tipoAtencion === 'CE') return atencion.servicio || null
  return ceMap.get(atencion.ceAtencionId)?.servicio || null
}

function DetalleView({ atencion, servicio, onVolver }) {
  const esControl = atencion?.tipoAtencion === 'CS'
  const { data: resumenCC, isLoading: loadCC } = useResumenCC(esControl ? atencion?.id : null)
  const { data: resumenCE, isLoading: loadCE } = useResumenCE(esControl ? null : atencion?.id)
  const resumen = esControl ? resumenCC : resumenCE
  const isLoading = esControl ? loadCC : loadCE

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
        <Button variant="ghost" size="sm" type="button" onClick={onVolver} style={{ gap: 4 }}>
          <ArrowLeft size={13} /> Volver al historial
        </Button>
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          {esControl ? 'Control / Seguimiento' : 'Consulta Externa'}
          {servicio && (
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>— {servicio}</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {formatDateTime(atencion?.fechaAtencion)}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 14px' }}>
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>
            <LoadingSpinner /> Cargando registro...
          </div>
        )}
        {!isLoading && !resumen && (
          <div className="empty-state" style={{ margin: 16 }}>
            <div className="empty-state-title">Sin datos guardados</div>
          </div>
        )}
        {!isLoading && resumen && (
          esControl
            ? <ResumenControlPanel resumen={resumen} />
            : <ResumenExternaPanel resumen={resumen} />
        )}
      </div>
    </div>
  )
}

// HistorialPanel

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 14px',
  borderBottom: '1px solid var(--border-light)',
  flexShrink: 0,
}

export default function HistorialPanel({ dniPaciente, onClose }) {
  const [vistaDetalle, setVistaDetalle] = useState(null)
  const isMobile = useWindowWidth() < 1024

  const panelStyle = {
    width: isMobile ? '100%' : 'clamp(300px, 32vw, 480px)',
    flexShrink: 0,
    background: 'var(--white)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: isMobile ? 'static' : 'sticky',
    top: isMobile ? undefined : 'calc(var(--topbar-height, 58px) + 12px)',
    maxHeight: isMobile ? 'none' : 'calc(100vh - var(--topbar-height, 58px) - 52px)',
    alignSelf: 'flex-start',
  }
  const { data: atenciones, isLoading, isError } = useListarAtencionesPorDni(dniPaciente)

  const ceMap = buildCeMap(atenciones)
  const sorted = [...(atenciones || [])].sort((a, b) =>
    (b.fechaAtencion || '') > (a.fechaAtencion || '') ? 1 : -1
  )

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>Historial del Paciente</span>
        <Button variant="ghost" size="sm" type="button" onClick={onClose}>
          <X size={15} />
        </Button>
      </div>

      {vistaDetalle ? (
        <DetalleView
          atencion={vistaDetalle}
          servicio={resolveServicioEnLista(vistaDetalle, ceMap)}
          onVolver={() => setVistaDetalle(null)}
        />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '20px 14px', color: 'var(--text-muted)', fontSize: 13 }}>
              <LoadingSpinner /> Cargando historial...
            </div>
          )}

          {isError && (
            <div className="empty-state" style={{ margin: 14 }}>
              <div className="empty-state-title">No fue posible cargar el historial</div>
              <div>Intente nuevamente en unos segundos.</div>
            </div>
          )}

          {!isLoading && !isError && sorted.length === 0 && (
            <div className="empty-state" style={{ margin: 14 }}>
              <div className="empty-state-title">Sin registros</div>
              <div>No hay atenciones registradas para este paciente.</div>
            </div>
          )}

          {!isLoading && !isError && sorted.length > 0 && (
            <table className="data-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th style={{ width: 100 }}>Estado</th>
                  <th style={{ width: 48 }} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((atencion) => (
                  <tr key={atencion.id}>
                    <td style={{ fontSize: 12 }}>
                      {formatDateTime(atencion.fechaAtencion)}
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                        <Badge variant={tipoBadgeVariant(atencion.tipoAtencion)} style={{ fontSize: 10 }}>
                          {atencion.tipoAtencion === 'CE' ? 'CE' : 'CC'}
                        </Badge>
                        {' '}{resolveServicioEnLista(atencion, ceMap) || '—'}
                      </div>
                    </td>
                    <td>
                      <Badge variant={estadoBadgeVariant(atencion.estado)}>
                        {atencion.estado || '—'}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="secondary" size="xs" type="button" onClick={() => setVistaDetalle(atencion)}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

ReadField.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.any }
TextBlock.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.any }
FieldGrid.propTypes = { cols: PropTypes.number, children: PropTypes.node }
CollapsibleSection.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node, defaultOpen: PropTypes.bool }
ProblemasTable.propTypes = { problemas: PropTypes.array }
SolicitudesApoyoTable.propTypes = { solicitudes: PropTypes.array }
DiagnosTable.propTypes = { diagnosticos: PropTypes.array }
ResumenControlPanel.propTypes = { resumen: PropTypes.object }
ResumenExternaPanel.propTypes = { resumen: PropTypes.object }
DetalleView.propTypes = { atencion: PropTypes.object, servicio: PropTypes.string, onVolver: PropTypes.func.isRequired }

HistorialPanel.propTypes = {
  dniPaciente: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}
