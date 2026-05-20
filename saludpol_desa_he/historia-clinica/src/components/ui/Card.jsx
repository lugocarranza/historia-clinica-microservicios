import PropTypes from 'prop-types'
import styles from './Card.module.css'

export function Card({ children, className = '', allowOverflow = false }) {
  return <div className={[styles.card, allowOverflow ? styles.allowOverflow : '', className].join(' ').trim()}>{children}</div>
}

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  allowOverflow: PropTypes.bool,
}

export function CardHeader({ title, actions, variant = 'default' }) {
  return (
    <div className={[styles.header, styles[variant]].join(' ')}>
      <span className={[styles.title, styles[`title-${variant}`]].join(' ')}>{title}</span>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}

CardHeader.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.node,
  variant: PropTypes.string,
}

export function CardBody({ children, noPadding = false }) {
  return (
    <div className={noPadding ? '' : styles.body}>{children}</div>
  )
}

CardBody.propTypes = {
  children: PropTypes.node,
  noPadding: PropTypes.bool,
}
