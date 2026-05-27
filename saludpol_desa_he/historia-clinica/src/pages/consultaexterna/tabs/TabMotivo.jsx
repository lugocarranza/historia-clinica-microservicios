import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const MAX_LENGTHS = {
  oapEpisodio: 30,
  motivo: 500,
  tiempoEnfermedad: 50,
  formaInicio: 20,
  curso: 20,
  enfermedadActual: 2000,
  sintomasSignos: 2000,
  relatoCronologico: 2000,
  factoresMod: 1000,
  tratamientosPrevios: 1000,
}

const getDefaultValues = (data) => ({
  oapEpisodio: data?.oapEpisodio || '',
  motivo: data?.motivo || '',
  tiempoEnfermedad: data?.tiempoEnfermedad || '',
  formaInicio: data?.formaInicio || '',
  curso: data?.curso || '',
  enfermedadActual: data?.enfermedadActual || '',
  sintomasSignos: data?.sintomasSignos || '',
  relatoCronologico: data?.relatoCronologico || '',
  factoresMod: data?.factoresMod || '',
  tratamientosPrevios: data?.tratamientosPrevios || '',
})

export default function TabMotivo({ onSave, saves, initialData, isReadOnly = false }) {
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
    onSave(saves.saveMotivo, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">1. Motivo de Consulta</div>
      <Card>
        <CardBody>
          <div className="form-grid g3" style={{ marginBottom: 12 }}>
            <FormField label="OAP Asociada" error={errors.oapEpisodio?.message}>
              <Input
                {...register('oapEpisodio', {
                  maxLength: {
                    value: MAX_LENGTHS.oapEpisodio,
                    message: `La OAP no debe superar ${MAX_LENGTHS.oapEpisodio} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.oapEpisodio}
                placeholder="Nro OAP (opcional)"
                disabled={isReadOnly}
              />
            </FormField>

            <div style={{ gridColumn: '1/3' }}>
              <FormField label="Motivo de Consulta" required error={errors.motivo?.message}>
                <Input
                  {...register('motivo', {
                    required: 'El motivo de consulta es requerido',
                    maxLength: {
                      value: MAX_LENGTHS.motivo,
                      message: `El motivo de consulta no debe superar ${MAX_LENGTHS.motivo} caracteres`,
                    },
                  })}
                  maxLength={MAX_LENGTHS.motivo}
                  placeholder="Describa el motivo principal de la consulta"
                  disabled={isReadOnly}
                />
              </FormField>
            </div>
            <FormField label="Tiempo de Enfermedad" required error={errors.tiempoEnfermedad?.message}>
              <Input
                {...register('tiempoEnfermedad', {
                  required: 'El tiempo de enfermedad es requerido',
                  maxLength: {
                    value: MAX_LENGTHS.tiempoEnfermedad,
                    message: `El tiempo de enfermedad no debe superar ${MAX_LENGTHS.tiempoEnfermedad} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.tiempoEnfermedad}
                placeholder="Ej: 3 días"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Forma de Inicio" required error={errors.formaInicio?.message}>
              <Select {...register('formaInicio', { required: 'La forma de inicio es requerida' })} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {['Insidioso', 'Brusco', 'Gradual'].map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
            <FormField label="Curso" required error={errors.curso?.message}>
              <Select {...register('curso', { required: 'El curso es requerido' })} disabled={isReadOnly}>
                <option value="">— Seleccionar —</option>
                {['Progresivo', 'Regresivo', 'Estacionario', 'Intermitente'].map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="form-grid" style={{ gap: 10 }}>
            <FormField label="Enfermedad Actual" required error={errors.enfermedadActual?.message}>
              <Textarea
                {...register('enfermedadActual', {
                  required: 'La enfermedad actual es requerida',
                  maxLength: {
                    value: MAX_LENGTHS.enfermedadActual,
                    message: `La enfermedad actual no debe superar ${MAX_LENGTHS.enfermedadActual} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.enfermedadActual}
                placeholder="Descripción de la enfermedad actual"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Síntomas y Signos Principales" required error={errors.sintomasSignos?.message}>
              <Textarea
                {...register('sintomasSignos', {
                  required: 'Los síntomas y signos son requeridos',
                  maxLength: {
                    value: MAX_LENGTHS.sintomasSignos,
                    message: `Los síntomas y signos no deben superar ${MAX_LENGTHS.sintomasSignos} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.sintomasSignos}
                placeholder="Liste los síntomas y signos"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Relato Cronológico" required error={errors.relatoCronologico?.message}>
              <Textarea
                {...register('relatoCronologico', {
                  required: 'El relato cronológico es requerido',
                  maxLength: {
                    value: MAX_LENGTHS.relatoCronologico,
                    message: `El relato cronológico no debe superar ${MAX_LENGTHS.relatoCronologico} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.relatoCronologico}
                placeholder="Descripción ordenada cronológicamente"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Factores Agravantes o Atenuantes" required error={errors.factoresMod?.message}>
              <Textarea
                rows={2}
                {...register('factoresMod', {
                  required: 'Los factores agravantes o atenuantes son requeridos',
                  maxLength: {
                    value: MAX_LENGTHS.factoresMod,
                    message: `Los factores modificadores no deben superar ${MAX_LENGTHS.factoresMod} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.factoresMod}
                placeholder="Factores que modifican el cuadro"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Tratamientos Previos y Respuesta" required error={errors.tratamientosPrevios?.message}>
              <Textarea
                rows={2}
                {...register('tratamientosPrevios', {
                  required: 'Los tratamientos previos son requeridos',
                  maxLength: {
                    value: MAX_LENGTHS.tratamientosPrevios,
                    message: `Los tratamientos previos no deben superar ${MAX_LENGTHS.tratamientosPrevios} caracteres`,
                  },
                })}
                maxLength={MAX_LENGTHS.tratamientosPrevios}
                placeholder="Tratamientos anteriores y su efecto"
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveMotivo.isPending}>
          {saves.saveMotivo.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabMotivo.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveMotivo: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
