import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import OrdenMedicaListaPanel from './OrdenMedicaListaPanel'

export default function OrdenMedicaPage() {
  const { toast, success, error, hideToast } = useToast()
  const [dniInput, setDniInput] = useState('')
  const [dniBuscado, setDniBuscado] = useState('')

  const handleBuscar = (event) => {
    event.preventDefault()
    const dni = dniInput.trim()
    if (!/^\d{8,12}$/.test(dni)) {
      error('Ingrese un DNI válido')
      return
    }
    setDniBuscado(dni)
    success('Buscando órdenes médicas')
  }

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Orden Médica</div>
          <div className="page-subtitle">
            Búsqueda directa de órdenes médicas por DNI del paciente
          </div>
        </div>
      </div>

      <Card>
        <CardHeader title="Buscar paciente" />
        <CardBody>
          <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <FormField label="DNI">
              <Input
                value={dniInput}
                onChange={(event) => setDniInput(event.target.value.replaceAll(/\D/g, '').slice(0, 12))}
                placeholder="Ingrese DNI"
                inputMode="numeric"
              />
            </FormField>
            <Button type="submit" variant="primary">
              <Search size={14} /> Buscar
            </Button>
          </form>
        </CardBody>
      </Card>

      {dniBuscado ? (
        <OrdenMedicaListaPanel key={dniBuscado} dniPaciente={dniBuscado} />
      ) : (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div className="empty-state-title">Ingrese un DNI para consultar órdenes</div>
              <div>La búsqueda consulta directamente las órdenes médicas registradas.</div>
            </div>
          </CardBody>
        </Card>
      )}

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.error === true ? 'error' : 'success'}
          onClose={hideToast}
        />
      )}
    </div>
  )
}
