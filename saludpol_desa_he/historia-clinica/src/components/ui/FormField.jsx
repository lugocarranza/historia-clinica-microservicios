import PropTypes from 'prop-types'
import styles from './FormField.module.css'

export default function FormField({ label, required, error, warning, hint, children, className = '' }) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.req}>*</span>}
        </label>
      )}
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
      {!error && warning && <span className={styles.warning} style={{ color: '#d97706', fontSize: 11, marginTop: 4 }}>{warning}</span>}
    </div>
  )
}

FormField.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  warning: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
}
