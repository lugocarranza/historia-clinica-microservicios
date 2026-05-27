import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import SolicitudApoyoCascade from '@/components/clinical/SolicitudApoyoCascade'

const newRow = () => ({
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

const getDefaultValues = (data) => {
  const rows = (data || []).map((item) => ({
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
  return { solicitudes: rows.length ? rows : [newRow()] }
}

const prioridadColor = (p) => {
  if (p === 'Urgente') return '#fff3e8'
  if (p === 'Emergencia') return '#fdeef0'
  return 'white'
}

export default function TabSolicitudesApoyo({ onSave, saves, initialData, isReadOnly = false }) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { solicitudes: [newRow()] } })

  const { fields, append, remove } = useFieldArray({ control, name: 'solicitudes' })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveSolicitudesApoyo, data.solicitudes)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">9. Solicitudes de Apoyo Diagnóstico</div>

      {fields.map((field, i) => {
        const prioridad = watch(`solicitudes.${i}.prioridad`)
        return (
          <Card key={field.id} style={{ marginBottom: 10, borderLeft: `4px solid ${prioridadColor(prioridad) === 'white' ? '#e5e7eb' : prioridadColor(prioridad)}` }}>
            <CardHeader
              title={`Solicitud ${i + 1}`}
              actions={
                !getValues(`solicitudes.${i}.id`) && !isReadOnly ? (
                  <Button variant="danger" size="xs" type="button" onClick={() => remove(i)}>
                    <Trash2 size={12} />
                  </Button>
                ) : null
              }
            />
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Cascada de sub-tipos + autocomplete de procedimiento */}
                <FormField label="Tipo / Procedimiento" error={errors.solicitudes?.[i]?.message}>
                  <Controller
                    control={control}
                    name={`solicitudes.${i}`}
                    rules={{
                      validate: (v) => (v.codigoCpms ? true : 'Seleccione un procedimiento'),
                    }}
                    render={({ field: { value, onChange } }) => (
                      <SolicitudApoyoCascade
                        value={value}
                        onChange={(newVal) => onChange({ ...value, ...newVal })}
                        isReadOnly={isReadOnly}
                      />
                    )}
                  />
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10 }}>
                  <FormField label="Prioridad" error={errors.solicitudes?.[i]?.prioridad?.message}>
                    <Select
                      {...register(`solicitudes.${i}.prioridad`)}
                      disabled={isReadOnly}
                      style={{ background: prioridadColor(prioridad), fontWeight: 600, padding: '4px 7px', fontSize: 13 }}
                    >
                      {['Normal', 'Urgente', 'Emergencia'].map((o) => <option key={o}>{o}</option>)}
                    </Select>
                  </FormField>

                  <FormField label="Observaciones" error={errors.solicitudes?.[i]?.observaciones?.message}>
                    <Input
                      {...register(`solicitudes.${i}.observaciones`, {
                        maxLength: { value: 500, message: 'Las observaciones no deben superar 500 caracteres' },
                      })}
                      maxLength={500}
                      disabled={isReadOnly}
                      style={{ padding: '4px 7px', fontSize: 13 }}
                    />
                  </FormField>
                </div>
              </div>
            </CardBody>
          </Card>
        )
      })}

      <div style={{ marginBottom: 10 }}>
        <Button variant="secondary" size="xs" type="button" disabled={isReadOnly} onClick={() => append(newRow())}>
          + Agregar Solicitud
        </Button>
      </div>

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
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
