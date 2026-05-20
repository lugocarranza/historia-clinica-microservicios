import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, useFieldArray } from 'react-hook-form'
import Button from '@/components/ui/Button'
import DiagnosticoTableSection from '@/components/clinical/DiagnosticoTableSection'

const newRow = (index = 1) => ({
  id: null,
  codigoCie10: '',
  descripcion: '',
  tipo: 'Definitivo',
  caso: 'Nuevo',
  nroProblemAsoc: String(index),
})

const getDefaultValues = (data) => {
  const rows = (data || []).map((item, index) => ({
    id: item?.id ?? null,
    codigoCie10: item?.codigoCie10 || '',
    descripcion: item?.descripcion || '',
    tipo: item?.tipo || 'Definitivo',
    caso: item?.caso || 'Nuevo',
    nroProblemAsoc: item?.nroProblemAsoc == null ? String(index + 1) : String(item.nroProblemAsoc),
  }))
  return { diagnosticos: rows.length ? rows : [newRow(1), newRow(2)] }
}

export default function TabDiagnosticoCC({ onSave, saves, initialData, isReadOnly = false }) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(null),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'diagnosticos',
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => onSave(saves.saveDiagnosticos, data.diagnosticos)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <DiagnosticoTableSection
        sectionTitle="3. Diagnóstico"
        headers={{
          code: 'Código CIE-10',
          codeWidth: 120,
          codePlaceholder: 'Ej: I10',
          description: 'Diagnóstico',
          descriptionPlaceholder: 'Descripción diagnóstica',
          type: 'Tipo',
          typeWidth: 130,
          case: 'Caso',
          caseWidth: 110,
          problem: 'Problema N°',
          problemWidth: 130,
        }}
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
        addButtonLabel="+ Agregar Diagnóstico"
        typeOptions={['Definitivo', 'Presuntivo', 'Repetitivo']}
        problemField={{
          kind: 'select',
          options: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          rules: {
            required: 'El número de problema asociado es requerido',
          },
        }}
        rowStyle={(index) => ({ background: index % 2 === 0 ? 'white' : 'var(--c-primary-faint)' })}
        searchMinLength={3}
        searchLimit={12}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveDiagnosticos.isPending}>
          {saves.saveDiagnosticos.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabDiagnosticoCC.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveDiagnosticos: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
