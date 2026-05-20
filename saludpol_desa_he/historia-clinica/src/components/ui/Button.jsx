import PropTypes from 'prop-types'
import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[styles.btn, styles[variant], styles[size], className].join(' ')}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  size: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
}
