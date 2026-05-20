import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { Card, CardBody } from '@/components/ui/Card'
import { Select, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import VitalsGrid from '@/components/clinical/VitalsGrid'
import { getVitalFields } from '@/components/clinical/vitalFields'
import { calculateImcKgM2, toNumberOrNull } from '@/utils/number'

const CONDUCTAS = [
  { key: 'mantenerTrat', label: 'Mantener tratamiento' },
  { key: 'ajustarDosis', label: 'Ajustar dosis' },
  { key: 'cambiarEsquema', label: 'Cambiar esquema' },
  { key: 'suspenderTrat', label: 'Suspender tratamiento' },
  { key: 'nuevosEstudios', label: 'Solicitar nuevos estudios' },
  { key: 'interconsulta', label: 'Interconsulta' },
  { key: 'altaProblema', label: 'Alta de problema' },
]

const OBJECTIVE_FIELDS = getVitalFields('soap')

const getDefaultValues = (data) => ({
  subjetivo: {
    evolucion: data?.subjetivo?.evolucion || '',
    persistencia: data?.subjetivo?.persistencia || '',
    adherencia: data?.subjetivo?.adherencia || '',
    eventosAdversos: data?.subjetivo?.eventosAdversos || '',
  },
  objetivo: {
    paSistolica: data?.objetivo?.paSistolica ?? '',
    paDiastolica: data?.objetivo?.paDiastolica ?? '',
    fc: data?.objetivo?.fc ?? '',
    fr: data?.objetivo?.fr ?? '',
    temperatura: data?.objetivo?.temperatura ?? '',
    satO2: data?.objetivo?.satO2 ?? '',
    peso: data?.objetivo?.peso ?? '',
    talla: data?.objetivo?.talla ?? '',
    hallazgosFisicos: data?.objetivo?.hallazgosFisicos || '',
    resultEstudios: data?.objetivo?.resultEstudios || '',
    comparacionPrevia: data?.objetivo?.comparacionPrevia || '',
  },
  analisis: {
    evolucionEstado: data?.analisis?.evolucionEstado || '',
    diagActualizado: data?.analisis?.diagActualizado || '',
    cambiosSeveridad: data?.analisis?.cambiosSeveridad || '',
    evalTerapeutica: data?.analisis?.evalTerapeutica || '',
  },
  plan: {
    mantenerTrat: data?.plan?.mantenerTrat === 'S',
    ajustarDosis: data?.plan?.ajustarDosis === 'S',
    cambiarEsquema: data?.plan?.cambiarEsquema === 'S',
    suspenderTrat: data?.plan?.suspenderTrat === 'S',
    nuevosEstudios: data?.plan?.nuevosEstudios === 'S',
    interconsulta: data?.plan?.interconsulta === 'S',
    altaProblema: data?.plan?.altaProblema === 'S',
    detallesPlan: data?.plan?.detallesPlan || '',
  },
})

function SoapBlock({ letra, label, color, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '7px 14px', borderRadius: 'var(--radius)', background: color + '18', borderLeft: `4px solid ${color}` }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color }}>{letra}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

export default function TabSoap({ onSave, saves, initialData, isReadOnly = false }) {
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

  const objetivoValues = watch('objetivo') ?? {}
  const planValues = watch('plan') ?? {}
  const imcCalculado = calculateImcKgM2(objetivoValues.peso, objetivoValues.talla)

  const onSubmit = (data) => {
    if (isReadOnly) return
    const objetivo = {
      ...data.objetivo,
      paSistolica: toNumberOrNull(data.objetivo.paSistolica),
      paDiastolica: toNumberOrNull(data.objetivo.paDiastolica),
      fc: toNumberOrNull(data.objetivo.fc),
      fr: toNumberOrNull(data.objetivo.fr),
      temperatura: toNumberOrNull(data.objetivo.temperatura),
      satO2: toNumberOrNull(data.objetivo.satO2),
      peso: toNumberOrNull(data.objetivo.peso),
      talla: toNumberOrNull(data.objetivo.talla),
      imc: imcCalculado === '' ? null : Number(imcCalculado),
    }

    const plan = {
      ...data.plan,
      mantenerTrat: data.plan.mantenerTrat ? 'S' : 'N',
      ajustarDosis: data.plan.ajustarDosis ? 'S' : 'N',
      cambiarEsquema: data.plan.cambiarEsquema ? 'S' : 'N',
      suspenderTrat: data.plan.suspenderTrat ? 'S' : 'N',
      nuevosEstudios: data.plan.nuevosEstudios ? 'S' : 'N',
      interconsulta: data.plan.interconsulta ? 'S' : 'N',
      altaProblema: data.plan.altaProblema ? 'S' : 'N',
    }

    onSave(saves.saveSubjetivo, data.subjetivo)
    onSave(saves.saveObjetivo, objetivo)
    onSave(saves.saveAnalisis, data.analisis)
    onSave(saves.savePlan, plan)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">1. Motivo de Consulta &mdash; Metodología SOAP</div>

      <SoapBlock letra="S" label="Subjetivo" color="#1a6b3c">
        <Card><CardBody>
          <div className="form-grid" style={{ gap: 10 }}>
            <FormField label="Evolución desde última consulta" error={errors.subjetivo?.evolucion?.message}>
              <Textarea
                {...register('subjetivo.evolucion', {
                  maxLength: { value: 2000, message: 'La evolución no debe superar 2000 caracteres' }
                })}
                maxLength={2000}
                placeholder="Describa la evolución del paciente desde la última visita"
                disabled={isReadOnly}
              />
            </FormField>
            <div className="form-grid g2" style={{ gap: 10 }}>
              <FormField label="Persistencia o resolución de síntomas" error={errors.subjetivo?.persistencia?.message}>
                <Textarea
                  {...register('subjetivo.persistencia', {
                    maxLength: { value: 1000, message: 'El texto no debe superar 1000 caracteres' }
                  })}
                  maxLength={1000}
                  rows={2}
                  disabled={isReadOnly}
                />
              </FormField>
              <FormField label="Adherencia al tratamiento" error={errors.subjetivo?.adherencia?.message}>
                <Textarea
                  {...register('subjetivo.adherencia', {
                    maxLength: { value: 1000, message: 'El texto no debe superar 1000 caracteres' }
                  })}
                  maxLength={1000}
                  rows={2}
                  disabled={isReadOnly}
                />
              </FormField>
            </div>
            <FormField label="Eventos adversos" error={errors.subjetivo?.eventosAdversos?.message}>
              <Textarea {...register('subjetivo.eventosAdversos', { maxLength: { value: 1000, message: 'El texto no debe superar 1000 caracteres' } })} maxLength={1000} rows={2} disabled={isReadOnly} />
            </FormField>
          </div>
        </CardBody></Card>
      </SoapBlock>

      <SoapBlock letra="O" label="Objetivo" color="#0056b3">
        <Card><CardBody>
          <div style={{ marginBottom: 10 }}>
            <VitalsGrid
              fields={OBJECTIVE_FIELDS}
              register={register}
              errors={errors.objetivo}
              values={objetivoValues}
              imcValue={imcCalculado}
              fieldPrefix="objetivo"
              isReadOnly={isReadOnly}
            />
          </div>
          <div className="form-grid g2" style={{ gap: 10 }}>
            <FormField label="Hallazgos físicos relevantes" error={errors.objetivo?.hallazgosFisicos?.message}>
              <Textarea
                {...register('objetivo.hallazgosFisicos', {
                  maxLength: { value: 2000, message: 'Los hallazgos no deben superar 2000 caracteres' }
                })}
                maxLength={2000}
                rows={3}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Resultados de estudios solicitados" error={errors.objetivo?.resultEstudios?.message}>
              <Textarea
                {...register('objetivo.resultEstudios', {
                  maxLength: { value: 2000, message: 'Los resultados no deben superar 2000 caracteres' }
                })}
                maxLength={2000}
                rows={3}
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </CardBody></Card>
      </SoapBlock>

      <SoapBlock letra="A" label="Análisis / Evaluación" color="#b85000">
        <Card><CardBody>
          <div className="form-grid g2" style={{ gap: 10 }}>
            <FormField label="Evolución del cuadro" error={errors.analisis?.evolucionEstado?.message}>
              <Select {...register('analisis.evolucionEstado', { required: 'Seleccione la evolución del cuadro' })} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {['Mejoría', 'Igual', 'Peor', 'Resuelto'].map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
            <FormField label="Diagnóstico actualizado (CIE-10)" error={errors.analisis?.diagActualizado?.message}>
              <Textarea
                {...register('analisis.diagActualizado', {
                  maxLength: { value: 500, message: 'El diagnóstico no debe superar 500 caracteres' }
                })}
                maxLength={500}
                rows={2}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Cambios en severidad" error={errors.analisis?.cambiosSeveridad?.message}>
              <Textarea
                {...register('analisis.cambiosSeveridad', {
                  maxLength: { value: 500, message: 'El texto no debe superar 500 caracteres' }
                })}
                maxLength={500}
                rows={2}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Evaluación de respuesta terapéutica" error={errors.analisis?.evalTerapeutica?.message}>
              <Textarea
                {...register('analisis.evalTerapeutica', {
                  maxLength: { value: 500, message: 'El texto no debe superar 500 caracteres' }
                })}
                maxLength={500}
                rows={2}
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </CardBody></Card>
      </SoapBlock>

      <SoapBlock letra="P" label="Plan" color="#c0001a">
        <Card><CardBody>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Conducta terapéutica</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
              {CONDUCTAS.map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--radius)', border: `1.5px solid ${planValues[key] ? 'var(--c-primary)' : 'var(--border)'}`, background: planValues[key] ? 'var(--c-primary-pale)' : 'white', fontWeight: planValues[key] ? 600 : 400, transition: 'all .15s' }}>
                  <input {...register(`plan.${key}`)} type="checkbox" disabled={isReadOnly} style={{ accentColor: 'var(--c-primary)', width: 14, height: 14 }} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <FormField label="Detalles del Plan" error={errors.plan?.detallesPlan?.message}>
            <Textarea
              {...register('plan.detallesPlan', {
                maxLength: { value: 2000, message: 'Los detalles del plan no deben superar 2000 caracteres' },
              })}
              rows={3}
              placeholder="Detalle las indicaciones, ajustes o nuevas indicaciones del plan terapéutico"
              maxLength={2000}
              disabled={isReadOnly}
            />
          </FormField>
        </CardBody></Card>
      </SoapBlock>

      {!isReadOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button type="submit" disabled={saves.savePlan.isPending || saves.saveSubjetivo.isPending || saves.saveObjetivo.isPending || saves.saveAnalisis.isPending}>
            Guardar SOAP
          </Button>
        </div>
      )}
    </form>
  )
}

TabSoap.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveSubjetivo: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
    saveObjetivo: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
    saveAnalisis: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
    savePlan: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.shape({
    subjetivo: PropTypes.object,
    objetivo: PropTypes.object,
    analisis: PropTypes.object,
    plan: PropTypes.object,
  }),
  isReadOnly: PropTypes.bool,
}

SoapBlock.propTypes = {
  letra: PropTypes.string,
  label: PropTypes.string,
  color: PropTypes.string,
  children: PropTypes.node,
}
