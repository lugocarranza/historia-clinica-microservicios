import { Fragment, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Controller } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { buscarCie10 } from '@/api/padron'

const inputCellStyle = { fontSize: 12, padding: '4px 7px' }

const normalizeCie10 = (item) => ({
  codigo: item?.codigoCie10 ?? item?.codigo ?? '',
  descripcion: item?.descripcionCie10 ?? item?.descripcion ?? '',
})

const tipoBg = (tipo) => {
  if (tipo === 'Definitivo') return '#eaf5ee'
  if (tipo === 'Presuntivo') return '#fff3e8'
  return '#e8f0fb'
}

export default function DiagnosticoTableSection({
  sectionTitle,
  headers,
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
  addButtonLabel,
  typeOptions,
  problemField,
  rowStyle,
  renderRowPrefix,
  searchMinLength = 1,
  searchLimit,
  dedupeNormalizedQuery = false,
}) {
  const [lookupState, setLookupState] = useState({})
  const [descriptionOptions, setDescriptionOptions] = useState({})
  const [descriptionLookupState, setDescriptionLookupState] = useState({})
  const lastDescriptionQueryRef = useRef({})
  const descriptionSearchRequestIdRef = useRef({})

  const getPath = (index, key) => `diagnosticos.${index}.${key}`

  const handleCodigoBlur = async (index, codigo) => {
    if (isReadOnly) return
    if (!codigo?.trim()) {
      const descripcionPath = getPath(index, 'descripcion')
      setValue(descripcionPath, '', { shouldDirty: true, shouldValidate: true })
      clearErrors(descripcionPath)
      return
    }

    const codePath = getPath(index, 'codigoCie10')
    const descripcionPath = getPath(index, 'descripcion')
    setLookupState((state) => ({ ...state, [index]: true }))

    try {
      const resultados = await buscarCie10(codigo.trim())
      if (!Array.isArray(resultados) || !resultados.length) {
        setError(codePath, { type: 'manual', message: 'Código no encontrado' })
        setValue(descripcionPath, '', { shouldDirty: true })
      } else {
        const encontrado = normalizeCie10(resultados[0])
        clearErrors(codePath)
        setValue(codePath, (encontrado.codigo || codigo).toUpperCase(), { shouldDirty: true, shouldValidate: true })
        setValue(descripcionPath, encontrado.descripcion || '', { shouldDirty: true, shouldValidate: true })
        setDescriptionOptions((state) => ({ ...state, [index]: [encontrado] }))
      }
    } catch {
      setError(codePath, { type: 'manual', message: 'Código no encontrado' })
      setValue(descripcionPath, '', { shouldDirty: true })
    } finally {
      setLookupState((state) => ({ ...state, [index]: false }))
    }
  }

  const searchDescriptionOptions = async (index, query) => {
    const trimmed = query?.trim() ?? ''
    const normalizedQuery = dedupeNormalizedQuery ? trimmed.toLowerCase() : trimmed
    const lastQuery = lastDescriptionQueryRef.current[index]

    if (trimmed.length < searchMinLength) {
      descriptionSearchRequestIdRef.current[index] = (descriptionSearchRequestIdRef.current[index] ?? 0) + 1
      lastDescriptionQueryRef.current[index] = ''
      setDescriptionOptions((state) => ({ ...state, [index]: [] }))
      setDescriptionLookupState((state) => ({ ...state, [index]: false }))
      return
    }

    if (dedupeNormalizedQuery && lastQuery === normalizedQuery) {
      return
    }

    const requestId = (descriptionSearchRequestIdRef.current[index] ?? 0) + 1
    descriptionSearchRequestIdRef.current[index] = requestId
    lastDescriptionQueryRef.current[index] = normalizedQuery
    setDescriptionLookupState((state) => ({ ...state, [index]: true }))

    try {
      const resultados = await buscarCie10(trimmed)
      if (descriptionSearchRequestIdRef.current[index] !== requestId) return

      let options = (Array.isArray(resultados) ? resultados : [])
        .map(normalizeCie10)
        .filter((item) => item.codigo || item.descripcion)

      if (searchLimit) {
        options = options.slice(0, searchLimit)
      }

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
    const descripcionPath = getPath(index, 'descripcion')
    const codigoPath = getPath(index, 'codigoCie10')
    const text = (value || '').trim()

    if (!text) {
      setValue(codigoPath, '', { shouldDirty: true, shouldValidate: true })
      clearErrors(codigoPath)
      return false
    }

    const options = descriptionOptions[index] || []
    const match = options.find((item) => item.descripcion?.toLowerCase() === text.toLowerCase())
    if (!match) return false

    setValue(codigoPath, match.codigo, { shouldDirty: true, shouldValidate: true })
    setValue(descripcionPath, match.descripcion, { shouldDirty: true, shouldValidate: true })
    clearErrors(codigoPath)
    clearErrors(descripcionPath)
    return true
  }

  return (
    <>
      <div className="section-div">{sectionTitle}</div>
      <Card allowOverflow>
        <CardBody noPadding>
          <table className="data-table row-top">
            <thead>
              <tr>
                <th style={{ width: headers.codeWidth }}>{headers.code}</th>
                <th>{headers.description}</th>
                <th style={{ width: headers.typeWidth }}>{headers.type}</th>
                <th style={{ width: headers.caseWidth }}>{headers.case}</th>
                <th style={{ width: headers.problemWidth }}>{headers.problem}</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const rowErrors = errors?.diagnosticos?.[index]
                const rowBusy = lookupState[index] || descriptionLookupState[index]
                return (
                  <Fragment key={field.id}>
                    {renderRowPrefix ? renderRowPrefix(index) : null}
                    <tr style={rowStyle ? rowStyle(index) : undefined}>
                      <td>
                        <FormField error={rowErrors?.codigoCie10?.message}>
                          <Input
                            {...register(getPath(index, 'codigoCie10'), {
                              required: 'El código CIE-10 es requerido',
                              maxLength: {
                                value: 10,
                                message: 'El código CIE-10 no debe superar 10 caracteres',
                              },
                            })}
                            onChange={(event) => {
                              const path = getPath(index, 'codigoCie10')
                              const value = event.target.value.toUpperCase()
                              setValue(path, value, { shouldDirty: true, shouldValidate: true })
                              clearErrors(path)
                            }}
                            onBlur={async (event) => {
                              await handleCodigoBlur(index, event.target.value)
                            }}
                            maxLength={10}
                            placeholder={headers.codePlaceholder}
                            disabled={isReadOnly}
                            style={{
                              ...inputCellStyle,
                              fontFamily: 'var(--font-mono)',
                              borderColor: rowErrors?.codigoCie10 ? 'var(--c-red)' : undefined,
                            }}
                          />
                        </FormField>
                      </td>
                      <td>
                        <FormField error={rowErrors?.descripcion?.message}>
                          <Controller
                            control={control}
                            name={getPath(index, 'descripcion')}
                            rules={{
                              maxLength: {
                                value: 500,
                                message: 'La descripción no debe superar 500 caracteres',
                              },
                            }}
                            render={({ field: controllerField }) => (
                              <AutocompleteSelect
                                value={controllerField.value || ''}
                                onChange={(value) => {
                                  const descripcionPath = getPath(index, 'descripcion')
                                  const codigoPath = getPath(index, 'codigoCie10')

                                  controllerField.onChange(value)
                                  clearErrors(descripcionPath)

                                  if (applyDescriptionSelection(index, value)) {
                                    return
                                  }

                                  setValue(codigoPath, '', { shouldDirty: true, shouldValidate: true })
                                  clearErrors(codigoPath)
                                }}
                                onBlur={() => {
                                  controllerField.onBlur()
                                  applyDescriptionSelection(index, getValues(getPath(index, 'descripcion')))
                                }}
                                onSearch={(query) => searchDescriptionOptions(index, query)}
                                onSelect={(item) => {
                                  const codigoPath = getPath(index, 'codigoCie10')
                                  const descripcionPath = getPath(index, 'descripcion')
                                  setValue(codigoPath, item.codigo, { shouldDirty: true, shouldValidate: true })
                                  setValue(descripcionPath, item.descripcion, { shouldDirty: true, shouldValidate: true })
                                  clearErrors(codigoPath)
                                  clearErrors(descripcionPath)
                                }}
                                options={descriptionOptions[index] || []}
                                loading={Boolean(descriptionLookupState[index])}
                                getOptionLabel={(item) => item.descripcion}
                                getOptionValue={(item) => item.descripcion}
                                getOptionMeta={(item) => item.codigo}
                                getOptionKey={(item) => `${item.codigo}-${item.descripcion}`}
                                maxLength={500}
                                placeholder={lookupState[index] ? 'Buscando...' : headers.descriptionPlaceholder}
                                readOnly={lookupState[index]}
                                disabled={isReadOnly}
                                style={{
                                  ...inputCellStyle,
                                  background: rowBusy ? '#f8fafc' : undefined,
                                  borderStyle: rowBusy ? 'dashed' : undefined,
                                }}
                              />
                            )}
                          />
                        </FormField>
                      </td>
                      <td>
                        <FormField error={rowErrors?.tipo?.message}>
                          <Select
                            {...register(getPath(index, 'tipo'))}
                            disabled={isReadOnly}
                            style={{
                              ...inputCellStyle,
                              background: tipoBg(getValues(getPath(index, 'tipo'))),
                              fontWeight: 600,
                            }}
                          >
                            {typeOptions.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </Select>
                        </FormField>
                      </td>
                      <td>
                        <FormField error={rowErrors?.caso?.message}>
                          <Select
                            {...register(getPath(index, 'caso'))}
                            disabled={isReadOnly}
                            style={inputCellStyle}
                          >
                            {['Nuevo', 'Repetido'].map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </Select>
                        </FormField>
                      </td>
                      <td>
                        <FormField error={rowErrors?.nroProblemAsoc?.message}>
                          {problemField.kind === 'select' ? (
                            <Select
                              {...register(getPath(index, 'nroProblemAsoc'), problemField.rules)}
                              disabled={isReadOnly}
                              style={inputCellStyle}
                            >
                              {problemField.options.map((option) => (
                                <option key={option} value={String(option)}>
                                  {option}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            <Input
                              {...register(getPath(index, 'nroProblemAsoc'), problemField.rules)}
                              placeholder="N°"
                              type="number"
                              min={problemField.min}
                              max={problemField.max}
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
                            onClick={() => remove(index)}
                            disabled={isReadOnly}
                          >
                            <Trash2 size={12} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  </Fragment>
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
              onClick={() => append(createRow(fields.length + 1))}
            >
              {addButtonLabel}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  )
}

DiagnosticoTableSection.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  headers: PropTypes.shape({
    code: PropTypes.string.isRequired,
    codeWidth: PropTypes.number.isRequired,
    codePlaceholder: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    descriptionPlaceholder: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    typeWidth: PropTypes.number.isRequired,
    case: PropTypes.string.isRequired,
    caseWidth: PropTypes.number.isRequired,
    problem: PropTypes.string.isRequired,
    problemWidth: PropTypes.number.isRequired,
  }).isRequired,
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
  addButtonLabel: PropTypes.string.isRequired,
  typeOptions: PropTypes.array.isRequired,
  problemField: PropTypes.shape({
    kind: PropTypes.oneOf(['input', 'select']).isRequired,
    rules: PropTypes.object,
    options: PropTypes.array,
    min: PropTypes.string,
    max: PropTypes.string,
  }).isRequired,
  rowStyle: PropTypes.func,
  renderRowPrefix: PropTypes.func,
  searchMinLength: PropTypes.number,
  searchLimit: PropTypes.number,
  dedupeNormalizedQuery: PropTypes.bool,
}
