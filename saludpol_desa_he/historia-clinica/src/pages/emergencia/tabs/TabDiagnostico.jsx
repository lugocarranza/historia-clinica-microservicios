import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import DiagnosticoTableSection from '@/components/clinical/DiagnosticoTableSection'

const CONDICION_OPTIONS = ['Estable', 'Inestable', 'Critico']

const newRow = () => ({
  codigoCie10: '',
  descripcion: '',
  tipo: 'Presuntivo',
  caso: 'Nuevo',
  nroProblemAsoc: null,
  buscando: false,
  error: false,
})

const getDefaultValues = (data, condicion) => {
  const rows = (data || []).map((item) => ({
    id: item?.id || null,
    codigoCie10: item?.codigoCie10 || '',
    descripcion: item?.descripcion || '',
    tipo: item?.tipo || 'Presuntivo',
    caso: item?.caso || 'Nuevo',
    nroProblemAsoc: item?.nroProblemAsoc ?? null,
    buscando: false,
    error: false,
  }))
  return {
    condicion: condicion || '',
    diagnosticos: rows.length ? rows : [newRow()],
  }
}

const renderSectionRow = (label, background, color) => (
  <tr>
    <td
      colSpan={4}
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

export default function TabDiagnostico({ onSave, saves, initialData, condicion: condicionProp, isReadOnly = false }) {
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
  } = useForm({ defaultValues: getDefaultValues(null, null) })

  const { fields, append, remove } = useFieldArray({ control, name: 'diagnosticos' })

  useEffect(() => {
    reset(getDefaultValues(initialData, condicionProp))
  }, [initialData, condicionProp, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    if (data.condicion) {
      saves.saveCondicion.mutate({ condicion: data.condicion })
    }
    onSave(saves.saveDiagnosticos, data.diagnosticos)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">VII. Diagnostico</div>

      <Card style={{ marginBottom: 12 }}>
        <CardHeader title="Condicion Clinica del Paciente" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Condicion" error={errors.condicion?.message}>
              <Select {...register('condicion')} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {CONDICION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
          </div>
        </CardBody>
      </Card>

      <DiagnosticoTableSection
        sectionTitle="Impresion Diagnostica (CIE-10)"
        headers={{
          code: 'Codigo CIE-10',
          codeWidth: 130,
          codePlaceholder: 'Ej: J06.9',
          description: 'Impresion Diagnostica',
          descriptionPlaceholder: 'Descripcion diagnostica',
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
        addButtonLabel="+ Agregar Diagnostico"
        typeOptions={['Presuntivo', 'Definitivo']}
        problemField={{ kind: 'input', min: '1', max: '999', rules: {} }}
        showCaseColumn={false}
        showProblemColumn={false}
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
    saveCondicion: PropTypes.shape({ mutate: PropTypes.func }),
  }).isRequired,
  initialData: PropTypes.array,
  condicion: PropTypes.string,
  isReadOnly: PropTypes.bool,
}
