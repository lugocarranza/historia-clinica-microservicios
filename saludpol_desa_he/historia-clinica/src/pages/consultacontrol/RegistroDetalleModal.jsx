import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { useResumenCC } from '@/hooks/useConsultaControl'
import { useResumenCE } from '@/hooks/useConsultaExterna'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDate, formatDateTime } from '@/utils/date'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const campo = (valor, fallback = '—') =>
  valor != null && valor !== '' ? String(valor) : fallback

const sn = (valor) => {
  if (valor === 'S') return 'Sí'
  if (valor === 'N') return 'No'
  return '—'
}

const estadoVariant = (estado = '') => {
  const v = estado.toUpperCase()
  if (v.includes('COMPLET')) return 'blue'
  if (v.includes('ABIERT')) return 'green'
  if (v.includes('ANUL')) return 'red'
  return 'gray'
}

// ─── Primitivos read-only ─────────────────────────────────────────────────────

function ReadField({ label, value, wide }) {
  return (
    <div style={wide ? { gridColumn: '1/-1' } : {}}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text)', minHeight: 20 }}>{campo(value)}</div>
    </div>
  )
}

function ReadTextarea({ label, value }) {
  return (
    <div style={{ gridColumn: '1/-1' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{
        fontSize: 13,
        color: 'var(--text)',
        background: 'var(--bg)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius)',
        padding: '6px 10px',
        minHeight: 48,
        whiteSpace: 'pre-wrap',
      }}>
        {campo(value)}
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--c-primary-mid)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      borderBottom: '1px solid var(--border-light)',
      paddingBottom: 4,
      marginBottom: 10,
      marginTop: 16,
    }}>
      {children}
    </div>
  )
}

function Grid({ cols = 3, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px 16px', marginBottom: 8 }}>
      {children}
    </div>
  )
}

// Componentes Compartidos

function ListaProblemasTable({ problemas }) {
  if (!problemas?.length) return null
  return (
    <>
      <SectionTitle>Lista de Problemas</SectionTitle>
      <table className="data-table" style={{ marginBottom: 8 }}>
        <thead>
          <tr>
            <th style={{ width: 40 }}>Nro</th>
            <th>Descripción</th>
            <th style={{ width: 100 }}>Estado</th>
            <th style={{ width: 110 }}>Fecha Identificación</th>
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
    </>
  )
}

function DiagnosticosTable({ diagnosticos }) {
  if (!diagnosticos?.length) return null
  return (
    <>
      <SectionTitle>Diagnósticos</SectionTitle>
      <table className="data-table" style={{ marginBottom: 8 }}>
        <thead>
          <tr>
            <th style={{ width: 80 }}>CIE-10</th>
            <th>Descripción</th>
            <th style={{ width: 100 }}>Tipo</th>
            <th style={{ width: 90 }}>Caso</th>
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
    </>
  )
}

// ─── Resumen Control ──────────────────────────────────────────────────────────

function ResumenControl({ resumen }) {
  const s = resumen?.soapSubjetivo
  const o = resumen?.soapObjetivo
  const a = resumen?.soapAnalisis
  const p = resumen?.soapPlan
  const pc = resumen?.planControl
  const dc = resumen?.decisionControl

  return (
    <>
      {/* SOAP Subjetivo */}
      <SectionTitle>SOAP Subjetivo</SectionTitle>
      <Grid cols={2}>
        <ReadTextarea label="Evolución / Motivo de consulta" value={s?.evolucion} />
        <ReadTextarea label="Persistencia de síntomas" value={s?.persistencia} />
        <ReadTextarea label="Adherencia al tratamiento" value={s?.adherencia} />
        <ReadTextarea label="Eventos adversos" value={s?.eventosAdversos} />
      </Grid>

      {/* SOAP Objetivo */}
      <SectionTitle>SOAP Objetivo — Signos Vitales</SectionTitle>
      <Grid cols={4}>
        <ReadField label="PA Sistólica (mmHg)" value={o?.paSistolica} />
        <ReadField label="PA Diastólica (mmHg)" value={o?.paDiastolica} />
        <ReadField label="FC (lpm)" value={o?.fc} />
        <ReadField label="FR (rpm)" value={o?.fr} />
        <ReadField label="Temperatura (°C)" value={o?.temperatura} />
        <ReadField label="Sat O₂ (%)" value={o?.satO2} />
        <ReadField label="Peso (kg)" value={o?.peso} />
        <ReadField label="Talla (cm)" value={o?.talla} />
        <ReadField label="IMC (kg/m²)" value={o?.imc} />
      </Grid>
      <Grid cols={2}>
        <ReadTextarea label="Hallazgos físicos" value={o?.hallazgosFisicos} />
        <ReadTextarea label="Resultados de estudios" value={o?.resultEstudios} />
        {o?.comparacionPrevia && (
          <ReadTextarea label="Comparación con registro previo" value={o?.comparacionPrevia} />
        )}
      </Grid>

      {/* SOAP Análisis */}
      <SectionTitle>SOAP Análisis</SectionTitle>
      <Grid cols={2}>
        <ReadField label="Evolución del estado" value={a?.evolucionEstado} />
        <ReadTextarea label="Diagnóstico actualizado" value={a?.diagActualizado} />
        <ReadTextarea label="Cambios de severidad" value={a?.cambiosSeveridad} />
        <ReadTextarea label="Evaluación terapéutica" value={a?.evalTerapeutica} />
      </Grid>

      {/* SOAP Plan */}
      <SectionTitle>SOAP Plan</SectionTitle>
      <Grid cols={4}>
        <ReadField label="Mantener tratamiento" value={sn(p?.mantenerTrat)} />
        <ReadField label="Ajustar dosis" value={sn(p?.ajustarDosis)} />
        <ReadField label="Cambiar esquema" value={sn(p?.cambiarEsquema)} />
        <ReadField label="Suspender tratamiento" value={sn(p?.suspenderTrat)} />
        <ReadField label="Nuevos estudios" value={sn(p?.nuevosEstudios)} />
        <ReadField label="Interconsulta" value={sn(p?.interconsulta)} />
        <ReadField label="Alta de problema" value={sn(p?.altaProblema)} />
      </Grid>
      <Grid cols={1}>
        <ReadTextarea label="Detalles del plan" value={p?.detallesPlan} />
      </Grid>

      {/* Lista Problemas */}
      <ListaProblemasTable problemas={resumen?.listaProblemas} />

      {/* Diagnósticos */}
      <DiagnosticosTable diagnosticos={resumen?.diagnosticos} />

      {/* Plan de Control */}
      <SectionTitle>Plan de Control</SectionTitle>
      <Grid cols={3}>
        <ReadField label="Próxima cita" value={pc?.proximaCita ? formatDate(pc.proximaCita) : null} />
      </Grid>
      {pc?.medicacion?.length > 0 && (
        <table className="data-table" style={{ marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ width: 90 }}>Código</th>
              <th>Fármaco</th>
              <th style={{ width: 70 }}>Dosis</th>
              <th style={{ width: 70 }}>Vía</th>
              <th style={{ width: 90 }}>Frecuencia</th>
              <th style={{ width: 90 }}>Duración</th>
              <th style={{ width: 90 }}>Conducta</th>
            </tr>
          </thead>
          <tbody>
            {pc.medicacion.map((m, i) => (
              <tr key={i}> {/* NOSONAR */}
                <td>{m.codigo || '—'}</td>
                <td>{m.farmaco || '—'}</td>
                <td>{m.dosis || '—'}</td>
                <td>{m.via || '—'}</td>
                <td>{m.frecuencia || '—'}</td>
                <td>{m.duracion || '—'}</td>
                <td>{m.conducta || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Grid cols={2}>
        <ReadTextarea label="Indicaciones generales" value={pc?.indicaciones} />
        <ReadTextarea label="Criterios de alarma" value={pc?.criteriosAlarma} />
      </Grid>

      {/* Decisión de Control */}
      {dc && (
        <>
          <SectionTitle>Decisión de Control</SectionTitle>
          <Grid cols={2}>
            <ReadField label="Decisión" value={dc.decision} />
            <ReadField label="Fecha de cierre" value={dc.fechaCierre ? formatDateTime(dc.fechaCierre) : null} />
            {dc.refPnpIpress && <ReadField label="Referencia PNP — IPRESS" value={dc.refPnpIpress} />}
            {dc.refPnpMotivo && <ReadTextarea label="Motivo referencia PNP" value={dc.refPnpMotivo} />}
            {dc.refNopnpIpress && <ReadField label="Referencia No PNP — IPRESS" value={dc.refNopnpIpress} />}
            {dc.refNopnpMotivo && <ReadTextarea label="Motivo referencia No PNP" value={dc.refNopnpMotivo} />}
          </Grid>
          <Grid cols={3}>
            <ReadField label="Profesional" value={dc.profNombres} />
            <ReadField label="Doc. identidad" value={dc.profDocIdent} />
            <ReadField label="Colegiatura" value={dc.profColegiatura} />
          </Grid>
        </>
      )}
    </>
  )
}

// ─── Resumen Externa ──────────────────────────────────────────────────────────

function ResumenExterna({ resumen }) {
  const m = resumen?.motivo

  return (
    <>
      {/* Motivo de Consulta */}
      {m && (
        <>
          <SectionTitle>Motivo de Consulta</SectionTitle>
          <Grid cols={2}>
            <ReadTextarea label="Motivo" value={m.motivo} />
            <ReadField label="Tiempo de enfermedad" value={m.tiempoEnfermedad} />
            <ReadField label="Forma de inicio" value={m.formaInicio} />
            <ReadField label="Curso" value={m.curso} />
            <ReadTextarea label="Enfermedad actual" value={m.enfermedadActual} />
            <ReadTextarea label="Síntomas y signos" value={m.sintomasSignos} />
            <ReadTextarea label="Relato cronológico" value={m.relatoCronologico} />
            <ReadTextarea label="Factores modificadores" value={m.factoresMod} />
            <ReadTextarea label="Tratamientos previos" value={m.tratamientosPrevios} />
          </Grid>
        </>
      )}

      {/* Lista Problemas */}
      <ListaProblemasTable problemas={resumen?.listaProblemas} />

      {/* Diagnósticos */}
      <DiagnosticosTable diagnosticos={resumen?.diagnosticos} />

      {/* Tratamientos */}
      {resumen?.tratamientos?.length > 0 && (
        <>
          <SectionTitle>Tratamiento</SectionTitle>
          <table className="data-table" style={{ marginBottom: 8 }}>
            <thead>
              <tr>
                <th style={{ width: 90 }}>Código</th>
                <th>Medicamento</th>
                <th style={{ width: 70 }}>Dosis</th>
                <th style={{ width: 70 }}>Vía</th>
                <th style={{ width: 100 }}>Frecuencia (h)</th>
                <th style={{ width: 90 }}>Duración</th>
              </tr>
            </thead>
            <tbody>
              {resumen.tratamientos.map((t, i) => (
                <tr key={i}> {/* NOSONAR */}
                  <td>{t.codigo || '—'}</td>
                  <td>{t.medicamento || '—'}</td>
                  <td>{t.dosis || '—'}</td>
                  <td>{t.via || '—'}</td>
                  <td>{t.frecuencia || '—'}</td>
                  <td>{t.duracion || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {resumen.indicacionesNoFarm && (
            <Grid cols={1}>
              <ReadTextarea label="Indicaciones no farmacológicas" value={resumen.indicacionesNoFarm} />
            </Grid>
          )}
        </>
      )}

      {/* Decisión Clínica */}
      {resumen?.decisionClinica && (
        <>
          <SectionTitle>Decisión Clínica</SectionTitle>
          <Grid cols={2}>
            <ReadField label="Decisión" value={resumen.decisionClinica.decision || resumen.decisionClinica.decisionAlta} />
            {resumen.decisionClinica.destino && (
              <ReadField label="Destino" value={resumen.decisionClinica.destino} />
            )}
            {resumen.decisionClinica.especialidadRef && (
              <ReadField label="Especialidad de Referencia" value={resumen.decisionClinica.especialidadRef} />
            )}
            {resumen.decisionClinica.planManejo && (
              <ReadField label="Plan de Manejo" value={resumen.decisionClinica.planManejo} />
            )}
            {resumen.decisionClinica.pronostico && (
              <ReadField label="Pronóstico" value={resumen.decisionClinica.pronostico} />
            )}
            {resumen.decisionClinica.observaciones && (
              <ReadField label="Observaciones" value={resumen.decisionClinica.observaciones} />
            )}
            <ReadField label="Profesional" value={resumen.decisionClinica.profNombres || resumen.decisionClinica.medicoNombre} />
            <ReadField label="Colegiatura" value={resumen.decisionClinica.profColegiatura || resumen.decisionClinica.medicoCmp} />
          </Grid>
        </>
      )}
    </>
  )
}

// ─── Hook selector ────────────────────────────────────────────────────────────

function useResumen(atencion) {
  const esControl = atencion?.tipoAtencion === 'CS'
  const cc = useResumenCC(esControl ? atencion?.id : null)
  const ce = useResumenCE(esControl ? null : atencion?.admisionId)
  return esControl ? cc : ce
}

// ─── Modal principal ──────────────────────────────────────────────────────────

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  zIndex: 210,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
}

const modalStyle = {
  background: 'var(--white)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
  width: '100%',
  maxWidth: 760,
  maxHeight: '88vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 20px',
  borderBottom: '1px solid var(--border-light)',
  flexShrink: 0,
}

const modalBodyStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '4px 20px 20px',
}

function ModalContent({ isLoading, resumen, esControl }) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>
        <LoadingSpinner /> Cargando registro...
      </div>
    )
  }
  if (resumen == null) {
    return (
      <div className="empty-state" style={{ margin: 24 }}>
        <div className="empty-state-title">No hay datos disponibles</div>
        <div>Este registro aún no tiene información guardada.</div>
      </div>
    )
  }
  if (esControl) {
    return <ResumenControl resumen={resumen} />
  }
  return <ResumenExterna resumen={resumen} />
}

export default function RegistroDetalleModal({ atencion, onClose }) {
  const { tipoAtencion, fechaAtencion, estado } = atencion || {}
  const esControl = tipoAtencion === 'CS'

  const { data: resumen, isLoading } = useResumen(atencion)

  return (
    <button type="button" aria-label="Cerrar modal" style={{ ...overlayStyle, border: "none", padding: 0, cursor: "default" }} onClick={onClose}>
      <div role="dialog" aria-modal="true" style={{ ...modalStyle, cursor: "auto" }} onClick={(e) => e.stopPropagation()}> {/* NOSONAR (S6847, S6819, S1082) */} 
        <div style={modalHeaderStyle}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', flex: 1 }}>
            {esControl ? 'Control / Seguimiento' : 'Consulta Externa'}
            {fechaAtencion && (
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8, fontSize: 13 }}>
                — {formatDateTime(fechaAtencion)}
              </span>
            )}
          </span>
          {estado && <Badge variant={estadoVariant(estado)}>{estado}</Badge>}
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            <X size={14} /> Cerrar
          </Button>
        </div>

        <div style={modalBodyStyle}>
          <ModalContent isLoading={isLoading} resumen={resumen} esControl={esControl} />
        </div>
      </div>
    </button>
  )
}

ReadField.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.any, wide: PropTypes.bool }
ReadTextarea.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.any }
SectionTitle.propTypes = { children: PropTypes.node }
Grid.propTypes = { cols: PropTypes.number, children: PropTypes.node }
ResumenControl.propTypes = { resumen: PropTypes.object }
ResumenExterna.propTypes = { resumen: PropTypes.object }
ListaProblemasTable.propTypes = { problemas: PropTypes.array }
DiagnosticosTable.propTypes = { diagnosticos: PropTypes.array }
RegistroDetalleModal.propTypes = { atencion: PropTypes.object, onClose: PropTypes.func.isRequired }


ModalContent.propTypes = {
  isLoading: PropTypes.bool,
  resumen: PropTypes.object,
  esControl: PropTypes.bool
}
