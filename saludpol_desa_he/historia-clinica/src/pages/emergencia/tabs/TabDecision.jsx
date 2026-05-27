import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const DECISIONES = ['Alta', 'Observacion', 'Hospitalizacion', 'UCI', 'Referencia']

const getDefaultValues = (data) => ({
  decision:      data?.decision      || '',
  justificacion: data?.justificacion || '',
})

export default function TabDecision({ onSave, saves, initialData, isReadOnly = false }) {
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
    onSave(saves.saveDecision, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">VIII. Decision Clinica</div>

      <Card>
        <CardHeader title="Decision Clinica" />
        <CardBody>
          <FormField label="Decision" required error={errors.decision?.message}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {DECISIONES.map((opcion) => (
                <label
                  key={opcion}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isReadOnly ? 'default' : 'pointer' }}
                >
                  <input
                    type="radio"
                    value={opcion}
                    {...register('decision', { required: 'La decision es requerida' })}
                    disabled={isReadOnly}
                    style={{ accentColor: 'var(--c-primary)', width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: 14 }}>{opcion}</span>
                </label>
              ))}
            </div>
            {errors.decision && (
              <span style={{ fontSize: 12, color: 'var(--c-error)', marginTop: 4, display: 'block' }}>
                {errors.decision.message}
              </span>
            )}
          </FormField>

          <FormField
            label="Justificacion clinica obligatoria"
            required
            error={errors.justificacion?.message}
            style={{ marginTop: 12 }}
          >
            <Textarea
              {...register('justificacion', {
                required: 'La justificacion es requerida',
                maxLength: { value: 300, message: 'Max 300 caracteres' },
              })}
              maxLength={300}
              rows={4}
              disabled={isReadOnly}
            />
          </FormField>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveDecision.isPending}>
          {saves.saveDecision.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabDecision.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveDecision: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
