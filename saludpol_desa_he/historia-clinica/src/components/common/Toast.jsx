import PropTypes from 'prop-types'

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`toast ${toast.error ? 'toast-error' : ''}`}>
      <span>{toast.msg}</span>
    </div>
  )
}

Toast.propTypes = {
  toast: PropTypes.shape({
    error: PropTypes.bool,
    msg: PropTypes.string.isRequired,
  }),
}
