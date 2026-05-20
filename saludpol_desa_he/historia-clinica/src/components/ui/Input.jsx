import PropTypes from 'prop-types'
import styles from './Input.module.css'
import { forwardRef, useEffect, useState } from 'react'

const normalizeText = (value) => (value == null ? '' : String(value))
const getTextLength = (value) => normalizeText(value).length

function useTextFieldValue({ value, defaultValue, onChange }) {
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normalizeText(isControlled ? value : defaultValue))

  useEffect(() => {
    if (isControlled) {
      setUncontrolledValue(normalizeText(value))
    }
  }, [isControlled, value])

  const currentValue = isControlled ? value : uncontrolledValue

  const handleChange = (event) => {
    if (!isControlled) {
      setUncontrolledValue(event.target.value)
    }

    onChange?.(event)
  }

  return {
    currentValue,
    handleChange,
    isControlled,
  }
}

function CharacterCount({ value, maxLength }) {
  if (maxLength == null) {
    return null
  }

  return (
    <div className={styles.charCount}>
      <span className={styles.charFloat}>
        {getTextLength(value)} / {maxLength}
      </span>
    </div>
  )
}

CharacterCount.propTypes = {
  value: PropTypes.any,
  maxLength: PropTypes.number,
}

export const Input = forwardRef(function Input({ readOnly, highlight, className = '', ...props }, ref) {
  const {
    value,
    defaultValue,
    onChange,
    maxLength,
    ...inputProps
  } = props

  const textField = useTextFieldValue({ value, defaultValue, onChange })

  return (
    <>
      <input
        ref={ref}
        className={[
          styles.input,
          readOnly ? styles.readonly : '',
          highlight ? styles.highlight : '',
          className,
        ].join(' ')}
        readOnly={readOnly}
        maxLength={maxLength}
        value={textField.isControlled ? normalizeText(value) : undefined}
        defaultValue={textField.isControlled ? undefined : defaultValue}
        onChange={textField.handleChange}
        {...inputProps}
      />
      <CharacterCount value={textField.currentValue} maxLength={maxLength} />
    </>
  )
})

Input.propTypes = {
  readOnly: PropTypes.bool,
  highlight: PropTypes.bool,
  className: PropTypes.string,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  maxLength: PropTypes.number,
}

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select ref={ref} className={[styles.input, className].join(' ')} {...props}>
      {children}
    </select>
  )
})

Select.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

export const Textarea = forwardRef(function Textarea({ className = '', rows = 3, ...props }, ref) {
  const {
    value,
    defaultValue,
    onChange,
    maxLength,
    ...textareaProps
  } = props

  const textField = useTextFieldValue({ value, defaultValue, onChange })

  return <>
    <textarea
      ref={ref}
      className={[styles.textarea, className].join(' ')}
      rows={rows}
      maxLength={maxLength}
      value={textField.isControlled ? normalizeText(value) : undefined}
      defaultValue={textField.isControlled ? undefined : defaultValue}
      onChange={textField.handleChange}
      {...textareaProps}
    />
    <CharacterCount value={textField.currentValue} maxLength={maxLength} />
  </>
})

Textarea.propTypes = {
  className: PropTypes.string,
  rows: PropTypes.number,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  maxLength: PropTypes.number,
}
