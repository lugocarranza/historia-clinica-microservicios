import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const MAX = 300

const getDefaultValues = (data) => ({
  laboratorio:        data?.laboratorio        || '',
  imagenes:           data?.imagenes           || '',
  otros:              data?.otros              || '',
  justificacionMedica: data?.justificacionMedica || '',
})

export default function TabApoyoDiag({ onSave, saves, initialData, isReadOnly = false }) {
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
    onSave(saves.saveApoyoDiag, data)
  }

  const field = (name, label) => (
    <FormField label={label} error={errors[name]?.message}>
      <Textarea
        {...register(name, { maxLength: { value: MAX, message: `Max ${MAX} caracteres` } })}
        maxLength={MAX}
        rows={3}
        disabled={isReadOnly}
      />
    </FormField>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">IX. Apoyo Diagnostico</div>

      <Card>
        <CardHeader title="Apoyo Diagnostico Solicitado" />
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {field('laboratorio', 'Laboratorio')}
            {field('imagenes', 'Imagenes (RX / ECO / TAC / RM)')}
            {field('otros', 'Otros')}
            {field('justificacionMedica', 'Justificacion medica')}
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveApoyoDiag.isPending}>
          {saves.saveApoyoDiag.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabApoyoDiag.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveApoyoDiag: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
