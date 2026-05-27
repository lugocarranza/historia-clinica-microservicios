import PropTypes from 'prop-types'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { obtenerEstablecimientoPorCodigoIpress } from '@/api/maestro'

// ── Constantes del formulario ─────────────────────────────────────────────────

const TIPO_ADSCRIPCION = [
  { value: 'APN', label: 'Adscrita PNP' },
  { value: 'ANP', label: 'Adscrita No PNP' },
  { value: 'NOA', label: 'No Adscrita' },
]

const MODALIDAD_INGRESO = [
  'Espontaneo', 'Referido', 'Ambulancia', 'Evacuacion',
]

const CONDICION_SEGURO = ['Titular', 'Derechohabiente']

const ACOMP_TIPO = ['Acompañante', 'Responsable', 'Tercero']

// ── Helpers ───────────────────────────────────────────────────────────────────

const isEmptyValue = (v) => v == null || String(v).trim() === ''

const resolveCodigoIpress = (user) => {
  const primerIpress = Array.isArray(user?.ipress) ? user.ipress[0] : null
  if (!primerIpress) return ''
  if (typeof primerIpress === 'string') return primerIpress.trim()
  if (typeof primerIpress !== 'object') return ''
  for (const key of ['codigoIpress', 'codigo', 'cuiIpress', 'renipress', 'codigoRenipress']) {
    const val = primerIpress?.[key]
    if (!isEmptyValue(val)) return String(val).trim()
  }
  return ''
}

const calcularEdad = (fechaNac) => {
  if (!fechaNac) return ''
  try {
    const nac = new Date(fechaNac)
    const hoy = new Date()
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad >= 0 ? String(edad) : ''
  } catch {
    return ''
  }
}

const getDefaultValues = (data, filiacion) => ({
  // Sección I
  fechaAtencion:      data?.fechaAtencion      || '',
  horaIngreso:        data?.horaIngreso        || '',
  horaAtencionMedica: data?.horaAtencionMedica || '',
  tipoAdscripcion:    data?.tipoAdscripcion    || '',
  servicio:           'EMERGENCIA',
  idIpress:           data?.idIpress           || '',
  oapEpisodio:        data?.oapEpisodio        || '',
  modalidadIngreso:   data?.modalidadIngreso   || '',
  // Sección II — filiación
  dniPaciente:        data?.dniPaciente        || filiacion?.dniPaciente     || '',
  apellidosPaciente:  data?.apellidosPaciente  || filiacion?.apellidosPaciente || '',
  nombresPaciente:    data?.nombresPaciente    || filiacion?.nombresPaciente   || '',
  fechaNac:           data?.fechaNac           || filiacion?.fechaNac          || '',
  sexo:               data?.sexo               || filiacion?.sexo              || '',
  condicionSeguro:    data?.condicionSeguro    || filiacion?.condicionSeguro   || '',
  telefonoPaciente:   data?.telefonoPaciente   || '',
  filiacionOrigen:    data?.filiacionOrigen    || filiacion?.filiacionOrigen   || 'MANUAL',
  // Acompañante
  acompTipo:          data?.acompTipo          || '',
  acompNombres:       data?.acompNombres       || '',
  acompDni:           data?.acompDni           || '',
  acompTelefono:      data?.acompTelefono      || '',
})

// ── Componente ────────────────────────────────────────────────────────────────

export default function TabIngreso({ onSave, saves, initialData, filiacion, isReadOnly = false }) {
  const { user } = useAuthStore()
  const [ipress, setIpress] = useState({ cui: '', razonSocial: '' })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(null, null) })

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const filiacionOrigen = watch('filiacionOrigen')
  const fechaNac = watch('fechaNac')
  const edad = calcularEdad(fechaNac)

  // Cargar IPRESS desde el usuario (igual que AdmisionPage)
  useEffect(() => {
    const codigo = resolveCodigoIpress(user)
    if (!codigo) return
    obtenerEstablecimientoPorCodigoIpress(codigo)
      .then((est) => {
        setIpress({ cui: est?.codigoIpress || codigo, razonSocial: est?.nombreIpress || '' })
      })
      .catch(() => setIpress({ cui: codigo, razonSocial: '' }))
  }, [user])

  // Sincronizar idIpress del formulario con el valor cargado
  const syncIpress = useCallback(() => {
    if (ipress.cui && !initialData?.idIpress) {
      setValue('idIpress', ipress.cui, { shouldDirty: false })
    }
  }, [ipress.cui, initialData?.idIpress, setValue])

  useEffect(() => { syncIpress() }, [syncIpress])

  // Cargar datos iniciales cuando llegan del API
  useEffect(() => {
    const defaults = getDefaultValues(initialData, filiacion)
    if (ipress.cui && !defaults.idIpress) defaults.idIpress = ipress.cui
    reset(defaults)
  }, [initialData, filiacion, reset, ipress.cui])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveIngreso, { ...data, servicio: 'EMERGENCIA' })
  }

  // Campos de filiación editables solo en modo MANUAL
  const filiacionEditable = !isReadOnly && filiacionOrigen === 'MANUAL'
  const filiacionReadOnly = isReadOnly || filiacionOrigen !== 'MANUAL'

  const origenLabel  = { HCE: 'Datos desde HCE', PADRON: 'Datos desde Padrón', MANUAL: 'Ingreso manual' }
  const origenVariant = { HCE: 'blue', PADRON: 'green', MANUAL: 'gray' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">I. Datos Institucionales</div>

      {/* ── Sección I: Datos Institucionales ── */}
      <Card>
        <CardBody>
          <div className="form-grid g3" style={{ marginBottom: 12 }}>

            {/* IPRESS */}
            <div style={{ gridColumn: '1/-1' }}>
              <FormField label="IPRESS">
                <Input
                  value={ipress.razonSocial ? `${ipress.cui} — ${ipress.razonSocial}` : ipress.cui}
                  readOnly
                  highlight
                  tabIndex={-1}
                />
                <input type="hidden" {...register('idIpress')} />
              </FormField>
            </div>

            {/* Tipo de adscripción */}
            <div style={{ gridColumn: '1/-1' }}>
              <FormField label="Tipo">
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
                  {TIPO_ADSCRIPCION.map(({ value, label }) => (
                    <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isReadOnly ? 'default' : 'pointer' }}>
                      <input
                        type="radio"
                        value={value}
                        {...register('tipoAdscripcion')}
                        disabled={isReadOnly}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Servicio — fijo */}
            <FormField label="Servicio">
              <Input value="EMERGENCIA" readOnly highlight tabIndex={-1} />
            </FormField>

            {/* Fechas y horas */}
            <FormField label="Fecha" required error={errors.fechaAtencion?.message}>
              <Input
                type="date"
                max={today}
                {...register('fechaAtencion', {
                  required: 'La fecha es requerida',
                  validate: (v) => !v || v <= today || 'La fecha no puede ser futura', // NOSONAR (S3800)
                })}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Hora Ingreso" required error={errors.horaIngreso?.message}>
              <Input
                type="time"
                {...register('horaIngreso', { required: 'La hora de ingreso es requerida' })}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Hora Atención Médica">
              <Input type="time" {...register('horaAtencionMedica')} disabled={isReadOnly} />
            </FormField>

            {/* OAP */}
            <div style={{ gridColumn: '1/3' }}>
              <FormField label="OAP Asociada (Episodio)">
                <Input
                  {...register('oapEpisodio', { maxLength: { value: 30, message: 'Max 30 caracteres' } })}
                  maxLength={30}
                  disabled={isReadOnly}
                />
              </FormField>
            </div>

            {/* Modalidad de Ingreso */}
            <div style={{ gridColumn: '1/-1' }}>
              <FormField label="Modalidad de Ingreso" required error={errors.modalidadIngreso?.message}>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
                  {MODALIDAD_INGRESO.map((op) => (
                    <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isReadOnly ? 'default' : 'pointer' }}>
                      <input
                        type="radio"
                        value={op}
                        {...register('modalidadIngreso', { required: 'La modalidad de ingreso es requerida' })}
                        disabled={isReadOnly}
                      />
                      {op}
                    </label>
                  ))}
                </div>
                {errors.modalidadIngreso && (
                  <div className="field-error">{errors.modalidadIngreso.message}</div>
                )}
              </FormField>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Sección II: Filiación ── */}
      <div className="section-div" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        II. Filiación
        <Badge variant={origenVariant[filiacionOrigen] ?? 'gray'}>
          {origenLabel[filiacionOrigen] ?? 'Manual'}
        </Badge>
      </div>

      <Card>
        <CardBody>
          {/* Hidden fields */}
          <input type="hidden" {...register('filiacionOrigen')} />
          <input type="hidden" {...register('fechaNac')} />

          <div className="form-grid g3" style={{ marginBottom: 12 }}>
            {/* Apellidos y Nombres */}
            <div style={{ gridColumn: '1/3' }}>
              <FormField label="Apellidos y Nombres" error={errors.apellidosPaciente?.message}>
                <Input
                  {...register('apellidosPaciente', {
                    maxLength: { value: 255, message: 'Max 255 caracteres' },
                  })}
                  maxLength={255}
                  placeholder="Apellidos y nombres completos"
                  readOnly={filiacionReadOnly}
                  highlight={!filiacionEditable}
                  disabled={isReadOnly && !filiacionEditable}
                />
              </FormField>
            </div>
            {/* Nombres separados (ocultos, se usan en el submit) */}
            <input type="hidden" {...register('nombresPaciente')} />

            {/* DNI */}
            <FormField label="DNI">
              <Input value={watch('dniPaciente')} readOnly highlight tabIndex={-1} />
              <input type="hidden" {...register('dniPaciente')} />
            </FormField>

            {/* Edad */}
            <FormField label="Edad">
              <Input value={edad ? `${edad} años` : ''} readOnly highlight tabIndex={-1} />
            </FormField>

            {/* Sexo */}
            <FormField label="Sexo">
              <Input
                {...register('sexo')}
                readOnly={filiacionReadOnly}
                highlight={!filiacionEditable}
                placeholder="M / F"
                maxLength={1}
                style={{ textTransform: 'uppercase' }}
              />
            </FormField>

            {/* Condición */}
            <div style={{ gridColumn: '1/-1' }}>
              <FormField label="Condición">
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
                  {CONDICION_SEGURO.map((op) => (
                    <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: filiacionReadOnly ? 'default' : 'pointer' }}>
                      <input
                        type="radio"
                        value={op}
                        {...register('condicionSeguro')}
                        disabled={filiacionReadOnly}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Teléfono paciente — siempre editable */}
            <FormField label="Teléfono">
              <Input
                {...register('telefonoPaciente', {
                  maxLength: { value: 9, message: 'Max 9 dígitos' },
                  pattern: { value: /^\d*$/, message: 'Solo dígitos' },
                })}
                maxLength={9}
                inputMode="numeric"
                placeholder="987654321"
                disabled={isReadOnly}
              />
            </FormField>
          </div>

          {/* ── Acompañante / Responsable ── */}
          <div style={{ borderTop: '1px solid var(--c-border, #e5e7eb)', paddingTop: 14, marginTop: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Acompañante / Responsable</div>
            <div className="form-grid g3">
              {/* Tipo de acompañante — radio */}
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Tipo" required>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
                    {ACOMP_TIPO.map((op) => (
                      <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isReadOnly ? 'default' : 'pointer' }}>
                        <input
                          type="radio"
                          value={op}
                          {...register('acompTipo', { required: 'El tipo de acompañante es requerido' })}
                          disabled={isReadOnly}
                        />
                        {op}
                      </label>
                    ))}
                  </div>
                  {errors.acompTipo && (
                    <div className="field-error">{errors.acompTipo.message}</div>
                  )}
                </FormField>
              </div>

              {/* Nombre */}
              <div style={{ gridColumn: '1/3' }}>
                <FormField label="Apellidos y Nombres" required error={errors.acompNombres?.message}>
                  <Input
                    {...register('acompNombres', {
                      required: 'El nombre del acompañante es requerido',
                      maxLength: { value: 255, message: 'Max 255 caracteres' },
                    })}
                    maxLength={255}
                    placeholder="Apellidos y nombres completos"
                    disabled={isReadOnly}
                  />
                </FormField>
              </div>

              {/* DNI acompañante */}
              <FormField label="DNI" required error={errors.acompDni?.message}>
                <Input
                  {...register('acompDni', {
                    required: 'El DNI del acompañante es requerido',
                    maxLength: { value: 8, message: 'Max 8 dígitos' },
                    pattern: { value: /^\d*$/, message: 'Solo dígitos' },
                  })}
                  maxLength={8}
                  inputMode="numeric"
                  placeholder="12345678"
                  disabled={isReadOnly}
                />
              </FormField>

              {/* Teléfono acompañante */}
              <FormField label="Teléfono" required error={errors.acompTelefono?.message}>
                <Input
                  {...register('acompTelefono', {
                    required: 'El teléfono del acompañante es requerido',
                    maxLength: { value: 9, message: 'Max 9 dígitos' },
                    pattern: { value: /^\d*$/, message: 'Solo dígitos' },
                  })}
                  maxLength={9}
                  inputMode="numeric"
                  placeholder="987654321"
                  disabled={isReadOnly}
                />
              </FormField>
            </div>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveIngreso.isPending}>
          {saves.saveIngreso.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabIngreso.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveIngreso: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  filiacion: PropTypes.shape({
    dniPaciente: PropTypes.string,
    apellidosPaciente: PropTypes.string,
    nombresPaciente: PropTypes.string,
    fechaNac: PropTypes.string,
    sexo: PropTypes.string,
    condicionSeguro: PropTypes.string,
    filiacionOrigen: PropTypes.string,
  }),
  isReadOnly: PropTypes.bool,
}
