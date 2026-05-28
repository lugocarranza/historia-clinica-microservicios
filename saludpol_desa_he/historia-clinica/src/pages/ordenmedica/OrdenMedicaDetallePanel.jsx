import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Minimize2, Printer } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDate, formatDateTime } from '@/utils/date'
import { useOrdenMedicaDetalle } from '@/hooks/useOrdenMedica'
import styles from './OrdenMedicaDetallePanel.module.css'

const STORAGE_KEY_VISTA_REDUCIDA = 'ordenMedicaVistaReducida'

const EMPTY_VALUES = new Set(['', '-', '—', 'N/A', 'NO APLICA', 'PENDIENTE'])

const estadoVariant = (estado = '') => {
  const value = estado.toUpperCase()
  if (value.includes('ANUL')) return 'red'
  if (value.includes('ATEND')) return 'blue'
  if (value.includes('OBSERV')) return 'orange'
  return 'green'
}

const prioridadVariant = (prioridad = '') => {
  const value = prioridad.toUpperCase()
  if (value.includes('URGENT') || value.includes('EMERG')) return 'orange'
  if (value.includes('PREFER')) return 'blue'
  return 'gray'
}

const hasValue = (value) => {
  if (value === null || value === undefined) return false
  const normalized = String(value).replace(/\s+/g, ' ').trim()
  return !EMPTY_VALUES.has(normalized.toUpperCase())
}

const valueOrDash = (value) => (hasValue(value) ? value : '—')

const compactFields = (fields) => fields.filter((field) => hasValue(field.value))

function QuickField({ label, value, critical = false }) {
  if (!hasValue(value)) return null
  return (
    <div className={[styles.quickField, critical ? styles.critical : ''].join(' ')}>
      <span className={styles.label}>{label}</span>
      <div className={[styles.value, styles.mono].join(' ')}>{value}</div>
    </div>
  )
}

QuickField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  critical: PropTypes.bool,
}

function Section({ title, fields, columns = 4, compact = false, showHeader = true }) {
  const visibleFields = compactFields(fields)
  if (!visibleFields.length) return null

  return (
    <section className={[styles.sectionCard, compact ? styles.compactSection : ''].join(' ')}>
      {showHeader && (
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
      )}
      <div className={[styles.sectionBody, styles[`grid${columns}`]].join(' ')}>
        {visibleFields.map(({ label, value, wide }) => (
          <div key={label} className={[styles.field, wide ? styles.wide : ''].join(' ')}>
            <span className={styles.label}>{label}</span>
            <div className={styles.value}>{value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    wide: PropTypes.bool,
  })).isRequired,
  columns: PropTypes.oneOf([2, 3, 4]),
  compact: PropTypes.bool,
  showHeader: PropTypes.bool,
}

function PrestacionesGrupo({ titulo, filas }) {
  if (!filas?.length) return null
  return (
    <div className={styles.groupBlock}>
      <div className={styles.groupTitle}>
        <span>{titulo}</span>
        <span>{filas.length} item{filas.length === 1 ? '' : 's'}</span>
      </div>
      <div className={styles.tableWrap}>
      <table className={[styles.table, styles.prestacionesTable].join(' ')}>
        <thead>
          <tr>
            <th>CIE10</th>
            <th>SEGUS</th>
            <th>CPMS</th>
            <th>Descripción</th>
            <th>Cant.</th>
            <th>Prioridad</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id}>
              <td className={styles.mono}>{valueOrDash(f.codigoCie10)}</td>
              <td className={styles.mono}>{valueOrDash(f.codigoSegus)}</td>
              <td className={styles.mono}>{valueOrDash(f.codigoCpms)}</td>
              <td>{valueOrDash(f.descripcion)}</td>
              <td className={styles.mono}>{valueOrDash(f.cantidad)}</td>
              <td>
                {hasValue(f.prioridad) ? (
                  <Badge variant={prioridadVariant(f.prioridad)}>{f.prioridad}</Badge>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

PrestacionesGrupo.propTypes = {
  titulo: PropTypes.string.isRequired,
  filas: PropTypes.array,
}

function PrestacionesSection({ prestaciones }) {
  const grupos = [
    ['Laboratorio', prestaciones?.laboratorio],
    ['Imagen', prestaciones?.imagen],
    ['Procedimiento diagnóstico', prestaciones?.procedimientoDiagnostico],
    ['Procedimiento terapéutico programado', prestaciones?.procedimientoTerapeutico],
    ['Terapia especializada', prestaciones?.terapiaEspecializada],
    ['Otros', prestaciones?.otros],
  ]
  const hasRows = grupos.some(([, filas]) => filas?.length)
  if (!hasRows) return null

  return (
    <section className={[styles.sectionCard, styles.compactSection].join(' ')}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Detalle de prestaciones solicitadas</h2>
      </div>
      <div className={styles.sectionBody}>
        {grupos.map(([titulo, filas]) => (
          <PrestacionesGrupo key={titulo} titulo={titulo} filas={filas} />
        ))}
      </div>
    </section>
  )
}

PrestacionesSection.propTypes = {
  prestaciones: PropTypes.shape({
    laboratorio: PropTypes.array,
    imagen: PropTypes.array,
    procedimientoDiagnostico: PropTypes.array,
    procedimientoTerapeutico: PropTypes.array,
    terapiaEspecializada: PropTypes.array,
    otros: PropTypes.array,
  }),
}

function KeyValueSection({ title, fields }) {
  const visibleFields = compactFields(fields)
  if (!visibleFields.length) return null

  return (
    <section className={[styles.sectionCard, styles.compactSection].join(' ')}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>
        <table className={[styles.table, styles.kvTable].join(' ')}>
          <tbody>
            {visibleFields.map(({ label, value }) => (
              <tr key={label}>
                <th>{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

KeyValueSection.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })).isRequired,
}

function FirmaSection({ firma }) {
  const fields = [
    { label: 'Profesional tratante', value: firma?.profesionalTratante },
    { label: 'Doc. identidad', value: firma?.documentoIdentidad },
    { label: 'Colegiatura', value: firma?.colegiatura },
    { label: 'Reg. especialista', value: firma?.regEspecialista },
    { label: 'Firma digital', value: firma?.firmaDigitalHash },
  ]
  const visibleFields = compactFields(fields)
  if (!visibleFields.length) return null

  return (
    <section className={[styles.sectionCard, styles.compactSection].join(' ')}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Firma del profesional tratante</h2>
      </div>
      <div className={styles.sectionBody}>
        <div className={styles.signatureBox}>
          {fields.map(({ label, value }) => (
            <div key={label} className={styles.signatureCell}>
              <span className={styles.label}>{label}</span>
              <div className={styles.signatureLine} />
              <strong className={label === 'Profesional tratante' ? '' : styles.mono}>
                {valueOrDash(value)}
              </strong>
            </div>
          ))}
        </div>
        <div className={styles.footerNote}>Documento generado desde HCE SaludPol</div>
      </div>
    </section>
  )
}

FirmaSection.propTypes = {
  firma: PropTypes.shape({
    profesionalTratante: PropTypes.string,
    documentoIdentidad: PropTypes.string,
    colegiatura: PropTypes.string,
    regEspecialista: PropTypes.string,
    firmaDigitalHash: PropTypes.string,
  }),
}

export default function OrdenMedicaDetallePanel({
  ordenId,
  onVolver,
  onAnterior,
  onSiguiente,
  posicionActual,
  totalOrdenes,
}) {
  const [vistaReducida, setVistaReducida] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY_VISTA_REDUCIDA) === 'S'
  })
  const { data, isLoading, isError } = useOrdenMedicaDetalle(ordenId)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY_VISTA_REDUCIDA, vistaReducida ? 'S' : 'N')
  }, [vistaReducida])

  if (isLoading) {
    return (
      <div className={styles.stateBox}>
        <LoadingSpinner />
        <div className="empty-state-title">Cargando orden médica...</div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className={styles.stateBox}>
        <div className="empty-state-title">No se pudo cargar la orden</div>
        <Button variant="secondary" size="sm" type="button" onClick={onVolver}>
          <ArrowLeft size={14} /> Volver al listado
        </Button>
      </div>
    )
  }

  const {
    cabecera,
    asegurado,
    establecimiento,
    cobertura,
    actoMedico,
    profesional,
    prestaciones,
    hemodialisis,
    quimioterapia,
    firma,
  } = data

  const fechaEmision = cabecera?.fechaEmision
    ? `${formatDate(cabecera.fechaEmision)}${cabecera.horaEmision ? ` ${cabecera.horaEmision}` : ''}`
    : null
  const nroHc = cabecera?.nroHc
  const fechaNacimiento = asegurado?.fechaNacimiento
  const sexo = asegurado?.sexo
  const edadTexto = asegurado?.edadTexto

  return (
    <div className={styles.orderDetail}>
      <div className={styles.toolbar}>
        <Button variant="secondary" size="sm" type="button" onClick={onVolver}>
          <ArrowLeft size={14} /> Volver al listado
        </Button>
        <div className={styles.navGroup}>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onAnterior || undefined}
            disabled={!onAnterior}
            title="Orden anterior"
          >
            <ChevronLeft size={14} /> Anterior
          </Button>
          {posicionActual && totalOrdenes ? (
            <span className={styles.navCounter}>{posicionActual} de {totalOrdenes}</span>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onSiguiente || undefined}
            disabled={!onSiguiente}
            title="Orden siguiente"
          >
            Siguiente <ChevronRight size={14} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => window.print()}
            title="Imprimir orden médica"
          >
            <Printer size={14} /> Imprimir
          </Button>
          <Button
            variant={vistaReducida ? 'primary' : 'secondary'}
            size="sm"
            type="button"
            onClick={() => setVistaReducida((actual) => !actual)}
          >
            {vistaReducida ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            {vistaReducida ? 'Vista completa' : 'Vista reducida'}
          </Button>
        </div>
      </div>

      <div className={styles.printableArea}>
      <section className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Orden Médica</h1>
          <p className={styles.pageSubtitle}>
            Registro clínico administrativo para prestaciones cubiertas por SaludPol.
          </p>
        </div>
        {hasValue(cabecera?.estado) && (
          <Badge variant={estadoVariant(cabecera.estado)}>{cabecera.estado}</Badge>
        )}
      </section>

      <section className={styles.quickStrip}>
        <QuickField label="OAP Nro." value={cabecera?.nroOap} critical />
        <QuickField label="Historia Clínica Nro." value={nroHc} />
        <QuickField label="Fecha de emisión" value={fechaEmision} />
        <QuickField label="APS Nro." value={cabecera?.nroAps} critical />
        {!vistaReducida && (
          <QuickField label="Carta de Garantía Nro." value={cabecera?.nroCartaGarantia} critical />
        )}
        <QuickField label="Tipo de atención" value={cabecera?.tipoAtencion?.nombre || cabecera?.tipoAtencion?.codigo} />
        <QuickField label="Tipo de orden" value={cabecera?.tipoOrden?.nombre || cabecera?.tipoOrden?.codigo} />
      </section>

      <Section
        title="Identificación del asegurado"
        compact
        showHeader={!vistaReducida}
        fields={[
          { label: 'Apellidos y nombres', value: asegurado?.apellidosNombres, wide: true },
          { label: 'Edad', value: edadTexto },
          ...(!vistaReducida ? [{ label: 'Sexo', value: sexo }] : []),
          ...(!vistaReducida ? [{ label: 'F. nacimiento', value: formatDate(fechaNacimiento) }] : []),
          { label: 'Doc. identidad', value: asegurado?.documentoIdentidad },
          ...(!vistaReducida ? [
            { label: 'Tipo beneficiario', value: asegurado?.tipoBeneficiario },
            { label: 'Condición', value: asegurado?.condicion, wide: true },
            { label: 'Parentesco', value: asegurado?.parentesco },
          ] : []),
        ]}
      />

      <Section
        title="Datos del establecimiento IPRESS emisora"
        columns={3}
        compact
        showHeader={!vistaReducida}
        fields={vistaReducida ? [] : [
          { label: 'CUI IPRESS', value: establecimiento?.ipressCui },
          { label: 'IPRESS', value: establecimiento?.ipress },
          { label: 'Sede', value: establecimiento?.sede },
          { label: 'Región', value: establecimiento?.region },
          { label: 'Categoría', value: establecimiento?.categoria },
          { label: 'Plan', value: establecimiento?.plan },
          { label: 'Error Maestros', value: establecimiento?.errorMaestros, wide: true },
        ]}
      />

      <Section
        title="Cobertura y financiamiento"
        compact
        showHeader={!vistaReducida}
        fields={vistaReducida ? [] : [
          { label: 'Tipo de seguro', value: cobertura?.tipoSeguro },
          { label: 'Plan de salud', value: cobertura?.planSalud },
          { label: 'Tipo de cobertura', value: cobertura?.tipoCobertura },
          { label: 'Tipo de beneficio', value: cobertura?.tipoBeneficio },
        ]}
      />

      <Section
        title="Acto médico y contexto clínico"
        compact
        showHeader={!vistaReducida}
        fields={vistaReducida ? [] : [
          { label: 'Tipo de atención', value: actoMedico?.tipoAtencion },
          { label: 'Actividad', value: actoMedico?.actividad },
          { label: 'Sub actividad', value: actoMedico?.subActividad },
          { label: 'Servicio / Especialidad', value: actoMedico?.servicio },
          { label: 'Fecha y hora de atención', value: formatDateTime(actoMedico?.fechaAtencion) },
        ]}
      />

      <Section
        title="Datos del profesional solicitante"
        columns={3}
        compact
        fields={[
          { label: 'Profesional responsable', value: profesional?.nombre },
          { label: 'Profesión', value: profesional?.profesion },
          { label: 'Doc. ident.', value: profesional?.documentoIdentidad },
          { label: 'Colegiatura', value: profesional?.colegiatura },
          { label: 'RNE', value: profesional?.regEspecialista },
        ]}
      />

      <PrestacionesSection prestaciones={prestaciones} />

      <div className={styles.specialGrid}>
        <KeyValueSection
          title="Orden de hemodiálisis"
          fields={[
            { label: 'Tipo de diálisis', value: hemodialisis?.tipoDialisis },
            { label: 'Frecuencia semanal', value: hemodialisis?.frecuencia },
            { label: 'Duración de cada sesión', value: hemodialisis?.duracionSesionMin ? `${hemodialisis.duracionSesionMin} min` : null },
            { label: 'Número de sesiones', value: hemodialisis?.numeroSesiones },
            { label: 'Acceso vascular', value: hemodialisis?.accesoVascular },
            { label: 'Anticoagulación', value: hemodialisis?.anticoagulacion },
            { label: 'Observaciones', value: hemodialisis?.observaciones },
          ]}
        />

        <KeyValueSection
          title="Orden de quimioterapia"
          fields={[
            { label: 'Diagnóstico oncológico', value: quimioterapia?.diagnosticoOncologico },
            { label: 'Estadio', value: quimioterapia?.estadio },
            { label: 'Protocolo terapéutico', value: quimioterapia?.protocoloTerapeutico },
            { label: 'Ciclo', value: quimioterapia?.ciclo },
            { label: 'Medicamentos', value: quimioterapia?.medicamentos },
            { label: 'Dosis', value: quimioterapia?.dosis },
            { label: 'Vía', value: quimioterapia?.via },
            { label: 'Frecuencia', value: quimioterapia?.frecuencia },
            { label: 'Duración del ciclo', value: quimioterapia?.duracionCicloDias ? `${quimioterapia.duracionCicloDias} días` : null },
            { label: 'Observaciones', value: quimioterapia?.observaciones },
          ]}
        />
      </div>

      <FirmaSection firma={firma} />
      </div>
    </div>
  )
}

OrdenMedicaDetallePanel.propTypes = {
  ordenId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onVolver: PropTypes.func.isRequired,
  onAnterior: PropTypes.func,
  onSiguiente: PropTypes.func,
  posicionActual: PropTypes.number,
  totalOrdenes: PropTypes.number,
}
