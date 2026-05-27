import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import VitalsGrid from '@/components/clinical/VitalsGrid'
import { getVitalFields } from '@/components/clinical/vitalFields'
import { useAuthStore } from '@/store/authStore'

const PRIORIDAD = [
  'Prioridad I: Resucitacion',
  'Prioridad II: Emergencia',
  'Prioridad III: Urgencia',
  'Prioridad IV: Menos urgente',
]

const TRIAGE_VITAL_FIELDS = getVitalFields('triage')

const getDefaultValues = (data) => ({
  horaTriage:         data?.horaTriage         || '',
  profesionalNombre:  data?.profesionalNombre  || '',
  prioridad:          data?.prioridad          || '',
  paSistolica:        data?.paSistolica        ?? '',
  paDiastolica:       data?.paDiastolica       ?? '',
  fc:                 data?.fc                 ?? '',
  fr:                 data?.fr                 ?? '',
  satO2:              data?.satO2              ?? '',
  temperatura:        data?.temperatura        ?? '',
  glasgow:            data?.glasgow            ?? '',
  eva:                data?.eva                ?? '',
  motivoConsulta:     data?.motivoConsulta     || '',
})

export default function TabTriage({ onSave, saves, initialData, isReadOnly = false }) {
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(null) })

  // Auto-fill profesional desde el usuario logueado
  useEffect(() => {
    const nombreUsuario = user
      ? `${user.apellidoPaterno || ''} ${user.apellidoMaterno || ''} ${user.nombres || ''}`.trim().toUpperCase()
      : ''
    const defaults = getDefaultValues(initialData)
    if (!defaults.profesionalNombre && nombreUsuario) {
      defaults.profesionalNombre = nombreUsuario
    }
    reset(defaults)
  }, [initialData, user, reset])

  // Si el usuario cambia (improbable) actualizar el campo sin perder otros valores
  useEffect(() => {
    if (!user) return
    const nombre = `${user.apellidoPaterno || ''} ${user.apellidoMaterno || ''} ${user.nombres || ''}`.trim().toUpperCase()
    setValue('profesionalNombre', nombre, { shouldDirty: false })
  }, [user, setValue])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveTriage, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">IV. Triage</div>

      <Card>
        <CardHeader title="Datos del Triage" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Hora de Triage" required error={errors.horaTriage?.message}>
              <Input
                type="time"
                {...register('horaTriage', { required: 'La hora de triage es requerida' })}
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="Prioridad" required error={errors.prioridad?.message}>
              <Select
                {...register('prioridad', { required: 'La prioridad es requerida' })}
                disabled={isReadOnly}
              >
                <option value="">— Seleccionar —</option>
                {PRIORIDAD.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>

            <FormField label="Profesional Responsable" required error={errors.profesionalNombre?.message}>
              <Input
                {...register('profesionalNombre', {
                  required: 'El profesional responsable es requerido',
                  maxLength: { value: 70, message: 'Max 70 caracteres' },
                })}
                maxLength={70}
                readOnly
                highlight
                tabIndex={-1}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Signos Vitales" />
        <CardBody>
          <VitalsGrid
            fields={TRIAGE_VITAL_FIELDS}
            register={register}
            errors={errors}
            values={watch()}
            isReadOnly={isReadOnly}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Motivo de Consulta" />
        <CardBody>
          <FormField label="Motivo de Consulta" required error={errors.motivoConsulta?.message}>
            <Textarea
              {...register('motivoConsulta', {
                required: 'El motivo de consulta es requerido',
                maxLength: { value: 200, message: 'Max 200 caracteres' },
              })}
              rows={3}
              maxLength={200}
              placeholder="Describa el motivo principal de consulta..."
              disabled={isReadOnly}
            />
          </FormField>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveTriage.isPending}>
          {saves.saveTriage.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabTriage.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveTriage: PropTypes.shape({
      mutate: PropTypes.func,
      isPending: PropTypes.bool,
    }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
