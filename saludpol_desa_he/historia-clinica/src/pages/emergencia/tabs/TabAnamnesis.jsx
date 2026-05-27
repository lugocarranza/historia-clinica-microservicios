import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const FORMA_INICIO = ['Brusco', 'Insidioso']
const CURSO = ['Progresivo', 'Estacionario', 'Episodico/Recurrente', 'Agudo', 'Cronico']
const ANT_TIPOS = [
  'Cardiovasculares',
  'Diabetes Mellitus',
  'Medicacion actual',
  'Alergias',
  'Cirugias previas',
  'Consumo sustancias',
]

const getDefaultValues = (data) => ({
  tiempoEnfermedad: data?.tiempoEnfermedad || '',
  formaInicio:      data?.formaInicio      || '',
  curso:            data?.curso            || '',
  antecedentes: ANT_TIPOS.map((tipo) => {
    const existing = data?.antecedentes?.find((a) => a.tipo === tipo)
    const noRefiere = existing?.descripcion === 'No refiere'
    return {
      tipo,
      noRefiere,
      descripcion: noRefiere ? '' : (existing?.descripcion || ''),
    }
  }),
})

export default function TabAnamnesis({ onSave, saves, initialData, isReadOnly = false }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(null) })

  const { fields } = useFieldArray({ control, name: 'antecedentes' })
  const watchedAntecedentes = watch('antecedentes')

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    const payload = {
      ...data,
      antecedentes: data.antecedentes.map((a) => ({
        tipo: a.tipo,
        descripcion: a.noRefiere ? 'No refiere' : a.descripcion,
      })),
    }
    onSave(saves.saveAnamnesis, payload)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">V. Anamnesis</div>

      <Card>
        <CardHeader title="Anamnesis" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Tiempo de Enfermedad" error={errors.tiempoEnfermedad?.message}>
              <Input
                {...register('tiempoEnfermedad', {
                  maxLength: { value: 24, message: 'Max 24 caracteres' },
                })}
                maxLength={24}
                placeholder="Ej: 3 dias, 2 semanas"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="Forma de Inicio" error={errors.formaInicio?.message}>
              <Select {...register('formaInicio')} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {FORMA_INICIO.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>

            <FormField label="Curso" error={errors.curso?.message}>
              <Select {...register('curso')} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {CURSO.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Antecedentes Relevantes" />
        <CardBody>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', width: 180, fontSize: 13, color: 'var(--c-text-muted)' }}>Antecedente</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', width: 110, fontSize: 13, color: 'var(--c-text-muted)' }}>No refiere</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 13, color: 'var(--c-text-muted)' }}>Descripcion</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const noRefiere = watchedAntecedentes?.[index]?.noRefiere
                return (
                  <tr key={field.id} style={{ borderBottom: '1px solid var(--c-border-light, #f0f0f0)' }}>
                    <td style={{ padding: '8px 8px', fontSize: 14 }}>
                      <input type="hidden" {...register(`antecedentes.${index}.tipo`)} />
                      {field.tipo}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        {...register(`antecedentes.${index}.noRefiere`)}
                        disabled={isReadOnly}
                        style={{ width: 16, height: 16, cursor: isReadOnly ? 'default' : 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <Input
                        {...register(`antecedentes.${index}.descripcion`, {
                          validate: (value) => { // NOSONAR (S3800 RHF validate)
                            if (getValues(`antecedentes.${index}.noRefiere`)) return true
                            if (!value?.trim()) return 'La descripcion es requerida'
                            return true
                          },
                          maxLength: { value: 200, message: 'Max 200 caracteres' },
                        })}
                        maxLength={200}
                        placeholder={noRefiere ? 'No refiere' : 'Descripcion...'}
                        disabled={isReadOnly || noRefiere}
                      />
                      {errors.antecedentes?.[index]?.descripcion && (
                        <span style={{ fontSize: 12, color: 'var(--c-red)' }}>
                          {errors.antecedentes[index].descripcion.message}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveAnamnesis.isPending}>
          {saves.saveAnamnesis.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabAnamnesis.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveAnamnesis: PropTypes.shape({
      mutate: PropTypes.func,
      isPending: PropTypes.bool,
    }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
