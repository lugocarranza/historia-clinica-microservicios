import PropTypes from 'prop-types'
import LayoutPatientBanner from '@/components/layout/PatientBanner'

export function PatientBanner({ admision, tipoConsulta }) {
  return <LayoutPatientBanner paciente={admision} nroHc={admision?.nroHc} tipoConsulta={tipoConsulta} />
}

PatientBanner.propTypes = {
  admision: PropTypes.shape({
    apellidosPaciente: PropTypes.string,
    nombresPaciente: PropTypes.string,
    dniPaciente: PropTypes.string,
    fechaNac: PropTypes.string,
    sexo: PropTypes.string,
    situacion: PropTypes.string,
    condicion: PropTypes.string,
    servicio: PropTypes.string,
    nroHc: PropTypes.string,
  }),
  tipoConsulta: PropTypes.string,
}
