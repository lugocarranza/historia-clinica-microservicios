import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import PropTypes from 'prop-types'
import { Trash2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { todayDateInput } from '@/utils/date'

const newRow = (n) => ({ id: null, nroProblema: n, descripcion: '', tipo: 'Nuevo', estado: 'Activo', fechaIdentificacion: '' })

const getDefaultValues = (data) => {
  const rows = (data || []).map((item, index) => ({
    id: item?.id ?? null,
    nroProblema: item?.nroProblema ?? index + 1,
    descripcion: item?.descripcion || '',
    tipo: item?.tipo || 'Nuevo',
    estado: item?.estado || 'Activo',
    fechaIdentificacion: item?.fechaIdentificacion || '',
  }))
  return { problemas: rows.length ? rows : [newRow(1), newRow(2)] }
}

export default function TabListaProblemasCC({ onSave, saves, initialData, isReadOnly = false }) {
  const maxDate = todayDateInput()
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(null),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'problemas',
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    const problemas = data.problemas.map((row, index) => ({
      ...row,
      nroProblema: index + 1,
    }))
    onSave(saves.saveListaProblemas, problemas)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">2. Lista Actualizada de Problemas</div>
      <Card>
        <CardBody noPadding>
          <table className="data-table row-top">
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: 'center' }}>N°</th>
                <th>Problema</th>
                <th style={{ width: 110 }}>Tipo</th>
                <th style={{ width: 160 }}>Estado</th>
                <th style={{ width: 150 }}>Fecha Identificación</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => (
                <tr key={field.id} style={{ background: field.tipo === 'Nuevo' ? '#fffbeb' : 'white' }}>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--c-primary)', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                  <td>
                    <FormField error={errors.problemas?.[i]?.descripcion?.message}>
                      <Input
                        {...register(`problemas.${i}.descripcion`, {
                          required: 'La descripción del problema es requerida',
                          maxLength: { value: 500, message: 'La descripción no debe superar 500 caracteres' },
                        })}
                        maxLength={500}
                        placeholder="Describa el problema"
                        disabled={isReadOnly}
                        style={{ padding: '4px 7px', fontSize: 12 }}
                      />
                    </FormField>
                  </td>
                  <td>
                    <Select {...register(`problemas.${i}.tipo`)} disabled={isReadOnly} style={{ padding: '4px 7px', fontSize: 12 }}>
                      {['Nuevo', 'Conocido'].map((o) => <option key={o}>{o}</option>)}
                    </Select>
                  </td>
                  <td>
                    <Select {...register(`problemas.${i}.estado`)} disabled={isReadOnly} style={{ padding: '4px 7px', fontSize: 12 }}>
                      {['Activo', 'En seguimiento', 'Resuelto', 'Crónico controlado'].map((o) => <option key={o}>{o}</option>)}
                    </Select>
                  </td>
                  <td>
                    <FormField error={errors.problemas?.[i]?.fechaIdentificacion?.message}>
                      <Input
                        type="date"
                        {...register(`problemas.${i}.fechaIdentificacion`, {
                          validate: (value) => (
                            value && value > maxDate
                              ? 'La fecha de identificación no puede ser futura'
                              : true
                          ),
                        })}
                        max={maxDate}
                        style={{ padding: '4px 7px', fontSize: 12 }}
                      />
                    </FormField>
                  </td>
                  <td>
                    {!getValues(`problemas.${i}.id`) && !isReadOnly && (
                      <Button variant="danger" size="xs" type="button" onClick={() => remove(i)}>
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: 10 }}>
            <Button variant="secondary" size="xs" type="button" disabled={isReadOnly} onClick={() => append(newRow(fields.length + 1))}>
              + Agregar Problema
            </Button>
          </div>
        </CardBody>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveListaProblemas.isPending}>
          {saves.saveListaProblemas.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabListaProblemasCC.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveListaProblemas: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
