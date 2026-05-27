import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import VitalsGrid from '@/components/clinical/VitalsGrid'
import { getVitalFields } from '@/components/clinical/vitalFields'
import { calculateImcKgM2, toNumberOrNull } from '@/utils/number'

const VITALES = getVitalFields('exam')

const REGIONES = [
  'Aspecto General', 'Cabeza y Cuello', 'Tórax y Pulmones', 'Cardiovascular',
  'Abdomen', 'Extremidades', 'Neurológico', 'Piel y Faneras',
]

const MAX_LENGTHS = {
  hallazgos: 1000,
}

const asText = (value) => (value == null ? '' : String(value))

const getDefaultValues = (data) => {
  const regionMap = Object.fromEntries((data?.regiones || []).map((item) => [item.region, item.hallazgos || '']))

  return {
    paSistolica: asText(data?.paSistolica),
    paDiastolica: asText(data?.paDiastolica),
    fc: asText(data?.fc),
    fr: asText(data?.fr),
    temperatura: asText(data?.temperatura),
    satO2: asText(data?.satO2),
    peso: asText(data?.peso),
    talla: asText(data?.talla),
    regiones: REGIONES.map((region) => ({ region, hallazgos: regionMap[region] || '' })),
  }
}

export default function TabExamenFisico({ onSave, saves, initialData, isReadOnly = false, requiredRegions }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paSistolica: '',
      paDiastolica: '',
      fc: '',
      fr: '',
      temperatura: '',
      satO2: '',
      peso: '',
      talla: '',
      regiones: REGIONES.map((region) => ({ region, hallazgos: '' })),
    },
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const vitalValues = {
    paSistolica: watch('paSistolica'),
    paDiastolica: watch('paDiastolica'),
    fc: watch('fc'),
    fr: watch('fr'),
    temperatura: watch('temperatura'),
    satO2: watch('satO2'),
    peso: watch('peso'),
    talla: watch('talla'),
  }
  const imcCalculado = calculateImcKgM2(vitalValues.peso, vitalValues.talla)

  const handleSave = (values) => {
    if (isReadOnly) return

    const regiones = REGIONES.map((region, index) => ({
      region,
      hallazgos: values.regiones?.[index]?.hallazgos || '',
    }))

    onSave(saves.saveExamenFisico, {
      paSistolica: toNumberOrNull(values.paSistolica),
      paDiastolica: toNumberOrNull(values.paDiastolica),
      fc: toNumberOrNull(values.fc),
      fr: toNumberOrNull(values.fr),
      temperatura: toNumberOrNull(values.temperatura),
      satO2: toNumberOrNull(values.satO2),
      peso: toNumberOrNull(values.peso),
      talla: toNumberOrNull(values.talla),
      imc: imcCalculado === '' ? null : Number(imcCalculado),
      regiones,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <div className="section-div">5. Examen Físico</div>
      <Card>
        <CardHeader title="Signos Vitales y Antropometría" />
        <CardBody>
          <VitalsGrid
            fields={VITALES}
            register={register}
            errors={errors}
            values={vitalValues}
            imcValue={imcCalculado}
            isReadOnly={isReadOnly}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Hallazgos por Región" />
        <CardBody>
          <div className="form-grid g2" style={{ gap: 10 }}>
            {REGIONES.map((region, i) => {
              if (requiredRegions?.size > 0 && region !== 'Aspecto General' && !requiredRegions.has(region)) return null
              return (
                <FormField key={region} label={region} error={errors.regiones?.[i]?.hallazgos?.message}>
                  <Input
                    {...register(`regiones.${i}.hallazgos`, {
                      maxLength: {
                        value: MAX_LENGTHS.hallazgos,
                        message: `Los hallazgos no deben superar ${MAX_LENGTHS.hallazgos} caracteres`,
                      },
                    })}
                    maxLength={MAX_LENGTHS.hallazgos}
                    placeholder={`Hallazgos en ${region.toLowerCase()}`}
                    disabled={isReadOnly}
                  />
                </FormField>
              )
            })}
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveExamenFisico.isPending}>
          {saves.saveExamenFisico.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabExamenFisico.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveExamenFisico: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
  requiredRegions: PropTypes.instanceOf(Set),
}
