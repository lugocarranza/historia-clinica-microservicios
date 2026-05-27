import PropTypes from 'prop-types'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import AdmisionPage from '@/pages/admision/AdmisionPage'
import ConsultaExternaPage from '@/pages/consultaexterna/ConsultaExternaPage'
import ConsultaControlPage from '@/pages/consultacontrol/ConsultaControlPage'
import StubPage from '@/pages/stub/StubPage'
import EmergenciaPage from '@/pages/emergencia/EmergenciaPage'

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/admision" replace /> },
      { path: 'admision', element: <AdmisionPage /> },
      { path: 'consulta-externa', element: <ConsultaExternaPage /> },
      { path: 'consulta-control', element: <ConsultaControlPage /> },
      { path: 'emergencia', element: <EmergenciaPage /> },
      { path: 'hospitalizacion', element: <StubPage nombre="Hospitalización" /> },
      { path: 'farmacia', element: <StubPage nombre="Farmacia" /> },
      { path: 'laboratorio', element: <StubPage nombre="Laboratorio" /> },
      { path: 'imagenes', element: <StubPage nombre="Imágenes" /> },
      { path: 'reportes', element: <StubPage nombre="Reportes" /> },
      { path: 'estadistica', element: <StubPage nombre="Estadística" /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default router
