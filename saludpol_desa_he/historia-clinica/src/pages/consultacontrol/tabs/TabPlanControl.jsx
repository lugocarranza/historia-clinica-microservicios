import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Controller, useForm, useFieldArray } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import MedicationTableSection from '@/components/clinical/MedicationTableSection'
import SolicitudApoyoCascade from '@/components/clinical/SolicitudApoyoCascade'
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

const newSolicitud = () => ({
  id: null,
  idSubTipoParent: '',
  idSubTipoUltimo: '',
  tipo: '',
  descripcion: '',
  codigoCpms: '',
  codigoSegus: '',
  prioridad: 'Normal',
  observaciones: '',
})

const MAX_LENGTHS = {
  farmaco: 200,
}

const prioridadColor = (p) => {
  if (p === 'Urgente') return '#fff3e8'
  if (p === 'Emergencia') return '#fdeef0'
  return 'white'
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

  const solicitudes = (data?.solicitudesApoyo || []).map((item) => ({
    id: item?.id ?? null,
    idSubTipoParent: item?.idSubTipoParent || '',
    idSubTipoUltimo: item?.idSubTipoUltimo || '',
    tipo: item?.tipo || '',
    descripcion: item?.descripcion || '',
    codigoCpms: item?.codigoCpms || '',
    codigoSegus: item?.codigoSegus || '',
    prioridad: item?.prioridad || 'Normal',
    observaciones: item?.observaciones || '',
  }))

  return {
    medicacion: rows.length ? rows : [newMed()],
    solicitudesApoyo: solicitudes.length ? solicitudes : [newSolicitud()],
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
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(null),
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'medicacion' })
  const { fields: solicitudFields, append: appendSolicitud, remove: removeSolicitud } = useFieldArray({ control, name: 'solicitudesApoyo' })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    onSave(saves.savePlanControl, {
      medicacion: data.medicacion,
      solicitudesApoyo: data.solicitudesApoyo,
      ...data.plan,
    })
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

      <Card allowOverflow>
        <CardHeader title="Solicitudes de Apoyo Diagnóstico" />
        <CardBody>
          {solicitudFields.map((field, i) => {
            const prioridad = watch(`solicitudesApoyo.${i}.prioridad`)
            return (
              <div key={field.id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Solicitud {i + 1}</span>
                  {!getValues(`solicitudesApoyo.${i}.id`) && !isReadOnly && (
                    <Button variant="danger" size="xs" type="button" onClick={() => removeSolicitud(i)}>
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
                <FormField label="Tipo / Procedimiento">
                  <Controller
                    control={control}
                    name={`solicitudesApoyo.${i}`}
                    render={({ field: { value, onChange } }) => (
                      <SolicitudApoyoCascade
                        value={value}
                        onChange={(newVal) => onChange({ ...value, ...newVal })}
                        isReadOnly={isReadOnly}
                      />
                    )}
                  />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, marginTop: 8 }}>
                  <FormField label="Prioridad">
                    <Select
                      {...register(`solicitudesApoyo.${i}.prioridad`)}
                      disabled={isReadOnly}
                      style={{ background: prioridadColor(prioridad), fontWeight: 600, padding: '4px 7px', fontSize: 13 }}
                    >
                      {['Normal', 'Urgente', 'Emergencia'].map((o) => <option key={o}>{o}</option>)}
                    </Select>
                  </FormField>
                  <FormField label="Observaciones">
                    <Input
                      {...register(`solicitudesApoyo.${i}.observaciones`, {
                        maxLength: { value: 500, message: 'Las observaciones no deben superar 500 caracteres' },
                      })}
                      maxLength={500}
                      disabled={isReadOnly}
                      style={{ padding: '4px 7px', fontSize: 13 }}
                    />
                  </FormField>
                </div>
              </div>
            )
          })}
          <Button variant="secondary" size="xs" type="button" disabled={isReadOnly} onClick={() => appendSolicitud(newSolicitud())}>
            + Agregar Solicitud
          </Button>
        </CardBody>
      </Card>

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
