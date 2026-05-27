import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

const CRITERIOS = [
  { name: 'riesgoVitalInmed',     label: 'Riesgo vital inmediato' },
  { name: 'riesgoPerdidaOrgano',  label: 'Riesgo de perdida de organo o funcion' },
  { name: 'eventoCardiovascular', label: 'Evento cardiovascular agudo' },
  { name: 'eventoNeurologico',    label: 'Evento neurologico agudo' },
  { name: 'traumaGrave',          label: 'Trauma grave' },
  { name: 'dolorSevero',          label: 'Dolor severo incapacitante' },
]

const getDefaultValues = (data) => ({
  riesgoVitalInmed:     !!data?.riesgoVitalInmed,
  riesgoPerdidaOrgano:  !!data?.riesgoPerdidaOrgano,
  eventoCardiovascular: !!data?.eventoCardiovascular,
  eventoNeurologico:    !!data?.eventoNeurologico,
  traumaGrave:          !!data?.traumaGrave,
  dolorSevero:          !!data?.dolorSevero,
  sustentoClinico:      data?.sustentoClinico       || '',
  medicoNombre:         data?.medicoNombre          || '',
  medicoCmp:            data?.medicoCmp             || '',
  medicoRne:            data?.medicoRne             || '',
  horaRegistro:         data?.horaRegistro          || '',
})

export default function TabCriterio({ onSave, saves, initialData, isReadOnly = false }) {
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(null) })

  useEffect(() => {
    const nombreUsuario = user
      ? `${user.apellidoPaterno || ''} ${user.apellidoMaterno || ''} ${user.nombres || ''}`.trim().toUpperCase()
      : ''
    const defaults = getDefaultValues(initialData)
    if (!defaults.medicoNombre && nombreUsuario) {
      defaults.medicoNombre = nombreUsuario
    }
    reset(defaults)
  }, [initialData, user, reset])

  useEffect(() => {
    if (!user) return
    const nombre = `${user.apellidoPaterno || ''} ${user.apellidoMaterno || ''} ${user.nombres || ''}`.trim().toUpperCase()
    setValue('medicoNombre', nombre, { shouldDirty: false })
  }, [user, setValue])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveCriterio, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">XII. Criterio de Emergencia</div>

      <Card>
        <CardHeader title="Criterio de Emergencia" />
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CRITERIOS.map(({ name, label }) => (
              <label
                key={name}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: isReadOnly ? 'default' : 'pointer' }}
              >
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

          <FormField label="Sustento clinico" required error={errors.sustentoClinico?.message} style={{ marginTop: 12 }}>
            <Textarea
              {...register('sustentoClinico', {
                required: 'El sustento clinico es requerido',
                maxLength: { value: 300, message: 'Max 300 caracteres' },
              })}
              maxLength={300}
              rows={3}
              disabled={isReadOnly}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <CardHeader title="Medico Responsable" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Medico Responsable" required error={errors.medicoNombre?.message}>
              <Input
                {...register('medicoNombre', {
                  required: 'El medico responsable es requerido',
                  maxLength: { value: 70, message: 'Max 70 caracteres' },
                })}
                maxLength={70}
                readOnly
                highlight
                tabIndex={-1}
              />
            </FormField>

            <FormField label="CMP" required error={errors.medicoCmp?.message}>
              <Input
                {...register('medicoCmp', {
                  required: 'El CMP es requerido',
                  maxLength: { value: 6, message: 'Max 6 caracteres' },
                })}
                maxLength={6}
                placeholder="CMP"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="RNE" required error={errors.medicoRne?.message}>
              <Input
                {...register('medicoRne', {
                  required: 'El RNE es requerido',
                  maxLength: { value: 6, message: 'Max 6 caracteres' },
                })}
                maxLength={6}
                placeholder="RNE"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="Hora de registro" required error={errors.horaRegistro?.message}>
              <Input
                type="time"
                {...register('horaRegistro', { required: 'La hora de registro es requerida' })}
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveCriterio.isPending}>
          {saves.saveCriterio.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabCriterio.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveCriterio: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
