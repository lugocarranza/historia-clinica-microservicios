import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import Button from '@/components/ui/Button'
import MedicationTableSection from '@/components/clinical/MedicationTableSection'

const FRECUENCIA_MIN = 1
const FRECUENCIA_MAX = 48

const newRow = () => ({ codigo: '', medicamento: '', dosis: '', via: 'Oral', frecuencia: '' })

const getDefaultValues = (data) => ({
  items: Array.isArray(data) && data.length > 0
    ? data.map((d) => ({
        id: d.id || null,
        codigo: d.codigo || '',
        medicamento: d.medicamento || '',
        dosis: d.dosis || '',
        via: d.via || 'Oral',
        frecuencia: d.frecuencia || '',
      }))
    : [newRow()],
})

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
  } = useForm({ defaultValues: getDefaultValues(null) })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveTratamiento, data.items)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <MedicationTableSection
        sectionTitle="XI. Tratamiento"
        arrayName="items"
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
        descriptionField="medicamento"
        descriptionLabel="Medicamento"
        descriptionMaxLength={300}
        descriptionTooLongMessage="El medicamento no debe superar 300 caracteres"
        descriptionRequiredMessage="El medicamento es requerido"
        descriptionPlaceholder="Buscar medicamento..."
        showDuracion={false}
        frequencyField={{
          label: 'Frec. (h)',
          headerWidth: 100,
          placeholder: 'Ej: 8',
          durationPlaceholder: '',
          rules: {
            validate: (value) => { // NOSONAR (S3800 RHF validate)
              if (value == null || value === '') return true
              if (!/^\d+$/.test(value)) return 'La frecuencia debe ser un numero entero'
              const n = Number(value)
              return (n >= FRECUENCIA_MIN && n <= FRECUENCIA_MAX) || `La frecuencia debe estar entre ${FRECUENCIA_MIN} y ${FRECUENCIA_MAX} horas`
            },
          },
          type: 'number',
          inputMode: 'numeric',
          step: '1',
          min: FRECUENCIA_MIN,
          max: FRECUENCIA_MAX,
        }}
        addButtonLabel="+ Agregar Medicamento"
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveTratamiento.isPending}>
          {saves.saveTratamiento.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabTratamiento.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveTratamiento: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
