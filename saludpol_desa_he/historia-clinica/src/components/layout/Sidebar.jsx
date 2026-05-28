import { NavLink, useNavigate } from 'react-router-dom'
import {
  ClipboardList, Stethoscope, RefreshCw, FileText, AlertCircle,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { to: '/admision', icon: ClipboardList, label: 'Filiación' },
  { to: '/consulta-externa', icon: Stethoscope, label: 'Consulta Externa' },
  { to: '/consulta-control', icon: RefreshCw, label: 'Control / Seguimiento' },
  { to: '/orden-medica', icon: FileText, label: 'Orden Médica' },
  { to: '/emergencia', icon: AlertCircle, label: 'Emergencia' },
  // { to: '/hospitalizacion', icon: Hospital, label: 'Hospitalización' },
  // { to: '/farmacia', icon: Pill, label: 'Farmacia' },
  // { to: '/laboratorio', icon: FlaskConical, label: 'Laboratorio' },
  // { to: '/imagenes', icon: ScanLine, label: 'Imágenes' },
  // { to: '/reportes', icon: BarChart2, label: 'Reportes' },
  // { to: '/estadistica', icon: TrendingUp, label: 'Estadística' },
]

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <img src="/logo.png" alt="SALUDPOL" className={styles.logo} />
      </div>

      <div className={styles.sistema}>Historia Clínica</div>

      <nav className={styles.nav}>
        <div className={styles.section}>Módulos</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [styles.item, isActive ? styles.active : ''].join(' ')
            }
          >
            <Icon size={15} className={styles.icon} />
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userName}>{user?.nombres || 'Usuario'} {user?.apellidoPaterno || ''} {user?.apellidoMaterno || ''}</div>
        <div className={styles.userRole}>{user?.roles?.[0] || ''}</div>
        <button className={styles.logoutBtn} onClick={handleLogout} type="button">
          <LogOut size={13} /> Salir
        </button>
      </div>
    </aside>
  )
}