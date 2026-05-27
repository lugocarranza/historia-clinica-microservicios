import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const getDefaultValues = (data) => ({
  medicoTratante:   data?.medicoTratante   || '',
  medicoCmp:        data?.medicoCmp        || '',
  medicoRne:        data?.medicoRne        || '',
  firmaDigital:     data?.firmaDigital     || '',
  pacienteResponsable: data?.pacienteResponsable || '',
  respDni:          data?.respDni          || '',
  fechaHoraFirma:   data?.fechaHoraFirma   || '',
})

export default function TabAuditoria({ onSave, saves, initialData, isReadOnly = false }) {
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
    onSave(saves.saveAuditoria, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">XV. Registro de Auditoria</div>

      <Card>
        <CardHeader title="Firmas" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Medico Tratante" error={errors.medicoTratante?.message}>
              <Input
                {...register('medicoTratante', {
                  maxLength: { value: 300, message: 'Max 300 caracteres' },
                })}
                maxLength={300}
                placeholder="Apellidos y nombres"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="CMP" error={errors.medicoCmp?.message}>
              <Input
                {...register('medicoCmp', {
                  maxLength: { value: 10, message: 'Max 10 caracteres' },
                })}
                maxLength={10}
                placeholder="CMP"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="RNE" error={errors.medicoRne?.message}>
              <Input
                {...register('medicoRne', {
                  maxLength: { value: 10, message: 'Max 10 caracteres' },
                })}
                maxLength={10}
                placeholder="RNE"
                disabled={isReadOnly}
              />
            </FormField>
          </div>

          <FormField label="Firma" error={errors.firmaDigital?.message} style={{ marginTop: 12 }}>
            <Textarea
              {...register('firmaDigital', {
                maxLength: { value: 300, message: 'Max 300 caracteres' },
              })}
              maxLength={300}
              rows={4}
              placeholder="Firma del medico tratante"
              disabled={isReadOnly}
            />
          </FormField>

          <div className="form-grid g3" style={{ marginTop: 12 }}>
            <FormField label="Paciente / Responsable" error={errors.pacienteResponsable?.message}>
              <Input
                {...register('pacienteResponsable', {
                  maxLength: { value: 300, message: 'Max 300 caracteres' },
                })}
                maxLength={300}
                placeholder="Apellidos y nombres"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="DNI del responsable" error={errors.respDni?.message}>
              <Input
                {...register('respDni', {
                  maxLength: { value: 8, message: 'Max 8 caracteres' },
                  pattern: { value: /^\d*$/, message: 'Solo se permiten numeros' },
                })}
                maxLength={8}
                inputMode="numeric"
                placeholder="12345678"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="Fecha y Hora de Firma" error={errors.fechaHoraFirma?.message}>
              <Input
                type="datetime-local"
                {...register('fechaHoraFirma')}
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveAuditoria.isPending}>
          {saves.saveAuditoria.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabAuditoria.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveAuditoria: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
