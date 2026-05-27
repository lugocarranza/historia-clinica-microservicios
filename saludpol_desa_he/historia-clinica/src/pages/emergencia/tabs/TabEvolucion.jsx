import PropTypes from 'prop-types'
import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

const MAX = 300

const PLAN_CHECKS = [
  { name: 'pMantenerTrat',   label: 'Mantener tratamiento' },
  { name: 'pAjustarDosis',   label: 'Ajustar dosis' },
  { name: 'pCambiarEsquema', label: 'Cambiar esquema' },
  { name: 'pSuspenderTrat',  label: 'Suspender tratamiento' },
  { name: 'pNuevosEstudios', label: 'Nuevos estudios' },
  { name: 'pInterconsulta',  label: 'Interconsulta' },
  { name: 'pAltaProblema',   label: 'Alta del problema' },
]

const ANALISIS_CHECKS = [
  { name: 'aMejoria',   label: 'Mejoria' },
  { name: 'aIgual',     label: 'Igual' },
  { name: 'aPeor',      label: 'Peor' },
  { name: 'aResuelto',  label: 'Resuelto' },
]


const EMPTY_FORM = {
  fecha: '', hora: '', medicoResponsable: '', cmp: '', rne: '',
  sEvolucion: '', sPersistencia: '', sAdherencia: '', sEventosAdversos: '',
  oSignosVitales: '', oHallazgosFisicos: '', oResultEstudios: '', oComparacionPrevia: '',
  aMejoria: false, aIgual: false, aPeor: false, aResuelto: false,
  aDiagActualizado: '', aCambiosSeveridad: '', aEvalTerapeutica: '',
  pMantenerTrat: false, pAjustarDosis: false, pCambiarEsquema: false,
  pSuspenderTrat: false, pNuevosEstudios: false, pInterconsulta: false, pAltaProblema: false,
  pObservacion: '',
}

function CheckGroup({ items, register, isReadOnly }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
      {items.map(({ name, label }) => (
        <label key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isReadOnly ? 'default' : 'pointer' }}>
          <input
            type="checkbox"
            {...register(name)}
            disabled={isReadOnly}
            style={{ accentColor: 'var(--c-primary)', width: 15, height: 15 }}
          />
          <span style={{ fontSize: 14 }}>{label}</span>
        </label>
      ))}
    </div>
  )
}

CheckGroup.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, label: PropTypes.string })).isRequired,
  register: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
}

function EvolucionHistorial({ evoluciones }) {
  const [expandido, setExpandido] = useState(null)

  if (!evoluciones?.length) return null

  return (
    <Card style={{ marginBottom: 16 }}>
      <CardHeader title="Evoluciones Registradas" />
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {evoluciones.map((ev, i) => {
            const key = ev.id ?? i
            const isOpen = expandido === key
            return (
              <div key={key} style={{ border: '1px solid var(--c-border)', borderRadius: 6, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setExpandido(isOpen ? null : key)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: 'var(--c-surface-alt, #f8fafc)', border: 'none',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}
                >
                  <span>{ev.fecha} {ev.hora} — {ev.medicoResponsable || 'Sin medico'}</span>
                  <span>{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: 12, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ev.sEvolucion && <div><b>S:</b> {ev.sEvolucion}</div>}
                    {ev.oSignosVitales && <div><b>O (signos):</b> {ev.oSignosVitales}</div>}
                    {ev.oHallazgosFisicos && <div><b>O (hallazgos):</b> {ev.oHallazgosFisicos}</div>}
                    {ev.aDiagActualizado && <div><b>A:</b> {ev.aDiagActualizado}</div>}
                    {ev.pObservacion && <div><b>P:</b> {ev.pObservacion}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}

EvolucionHistorial.propTypes = {
  evoluciones: PropTypes.array,
}

const getNombreMedico = (user) =>
  user ? `${user.apellidoPaterno || ''} ${user.apellidoMaterno || ''} ${user.nombres || ''}`.trim().toUpperCase() : ''

export default function TabEvolucion({ saves, initialData, isReadOnly = false }) {
  const { user } = useAuthStore()
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { ...EMPTY_FORM } })

  useEffect(() => {
    const nombre = getNombreMedico(user)
    if (nombre) setValue('medicoResponsable', nombre, { shouldDirty: false })
  }, [user, setValue])

  const onSubmit = (data) => {
    if (isReadOnly) return
    saves.saveEvolucion.mutate(data, {
      onSuccess: () => reset({ ...EMPTY_FORM, medicoResponsable: getNombreMedico(user) }),
    })
  }

  const textarea = (name, label, required = false) => (
    <FormField label={label} required={required} error={errors[name]?.message}>
      <Textarea
        {...register(name, {
          ...(required ? { required: `${label} es requerido` } : {}),
          maxLength: { value: MAX, message: `Max ${MAX} caracteres` },
        })}
        maxLength={MAX}
        rows={3}
        disabled={isReadOnly}
      />
    </FormField>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">XIII. Evolucion SOAP</div>

      <EvolucionHistorial evoluciones={initialData} />

      <Card>
        <CardHeader title="Datos del Medico" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Fecha" required error={errors.fecha?.message}>
              <Input
                type="date"
                max={today}
                {...register('fecha', {
                  required: 'La fecha es requerida',
                  validate: (v) => !v || v <= today || 'La fecha no puede ser futura', // NOSONAR (S3800)
                })}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Hora" required error={errors.hora?.message}>
              <Input type="time" {...register('hora', { required: 'La hora es requerida' })} disabled={isReadOnly} />
            </FormField>
            <FormField label="Medico responsable" required error={errors.medicoResponsable?.message}>
              <Input
                {...register('medicoResponsable', {
                  required: 'El medico responsable es requerido',
                  maxLength: { value: 70, message: 'Max 70 caracteres' },
                })}
                maxLength={70}
                readOnly
                highlight
                tabIndex={-1}
              />
            </FormField>
            <FormField label="CMP" required error={errors.cmp?.message}>
              <Input
                {...register('cmp', {
                  required: 'El CMP es requerido',
                  maxLength: { value: 6, message: 'Max 6 caracteres' },
                })}
                maxLength={6}
                placeholder="CMP"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="RNE" required error={errors.rne?.message}>
              <Input
                {...register('rne', {
                  required: 'El RNE es requerido',
                  maxLength: { value: 6, message: 'Max 6 caracteres' },
                })}
                maxLength={6}
                placeholder="RNE"
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <CardHeader title="S — Subjetivo" />
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {textarea('sEvolucion', 'Evolucion desde ultima evaluacion', true)}
            {textarea('sPersistencia', 'Persistencia de sintomas', true)}
            {textarea('sAdherencia', 'Adherencia al tratamiento', true)}
            {textarea('sEventosAdversos', 'Eventos adversos', true)}
          </div>
        </CardBody>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <CardHeader title="O — Objetivo" />
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {textarea('oSignosVitales', 'Signos vitales', true)}
            {textarea('oHallazgosFisicos', 'Hallazgos fisicos', true)}
            {textarea('oResultEstudios', 'Resultados de estudios', true)}
            {textarea('oComparacionPrevia', 'Comparacion con evaluacion previa', true)}
          </div>
        </CardBody>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <CardHeader title="A — Analisis / Evaluacion" />
        <CardBody>
          <CheckGroup items={ANALISIS_CHECKS} register={register} isReadOnly={isReadOnly} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {textarea('aDiagActualizado', 'Diagnostico actualizado', true)}
            {textarea('aCambiosSeveridad', 'Cambios de severidad', true)}
            {textarea('aEvalTerapeutica', 'Evaluacion terapeutica', true)}
          </div>
        </CardBody>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <CardHeader title="P — Plan / Conducta" />
        <CardBody>
          <CheckGroup items={PLAN_CHECKS} register={register} isReadOnly={isReadOnly} />
          {textarea('pObservacion', 'Observacion', true)}
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveEvolucion.isPending}>
          {saves.saveEvolucion.isPending ? 'Guardando...' : 'Guardar Evolucion'}
        </Button>
      </div>
    </form>
  )
}

TabEvolucion.propTypes = {
  saves: PropTypes.shape({
    saveEvolucion: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
