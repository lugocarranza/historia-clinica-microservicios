import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { buscarProcedimientos } from '@/api/maestro'

const MAX_LENGTHS = {
  ano: 4,
  tratamientoActual: 300,
  observaciones: 500,
  procedimiento: 200,
  complicaciones: 500,
  alergiaDesc: 300,
  tipoReaccion: 30,
  imc: 10,
}

const APP_CONDICIONES = [
  'Hipertensión arterial', 'Diabetes Mellitus', 'Dislipidemia', 'Cardiopatía',
  'ACV / TIA', 'Asma / EPOC', 'TBC', 'Enfermedad Renal Crónica',
  'Enfermedad Tiroidea', 'Cáncer', 'Otra (especificar)',
]

const asText = (value) => (value == null ? '' : String(value))

const toDefaultAppRow = (source, condicion) => ({
  condicion,
  tiene: source?.tiene || 'N',
  anoDx: asText(source?.anoDx),
  tratamientoActual: source?.tratamientoActual || '',
  observaciones: source?.observaciones || '',
})

const getDefaultValues = (data) => {
  const appMap = new Map((data?.appList || []).map((item) => [item.condicion, item]))

  return {
    appList: APP_CONDICIONES.map((condicion) => toDefaultAppRow(appMap.get(condicion), condicion)),
    quirurgicos: (data?.quirurgicos?.length ? data.quirurgicos : [{ id: null, procedimiento: '', ano: '', complicaciones: '' }]).map((item) => ({
      id: item?.id ?? null,
      procedimiento: item?.procedimiento || '',
      ano: asText(item?.ano),
      complicaciones: item?.complicaciones || '',
    })),
    alergico: {
      alergiaMed: data?.alergico?.alergiaMed || 'N',
      alergiaMedDesc: data?.alergico?.alergiaMedDesc || '',
      alergiaAli: data?.alergico?.alergiaAli || 'N',
      alergiaAliDesc: data?.alergico?.alergiaAliDesc || '',
      alergiaOtros: data?.alergico?.alergiaOtros || 'N',
      alergiaOtrosDesc: data?.alergico?.alergiaOtrosDesc || '',
      tipoReaccion: data?.alergico?.tipoReaccion || '',
    },
    habito: {
      tabaco: data?.habitoRiesgo?.tabaco || 'No',
      alcohol: data?.habitoRiesgo?.alcohol || 'No',
      drogas: data?.habitoRiesgo?.drogas || 'No',
      sedentarismo: data?.habitoRiesgo?.sedentarismo || 'N',
      otrosFactores: data?.habitoRiesgo?.otrosFactores || '',
    },
  }
}

export default function TabAntPersonal({ onSave, saves, initialData, isReadOnly = false }) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      appList: APP_CONDICIONES.map((condicion) => ({ condicion, tiene: 'N', anoDx: '', tratamientoActual: '', observaciones: '' })),
      quirurgicos: [{ procedimiento: '', ano: '', complicaciones: '' }],
      alergico: { alergiaMed: 'N', alergiaMedDesc: '', alergiaAli: 'N', alergiaAliDesc: '', alergiaOtros: 'N', alergiaOtrosDesc: '', tipoReaccion: '' },
      habito: { tabaco: 'No', alcohol: 'No', drogas: 'No', sedentarismo: 'N', otrosFactores: '' },
    },
  })

  useEffect(() => {
    reset(getDefaultValues(initialData))
  }, [initialData, reset])

  const { fields: appFields } = useFieldArray({ control, name: 'appList' })
  const { fields: quirFields, append: appendQuir, remove: removeQuir } = useFieldArray({ control, name: 'quirurgicos' })

  const [procedimientoOptions, setProcedimientoOptions] = useState({})
  const [procedimientoLoading, setProcedimientoLoading] = useState({})
  const procedimientoRequestIdRef = useRef({})

  const searchProcedimientoOptions = async (index, query) => {
    const trimmed = query?.trim() ?? ''
    if (!trimmed) {
      procedimientoRequestIdRef.current[index] = (procedimientoRequestIdRef.current[index] ?? 0) + 1
      setProcedimientoOptions((s) => ({ ...s, [index]: [] }))
      setProcedimientoLoading((s) => ({ ...s, [index]: false }))
      return
    }

    const requestId = (procedimientoRequestIdRef.current[index] ?? 0) + 1
    procedimientoRequestIdRef.current[index] = requestId
    setProcedimientoLoading((s) => ({ ...s, [index]: true }))

    try {
      const resultados = await buscarProcedimientos(trimmed)
      if (procedimientoRequestIdRef.current[index] !== requestId) return
      setProcedimientoOptions((s) => ({ ...s, [index]: Array.isArray(resultados) ? resultados : [] }))
    } catch {
      if (procedimientoRequestIdRef.current[index] !== requestId) return
      setProcedimientoOptions((s) => ({ ...s, [index]: [] }))
    } finally {
      if (procedimientoRequestIdRef.current[index] === requestId) {
        setProcedimientoLoading((s) => ({ ...s, [index]: false }))
      }
    }
  }

  const alergiaMed = watch('alergico.alergiaMed')
  const alergiaAli = watch('alergico.alergiaAli')
  const alergiaOtros = watch('alergico.alergiaOtros')
  const hayAlergia = alergiaMed === 'S' || alergiaAli === 'S' || alergiaOtros === 'S'

  const handleSave = (data) => {
    if (isReadOnly) return

    // Limpiar campos si tiene es 'N'
    const cleanedAppList = data.appList.map(item => {
      if (item.tiene === 'N') {
        return { ...item, anoDx: '', tratamientoActual: '', observaciones: '' }
      }
      return item
    })

    onSave(saves.saveAntPersonal, {
      appList: cleanedAppList,
      quirurgicos: data.quirurgicos,
      alergico: { ...data.alergico, tipoReaccion: hayAlergia ? data.alergico.tipoReaccion : '' },
      habitoRiesgo: data.habito
    })
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <div className="section-div">2A. Antecedentes Personales Patológicos</div>
      <Card>
        <CardBody noPadding>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 220 }}>Condición</th>
                <th style={{ width: 80 }}>Sí / No</th>
                <th style={{ width: 80 }}>Año Dx</th>
                <th>Tratamiento Actual</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {appFields.map((field, i) => {
                const tiene = watch(`appList.${i}.tiene`) === 'S'
                return (
                  <tr key={field.id}>
                    <td style={{ fontWeight: 500 }}>{field.condicion}</td>
                    <td>
                      <div className="radio-group">
                        <label><input type="radio" value="S" {...register(`appList.${i}.tiene`)} disabled={isReadOnly} /> Sí</label>
                        <label><input type="radio" value="N" {...register(`appList.${i}.tiene`)} disabled={isReadOnly} /> No</label>
                      </div>
                    </td>
                    <td>
                      <FormField error={errors.appList?.[i]?.anoDx?.message}>
                        <Input
                          {...register(`appList.${i}.anoDx`, {
                            required: tiene ? 'Requerido' : false,
                            validate: (value) => { // NOSONAR (S3800 RHF validate)
                              if (!tiene) return true
                              if (!value) return true
                              if (!/^\d{4}$/.test(value)) return '4 dígitos'
                              return Number(value) <= new Date().getFullYear() || 'El año no puede ser mayor al actual'
                            },
                            maxLength: { value: MAX_LENGTHS.ano, message: 'Max 4' },
                          })}
                          placeholder="Año"
                          maxLength={MAX_LENGTHS.ano}
                          inputMode="numeric"
                          disabled={isReadOnly || !tiene}
                          style={{ padding: '4px 7px', fontSize: 12 }}
                        />
                      </FormField>
                    </td>
                    <td>
                      <FormField error={errors.appList?.[i]?.tratamientoActual?.message}>
                        <Input
                          {...register(`appList.${i}.tratamientoActual`, {
                            required: tiene ? 'Requerido' : false,
                            maxLength: { value: MAX_LENGTHS.tratamientoActual, message: `Max ${MAX_LENGTHS.tratamientoActual}` },
                          })}
                          maxLength={MAX_LENGTHS.tratamientoActual}
                          disabled={isReadOnly || !tiene}
                          style={{ padding: '4px 7px', fontSize: 12 }}
                        />
                      </FormField>
                    </td>
                    <td>
                      <FormField error={errors.appList?.[i]?.observaciones?.message}>
                        <Input
                          {...register(`appList.${i}.observaciones`, {
                            required: tiene ? 'Requerido' : false,
                            maxLength: { value: MAX_LENGTHS.observaciones, message: `Max ${MAX_LENGTHS.observaciones}` },
                          })}
                          maxLength={MAX_LENGTHS.observaciones}
                          disabled={isReadOnly || !tiene}
                          style={{ padding: '4px 7px', fontSize: 12 }}
                        />
                      </FormField>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="section-div">2B. Antecedentes Quirúrgicos</div>
      <Card allowOverflow>
        <CardBody noPadding>
          <table className="data-table row-top">
            <thead>
              <tr><th>Procedimiento</th><th style={{ width: 90 }}>Año</th><th>Complicaciones</th><th style={{ width: 44 }}></th></tr>
            </thead>
            <tbody>
              {quirFields.map((field, i) => (
                <tr key={field.id}>
                  <td>
                    <FormField error={errors.quirurgicos?.[i]?.procedimiento?.message}>
                      <Controller
                        control={control}
                        name={`quirurgicos.${i}.procedimiento`}
                        rules={{
                          required: 'El procedimiento es requerido',
                          maxLength: { value: MAX_LENGTHS.procedimiento, message: `El procedimiento no debe superar ${MAX_LENGTHS.procedimiento} caracteres` },
                        }}
                        render={({ field: controllerField }) => (
                          <AutocompleteSelect
                            value={controllerField.value || ''}
                            onChange={(value) => controllerField.onChange(value)}
                            onBlur={controllerField.onBlur}
                            onSearch={(query) => searchProcedimientoOptions(i, query)}
                            onSelect={(item) => controllerField.onChange(item.descripcionProcedimiento)}
                            options={procedimientoOptions[i] || []}
                            loading={Boolean(procedimientoLoading[i])}
                            getOptionLabel={(item) => item.descripcionProcedimiento}
                            getOptionValue={(item) => item.descripcionProcedimiento}
                            getOptionMeta={(item) => item.codigoProcedimiento}
                            getOptionKey={(item) => item.codigoProcedimiento}
                            maxLength={MAX_LENGTHS.procedimiento}
                            placeholder="Nombre del procedimiento"
                            disabled={isReadOnly}
                            minSearchLength={3}
                            style={{ padding: '4px 7px', fontSize: 12 }}
                          />
                        )}
                      />
                    </FormField>
                  </td>
                  <td>
                    <FormField error={errors.quirurgicos?.[i]?.ano?.message}>
                      <Input
                        {...register(`quirurgicos.${i}.ano`, {
                          validate: (value) => { // NOSONAR (S3800 RHF validate)
                            if (!value) return true
                            if (!/^\d{4}$/.test(value)) return 'El año debe tener 4 dígitos'
                            return Number(value) <= new Date().getFullYear() || 'El año no puede ser mayor al actual'
                          },
                          maxLength: { value: MAX_LENGTHS.ano, message: 'El año no debe superar 4 caracteres' },
                        })}
                        placeholder="Año"
                        maxLength={MAX_LENGTHS.ano}
                        inputMode="numeric"
                        disabled={isReadOnly}
                        style={{ padding: '4px 7px', fontSize: 12 }}
                      />
                    </FormField>
                  </td>
                  <td>
                    <FormField error={errors.quirurgicos?.[i]?.complicaciones?.message}>
                      <Input
                        {...register(`quirurgicos.${i}.complicaciones`, {
                          maxLength: { value: MAX_LENGTHS.complicaciones, message: `Las complicaciones no deben superar ${MAX_LENGTHS.complicaciones} caracteres` },
                        })}
                        maxLength={MAX_LENGTHS.complicaciones}
                        disabled={isReadOnly}
                        style={{ padding: '4px 7px', fontSize: 12 }}
                      />
                    </FormField>
                  </td>
                  <td>
                    {!watch(`quirurgicos.${i}.id`) && (
                      <Button variant="danger" size="xs" type="button" onClick={() => removeQuir(i)} disabled={isReadOnly}>
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: 10 }}>
            <Button variant="secondary" size="xs" type="button" disabled={isReadOnly} onClick={() => appendQuir({ id: null, procedimiento: '', ano: '', complicaciones: '' })}>+ Agregar fila</Button>
          </div>
        </CardBody>
      </Card>

      <div className="section-div">2C. Antecedentes Alérgicos</div>
      <Card>
        <CardHeader title="Alergias" />
        <CardBody>
          <div className="form-grid g3">
            <FormField label="Medicamentos">
              <div className="radio-group">
                <label><input type="radio" value="N" {...register('alergico.alergiaMed')} disabled={isReadOnly} /> No</label>
                <label><input type="radio" value="S" {...register('alergico.alergiaMed')} disabled={isReadOnly} /> Sí</label>
              </div>
              {alergiaMed === 'S' && (
                <FormField error={errors.alergico?.alergiaMedDesc?.message}>
                  <Input
                    {...register('alergico.alergiaMedDesc', {
                      required: 'Especifique la alergia',
                      maxLength: { value: MAX_LENGTHS.alergiaDesc, message: `La descripción no debe superar ${MAX_LENGTHS.alergiaDesc} caracteres` },
                    })}
                    maxLength={MAX_LENGTHS.alergiaDesc}
                    placeholder="Especifique"
                    disabled={isReadOnly}
                    style={{ marginTop: 4 }}
                  />
                </FormField>
              )}
            </FormField>
            <FormField label="Alimentos">
              <div className="radio-group">
                <label><input type="radio" value="N" {...register('alergico.alergiaAli')} disabled={isReadOnly} /> No</label>
                <label><input type="radio" value="S" {...register('alergico.alergiaAli')} disabled={isReadOnly} /> Sí</label>
              </div>
              {alergiaAli === 'S' && (
                <FormField error={errors.alergico?.alergiaAliDesc?.message}>
                  <Input
                    {...register('alergico.alergiaAliDesc', {
                      required: 'Especifique la alergia',
                      maxLength: { value: MAX_LENGTHS.alergiaDesc, message: `La descripción no debe superar ${MAX_LENGTHS.alergiaDesc} caracteres` },
                    })}
                    maxLength={MAX_LENGTHS.alergiaDesc}
                    placeholder="Especifique"
                    disabled={isReadOnly}
                    style={{ marginTop: 4 }}
                  />
                </FormField>
              )}
            </FormField>
            <FormField label="Otros">
              <div className="radio-group">
                <label><input type="radio" value="N" {...register('alergico.alergiaOtros')} disabled={isReadOnly} /> No</label>
                <label><input type="radio" value="S" {...register('alergico.alergiaOtros')} disabled={isReadOnly} /> Sí</label>
              </div>
              {alergiaOtros === 'S' && (
                <FormField error={errors.alergico?.alergiaOtrosDesc?.message}>
                  <Input
                    {...register('alergico.alergiaOtrosDesc', {
                      required: 'Especifique la alergia',
                      maxLength: { value: MAX_LENGTHS.alergiaDesc, message: `La descripción no debe superar ${MAX_LENGTHS.alergiaDesc} caracteres` },
                    })}
                    maxLength={MAX_LENGTHS.alergiaDesc}
                    placeholder="Especifique"
                    disabled={isReadOnly}
                    style={{ marginTop: 4 }}
                  />
                </FormField>
              )}
            </FormField>
            {hayAlergia && (
              <FormField label="Tipo de Reacción" error={errors.alergico?.tipoReaccion?.message}>
                <Select {...register('alergico.tipoReaccion', { required: 'Seleccione el tipo de reacción' })} disabled={isReadOnly}>
                  <option value="">— Seleccionar —</option>
                  {['Leve', 'Moderada', 'Severa / Anafilaxia'].map((o) => <option key={o}>{o}</option>)}
                </Select>
              </FormField>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="section-div">2D. Hábitos Nocivos / Factores de Riesgo</div>
      <Card>
        <CardBody>
          <div className="form-grid g4">
            <FormField label="Tabaco">
              <Select {...register('habito.tabaco')} disabled={isReadOnly}>
                {['No', 'Exfumador', 'Activo'].map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
            <FormField label="Alcohol">
              <Select {...register('habito.alcohol')} disabled={isReadOnly}>
                {['No', 'Social', 'Frecuente'].map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
            <FormField label="Drogas">
              <Select {...register('habito.drogas')} disabled={isReadOnly}>
                {['No', 'Sí'].map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="form-grid g1" style={{ marginTop: 12 }}>
            <FormField label="Otros Factores de Riesgo" error={errors.habito?.otrosFactores?.message}>
              <Textarea
                {...register('habito.otrosFactores', {
                  maxLength: { value: 500, message: 'Máximo 500 caracteres' },
                })}
                maxLength={500}
                rows={3}
                placeholder="Especifique otros factores de riesgo..."
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveAntPersonal.isPending}>
          {saves.saveAntPersonal.isPending ? 'Guardando...' : 'Guardar Antecedentes'}
        </Button>
      </div>
    </form>
  )
}

TabAntPersonal.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveAntPersonal: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.object,
  isReadOnly: PropTypes.bool,
}
