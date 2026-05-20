import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const SISTEMAS = [
  { sistema: 'Cardiovascular', sintomas: ['Dolor precordial', 'Palpitaciones', 'Disnea de esfuerzo', 'Edemas', 'Síncope'] },
  { sistema: 'Respiratorio', sintomas: ['Tos', 'Expectoración', 'Hemoptisis', 'Disnea en reposo', 'Sibilancias'] },
  { sistema: 'Digestivo', sintomas: ['Náuseas', 'Vómitos', 'Diarrea', 'Estreñimiento', 'Dolor abdominal', 'Melena'] },
  { sistema: 'Genitourinario', sintomas: ['Disuria', 'Poliuria', 'Hematuria', 'Incontinencia'] },
  { sistema: 'Musculoesquelético', sintomas: ['Artralgia', 'Mialgia', 'Limitación funcional', 'Tumefacción articular'] },
  { sistema: 'Neurológico', sintomas: ['Cefalea', 'Mareos', 'Temblor', 'Convulsiones', 'Alteración de conciencia'] },
]

const getCheckedFromData = (initialData) => {
  const state = {}
  ;(initialData || []).forEach((item) => {
    state[`${item.sistema}__${item.sintoma}`] = item.presente === 'S'
  })
  return state
}

export default function TabRevisionSistemas({ onSave, saves, initialData, isReadOnly = false }) {
  const [checked, setChecked] = useState({})
  const { handleSubmit } = useForm()

  useEffect(() => {
    setChecked(getCheckedFromData(initialData))
  }, [initialData])

  const toggle = (sistema, sintoma) => {
    if (isReadOnly) return
    const key = `${sistema}__${sintoma}`
    setChecked((c) => ({ ...c, [key]: !c[key] }))
  }

  const toggleNoRefiere = (sistema, sintomas) => {
    if (isReadOnly) return
    setChecked((c) => {
      const next = { ...c }
      sintomas.forEach((s) => {
        next[`${sistema}__${s}`] = false
      })
      return next
    })
  }

  const handleSave = () => {
    if (isReadOnly) return

    const data = []
    SISTEMAS.forEach(({ sistema, sintomas }) => {
      sintomas.forEach((sintoma) => {
        data.push({ sistema, sintoma, presente: checked[`${sistema}__${sintoma}`] ? 'S' : 'N' })
      })
    })
    onSave(saves.saveRevisionSistemas, data)
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <div className="section-div">4. Revisión por Sistemas</div>
      {SISTEMAS.map(({ sistema, sintomas }) => {
        const hasAnyChecked = sintomas.some((s) => checked[`${sistema}__${s}`])
        const isNoRefiere = !hasAnyChecked

        return (
          <Card key={sistema} style={{ marginBottom: 8 }}>
            <CardHeader title={sistema} />
            <CardBody>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={isNoRefiere}
                    onChange={() => toggleNoRefiere(sistema, sintomas)}
                    disabled={isReadOnly}
                    style={{ accentColor: 'var(--c-primary)', width: 13, height: 13 }}
                  />
                  <span style={{ marginLeft: 4 }}>No refiere</span>
                </label>
                {sintomas.map((s) => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!checked[`${sistema}__${s}`]}
                      onChange={() => toggle(sistema, s)}
                      disabled={isReadOnly}
                      style={{ accentColor: 'var(--c-primary)', width: 13, height: 13 }}
                    />
                    <span style={{ marginLeft: 4 }}>{s}</span>
                  </label>
                ))}
              </div>
            </CardBody>
          </Card>
        )
      })}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="submit" disabled={isReadOnly || saves.saveRevisionSistemas.isPending}>
          {saves.saveRevisionSistemas.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

TabRevisionSistemas.propTypes = {
  onSave: PropTypes.func.isRequired,
  saves: PropTypes.shape({
    saveRevisionSistemas: PropTypes.shape({ isPending: PropTypes.bool, mutate: PropTypes.func }),
  }),
  initialData: PropTypes.array,
  isReadOnly: PropTypes.bool,
}
