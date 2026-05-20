import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, useFieldArray } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const newRow = () => ({ id: null, tipo: 'Laboratorio', descripcion: '', prioridad: 'Normal', observaciones: '' })

const MAX_LENGTHS = {
  descripcion: 300,
  observaciones: 500,
}

const getDefaultValues = (data) => {
  const rows = (data || []).map((item) => ({
    id: item?.id ?? null,
    tipo: item?.tipo || 'Laboratorio',
    descripcion: item?.descripcion || '',
    prioridad: item?.prioridad || 'Normal',
    observaciones: item?.observaciones || '',
  }))

  return {
    solicitudes: rows.length ? rows : [newRow()],
  }
}

export default function TabSolicitudesApoyo({ onSave, saves, initialData, isReadOnly = false }) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      solicitudes: [newRow()],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'solicitudes',
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveSolicitudesApoyo, data.solicitudes)
  }

  const prioridadColor = (p) => {
    if (p === 'Urgente') return '#fff3e8'
    if (p === 'Emergencia') return '#fdeef0'
    return 'white'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">9. Solicitudes de Apoyo Diagnóstico</div>
      <Card>
        <CardBody noPadding>
          <table className="data-table row-top">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Tipo</th>
                <th>Descripción / Examen</th>
                <th style={{ width: 120 }}>Prioridad</th>
                <th>Observaciones</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => (
                <tr key={field.id}>
                  <td>
                    <FormField error={errors.solicitudes?.[i]?.tipo?.message}>
                      <Select {...register(`solicitudes.${i}.tipo`)} disabled={isReadOnly} style={{ padding: '4px 7px', fontSize: 12 }}>
                      {['Laboratorio', 'Imagen', 'Interconsulta', 'Procedimiento'].map((o) => <option key={o}>{o}</option>)}
                      </Select>
                    </FormField>
                  </td>
                  <td>
                    <FormField error={errors.solicitudes?.[i]?.descripcion?.message}>
                      <Input
                        {...register(`solicitudes.${i}.descripcion`, {
                          required: 'La descripción es requerida',
                          maxLength: {
                            value: MAX_LENGTHS.descripcion,
                            message: `La descripción no debe superar ${MAX_LENGTHS.descripcion} caracteres`,
                          },
                        })}
                        maxLength={MAX_LENGTHS.descripcion}
                        placeholder="Hemograma completo, Rx Tórax..."
                        disabled={isReadOnly}
                        style={{ padding: '4px 7px', fontSize: 12 }}
                      />
                    </FormField>
                  </td>
                  <td>
                    <FormField error={errors.solicitudes?.[i]?.prioridad?.message}>
                      <Select
                        {...register(`solicitudes.${i}.prioridad`)}
                        disabled={isReadOnly}
                        style={{ background: prioridadColor(field.prioridad), fontWeight: 600, padding: '4px 7px', fontSize: 12 }}>
                      {['Normal', 'Urgente', 'Emergencia'].map((o) => <option key={o}>{o}</option>)}
                      </Select>
                    </FormField>
                  </td>
                  <td>
                    <FormField error={errors.solicitudes?.[i]?.observaciones?.message}>
                      <Input
                        {...register(`solicitudes.${i}.observaciones`, {
                          maxLength: {
                            value: MAX_LENGTHS.observaciones,
                            message: `Las observaciones no deben superar ${MAX_LENGTHS.observaciones} caracteres`,
                          },
                        })}
                        maxLength={MAX_LENGTHS.observaciones}
                        disabled={isReadOnly}
                        style={{ padding: '4px 7px', fontSize: 12 }}
                      />
                    </FormField>
                  </td>
                  <td>
                    {!getValues(`solicitudes.${i}.id`) && (
                      <Button variant="danger" size="xs" type="button" disabled={isReadOnly} onClick={() => remove(i)}><Trash2 size={12} /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: 10 }}>
            <Button variant="secondary" size="xs" type="button" disabled={isReadOnly} onClick={() => append(newRow())}>
              + Agregar Solicitud
            </Button>
          </div>
        </CardBody>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveSolicitudesApoyo.isPending}>
          {saves.saveSolicitudesApoyo.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabSolicitudesApoyo.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveSolicitudesApoyo: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
