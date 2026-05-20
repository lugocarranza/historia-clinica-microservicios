import PropTypes from 'prop-types'
import { calcEdad, formatDate } from '@/utils/date'

export default function PatientBanner({ paciente, nroHc, tipoConsulta }) {
  if (!paciente) return null

  return (
    <div className="patient-banner">
      <div>
        <div className="pb-name">
          {paciente.apellidosPaciente}, {paciente.nombresPaciente}
        </div>
        <div className="pb-details">
          <div className="pb-item">
            <span className="pb-label">Doc. Identidad</span>
            <span className="pb-value mono">{paciente.dniPaciente}</span>
          </div>
          <div className="pb-item">
            <span className="pb-label">Edad</span>
            <span className="pb-value">{calcEdad(paciente.fechaNac)}</span>
          </div>
          <div className="pb-item">
            <span className="pb-label">F. Nacimiento</span>
            <span className="pb-value">{formatDate(paciente.fechaNac)}</span>
          </div>
          <div className="pb-item">
            <span className="pb-label">Sexo</span>
            <span className="pb-value">{paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
          </div>
          <div className="pb-item">
            <span className="pb-label">Situación</span>
            <span className="pb-value">{paciente.situacion}</span>
          </div>
          <div className="pb-item">
            <span className="pb-label">Condición</span>
            <span className="pb-value">{paciente.condicion}</span>
          </div>
          {paciente.servicio && (
            <div className="pb-item">
              <span className="pb-label">Servicio</span>
              <span className="pb-value">{paciente.servicio}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div className="pb-hc">
          <div className="pb-hc-label">Nº Historia Clínica</div>
          <div className="pb-hc-value">{nroHc || '—'}</div>
        </div>
        {tipoConsulta && (
          <div style={{
            background: 'rgba(255,165,0,.15)',
            border: '1px solid rgba(255,165,0,.35)',
            borderRadius: 6,
            padding: '8px 14px',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Tipo</div>
            <div style={{ fontSize: 12.5, color: '#FFD580', fontWeight: 700, marginTop: 2 }}>{tipoConsulta}</div>
          </div>
        )}
      </div>
    </div>
  )
}

PatientBanner.propTypes = {
  paciente: PropTypes.shape({
    nombresPaciente: PropTypes.string,
    apellidosPaciente: PropTypes.string,
    dniPaciente: PropTypes.string,
    fechaNac: PropTypes.string,
    sexo: PropTypes.string,
    situacion: PropTypes.string,
    condicion: PropTypes.string,
    servicio: PropTypes.string,
  }),
  nroHc: PropTypes.string,
  tipoConsulta: PropTypes.string,
}
