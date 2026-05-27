import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

const ENFERMEDADES = ['Hipertensión Arterial', 'Diabetes Mellitus', 'Cáncer', 'Cardiopatía', 'ACV', 'TBC', 'Enf. Mental', 'Enf. Renal', 'Otros']
const FAMILIARES = ['Padre', 'Madre', 'Hermanos', 'Abuelos', 'Otros']
const MAX_OBSERVACIONES = 500

const isNoRefiere = (rows) =>
  rows.length > 0 &&
  rows.every((r) => FAMILIARES.every((f) => r[f.toLowerCase()] === 'N') && !r.observaciones)

const getDefaultRows = (initialData) => {
  const map = new Map((initialData || []).map((item) => [item.enfermedad, item]))
  return ENFERMEDADES.map((enfermedad) => {
    const source = map.get(enfermedad)
    return {
      enfermedad,
      padre: source?.padre || 'N',
      madre: source?.madre || 'N',
      hermanos: source?.hermanos || 'N',
      abuelos: source?.abuelos || 'N',
      otros: source?.otros || 'N',
    }
  })
}

const getDefaultFormValues = (initialData) => {
  const map = new Map((initialData || []).map((item) => [item.enfermedad, item]))
  return {
    rows: ENFERMEDADES.map((enfermedad) => ({
      observaciones: map.get(enfermedad)?.observaciones || '',
    })),
  }
}

export default function TabAntFamiliares({ onSave, saves, initialData, isReadOnly = false }) {
  const [rows, setRows] = useState(
    ENFERMEDADES.map((e) => ({ enfermedad: e, padre: 'N', madre: 'N', hermanos: 'N', abuelos: 'N', otros: 'N' }))
  )
  const [noRefiere, setNoRefiere] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rows: ENFERMEDADES.map(() => ({ observaciones: '' })),
    },
  })

  useEffect(() => {
    const defaultRows = getDefaultRows(initialData)
    setRows(defaultRows)
    reset(getDefaultFormValues(initialData))
    setNoRefiere(isNoRefiere(defaultRows))
  }, [initialData, reset])

  const toggle = (i, campo) => {
    if (isReadOnly) return
    setRows((currentRows) =>
      currentRows.map((row, idx) => (idx === i ? { ...row, [campo]: row[campo] === 'S' ? 'N' : 'S' } : row))
    )
  }

  const handleNoRefiere = () => {
    if (isReadOnly) return
    setNoRefiere((prev) => !prev)
  }

  const onSubmit = () => {
    if (isReadOnly) return

    const payload = noRefiere
      ? ENFERMEDADES.map((enfermedad) => ({
          enfermedad,
          padre: 'N', madre: 'N', hermanos: 'N', abuelos: 'N', otros: 'N',
          observaciones: '',
        }))
      : rows.map((row, index) => ({
          ...row,
          observaciones: getValues(`rows.${index}.observaciones`) || '',
        }))

    onSave(saves.saveAntFamiliares, payload)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="section-div">3. Antecedentes Familiares</div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, cursor: isReadOnly ? 'default' : 'pointer', fontSize: 13, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={noRefiere}
            onChange={handleNoRefiere}
            disabled={isReadOnly}
            style={{ accentColor: 'var(--c-primary)', width: 15, height: 15 }}
          />
          <span>No refiere antecedentes familiares</span>
        </label>
      </div>

      {!noRefiere && (
        <Card>
          <CardBody noPadding>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enfermedad</th>
                  {FAMILIARES.map((f) => <th key={f} style={{ width: 80 }}>{f}</th>)}
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.enfermedad}>
                    <td style={{ fontWeight: 500 }}>{row.enfermedad}</td>
                    {FAMILIARES.map((f) => {
                      const campo = f.toLowerCase()
                      return (
                        <td key={f} style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={row[campo] === 'S'}
                            onChange={() => toggle(i, campo)}
                            disabled={isReadOnly}
                            style={{ accentColor: 'var(--c-primary)', width: 14, height: 14 }}
                          />
                        </td>
                      )
                    })}
                    <td>
                      <FormField error={errors.rows?.[i]?.observaciones?.message}>
                        <Input
                          {...register(`rows.${i}.observaciones`, {
                            validate: (value) => {
                              const hasSelection = FAMILIARES.some((f) => rows[i][f.toLowerCase()] === 'S')
                              if (hasSelection && !value.trim()) return 'Las observaciones son requeridas'
                              return true
                            },
                            maxLength: {
                              value: MAX_OBSERVACIONES,
                              message: `Las observaciones no deben superar ${MAX_OBSERVACIONES} caracteres`,
                            },
                          })}
                          maxLength={MAX_OBSERVACIONES}
                          placeholder="Notas"
                          disabled={isReadOnly}
                          style={{ padding: '4px 7px', fontSize: 12 }}
                        />
                      </FormField>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveAntFamiliares.isPending}>
          {saves.saveAntFamiliares.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabAntFamiliares.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveAntFamiliares: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
