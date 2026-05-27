import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Select, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { buscarAsegurado } from '@/api/padron'

const TIPO_COBERTURA = ['Emergencia vital', 'Emergencia no vital', 'Urgencia']
const CARTA_GARANTIA = [
  'No requiere Carta de Garantía (IPRESS de adscripción)',
  'Requiere Carta de Garantía posterior a confirmación de emergencia (Prioridad I - II)',
]

const getDefaultValues = (data) => ({
  tipoCobertura: data?.tipoCobertura || '',
  cartaGarantia: data?.cartaGarantia || '',
  elegibilidadAuto: data?.elegibilidadAuto || 'N',
  obsAdministrativa: data?.obsAdministrativa || '',
})

export default function TabAseguramiento({ onSave, saves, initialData, dniPaciente, isReadOnly = false }) {
  const [elegible, setElegible] = useState(null)   // null=pendiente, true/false=resultado
  const [checkando, setCheckando] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(null) })

  const elegibilidadAuto = watch('elegibilidadAuto')
  const esElegible = elegibilidadAuto === 'S'

  useEffect(() => {
    reset(getDefaultValues(initialData))
    if (initialData?.elegibilidadAuto) {
      setElegible(initialData.elegibilidadAuto === 'S')
    }
  }, [initialData, reset])

  // Auto-verificar elegibilidad desde padrón cuando se abre el tab y hay DNI
  useEffect(() => {
    // Solo consultar si aún no se ha guardado un valor y hay DNI disponible
    if (!dniPaciente || initialData?.elegibilidadAuto || checkando) return

    setCheckando(true)
    buscarAsegurado(dniPaciente)
      .then((data) => {
        const esActivo = data?.situacion === 'ACTIVO'
        setElegible(esActivo)
        setValue('elegibilidadAuto', esActivo ? 'S' : 'N', { shouldDirty: true })
      })
      .catch(() => {
        setElegible(false)
        setValue('elegibilidadAuto', 'N', { shouldDirty: true })
      })
      .finally(() => setCheckando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dniPaciente])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveAseguramiento, data)
  }

  let badgeElegible = null
  if (elegible === true) badgeElegible = { texto: '✓ Elegible', color: '#16a34a', bg: '#dcfce7' }
  if (elegible === false) badgeElegible = { texto: '✗ No elegible', color: '#dc2626', bg: '#fee2e2' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">III. Aseguramiento</div>

      <Card>
        <CardHeader title="Cobertura y Elegibilidad" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Tipo de Cobertura" required error={errors.tipoCobertura?.message}>
              <Select
                {...register('tipoCobertura', { required: 'El tipo de cobertura es requerido' })}
                disabled={isReadOnly}
              >
                <option value="">— Seleccionar —</option>
                {TIPO_COBERTURA.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>

            <FormField label="Carta de Garantia">
              <Select {...register('cartaGarantia')} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {CARTA_GARANTIA.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>

            {/* Elegibilidad — solo lectura, determinada automáticamente */}
            <FormField label="Validación de Elegibilidad">
              <input type="hidden" {...register('elegibilidadAuto')} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
                {checkando && (
                  <span className="help-text">Verificando con el padrón...</span>
                )}
                {!checkando && badgeElegible && (
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      padding: '4px 12px',
                      borderRadius: 6,
                      color: badgeElegible.color,
                      background: badgeElegible.bg,
                    }}
                  >
                    {badgeElegible.texto}
                  </span>
                )}
                {!checkando && elegible === null && !initialData?.elegibilidadAuto && (
                  <span className="help-text">Se verificará automáticamente al guardar</span>
                )}
              </div>
            </FormField>

            {/* Observaciones — solo aparece cuando el paciente NO es elegible */}
            {esElegible ? null : (
              <div style={{ gridColumn: '1/-1' }}>
                <FormField
                  label="Observaciones Administrativas"
                  required
                  error={errors.obsAdministrativa?.message}
                >
                  <Textarea
                    {...register('obsAdministrativa', {
                      required: 'Las observaciones son requeridas cuando el paciente no es elegible',
                      maxLength: { value: 700, message: 'Max 700 caracteres' },
                    })}
                    rows={4}
                    maxLength={700}
                    placeholder="Indique el motivo por el que el paciente no es elegible y las acciones a tomar..."
                    disabled={isReadOnly}
                  />
                </FormField>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveAseguramiento.isPending}>
          {saves.saveAseguramiento.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabAseguramiento.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveAseguramiento: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  dniPaciente: PropTypes.string,
  isReadOnly: PropTypes.bool,
}
