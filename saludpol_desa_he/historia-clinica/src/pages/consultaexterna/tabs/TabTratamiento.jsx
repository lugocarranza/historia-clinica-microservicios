import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import MedicationTableSection from '@/components/clinical/MedicationTableSection'

const newRow = () => ({
  id: null,
  codigo: '',
  medicamento: '',
  dosis: '',
  via: 'Oral',
  frecuencia: '',
  duracion: '',
  indicaciones: '',
})

const FRECUENCIA_MIN = 1
const FRECUENCIA_MAX = 48

const MAX_LENGTHS = {
  medicamento: 200,
  indicaciones: 500,
  indicacionesNoFarm: 2000,
}

const getDefaultValues = (data) => {
  const rows = (data?.tratamientos || []).map((item) => ({
    id: item?.id ?? null,
    codigo: item?.codigo || '',
    medicamento: item?.medicamento || '',
    dosis: item?.dosis || '',
    via: item?.via || 'Oral',
    frecuencia: item?.frecuencia || '',
    duracion: item?.duracion || '',
    indicaciones: item?.indicaciones || '',
  }))

  return {
    tratamientos: rows.length ? rows : [newRow()],
    indicacionesNoFarm: data?.indicacionesNoFarm || '',
  }
}

export default function TabTratamiento({ onSave, saves, initialData, isReadOnly = false }) {
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
    defaultValues: {
      tratamientos: [newRow()],
      indicacionesNoFarm: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tratamientos',
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveTratamientos, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <MedicationTableSection
        sectionTitle="8. Tratamiento"
        arrayName="tratamientos"
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
        createRow={newRow}
        isReadOnly={isReadOnly}
        codeRules={{ required: 'El código del medicamento es requerido' }}
        dosisRules={{ required: 'La dosis es requerida' }}
        descriptionField="medicamento"
        descriptionLabel="Medicamento"
        descriptionMaxLength={MAX_LENGTHS.medicamento}
        descriptionTooLongMessage={`El medicamento no debe superar ${MAX_LENGTHS.medicamento} caracteres`}
        descriptionRequiredMessage="El medicamento es requerido"
        descriptionPlaceholder="Nombre genérico / comercial"
        frequencyField={{
          label: 'Frecuencia (horas)',
          headerWidth: 120,
          placeholder: '8',
          durationPlaceholder: '7',
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
              const number = Number(value)
              return (number >= FRECUENCIA_MIN && number <= FRECUENCIA_MAX) || `La frecuencia debe estar entre ${FRECUENCIA_MIN} y ${FRECUENCIA_MAX} horas`
            },
          },
          type: 'number',
          inputMode: 'numeric',
          step: '1',
          min: FRECUENCIA_MIN,
          max: FRECUENCIA_MAX,
        }}
        trailingField={{
          key: 'indicaciones',
          label: 'Indicaciones',
          headerWidth: 160,
          kind: 'input',
          maxLength: MAX_LENGTHS.indicaciones,
          placeholder: '',
          rules: {
            required: 'Las indicaciones son requeridas',
            maxLength: {
              value: MAX_LENGTHS.indicaciones,
              message: `Las indicaciones no deben superar ${MAX_LENGTHS.indicaciones} caracteres`,
            },
          },
        }}
        addButtonLabel="+ Agregar Medicamento"
      />

      <Card>
        <CardHeader title="Indicaciones No Farmacológicas" />
        <CardBody>
          <FormField label="Dieta, reposo, actividad física, cuidados en domicilio..." error={errors.indicacionesNoFarm?.message}>
            <Textarea
              {...register('indicacionesNoFarm', {
                maxLength: {
                  value: MAX_LENGTHS.indicacionesNoFarm,
                  message: `Las indicaciones no farmacológicas no deben superar ${MAX_LENGTHS.indicacionesNoFarm} caracteres`,
                },
              })}
              maxLength={MAX_LENGTHS.indicacionesNoFarm}
              rows={3}
              placeholder="Describa las indicaciones no farmacológicas"
              disabled={isReadOnly}
            />
          </FormField>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveTratamientos.isPending}>
          {saves.saveTratamientos.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabTratamiento.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveTratamientos: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.shape({
    tratamientos: PropTypes.array,
    indicacionesNoFarm: PropTypes.string,
  }),
  isReadOnly: PropTypes.bool,
}
