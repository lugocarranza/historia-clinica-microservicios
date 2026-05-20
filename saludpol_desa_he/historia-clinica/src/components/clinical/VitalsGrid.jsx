import PropTypes from 'prop-types'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'

export default function VitalsGrid({
  fields,
  register,
  errors,
  values,
  imcValue,
  isReadOnly = false,
  fieldPrefix = '',
}) {
  const getPath = (key) => (fieldPrefix ? `${fieldPrefix}.${key}` : key)

  return (
    <div className="form-grid g4">
      {fields.map(({ key, label, placeholder, type, step, inputMode, min, max, maxLength, rules, getWarning }) => (
        <FormField
          key={key}
          label={label}
          error={errors?.[key]?.message}
          warning={getWarning?.(values?.[key])}
        >
          <Input
            type={type || 'text'}
            step={step}
            inputMode={inputMode}
            min={min}
            max={max}
            maxLength={maxLength}
            {...register(getPath(key), rules)}
            placeholder={placeholder}
            disabled={isReadOnly}
          />
        </FormField>
      ))}
      <FormField label="IMC (kg/m²)">
        <Input readOnly value={imcValue} placeholder="-" />
      </FormField>
    </div>
  )
}

VitalsGrid.propTypes = {
  fields: PropTypes.array.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  values: PropTypes.object,
  imcValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isReadOnly: PropTypes.bool,
  fieldPrefix: PropTypes.string,
}
