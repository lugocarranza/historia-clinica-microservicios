import PropTypes from 'prop-types'

export function LoadingSpinner({ dark = false }) {
  return <span className={`spinner ${dark ? 'dark' : ''}`} />
}

LoadingSpinner.propTypes = {
  dark: PropTypes.bool
}
