import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const CONDICION_OPCIONES = ['Estable', 'Inestable', 'Critico', 'Fallecido']
const DESTINO_OPCIONES = [
  'Alta medica',
  'Observacion',
  'Hospitalizacion',
  'Transferencia',
  'Alta voluntaria',
  'Fallecimiento',
]

const getDefaultValues = (condicion, destino) => ({
  condicion: condicion || '',
  destino: destino || '',
})

export default function TabCierre({ onSave, saves, condicion: condicionProp, destino: destinoProp, isReadOnly = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(null, null) })

  useEffect(() => {
    reset(getDefaultValues(condicionProp, destinoProp))
  }, [condicionProp, destinoProp, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    if (data.condicion) {
      saves.saveCondicion.mutate({ condicion: data.condicion })
    }
    onSave(saves.saveDestino, { destino: data.destino })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">XIV. Destino y Condicion</div>

      <Card>
        <CardHeader title="Destino y Condicion del Paciente" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Condicion Clinica" error={errors.condicion?.message}>
              <Select {...register('condicion')} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {CONDICION_OPCIONES.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
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

TabCierre.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveCondicion: PropTypes.shape({ mutate: PropTypes.func }),
    saveDestino: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  condicion: PropTypes.string,
  destino: PropTypes.string,
  isReadOnly: PropTypes.bool,
}
