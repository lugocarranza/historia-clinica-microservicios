import PropTypes from 'prop-types'
import styles from './Tabs.module.css'

export function TabsBar({ tabs, active, onChange }) {
  return (
    <div className={styles.bar}>
      {tabs.map((t) => (
        <button
          key={t.key}
          className={[styles.tab, active === t.key ? styles.active : '', t.disabled ? styles.disabled : ''].join(' ').trim()}
          onClick={() => !t.disabled && onChange(t.key)}
          type="button"
          disabled={t.disabled}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

TabsBar.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })).isRequired,
  active: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}
