import PropTypes from 'prop-types'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import inputStyles from './Input.module.css'
import styles from './AutocompleteSelect.module.css'

const defaultGetOptionLabel = (option) => option?.label ?? ''
const defaultGetOptionValue = (option) => option?.value ?? defaultGetOptionLabel(option)
const defaultGetOptionMeta = (option) => option?.meta ?? ''

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timerId)
  }, [value, delay])

  return debouncedValue
}

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(node)
        return
      }
      ref.current = node
    })
  }
}

const normalizeText = (value) => (value == null ? '' : String(value))

const AutocompleteSelect = forwardRef(function AutocompleteSelect({
  value = '',
  onChange,
  onBlur,
  onFocus,
  onSearch,
  onSelect,
  options = [],
  loading = false,
  disabled = false,
  readOnly = false,
  placeholder,
  maxLength,
  className = '',
  style,
  minSearchLength = 3,
  searchDebounceMs = 250,
  noResultsText = 'Sin coincidencias',
  loadingText = 'Buscando...',
  getOptionLabel = defaultGetOptionLabel,
  getOptionValue = defaultGetOptionValue,
  getOptionMeta = defaultGetOptionMeta,
  getOptionKey,
  ...inputProps
}, ref) {
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const onSearchRef = useRef(onSearch)
  const lastEmittedQueryRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [hasTyped, setHasTyped] = useState(false)

  const normalizedValue = normalizeText(value)
  const debouncedValue = useDebouncedValue(normalizedValue, searchDebounceMs)

  const normalizedOptions = useMemo(() => {
    return options.map((option, index) => ({
      raw: option,
      label: normalizeText(getOptionLabel(option)),
      value: normalizeText(getOptionValue(option)),
      meta: normalizeText(getOptionMeta(option)),
      key: getOptionKey ? getOptionKey(option, index) : `${normalizeText(getOptionValue(option))}-${index}`,
    }))
  }, [options, getOptionLabel, getOptionValue, getOptionMeta, getOptionKey])

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    if (disabled) {
      setIsOpen(false)
      return
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [disabled])

  const emitSearch = (query) => {
    if (lastEmittedQueryRef.current === query) return
    lastEmittedQueryRef.current = query
    onSearchRef.current?.(query)
  }

  useEffect(() => {
    if (!onSearchRef.current || disabled || readOnly || !hasTyped) return

    const query = debouncedValue.trim()
    if (query.length < minSearchLength) {
      emitSearch('')
      return
    }

    emitSearch(query)
  }, [debouncedValue, disabled, readOnly, hasTyped, minSearchLength])

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1)
    } else if (highlightedIndex >= normalizedOptions.length) {
      setHighlightedIndex(normalizedOptions.length - 1)
    }
  }, [isOpen, highlightedIndex, normalizedOptions.length])

  const shouldShowMenu =
    isOpen &&
    !disabled &&
    !readOnly &&
    (loading || normalizedOptions.length > 0 || normalizedValue.trim().length >= minSearchLength)

  const selectOption = (option) => {
    onChange?.(option.label)
    onSelect?.(option.raw)
    setHasTyped(false)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleInputChange = (event) => {
    setHasTyped(true)
    onChange?.(event.target.value)
    setIsOpen(true)
    setHighlightedIndex(0)
  }

  const handleInputBlur = () => {
    onBlur?.()
  }

  const handleInputFocus = () => {
    if (disabled || readOnly) return
    setIsOpen(true)
    onFocus?.()
  }

  const handleKeyDown = (event) => {
    if (disabled || readOnly) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setHighlightedIndex((currentIndex) => {
        if (!normalizedOptions.length) return -1
        if (currentIndex < 0) return 0
        return Math.min(currentIndex + 1, normalizedOptions.length - 1)
      })
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((currentIndex) => {
        if (!normalizedOptions.length) return -1
        if (currentIndex < 0) return normalizedOptions.length - 1
        return Math.max(currentIndex - 1, 0)
      })
      return
    }

    if (event.key === 'Enter' && isOpen && highlightedIndex >= 0) {
      event.preventDefault()
      selectOption(normalizedOptions[highlightedIndex])
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div className={[styles.root, shouldShowMenu ? styles.rootOpen : ''].join(' ').trim()} ref={rootRef}>
      <input
        {...inputProps}
        ref={mergeRefs(inputRef, ref)}
        className={[inputStyles.input, styles.input, readOnly ? inputStyles.readonly : '', className].join(' ').trim()}
        value={normalizedValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete="off"
        style={style}
      />

      <span className={styles.indicator}>
        {loading ? <Loader2 size={14} className={styles.spin} /> : <ChevronDown size={14} />}
      </span>

      {shouldShowMenu && (
        <div className={styles.menu} role="listbox"> {/* NOSONAR (S6819: Custom combobox) */}
          {loading && (
            <div className={styles.stateRow}>
              <Loader2 size={12} className={styles.spin} />
              {loadingText}
            </div>
          )}

          {!loading && normalizedOptions.length === 0 && (
            <div className={styles.stateRow}>{noResultsText}</div>
          )}

          {!loading && normalizedOptions.map((option, index) => (
            // NOSONAR (este componente es un combobox personalizado y <option> no funciona fuera de <select>)
            <button
              key={option.key}
              type="button"
              className={[styles.option, highlightedIndex === index ? styles.optionActive : ''].join(' ').trim()}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              role="option" // NOSONAR (este componente es un combobox personalizado y <option> no funciona fuera de <select>)
              aria-selected={highlightedIndex === index}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              {option.meta ? <span className={styles.optionMeta}>{option.meta}</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

AutocompleteSelect.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onSearch: PropTypes.func,
  onSelect: PropTypes.func,
  options: PropTypes.array,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  minSearchLength: PropTypes.number,
  searchDebounceMs: PropTypes.number,
  noResultsText: PropTypes.string,
  loadingText: PropTypes.string,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  getOptionMeta: PropTypes.func,
  getOptionKey: PropTypes.func,
}

export default AutocompleteSelect
