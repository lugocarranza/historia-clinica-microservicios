import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Select, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const MAX = 300

const VIA_AEREA_OPS = ['Permeable', 'Comprometida']
const RESPIRACION_OPS = ['Respiracion adecuada', 'Dificultad respiratoria']
const CIRCULACION_OPS = ['Perfusion adecuada', 'Signos de shock']

const VIA_AEREA_DESC = [
  'Vía aérea permeable, paciente habla en frases completas',
  'Vía aérea permeable con secreciones',
  'Vía aérea parcialmente obstruida por secreciones',
  'Estridor inspiratorio',
  'Ronquido respiratorio',
  'Gorgoteo (sugiere secreciones o sangre)',
  'Cuerpo extraño sospechado',
  'Requiere aspiración de secreciones',
  'Requiere intubación',
]
const VIA_AEREA_HALLAZGO = [
  'Obstrucción de vía aérea',
  'Estridor',
  'Incapacidad para hablar',
  'Disminución del nivel de conciencia con riesgo de broncoaspiración',
]

const RESPIRACION_DESC = [
  'Respiración espontánea, simétrica, sin dificultad',
  'Taquipnea',
  'Uso de músculos accesorios',
  'Tiraje intercostal',
  'Respiración superficial',
  'Murmullo vesicular conservado bilateral',
  'Disminución de murmullo vesicular en hemitórax derecho',
  'Sibilancias',
  'Estertores',
  'SatO2 94% aire ambiente',
]
const RESPIRACION_HALLAZGO = [
  'Apnea',
  'Bradipnea severa',
  'Saturación <90%',
  'Asimetría torácica',
  'Ausencia de ruidos respiratorios (neumotórax)',
]

const CIRCULACION_DESC = [
  'Pulsos periféricos presentes y simétricos',
  'Relleno capilar <2 segundos',
  'Piel normoperfundida',
  'Palidez cutánea',
  'Diaforesis',
  'Hipotensión arterial',
  'Taquicardia',
  'Sangrado activo controlado',
]
const CIRCULACION_HALLAZGO = [
  'Shock',
  'Hipotensión severa',
  'Pulso débil o ausente',
  'Sangrado activo masivo',
  'Extremidades frías con relleno capilar prolongado',
]

const getDefaultValues = (data) => ({
  viaAerea: data?.viaAerea || '',
  viaAereaDesc: data?.viaAereaDesc || '',
  viaAereaHallazgo: data?.viaAereaHallazgo || '',
  respiracion: data?.respiracion || '',
  respiracionDesc: data?.respiracionDesc || '',
  respiracionHallazgo: data?.respiracionHallazgo || '',
  circulacion: data?.circulacion || '',
  circulacionDesc: data?.circulacionDesc || '',
  circulacionHallazgo: data?.circulacionHallazgo || '',
  neurologico: data?.neurologico || '',
  cardiovascular: data?.cardiovascular || '',
  respiratorio: data?.respiratorio || '',
  abdomen: data?.abdomen || '',
  extremidades: data?.extremidades || '',
  otrosHallazgos: data?.otrosHallazgos || '',
})

function AbcGroup({ title, name, estadoOptions, descOptions, hallazgoOptions, register, errors, isReadOnly }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--c-text-secondary)' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
        {estadoOptions.map((op) => (
          <label
            key={op}
            style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isReadOnly ? 'default' : 'pointer' }}
          >
            <input
              type="radio"
              value={op}
              {...register(name, { required: 'Seleccione una opción' })}
              disabled={isReadOnly}
              style={{ accentColor: 'var(--c-primary)', width: 15, height: 15 }}
            />
            <span style={{ fontSize: 14 }}>{op}</span>
          </label>
        ))}
      </div>
      {errors[name] && (
        <div className="field-error" style={{ marginBottom: 6 }}>{errors[name].message}</div>
      )}
      <div className="form-grid g2">
        <FormField label="Descripcion" required error={errors[`${name}Desc`]?.message}>
          <Select
            {...register(`${name}Desc`, { required: 'La descripción es requerida' })}
            disabled={isReadOnly}
          >
            <option value="">— Seleccionar —</option>
            {descOptions.map((o) => <option key={o}>{o}</option>)}
          </Select>
        </FormField>
        <FormField label="Hallazgo crítico" required error={errors[`${name}Hallazgo`]?.message}>
          <Select
            {...register(`${name}Hallazgo`, { required: 'El hallazgo crítico es requerido' })}
            disabled={isReadOnly}
          >
            <option value="">— Seleccionar —</option>
            {hallazgoOptions.map((o) => <option key={o}>{o}</option>)}
          </Select>
        </FormField>
      </div>
    </div>
  )
}

AbcGroup.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  estadoOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  descOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  hallazgoOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  isReadOnly: PropTypes.bool,
}

export default function TabExamenFisico({ onSave, saves, initialData, isReadOnly = false }) {
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
    onSave(saves.saveExamenFisico, data)
  }

  const sistemaField = (name, label) => (
    <FormField label={label} required error={errors[name]?.message}>
      <Textarea
        {...register(name, {
          required: 'Este campo es requerido',
          maxLength: { value: MAX, message: `Max ${MAX} caracteres` },
        })}
        maxLength={MAX}
        rows={3}
        disabled={isReadOnly}
      />
    </FormField>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">VI. Examen Fisico</div>

      <Card>
        <CardHeader title="ABC (Evaluacion Primaria)" />
        <CardBody>
          <AbcGroup
            title="Via Aerea"
            name="viaAerea"
            estadoOptions={VIA_AEREA_OPS}
            descOptions={VIA_AEREA_DESC}
            hallazgoOptions={VIA_AEREA_HALLAZGO}
            register={register}
            errors={errors}
            isReadOnly={isReadOnly}
          />
          <AbcGroup
            title="Respiracion"
            name="respiracion"
            estadoOptions={RESPIRACION_OPS}
            descOptions={RESPIRACION_DESC}
            hallazgoOptions={RESPIRACION_HALLAZGO}
            register={register}
            errors={errors}
            isReadOnly={isReadOnly}
          />
          <AbcGroup
            title="Circulacion"
            name="circulacion"
            estadoOptions={CIRCULACION_OPS}
            descOptions={CIRCULACION_DESC}
            hallazgoOptions={CIRCULACION_HALLAZGO}
            register={register}
            errors={errors}
            isReadOnly={isReadOnly}
          />
        </CardBody>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <CardHeader title="Examen por Sistemas" />
        <CardBody>
          <div className="form-grid g2">
            {sistemaField('neurologico', 'Neurologico')}
            {sistemaField('cardiovascular', 'Cardiovascular')}
            {sistemaField('respiratorio', 'Respiratorio')}
            {sistemaField('abdomen', 'Abdomen')}
            {sistemaField('extremidades', 'Extremidades')}
            {sistemaField('otrosHallazgos', 'Otros hallazgos')}
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
    saveExamenFisico: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
