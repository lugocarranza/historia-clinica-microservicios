import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import MedicationTableSection from '@/components/clinical/MedicationTableSection'
import { todayDateInput } from '@/utils/date'

const newMed = () => ({
  id: null,
  codigo: '',
  farmaco: '',
  dosis: '',
  via: 'Oral',
  frecuencia: '',
  duracion: '',
  conducta: 'Mantener',
})

const MAX_LENGTHS = {
  farmaco: 200,
}

const getDefaultValues = (data) => {
  const rows = (data?.medicacion || []).map((item) => ({
    id: item?.id ?? null,
    codigo: item?.codigo || '',
    farmaco: item?.farmaco || '',
    dosis: item?.dosis || '',
    via: item?.via || 'Oral',
    frecuencia: item?.frecuencia || '',
    duracion: item?.duracion || '',
    conducta: item?.conducta || 'Mantener',
  }))

  return {
    medicacion: rows.length ? rows : [newMed()],
    plan: {
      proximaCita: data?.proximaCita || '',
      indicaciones: data?.indicaciones || '',
      criteriosAlarma: data?.criteriosAlarma || '',
    },
  }
}

const conductaColor = (conducta) => {
  if (conducta === 'Mantener') return '#eaf5ee'
  if (conducta === 'Suspender') return '#fdeef0'
  return '#fff3e8'
}

export default function TabPlanControl({ onSave, saves, initialData, isReadOnly = false }) {
  const minProximaCita = todayDateInput()

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(null),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicacion',
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    onSave(saves.savePlanControl, { medicacion: data.medicacion, ...data.plan })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <MedicationTableSection
        sectionTitle="4. Plan Global del Control"
        cardHeaderTitle="Medicación Actual"
        arrayName="medicacion"
        fields={fields}
        errors={errors}
        control={control}
        register={register}
        setValue={setValue}
        setError={setError}
        clearErrors={clearErrors}
        getValues={getValues}
        append={append}
        remove={remove}
        createRow={newMed}
        isReadOnly={isReadOnly}
        dosisRules={{ required: 'La dosis es requerida' }}
        descriptionField="farmaco"
        descriptionLabel="Fármaco"
        descriptionMaxLength={MAX_LENGTHS.farmaco}
        descriptionTooLongMessage={`El fármaco no debe superar ${MAX_LENGTHS.farmaco} caracteres`}
        descriptionRequiredMessage="El fármaco es requerido"
        descriptionPlaceholder="Nombre genérico / comercial"
        frequencyField={{
          label: 'Frecuencia (horas)',
          placeholder: '8',
          durationPlaceholder: '30',
          durationSuffix: ' (días)',
          durationMaxLength: 8,
          durationType: 'number',
          durationInputMode: 'numeric',
          durationRules: {
            required: 'La duración es requerida',
            validate: (value) => { // NOSONAR (S3800 RHF validate)
              if (value == null || value === '') return true
              if (!/^\d+$/.test(value)) return 'La duración debe ser un número entero positivo'
              return (Number(value) >= 1) || `La duración debe ser de al menos 1 día`
            },
          },
          rules: {
            required: 'La frecuencia es requerida',
            validate: (value) => { // NOSONAR (S3800 RHF validate)
              if (value == null || value === '') return true
              if (!/^\d+$/.test(value)) return 'La frecuencia debe ser un número entero positivo'
              const n = Number(value)
              return (n >= 1 && n <= 48) || 'La frecuencia debe estar entre 1 y 48 horas'
            },
          },
          type: 'number',
          inputMode: 'numeric',
          step: '1',
          min: 1,
          max: 48,
        }}
        trailingField={{
          key: 'conducta',
          label: 'Conducta',
          headerWidth: 120,
          kind: 'select',
          options: ['Mantener', 'Ajustar', 'Cambiar', 'Suspender'],
          getStyle: (value) => ({ background: conductaColor(value), fontWeight: 600 }),
        }}
        addButtonLabel="+ Agregar Medicamento"
      />

      <Card>
        <CardHeader title="Seguimiento y Criterios de Alarma" />
        <CardBody>
          <div className="form-grid g2" style={{ gap: 12 }}>
            <FormField label="Próxima Cita" error={errors.plan?.proximaCita?.message}>
              <Input
                type="date"
                min={minProximaCita}
                disabled={isReadOnly}
                {...register('plan.proximaCita', {
                  required: 'La próxima cita es requerida',
                  validate: (value) => (
                    value && value < minProximaCita
                      ? 'La próxima cita no puede ser una fecha pasada'
                      : true
                  ),
                })}
              />
            </FormField>
            <div style={{ gridColumn: '1/-1' }}>
              <FormField label="Indicaciones Generales" error={errors.plan?.indicaciones?.message}>
                <Textarea
                  {...register('plan.indicaciones', {
                    maxLength: { value: 2000, message: 'Las indicaciones no deben superar 2000 caracteres' },
                  })}
                  maxLength={2000}
                  rows={3}
                  placeholder="Dieta, actividad física, cuidados, metas terapéuticas..."
                  disabled={isReadOnly}
                />
              </FormField>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <FormField label="Criterios de Alarma Explicados al Paciente" error={errors.plan?.criteriosAlarma?.message}>
                <Textarea
                  {...register('plan.criteriosAlarma', {
                    maxLength: { value: 2000, message: 'Los criterios de alarma no deben superar 2000 caracteres' },
                  })}
                  maxLength={2000}
                  rows={3}
                  placeholder="Signos o síntomas que requieren atención inmediata..."
                  disabled={isReadOnly}
                />
              </FormField>
            </div>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.savePlanControl.isPending}>
          {saves.savePlanControl.isPending ? 'Guardando...' : 'Guardar Plan'}
        </Button>
      </div>
    </form>
  )
}

TabPlanControl.propTypes = {
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
  saves: PropTypes.shape({
    savePlanControl: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
}
