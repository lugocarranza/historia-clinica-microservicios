import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Controller } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { buscarMedicamentos, obtenerMedicamentoPorCodigo } from '@/api/maestro'

const VIA_OPTIONS = ['Oral', 'EV', 'IM', 'Tópico', 'Inhalado']

const normalizeMedicamento = (item) => ({
  codigo: item?.codigoMedicamento ?? item?.codigo ?? '',
  descripcion: item?.descripcionMedicamento ?? item?.descripcion ?? '',
})

const inputCellStyle = { padding: '4px 7px', fontSize: 12 }

export default function MedicationTableSection({
  sectionTitle,
  cardHeaderTitle,
  arrayName,
  fields,
  errors,
  control,
  register,
  setValue,
  setError,
  clearErrors,
  getValues,
  append,
  remove,
  createRow,
  isReadOnly = false,
  codeMaxLength = 30,
  codeRules = {},
  dosisRules = {},
  descriptionField,
  descriptionLabel,
  descriptionMaxLength,
  descriptionTooLongMessage,
  descriptionRequiredMessage,
  descriptionPlaceholder,
  frequencyField,
  trailingField,
  addButtonLabel,
}) {
  const [lookupState, setLookupState] = useState({})
  const [descriptionOptions, setDescriptionOptions] = useState({})
  const [descriptionLookupState, setDescriptionLookupState] = useState({})
  const descriptionSearchRequestIdRef = useRef({})

  const getPath = (index, key) => `${arrayName}.${index}.${key}`

  const handleCodigoBlur = async (index, codigo) => {
    if (isReadOnly) return
    if (!codigo?.trim()) {
      const descripcionPath = getPath(index, descriptionField)
      setValue(descripcionPath, '', { shouldDirty: true, shouldValidate: true })
      clearErrors(descripcionPath)
      return
    }

    const codePath = getPath(index, 'codigo')
    const descripcionPath = getPath(index, descriptionField)
    setLookupState((state) => ({ ...state, [index]: true }))

    try {
      const result = await obtenerMedicamentoPorCodigo(codigo.trim())
      const med = normalizeMedicamento(result)

      if (!med.codigo && !med.descripcion) {
        setError(codePath, { type: 'manual', message: 'Código no encontrado' })
        setValue(descripcionPath, '', { shouldDirty: true, shouldValidate: true })
      } else {
        setValue(codePath, med.codigo || codigo.trim(), { shouldDirty: true, shouldValidate: true })
        setValue(descripcionPath, med.descripcion || '', { shouldDirty: true, shouldValidate: true })
        clearErrors(codePath)
        clearErrors(descripcionPath)
      }
    } catch {
      setError(codePath, { type: 'manual', message: 'Código no encontrado' })
      setValue(descripcionPath, '', { shouldDirty: true, shouldValidate: true })
    } finally {
      setLookupState((state) => ({ ...state, [index]: false }))
    }
  }

  const searchDescriptionOptions = async (index, query) => {
    const value = (query || '').trim()
    if (!value) {
      setDescriptionOptions((state) => ({ ...state, [index]: [] }))
      setDescriptionLookupState((state) => ({ ...state, [index]: false }))
      return
    }

    const requestId = (descriptionSearchRequestIdRef.current[index] || 0) + 1
    descriptionSearchRequestIdRef.current[index] = requestId
    setDescriptionLookupState((state) => ({ ...state, [index]: true }))

    try {
      const resultados = await buscarMedicamentos(value)
      if (descriptionSearchRequestIdRef.current[index] !== requestId) return

      const options = (Array.isArray(resultados) ? resultados : [])
        .map(normalizeMedicamento)
        .filter((item) => item.codigo || item.descripcion)

      setDescriptionOptions((state) => ({ ...state, [index]: options }))
    } catch {
      if (descriptionSearchRequestIdRef.current[index] !== requestId) return
      setDescriptionOptions((state) => ({ ...state, [index]: [] }))
    } finally {
      if (descriptionSearchRequestIdRef.current[index] === requestId) {
        setDescriptionLookupState((state) => ({ ...state, [index]: false }))
      }
    }
  }

  const applyDescriptionSelection = (index, value) => {
    const text = (value || '').trim()
    const codePath = getPath(index, 'codigo')
    const descripcionPath = getPath(index, descriptionField)

    if (!text) {
      setValue(codePath, '', { shouldDirty: true, shouldValidate: true })
      clearErrors(codePath)
      return false
    }

    const options = descriptionOptions[index] || []
    const match = options.find((item) => item.descripcion?.toLowerCase() === text.toLowerCase())
    if (!match) return false

    setValue(codePath, match.codigo, { shouldDirty: true, shouldValidate: true })
    setValue(descripcionPath, match.descripcion, { shouldDirty: true, shouldValidate: true })
    clearErrors(codePath)
    clearErrors(descripcionPath)
    return true
  }

  return (
    <>
      <div className="section-div">{sectionTitle}</div>
      <Card allowOverflow>
        {cardHeaderTitle ? <CardHeader title={cardHeaderTitle} /> : null}
        <CardBody noPadding>
          <table className="data-table row-top">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Código</th>
                <th>{descriptionLabel}</th>
                <th style={{ width: 80 }}>Dosis</th>
                <th style={{ width: 100 }}>Vía</th>
                <th style={{ width: 80 }}>{frequencyField.label}</th>
                <th style={{ width: 80 }}>Duración{frequencyField.durationSuffix || ''}</th>
                <th style={{ width: trailingField.headerWidth }}>{trailingField.label}</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const rowErrors = errors?.[arrayName]?.[index]
                const rowValue = getValues(`${arrayName}.${index}`) || {}
                const isBusy = lookupState[index] || descriptionLookupState[index]
                return (
                  <tr key={field.id}>
                    <td>
                      <FormField error={rowErrors?.codigo?.message}>
                        <Input
                          {...register(getPath(index, 'codigo'), {
                            maxLength: {
                              value: codeMaxLength,
                              message: `Max ${codeMaxLength} caracteres`,
                            },
                            ...codeRules,
                          })}
                          onChange={(event) => {
                            const path = getPath(index, 'codigo')
                            setValue(path, event.target.value, { shouldDirty: true, shouldValidate: true })
                            clearErrors(path)
                          }}
                          onBlur={async (event) => {
                            await handleCodigoBlur(index, event.target.value)
                          }}
                          maxLength={codeMaxLength}
                          placeholder="Cód."
                          disabled={isReadOnly}
                          readOnly={lookupState[index]}
                          style={inputCellStyle}
                        />
                      </FormField>
                    </td>
                    <td>
                      <FormField error={rowErrors?.[descriptionField]?.message}>
                        <Controller
                          control={control}
                          name={getPath(index, descriptionField)}
                          rules={{
                            required: descriptionRequiredMessage,
                            maxLength: {
                              value: descriptionMaxLength,
                              message: descriptionTooLongMessage,
                            },
                          }}
                          render={({ field: controllerField }) => (
                            <AutocompleteSelect
                              value={controllerField.value || ''}
                              onChange={(value) => {
                                const descripcionPath = getPath(index, descriptionField)
                                const codePath = getPath(index, 'codigo')

                                controllerField.onChange(value)
                                clearErrors(descripcionPath)

                                if (applyDescriptionSelection(index, value)) {
                                  return
                                }

                                setValue(codePath, '', { shouldDirty: true, shouldValidate: true })
                                clearErrors(codePath)
                              }}
                              onBlur={() => {
                                controllerField.onBlur()
                                applyDescriptionSelection(index, getValues(getPath(index, descriptionField)))
                              }}
                              onSearch={(query) => searchDescriptionOptions(index, query)}
                              onSelect={(item) => {
                                const codePath = getPath(index, 'codigo')
                                const descripcionPath = getPath(index, descriptionField)
                                setValue(codePath, item.codigo, { shouldDirty: true, shouldValidate: true })
                                setValue(descripcionPath, item.descripcion, { shouldDirty: true, shouldValidate: true })
                                clearErrors(codePath)
                                clearErrors(descripcionPath)
                              }}
                              options={descriptionOptions[index] || []}
                              loading={Boolean(descriptionLookupState[index])}
                              getOptionLabel={(item) => item.descripcion}
                              getOptionValue={(item) => item.descripcion}
                              getOptionMeta={(item) => item.codigo}
                              getOptionKey={(item) => `${item.codigo}-${item.descripcion}`}
                              maxLength={descriptionMaxLength}
                              placeholder={lookupState[index] ? 'Buscando...' : descriptionPlaceholder}
                              readOnly={lookupState[index]}
                              disabled={isReadOnly}
                              style={{
                                ...inputCellStyle,
                                background: isBusy ? '#f8fafc' : undefined,
                                borderStyle: isBusy ? 'dashed' : undefined,
                              }}
                            />
                          )}
                        />
                      </FormField>
                    </td>
                    <td>
                      <FormField error={rowErrors?.dosis?.message}>
                        <Input
                          {...register(getPath(index, 'dosis'), {
                            maxLength: {
                              value: 10,
                              message: 'La dosis no debe superar 10 caracteres',
                            },
                            ...dosisRules,
                          })}
                          maxLength={10}
                          placeholder="mg"
                          disabled={isReadOnly}
                          style={inputCellStyle}
                        />
                      </FormField>
                    </td>
                    <td>
                      <FormField error={rowErrors?.via?.message}>
                        <Select
                          {...register(getPath(index, 'via'))}
                          disabled={isReadOnly}
                          style={inputCellStyle}
                        >
                          {VIA_OPTIONS.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </Select>
                      </FormField>
                    </td>
                    <td>
                      <FormField error={rowErrors?.frecuencia?.message}>
                        <Input
                          {...register(getPath(index, 'frecuencia'), frequencyField.rules)}
                          placeholder={frequencyField.placeholder}
                          disabled={isReadOnly}
                          style={inputCellStyle}
                          type={frequencyField.type}
                          inputMode={frequencyField.inputMode}
                          step={frequencyField.step}
                          min={frequencyField.min}
                          max={frequencyField.max}
                        />
                      </FormField>
                    </td>
                    <td>
                      <FormField error={rowErrors?.duracion?.message}>
                        <Input
                          {...register(getPath(index, 'duracion'),
                            frequencyField.durationRules || {
                              maxLength: {
                                value: frequencyField.durationMaxLength || 50,
                                message: `La duración no debe superar ${frequencyField.durationMaxLength || 50} caracteres`,
                              },
                            }
                          )}
                          min={1}
                          maxLength={frequencyField.durationMaxLength || 50}
                          type={frequencyField.durationType}
                          inputMode={frequencyField.durationInputMode}
                          placeholder={frequencyField.durationPlaceholder}
                          disabled={isReadOnly}
                          style={inputCellStyle}
                        />
                      </FormField>
                    </td>
                    <td>
                      <FormField error={rowErrors?.[trailingField.key]?.message}>
                        {trailingField.kind === 'select' ? (
                          <Select
                            {...register(getPath(index, trailingField.key), trailingField.rules)}
                            disabled={isReadOnly}
                            style={{
                              ...inputCellStyle,
                              ...(trailingField.getStyle ? trailingField.getStyle(rowValue[trailingField.key]) : {}),
                            }}
                          >
                            {trailingField.options.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            {...register(getPath(index, trailingField.key), trailingField.rules)}
                            maxLength={trailingField.maxLength}
                            placeholder={trailingField.placeholder}
                            disabled={isReadOnly}
                            style={inputCellStyle}
                          />
                        )}
                      </FormField>
                    </td>
                    <td>
                      {!getValues(getPath(index, 'id')) && (
                        <Button
                          variant="danger"
                          size="xs"
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => remove(index)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: 10 }}>
            <Button
              variant="secondary"
              size="xs"
              type="button"
              disabled={isReadOnly}
              onClick={() => append(createRow())}
            >
              {addButtonLabel}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  )
}

MedicationTableSection.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  cardHeaderTitle: PropTypes.string,
  arrayName: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  errors: PropTypes.object,
  control: PropTypes.object.isRequired,
  register: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  getValues: PropTypes.func.isRequired,
  append: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  createRow: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
  codeMaxLength: PropTypes.number,
  codeRules: PropTypes.object,
  dosisRules: PropTypes.object,
  descriptionField: PropTypes.string.isRequired,
  descriptionLabel: PropTypes.string.isRequired,
  descriptionMaxLength: PropTypes.number.isRequired,
  descriptionTooLongMessage: PropTypes.string.isRequired,
  descriptionRequiredMessage: PropTypes.string.isRequired,
  descriptionPlaceholder: PropTypes.string.isRequired,
  frequencyField: PropTypes.shape({
    label: PropTypes.string.isRequired,
    headerWidth: PropTypes.number,
    placeholder: PropTypes.string.isRequired,
    durationPlaceholder: PropTypes.string.isRequired,
    durationSuffix: PropTypes.string,
    durationMaxLength: PropTypes.number,
    durationType: PropTypes.string,
    durationInputMode: PropTypes.string,
    durationRules: PropTypes.object,
    rules: PropTypes.object,
    type: PropTypes.string,
    inputMode: PropTypes.string,
    step: PropTypes.string,
    min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  trailingField: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    headerWidth: PropTypes.number.isRequired,
    kind: PropTypes.oneOf(['input', 'select']).isRequired,
    rules: PropTypes.object,
    maxLength: PropTypes.number,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    getStyle: PropTypes.func,
  }).isRequired,
  addButtonLabel: PropTypes.string.isRequired,
}
