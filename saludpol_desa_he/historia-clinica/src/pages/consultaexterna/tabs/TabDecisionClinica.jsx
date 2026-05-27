import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { todayDateInput } from '@/utils/date'
import { useAuthStore } from '@/store/authStore'
import { useIpressFromUser } from '@/hooks/useIpressFromUser'
import { useProfesionalSalud } from '@/hooks/useProfesionalSalud'

const OPCIONES_ALTA = ['Alta con cita', 'Alta sin cita', 'Hospitalización', 'Referencia', 'Contra-referencia', 'Emergencia']

const MAX_LENGTHS = {
  especialidadRef: 100,
  planManejo: 2000,
  pronostico: 1000,
  observaciones: 1000,
  medicoNombre: 70,
  medicoCmp: 6,
  // firmaDigital: 100,
}

const buildMedicoNombre = (user) => {
  if (!user) return ''
  return `${user.apellidoPaterno || ''} ${user.apellidoMaterno || ''} ${user.nombres || ''}`.trim().toUpperCase()
}

const getDefaultValues = (data, user, ipressData, profesional) => ({
  decisionAlta: data?.decisionAlta || '',
  fechaProximaCita: data?.fechaProximaCita || '',
  especialidadRef: data?.especialidadRef || '',
  planManejo: data?.planManejo || '',
  pronostico: data?.pronostico || '',
  observaciones: data?.observaciones || '',
  medicoNombre: data?.medicoNombre || buildMedicoNombre(user),
  medicoCmp: data?.medicoCmp || profesional?.numeroColegiatura || '',
  ipressCui: data?.ipressCui || ipressData?.ipressCui || '',
})

export default function TabDecisionClinica({ onSave, saves, initialData, isReadOnly = false }) {
  const minDate = todayDateInput()
  const [pendingData, setPendingData] = useState(null)
  const { user } = useAuthStore()
  const ipressData = useIpressFromUser()
  const { data: profesionalData } = useProfesionalSalud()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      decisionAlta: '',
      fechaProximaCita: '',
      especialidadRef: '',
      planManejo: '',
      pronostico: '',
      observaciones: '',
      medicoNombre: buildMedicoNombre(user),
      medicoCmp: '',
      ipressCui: '',
    },
  })

  const decisionAlta = watch('decisionAlta')

  useEffect(() => {
    reset(getDefaultValues(initialData, user, ipressData, profesionalData))
  }, [initialData, user, ipressData, profesionalData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    setPendingData(data)
  }

  const handleConfirm = () => {
    onSave(saves.saveDecisionClinica, pendingData)
    setPendingData(null)
  }

  const profCmpRegister = register('medicoCmp', {
    required: 'La colegiatura es requerida',
    maxLength: {
      value: MAX_LENGTHS.medicoCmp,
      message: `La colegiatura no debe superar ${MAX_LENGTHS.medicoCmp} caracteres`,
    },
    validate: (value) => /^\d*$/.test(value || '') || 'La colegiatura debe contener solo números',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">10. Decisión Clínica</div>
      <Card>
        <CardHeader title="Conducta y Plan" />
        <CardBody>
          <div className="form-grid g3" style={{ marginBottom: 12 }}>
            <FormField label="Decisión de Alta" error={errors.decisionAlta?.message} required>
              <Select {...register('decisionAlta', { required: 'La decisión de alta es obligatoria' })} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {OPCIONES_ALTA.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
            <FormField label="Fecha Próxima Cita" error={errors.fechaProximaCita?.message}>
              <Input
                type="date"
                min={minDate}
                {...register('fechaProximaCita', {
                  validate: (value) => {
                    const errorRequerido = decisionAlta === 'Alta con cita' && !value ? 'La fecha de próxima cita es obligatoria para Alta con cita' : null
                    const errorPasado = value && value < minDate ? 'La fecha de próxima cita no puede ser una fecha pasada' : null
                    return errorRequerido || errorPasado || true
                  },
                })}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Especialidad de Referencia" error={errors.especialidadRef?.message} required>
              <Input
                {...register('especialidadRef', {
                  required: 'La especialidad es obligatoria',
                  maxLength: {
                    value: MAX_LENGTHS.especialidadRef,
                    message: `La especialidad de referencia no debe superar ${MAX_LENGTHS.especialidadRef} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.especialidadRef}
                placeholder="Si aplica"
                disabled={isReadOnly}
              />
            </FormField>
          </div>
          <div className="form-grid" style={{ gap: 10 }}>
            <FormField label="Plan de Manejo" error={errors.planManejo?.message} required>
              <Textarea
                rows={3}
                {...register('planManejo', {
                  required: 'El plan de manejo es obligatorio',
                  maxLength: {
                    value: MAX_LENGTHS.planManejo,
                    message: `El plan de manejo no debe superar ${MAX_LENGTHS.planManejo} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.planManejo}
                placeholder="Describir el plan integral de manejo"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Pronóstico" error={errors.pronostico?.message} required>
              <Textarea
                rows={2}
                {...register('pronostico', {
                  required: 'El pronóstico es obligatorio',
                  maxLength: {
                    value: MAX_LENGTHS.pronostico,
                    message: `El pronóstico no debe superar ${MAX_LENGTHS.pronostico} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.pronostico}
                placeholder="Pronóstico del paciente"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Observaciones Finales" error={errors.observaciones?.message} required>
              <Textarea
                rows={2}
                {...register('observaciones', {
                  required: 'Las observaciones son obligatorias',
                  maxLength: {
                    value: MAX_LENGTHS.observaciones,
                    message: `Las observaciones no deben superar ${MAX_LENGTHS.observaciones} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.observaciones}
                placeholder="Observaciones adicionales del médico"
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Validación del Médico" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Médico Responsable" error={errors.medicoNombre?.message} required>
              <Input
                {...register('medicoNombre', {
                  required: 'El médico responsable es requerido',
                  maxLength: {
                    value: MAX_LENGTHS.medicoNombre,
                    message: `El médico responsable no debe superar ${MAX_LENGTHS.medicoNombre} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.medicoNombre}
                placeholder="Apellidos y Nombres"
                disabled
              />
            </FormField>
            <FormField label="CMP / N° Colegiatura" error={errors.medicoCmp?.message} required>
              <Input
                {...profCmpRegister}
                maxLength={MAX_LENGTHS.medicoCmp}
                placeholder="000000"
                disabled={isReadOnly || !!profesionalData}
                onChange={(event) => {
                  const soloDigitos = event.target.value.replaceAll(/\D/g, '').slice(0, 8)
                  event.target.value = soloDigitos
                  profCmpRegister.onChange(event)
                }}
              />
            </FormField>
            <FormField hidden label="CUI IPRESS">
              <Input {...register('ipressCui')} disabled placeholder="Cargando..." />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        {pendingData ? (
          <ConfirmDialog
            message="Una vez cerrada la consulta no podrá modificarse."
            detail="Verifique que todos los datos sean correctos antes de continuar."
            confirmLabel="Confirmar cierre"
            onConfirm={handleConfirm}
            onCancel={() => setPendingData(null)}
            isLoading={saves.saveDecisionClinica.isPending}
          />
        ) : (
          <Button type="submit" disabled={isReadOnly || saves.saveDecisionClinica.isPending}>
            {saves.saveDecisionClinica.isPending ? 'Cerrando consulta...' : 'Cerrar Consulta'}
          </Button>
        )}
      </div>
    </form>
  )
}

TabDecisionClinica.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveDecisionClinica: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
