import PropTypes from 'prop-types'
import { Card, CardBody } from '@/components/ui/Card'

export default function StubPage({ nombre }) {
  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">{nombre}</div>
          <div className="page-subtitle">Módulo en desarrollo &mdash; Sistema HCE SALUDPOL</div>
        </div>
      </div>
      <Card>
        <CardBody>
          <div className="empty-state">
            <div className="empty-state-title">Módulo {nombre}</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              Este módulo estará disponible en la siguiente fase de desarrollo.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

StubPage.propTypes = {
  nombre: PropTypes.string.isRequired,
}
