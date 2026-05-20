import PropTypes from 'prop-types'
import styles from './Badge.module.css'

export default function Badge({ children, variant = 'blue' }) {
  return <span className={[styles.badge, styles[variant]].join(' ')}>{children}</span>
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
}
