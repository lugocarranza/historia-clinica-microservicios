import { useLocation } from 'react-router-dom'
import { todayStr } from '@/utils/date'
import styles from './Topbar.module.css'

const ROUTE_LABELS = {
  '/admision': 'Admisión',
  '/consulta-externa': 'Consulta Externa',
  '/consulta-control': 'Control / Seguimiento',
  '/emergencia': 'Emergencia',
  '/hospitalizacion': 'Hospitalización',
  '/farmacia': 'Farmacia',
  '/laboratorio': 'Laboratorio',
  '/imagenes': 'Imágenes',
  '/reportes': 'Reportes',
  '/estadistica': 'Estadística',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const label = ROUTE_LABELS[base] || ''

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.brand}>SALUDPOL</span>
        <span className={styles.sep}>›</span>
        <span>Historia Clínica Electrónica</span>
        {label && (
          <>
            <span className={styles.sep}>›</span>
            <strong className={styles.current}>{label}</strong>
          </>
        )}
      </div>
      <div className={styles.right}>
        <span className={styles.date}>{todayStr()}</span>
      </div>
    </header>
  )
}
