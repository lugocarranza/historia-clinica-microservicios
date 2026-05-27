import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const DESTINO_OPCIONES = [
  'Alta medica',
  'Observacion',
  'Hospitalizacion',
  'Transferencia',
  'Alta voluntaria',
  'Fallecimiento',
]

const getDefaultValues = (data) => ({
  destino: data?.destino || '',
})

export default function TabDestino({ onSave, saves, initialData, isReadOnly = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(null) })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveDestino, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">XIV. Destino del Paciente</div>

      <Card>
        <CardHeader title="Destino del Paciente" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Destino" required error={errors.destino?.message}>
              <Select
                {...register('destino', { required: 'El destino es requerido' })}
                disabled={isReadOnly}
              >
                <option value="">— Seleccionar —</option>
                {DESTINO_OPCIONES.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveDestino.isPending}>
          {saves.saveDestino.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabDestino.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveDestino: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
