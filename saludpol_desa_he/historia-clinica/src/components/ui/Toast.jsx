import PropTypes from 'prop-types'
import { useEffect } from 'react'
import styles from './Toast.module.css'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div className={[styles.toast, styles[type]].join(' ')}>
      <span>{message}</span>
    </div>
  )
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
}
