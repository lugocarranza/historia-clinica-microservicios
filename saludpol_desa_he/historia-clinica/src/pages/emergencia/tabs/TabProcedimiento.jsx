import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const GRUPOS = [
  {
    titulo: 'Soporte Vital',
    items: [
      { name: 'rcp',               label: 'RCP' },
      { name: 'intubacionEt',      label: 'Intubacion endotraqueal' },
      { name: 'ventilacionAsist',  label: 'Ventilacion asistida' },
      { name: 'desfibrilacion',    label: 'Desfibrilacion' },
      { name: 'cardioversion',     label: 'Cardioversion' },
    ],
  },
  {
    titulo: 'Acceso Vascular',
    items: [
      { name: 'canalVenPeriferica', label: 'Canalizacion venosa periferica' },
      { name: 'canalVenCentral',    label: 'Canalizacion venosa central' },
      { name: 'sondaVesical',       label: 'Sonda vesical' },
      { name: 'sondaNasogastrica',  label: 'Sonda nasogastrica' },
    ],
  },
  {
    titulo: 'Trauma',
    items: [
      { name: 'inmovilizacion',    label: 'Inmovilizacion' },
      { name: 'reduccionFractura', label: 'Reduccion fractura' },
      { name: 'suturaHerida',      label: 'Sutura herida' },
      { name: 'curacionHeridas',   label: 'Curacion heridas' },
    ],
  },
  {
    titulo: 'Toracicos',
    items: [
      { name: 'drenajeToraxcico',  label: 'Drenaje toracico' },
      { name: 'toracocentesis',    label: 'Toracocentesis' },
    ],
  },
  {
    titulo: 'Otros',
    items: [
      { name: 'lavadoGastrico', label: 'Lavado gastrico' },
      { name: 'nebulizacion',   label: 'Nebulizacion' },
      { name: 'otrosProc',      label: 'Otros' },
    ],
  },
]

const CONSENTIMIENTO_OPS = ['Implicito por Emergencia Vital', 'Verbal', 'Escrito']

const ALL_BOOL_FIELDS = GRUPOS.flatMap((g) => g.items.map((i) => i.name))

const getDefaultValues = (data) => {
  const bools = Object.fromEntries(ALL_BOOL_FIELDS.map((n) => [n, !!data?.[n]]))
  return {
    ...bools,
    descClinica:    data?.descClinica    || '',
    otrosProcDesc:  data?.otrosProcDesc  || '',
    consentimiento: data?.consentimiento || '',
  }
}

export default function TabProcedimiento({ onSave, saves, initialData, isReadOnly = false }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(null) })

  const otrosMarcado = watch('otrosProc')

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const onSubmit = (data) => {
    if (isReadOnly) return
    onSave(saves.saveProcedimiento, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">X. Procedimientos</div>

      {GRUPOS.map(({ titulo, items }) => (
        <Card key={titulo} style={{ marginBottom: 12 }}>
          <CardHeader title={titulo} />
          <CardBody>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {items.map(({ name, label }) => (
                <label
                  key={name}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isReadOnly ? 'default' : 'pointer', minWidth: 200 }}
                >
                  <input
                    type="checkbox"
                    {...register(name)}
                    disabled={isReadOnly}
                    style={{ accentColor: 'var(--c-primary)', width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: 14 }}>{label}</span>
                </label>
              ))}
            </div>
            {titulo === 'Otros' && otrosMarcado && (
              <div style={{ marginTop: 10 }}>
                <FormField label="Descripcion de otros procedimientos" required error={errors.otrosProcDesc?.message}>
                  <Textarea
                    {...register('otrosProcDesc', {
                      required: 'La descripcion es requerida',
                      maxLength: { value: 300, message: 'Max 300 caracteres' },
                    })}
                    maxLength={300}
                    rows={2}
                    placeholder="Describir otros procedimientos..."
                    disabled={isReadOnly}
                  />
                </FormField>
              </div>
            )}
          </CardBody>
        </Card>
      ))}

      <Card>
        <CardHeader title="Informacion Adicional" />
        <CardBody>
          <FormField label="Descripcion clinica" required error={errors.descClinica?.message}>
            <Textarea
              {...register('descClinica', {
                required: 'La descripcion clinica es requerida',
                maxLength: { value: 300, message: 'Max 300 caracteres' },
              })}
              maxLength={300}
              rows={3}
              disabled={isReadOnly}
            />
          </FormField>

          <FormField label="Consentimiento" required style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {CONSENTIMIENTO_OPS.map((op) => (
                <label
                  key={op}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isReadOnly ? 'default' : 'pointer' }}
                >
                  <input
                    type="radio"
                    value={op}
                    {...register('consentimiento', { required: 'Seleccione el tipo de consentimiento' })}
                    disabled={isReadOnly}
                    style={{ accentColor: 'var(--c-primary)', width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: 14 }}>{op}</span>
                </label>
              ))}
            </div>
            {errors.consentimiento && (
              <div className="field-error" style={{ marginTop: 4 }}>{errors.consentimiento.message}</div>
            )}
          </FormField>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveProcedimiento.isPending}>
          {saves.saveProcedimiento.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabProcedimiento.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveProcedimiento: PropTypes.shape({ mutate: PropTypes.func, isPending: PropTypes.bool }),
  }).isRequired,
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
