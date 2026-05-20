import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, useFieldArray } from 'react-hook-form'
import Button from '@/components/ui/Button'
import DiagnosticoTableSection from '@/components/clinical/DiagnosticoTableSection'

const newRow = (nroProblemAsoc = 1) => ({
  id: null,
  codigoCie10: '',
  descripcion: '',
  tipo: 'Presuntivo',
  caso: 'Nuevo',
  nroProblemAsoc,
  buscando: false,
  error: false,
})

const getDefaultValues = (data) => {
  const rows = (data || []).map((item, index) => ({
    id: item?.id ?? null,
    codigoCie10: item?.codigoCie10 || '',
    descripcion: item?.descripcion || '',
    tipo: item?.tipo || 'Presuntivo',
    caso: item?.caso || 'Nuevo',
    nroProblemAsoc: item?.nroProblemAsoc ?? index + 1,
    buscando: false,
    error: false,
  }))

  return {
    diagnosticos: rows.length ? rows : [newRow()],
  }
}

const renderSectionRow = (label, background, color) => (
  <tr>
    <td
      colSpan={6}
      style={{
        background,
        color,
        fontWeight: 700,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
      }}
    >
      {label}
    </td>
  </tr>
)

export default function TabDiagnostico({ onSave, saves, initialData, isReadOnly = false }) {
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
      diagnosticos: [newRow()],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'diagnosticos',
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveDiagnosticos, data.diagnosticos)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <DiagnosticoTableSection
        sectionTitle="7. Diagnóstico (CIE-10)"
        headers={{
          code: 'Código CIE-10',
          codeWidth: 130,
          codePlaceholder: 'Ej: J06.9',
          description: 'Descripción Diagnóstica',
          descriptionPlaceholder: 'Descripción diagnóstica',
          type: 'Tipo',
          typeWidth: 140,
          case: 'Caso',
          caseWidth: 110,
          problem: 'Problema N°',
          problemWidth: 110,
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
        typeOptions={['Presuntivo', 'Definitivo', 'Repetitivo']}
        problemField={{
          kind: 'input',
          min: '1',
          max: '999',
          rules: {
            min: { value: 1, message: 'El número de problema debe ser mayor a 0' },
            max: { value: 999, message: 'El número de problema no debe superar 999' },
            setValueAs: (value) => (value === '' || value == null ? null : Number(value)),
          },
        }}
        renderRowPrefix={(index) => {
          if (index === 0) return renderSectionRow('Principal', '#eaf5ee', '#166534')
          if (index === 1) return renderSectionRow('Secundario', '#f1f5f9', '#475569')
          return null
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveDiagnosticos.isPending}>
          {saves.saveDiagnosticos.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabDiagnostico.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveDiagnosticos: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
