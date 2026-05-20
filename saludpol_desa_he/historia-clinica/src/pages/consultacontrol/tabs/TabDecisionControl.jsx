import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const OPCIONES = ['Alta', 'Continúa seguimiento de control ambulatorio', 'Referencia', 'Hospitalización']

const getDefaultValues = (data) => ({
  decision: data?.decision || 'Continúa seguimiento de control ambulatorio',
  refPnpIpress: data?.refPnpIpress || '',
  refPnpMotivo: data?.refPnpMotivo || '',
  refNopnpIpress: data?.refNopnpIpress || '',
  refNopnpMotivo: data?.refNopnpMotivo || '',
  profNombres: data?.profNombres || '',
  profDocIdent: data?.profDocIdent || '',
  profColegiatura: data?.profColegiatura || '',
  profRegEspecialidad: data?.profRegEspecialidad || '',
  fechaCierre: data?.fechaCierre || new Date().toISOString().slice(0, 16),
})

export default function TabDecisionControl({ onSave, saves, initialData, isReadOnly = false }) {
  const [pendingData, setPendingData] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(null),
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const decision = watch('decision')
  const decisionRegister = register('decision', {
    required: 'La decisión clínica es requerida',
  })
  const handleSave = (data) => setPendingData(data)

  const handleConfirm = () => {
    onSave(saves.saveDecisionControl, pendingData)
    setPendingData(null)
  }
  const profDocIdentRegister = register('profDocIdent', {
    required: 'El documento es requerido',
    maxLength: {
      value: 12,
      message: 'El documento no debe superar 12 caracteres',
    },
    validate: (value) => /^\d*$/.test(value || '') || 'El documento debe contener solo números',
  })
  const profColegiaturaRegister = register('profColegiatura', {
    required: 'La colegiatura es requerida',
    maxLength: {
      value: 6,
      message: 'La colegiatura no debe superar 6 caracteres',
    },
    validate: (value) => /^\d*$/.test(value || '') || 'La colegiatura debe contener solo números',
  })
  const profRegEspecialidadRegister = register('profRegEspecialidad', {
    required: 'El registro de especialidad es requerido',
    maxLength: {
      value: 5,
      message: 'El registro de especialidad no debe superar 5 caracteres',
    },
    validate: (value) => /^\d*$/.test(value || '') || 'El registro de especialidad debe contener solo números',
  })

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <div className="section-div">5. Decisión Clínica</div>
      <Card>
        <CardHeader title="Conducta Final" />
        <CardBody>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Seleccione la conducta final
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {OPCIONES.map((op) => (
                <label
                  key={op}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    border: `2px solid ${decision === op ? 'var(--c-primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    cursor: isReadOnly ? 'default' : 'pointer',
                    background: decision === op ? 'var(--c-primary)' : 'white',
                    color: decision === op ? 'white' : 'var(--text-mid)',
                    fontWeight: decision === op ? 700 : 400,
                    fontSize: 13,
                    transition: 'all .15s',
                    opacity: isReadOnly ? 0.85 : 1,
                  }}
                >
                  <input type="radio" value={op} {...decisionRegister} disabled={isReadOnly} style={{ display: 'none' }} />
                  {op}
                </label>
              ))}
            </div>
            {errors.decision?.message && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-red)' }}>{errors.decision.message}</div>
            )}
          </div>
          {decision === 'Referencia' && (
            <div style={{ background: 'var(--c-primary-faint)', border: '1px solid var(--c-primary-pale)', borderRadius: 'var(--radius)', padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-primary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>Datos de Referencia</div>
              <div className="form-grid g2" style={{ gap: 10 }}>
                <FormField label="IPRESS PNP Destino" error={errors.refPnpIpress?.message}>
                  <Input
                    {...register('refPnpIpress', {
                      validate: (value) => decision !== 'Referencia' || value?.trim() ? true : 'La IPRESS PNP destino es requerida',
                    })}
                    placeholder="Nombre de la IPRESS PNP"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label="Motivo (IPRESS PNP)" error={errors.refPnpMotivo?.message}>
                  <Input
                    {...register('refPnpMotivo', {
                      validate: (value) => decision !== 'Referencia' || value?.trim() ? true : 'El motivo es requerido',
                    })}
                    placeholder="Motivo clínico"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label="IPRESS No PNP Destino" error={errors.refNopnpIpress?.message}>
                  <Input
                    {...register('refNopnpIpress', {
                      validate: (value) => decision !== 'Referencia' || value?.trim() ? true : 'La IPRESS No PNP destino es requerida',
                    })}
                    placeholder="Nombre de la IPRESS No PNP"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label="Motivo (IPRESS No PNP)" error={errors.refNopnpMotivo?.message}>
                  <Input
                    {...register('refNopnpMotivo', {
                      validate: (value) => decision !== 'Referencia' || value?.trim() ? true : 'El motivo es requerido',
                    })}
                    placeholder="Motivo clínico"
                    disabled={isReadOnly}
                  />
                </FormField>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="highlight-block green" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 12.5, color: '#166534', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>Profesional Tratante</div>
        <div className="form-grid g3" style={{ gap: 10 }}>
          <div style={{ gridColumn: '1/3' }}>
            <FormField label="Nombres y Apellidos" error={errors.profNombres?.message}>
              <Input
                {...register('profNombres', {
                  required: 'El nombre del profesional es requerido',
                  maxLength: {
                    value: 70,
                    message: 'El nombre del profesional no debe superar 70 caracteres',
                  },
                  pattern: {
                    value: /^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                    message: 'El nombre solo puede contener letras y espacios',
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replaceAll(/[^A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
                  },
                })}
                maxLength={70}
                placeholder="Apellidos y Nombres completos"
                disabled={isReadOnly}
              />
            </FormField>
          </div>
          <FormField label="Doc. de Identidad" error={errors.profDocIdent?.message}>
            <Input
              {...profDocIdentRegister}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="DNI"
              disabled={isReadOnly}
              onChange={(event) => {
                const soloDigitos = event.target.value.replaceAll(/\D/g, '').slice(0, 8)
                event.target.value = soloDigitos
                profDocIdentRegister.onChange(event)
              }}
            />
          </FormField>
          <FormField label="N° Colegiatura" error={errors.profColegiatura?.message}>
            <Input
              {...profColegiaturaRegister}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              disabled={isReadOnly}
              onChange={(event) => {
                const soloDigitos = event.target.value.replaceAll(/\D/g, '').slice(0, 8)
                event.target.value = soloDigitos
                profColegiaturaRegister.onChange(event)
              }}
            />
          </FormField>
          <FormField label="Registro Especialidad" error={errors.profRegEspecialidad?.message}>
            <Input
              {...profRegEspecialidadRegister}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              placeholder="00000"
              disabled={isReadOnly}
              onChange={(event) => {
                const soloDigitos = event.target.value.replaceAll(/\D/g, '').slice(0, 8)
                event.target.value = soloDigitos
                profRegEspecialidadRegister.onChange(event)
              }}
            />
          </FormField>
          <FormField label="Fecha y Hora de Cierre" error={errors.fechaCierre?.message}>
            <Input
              type="datetime-local"
              {...register('fechaCierre', {
                required: 'La fecha de cierre es requerida',
              })}
              disabled={isReadOnly}
            />
          </FormField>
        </div>
      </div>

      {!isReadOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          {pendingData ? (
            <ConfirmDialog
              message="Una vez cerrado el control no podrá modificarse."
              detail="Verifique que todos los datos sean correctos antes de continuar."
              confirmLabel="Confirmar cierre"
              onConfirm={handleConfirm}
              onCancel={() => setPendingData(null)}
              isLoading={saves.saveDecisionControl.isPending}
            />
          ) : (
            <Button type="submit" disabled={saves.saveDecisionControl.isPending}>
              {saves.saveDecisionControl.isPending ? 'Cerrando control...' : 'Cerrar Control'}
            </Button>
          )}
        </div>
      )}
    </form>
  )
}

TabDecisionControl.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveDecisionControl: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
