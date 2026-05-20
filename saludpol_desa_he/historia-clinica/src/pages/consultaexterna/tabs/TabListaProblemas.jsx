import { Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, useFieldArray } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { todayDateInput } from '@/utils/date'

const newRow = (n) => ({ id: null, nroProblema: n, descripcion: '', estado: 'Activo', fechaIdentificacion: '' })

const getDefaultValues = (data) => {
  const rows = (data || []).map((item, index) => ({
    id: item?.id ?? null,
    nroProblema: item?.nroProblema ?? index + 1,
    descripcion: item?.descripcion || '',
    estado: item?.estado || 'Activo',
    fechaIdentificacion: item?.fechaIdentificacion || '',
  }))

  return {
    problemas: rows.length ? rows : [newRow(1)],
  }
}

export default function TabListaProblemas({ onSave, saves, initialData, isReadOnly = false }) {
  const maxDate = todayDateInput()
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      problemas: [newRow(1)],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'problemas',
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    const rows = data.problemas.map((row, index) => ({ ...row, nroProblema: index + 1 }))
    onSave(saves.saveListaProblemas, rows)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">6. Lista de Problemas Activa</div>
      <Card>
        <CardBody noPadding>
          <table className="data-table row-top">
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: 'center' }}>N°</th>
                <th>Descripción del Problema</th>
                <th style={{ width: 150 }}>Estado</th>
                <th style={{ width: 160 }}>Fecha Identificación</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => (
                <Fragment key={field.id}>
                  {i === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          background: '#eaf5ee',
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                        }}
                      >
                        Principal
                      </td>
                    </tr>
                  )}
                  {i === 1 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                        }}
                      >
                        Secundario
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--c-primary)' }}>{i + 1}</td>
                    <td>
                      <FormField error={errors.problemas?.[i]?.descripcion?.message}>
                        <Input
                          {...register(`problemas.${i}.descripcion`, {
                            required: 'La descripción del problema es requerida',
                            maxLength: {
                              value: 500,
                              message: 'La descripción no puede exceder los 500 caracteres'
                            },
                          })}
                          maxLength={500}
                          placeholder="Describa el problema"
                          disabled={isReadOnly}
                          style={{ padding: '4px 7px', fontSize: 12 }}
                        />
                      </FormField>
                    </td>
                    <td>
                      <FormField error={errors.problemas?.[i]?.estado?.message}>
                        <Select {...register(`problemas.${i}.estado`)} disabled={isReadOnly} style={{ padding: '4px 7px', fontSize: 12 }}>
                          {['Activo', 'Resuelto', 'En seguimiento'].map((o) => <option key={o}>{o}</option>)}
                        </Select>
                      </FormField>
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
                          disabled={isReadOnly}
                          style={{ padding: '4px 7px', fontSize: 12 }}
                        />
                      </FormField>
                    </td>
                    <td>
                      {!getValues(`problemas.${i}.id`) && (
                        <Button variant="danger" size="xs" onClick={() => remove(i)} type="button" disabled={isReadOnly}>
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
          <div style={{ padding: 10 }}>
            <Button variant="secondary" size="xs" type="button" disabled={isReadOnly} onClick={() => append(newRow(fields.length + 1))}>+ Agregar Problema</Button>
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

TabListaProblemas.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveListaProblemas: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
