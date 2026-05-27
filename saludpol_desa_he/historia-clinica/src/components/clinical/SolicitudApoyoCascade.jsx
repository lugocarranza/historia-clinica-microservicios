import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Select } from '@/components/ui/Input'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import { buscarSubTiposProcedimiento, buscarProcedimientosCpms } from '@/api/maestro'

export default function SolicitudApoyoCascade({ value, onChange, isReadOnly }) {
  const isComplete = !!(value?.codigoCpms)

  // Modo presentación vs. selección
  const [isEditing, setIsEditing] = useState(!isComplete)

  // Cadena de selecciones: [{ id, desc }, ...]
  const [chain, setChain] = useState([])
  // Opciones cacheadas por clave de padre: { '__root__': [...], [id]: [...] }
  const [levelOpts, setLevelOpts] = useState({})
  // Clave que está cargando actualmente
  const [fetchingKey, setFetchingKey] = useState(null)

  // Autocomplete de procedimiento
  const [procText, setProcText] = useState('')
  const [procOpts, setProcOpts] = useState([])
  const [procLoading, setProcLoading] = useState(false)
  const procReqRef = useRef(0)
  // Cache de claves ya solicitadas para evitar peticiones duplicadas
  const fetchedRef = useRef(new Set())

  const fetchLevel = async (parentId) => {
    const key = parentId ?? '__root__'
    if (fetchedRef.current.has(key)) return
    fetchedRef.current.add(key)
    setFetchingKey(key)
    try {
      const data = await buscarSubTiposProcedimiento(2, parentId)
      setLevelOpts((prev) => ({ ...prev, [key]: data }))
    } catch {
      fetchedRef.current.delete(key)
    } finally {
      setFetchingKey(null)
    }
  }

  // Carga el nivel raíz al entrar en modo edición
  useEffect(() => {
    if (isEditing) fetchLevel(undefined)
  }, [isEditing]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLevelSelect = (insertAt, item) => {
    const newChain = [
      ...chain.slice(0, insertAt),
      { id: item.idSubTipoProcedimiento, desc: item.descripcionSubTipoProcedimiento },
    ]
    setChain(newChain)
    setProcText('')
    setProcOpts([])
    fetchLevel(item.idSubTipoProcedimiento)
    // Propaga valor parcial (sin procedimiento aún)
    onChange({
      ...value,
      idSubTipoParent: newChain[0]?.id ?? '',
      tipo: newChain[0]?.desc ?? '',
      idSubTipoUltimo: item.idSubTipoProcedimiento,
      descripcion: '',
      codigoCpms: '',
      codigoSegus: '',
    })
  }

  const handleProcSearch = async (term) => {
    const lastId = chain[chain.length - 1]?.id
    if (!term || !lastId) { setProcOpts([]); return }
    const reqId = ++procReqRef.current
    setProcLoading(true)
    try {
      const results = await buscarProcedimientosCpms(term, lastId)
      if (procReqRef.current === reqId) setProcOpts(Array.isArray(results) ? results : [])
    } catch {
      if (procReqRef.current === reqId) setProcOpts([])
    } finally {
      if (procReqRef.current === reqId) setProcLoading(false)
    }
  }

  const handleProcSelect = (proc) => {
    const lastId = chain[chain.length - 1]?.id
    onChange({
      ...value,
      idSubTipoParent: chain[0]?.id ?? '',
      tipo: chain[0]?.desc ?? '',
      idSubTipoUltimo: lastId ?? '',
      descripcion: proc.descripcionSegus,
      codigoCpms: proc.codigoProcedimiento,
      codigoSegus: proc.codigoSegus,
    })
    setProcText(proc.descripcionSegus)
    setIsEditing(false)
  }

  const handleCambiar = () => {
    setChain([])
    setLevelOpts({})
    fetchedRef.current.clear()
    setProcText('')
    setProcOpts([])
    setIsEditing(true)
  }

  // Modo resumen
  if (!isEditing && isComplete) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minHeight: 32 }}>
        <span style={{ fontSize: 13 }}>
          {value.tipo && <><b>{value.tipo}</b>{' › '}</>}
          {value.descripcion}
          <span style={{ color: '#888', marginLeft: 6, fontSize: 12 }}>
            ({value.codigoCpms} / {value.codigoSegus})
          </span>
        </span>
        {!isReadOnly && (
          <button
            type="button"
            onClick={handleCambiar}
            style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Cambiar
          </button>
        )}
      </div>
    )
  }

  // Modo selección en cascada
  const rootKey = '__root__'
  const rootOpts = levelOpts[rootKey]
  const isLoadingRoot = fetchingKey === rootKey

  // El último nivel de la cadena tiene hijos vacíos → mostrar autocomplete
  const lastId = chain[chain.length - 1]?.id
  const lastChildren = lastId == null ? undefined : levelOpts[lastId]
  const showAutocomplete = lastId != null && lastChildren !== undefined && lastChildren.length === 0
  const isLoadingChild = lastId != null && fetchingKey === lastId

  let rootContent = null
  if (isLoadingRoot) {
    rootContent = <span style={{ fontSize: 12, color: '#888' }}>Cargando…</span>
  } else if (rootOpts?.length > 0) {
    rootContent = (
      <Select
        value={chain[0]?.id || ''}
        onChange={(e) => {
          const found = rootOpts.find((o) => o.idSubTipoProcedimiento === e.target.value)
          if (found) handleLevelSelect(0, found)
        }}
        disabled={isReadOnly}
        style={{ fontSize: 13, padding: '4px 7px' }}
      >
        <option value="">Seleccionar</option>
        {rootOpts.map((o) => (
          <option key={o.idSubTipoProcedimiento} value={o.idSubTipoProcedimiento}>
            {o.descripcionSubTipoProcedimiento}
          </option>
        ))}
      </Select>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Nivel raíz */}
      {rootContent}

      {/* Niveles intermedios: los hijos de cada elemento seleccionado */}
      {chain.map((item, i) => {
        const childOpts = levelOpts[item.id]
        if (!childOpts?.length) return null
        return (
          <Select
            key={item.id}
            value={chain[i + 1]?.id || ''}
            onChange={(e) => {
              const found = childOpts.find((o) => o.idSubTipoProcedimiento === e.target.value)
              if (found) handleLevelSelect(i + 1, found)
            }}
            disabled={isReadOnly}
            style={{ fontSize: 13, padding: '4px 7px' }}
          >
            <option value="">Seleccionar</option>
            {childOpts.map((o) => (
              <option key={o.idSubTipoProcedimiento} value={o.idSubTipoProcedimiento}>
                {o.descripcionSubTipoProcedimiento}
              </option>
            ))}
          </Select>
        )
      })}

      {/* Indicador de carga de hijos pa mostrar algo de feedback */}
      {isLoadingChild && <span style={{ fontSize: 12, color: '#888' }}>Cargando…</span>}

      {/* Autocomplete de procedimiento */}
      {showAutocomplete && <div style={{ width: '100%' }}>
        <AutocompleteSelect
          value={procText}
          onChange={(text) => setProcText(text)}
          onSearch={handleProcSearch}
          onSelect={handleProcSelect}
          options={procOpts}
          loading={procLoading}
          placeholder="Buscar procedimiento..."
          minSearchLength={3}
          getOptionLabel={(o) => o.descripcionSegus}
          getOptionValue={(o) => o.codigoProcedimiento}
          getOptionMeta={(o) => `${o.codigoProcedimiento} / ${o.codigoSegus}`}
          disabled={isReadOnly}
          style={{ fontSize: 13, padding: '4px 7px', minWidth: 240 }}
        />
      </div>}
    </div>
  )
}

SolicitudApoyoCascade.propTypes = {
  value: PropTypes.shape({
    idSubTipoParent: PropTypes.string,
    idSubTipoUltimo: PropTypes.string,
    tipo: PropTypes.string,
    descripcion: PropTypes.string,
    codigoCpms: PropTypes.string,
    codigoSegus: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
}
