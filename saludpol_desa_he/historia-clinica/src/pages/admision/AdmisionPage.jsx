import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { registrarAdmision, obtenerUltimaAdmisionPorDni } from '@/api/admision'
import { obtenerEstablecimientoPorCodigoIpress } from '@/api/maestro'
import { buscarAsegurado } from '@/api/padron'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import Toast from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { calcEdad, formatDate, toDateTimeLocal } from '@/utils/date'
import styles from './AdmisionPage.module.css'
import { ESPECIALIDADES } from '@/constants/especialidades'

const TIPOS_BENEFICIO = [
  'Atención Ambulatoria', 'Atención Maternidad', 'Atención Preventivo Promocional',
  'Atención Oncológica', 'Atención de Rehabilitación', 'Atención de Salud Mental',
  'Atención de Telesalud', 'Atención Domiciliaria',
]

const PROFESIONES = [
  'Médico', 'Odontólogo', 'Químico Farmacéutico', 'Obstetra',
  'Enfermero(a)', 'Biólogo', 'Psicólogo', 'Nutricionista', 'Asistente Social',
]

const TIPOS_SEGURO = ['SALUDPOL', 'EPS', 'SIS']
const PLANES_SALUD = ['Específico', 'Regular', 'Especial']
const TIPOS_COBERTURA = ['Regular', 'Total']
const TIPOS_ATENCION = ['Consulta Externa', 'Emergencia', 'Hospitalización Total']

const TIPO_ATENCION_ALIASES = {
  'Hospitalización Total': 'Hospitalización Total',
}

const MAX_LENGTHS = {
  dni: 8,
  cartaGarantia: 30,
  actividad: 200,
  subActividad: 200,
  consultaMedica: 100,
  servicio: 100,
  cuiIpress: 20,
  ipressRazonSocial: 255,
  ipressSede: 255,
  ipressRegion: 100,
  ipressCategoria: 20,
  profesionalNombre: 255,
  profesionalColegiatura: 6,
}

function createInitialForm() {
  return {
    cartaGaratiaNro: '',
    tipoSeguro: 'SALUDPOL',
    planSalud: 'Específico',
    tipoCobertura: 'Regular',
    tipoBeneficio: 'Atención Ambulatoria',
    tipoAtencion: 'Consulta Externa',
    actividad: 'Atención médica ambulatoria',
    subActividad: 'Consulta médica',
    consultaMedica: '',
    servicio: '',
    fechaAtencion: toDateTimeLocal(),
    cuiIpress: '',
    ipressRazonSocial: '',
    ipressSede: '',
    ipressRegion: '',
    ipressCategoria: '',
    profesionalNombre: '',
    profesionalProfesion: 'Médico',
    profesionalColegiatura: '',
  }
}

const isEmptyValue = (value) => value == null || String(value).trim() === ''

const resolveCodigoIpressDesdeUsuario = (user) => {
  const primerIpress = Array.isArray(user?.ipress) ? user.ipress[0] : null
  if (!primerIpress) return ''
  if (typeof primerIpress === 'string') return primerIpress.trim()
  if (typeof primerIpress !== 'object') return ''

  const keys = ['codigoIpress', 'codigo', 'cuiIpress', 'renipress', 'codigoRenipress']
  for (const key of keys) {
    const value = primerIpress?.[key]
    if (!isEmptyValue(value)) return String(value).trim()
  }
  return ''
}

const mapEstablecimientoToIpressFields = (establecimiento) => ({
  cuiIpress: establecimiento?.codigoIpress ?? '',
  ipressRazonSocial: establecimiento?.nombreIpress ?? '',
  ipressSede: establecimiento?.distritoIpress ?? establecimiento?.direccionIpress ?? '',
  ipressRegion: establecimiento?.departamentoIpress ?? '',
  ipressCategoria: establecimiento?.categoriaIpress ?? '',
})

const applyIpressDefaults = (formValues, ipressDefaults) => {
  if (!ipressDefaults) return formValues

  const next = { ...formValues }
  for (const [key, value] of Object.entries(ipressDefaults)) {
    if (isEmptyValue(next[key]) && !isEmptyValue(value)) {
      next[key] = value
    }
  }
  return next
}

const normalizarTexto = (value) => (typeof value === 'string' ? value.trim() : value)

function resolverValorSelect(value, opciones, fallback, aliases = {}) {
  if (value == null) return fallback
  const normalizado = normalizarTexto(value)
  const resuelto = aliases[normalizado] || normalizado
  return opciones.includes(resuelto) ? resuelto : fallback
}

function mergePacienteExistente(asegurado, admisionExistente) {
  if (!admisionExistente) return asegurado

  return {
    ...asegurado,
    dniPaciente: admisionExistente.dniPaciente ?? asegurado?.dniPaciente ?? '',
    apellidosPaciente: admisionExistente.apellidosPaciente ?? asegurado?.apellidosPaciente ?? '',
    nombresPaciente: admisionExistente.nombresPaciente ?? asegurado?.nombresPaciente ?? '',
    fechaNac: admisionExistente.fechaNac ?? asegurado?.fechaNac ?? '',
    sexo: admisionExistente.sexo ?? asegurado?.sexo ?? '',
    situacion: admisionExistente.situacion ?? asegurado?.situacion ?? '',
    condicion: admisionExistente.condicion ?? asegurado?.condicion ?? '',
    parentesco: admisionExistente.parentesco ?? asegurado?.parentesco ?? '',
    tipoCobertura: admisionExistente.tipoCobertura ?? asegurado?.tipoCobertura ?? '',
  }
}

const getSexoLabel = (sexo) => {
  if (!sexo) return ''
  return sexo === 'M' ? 'Masculino' : 'Femenino'
}

function createFormWithFiliacionLocal(admisionLocal, ipressDefaults) {
  const base = createInitialForm()
  if (!admisionLocal) return applyIpressDefaults(base, ipressDefaults)

  return applyIpressDefaults({
    ...base,
    cartaGaratiaNro: admisionLocal.cartaGaratiaNro ?? base.cartaGaratiaNro,
    tipoSeguro: resolverValorSelect(admisionLocal.tipoSeguro, TIPOS_SEGURO, base.tipoSeguro),
    planSalud: resolverValorSelect(admisionLocal.planSalud, PLANES_SALUD, base.planSalud),
    tipoCobertura: resolverValorSelect(admisionLocal.tipoCobertura, TIPOS_COBERTURA, base.tipoCobertura),
    tipoBeneficio: resolverValorSelect(admisionLocal.tipoBeneficio, TIPOS_BENEFICIO, base.tipoBeneficio),
    tipoAtencion: resolverValorSelect(admisionLocal.tipoAtencion, TIPOS_ATENCION, base.tipoAtencion, TIPO_ATENCION_ALIASES),
    actividad: admisionLocal.actividad ?? base.actividad,
    subActividad: admisionLocal.subActividad ?? base.subActividad,
    consultaMedica: admisionLocal.consultaMedica ?? base.consultaMedica,
    servicio: resolverValorSelect(admisionLocal.servicio, ESPECIALIDADES, base.servicio),
    fechaAtencion: toDateTimeLocal(),
    cuiIpress: admisionLocal.cuiIpress ?? base.cuiIpress,
    ipressRazonSocial: admisionLocal.ipressRazonSocial ?? base.ipressRazonSocial,
    ipressSede: admisionLocal.ipressSede ?? base.ipressSede,
    ipressRegion: admisionLocal.ipressRegion ?? base.ipressRegion,
    ipressCategoria: admisionLocal.ipressCategoria ?? base.ipressCategoria,
    profesionalNombre: admisionLocal.profesionalNombre ?? base.profesionalNombre,
    profesionalProfesion: resolverValorSelect(admisionLocal.profesionalProfesion, PROFESIONES, base.profesionalProfesion),
    profesionalColegiatura: admisionLocal.profesionalColegiatura ?? base.profesionalColegiatura,
  }, ipressDefaults)
}

export default function AdmisionPage() {
  const { user } = useAuthStore()
  const { toast, success, error, hideToast } = useToast()
  const maxFechaAtencion = toDateTimeLocal()

  const [dni, setDni] = useState('')
  const [paciente, setPaciente] = useState(null)
  const [filiacionPrecargada, setFiliacionPrecargada] = useState(null)
  const [buscandoPaciente, setBuscandoPaciente] = useState(false)
  const [ipressDefaults, setIpressDefaults] = useState(null)

  const limpiarDni = (value) => (value || '').replaceAll(/\D/g, '').slice(0, MAX_LENGTHS.dni)
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: createInitialForm(),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  function showToast(msg, type = 'success') {
    if (type === 'success') success(msg)
    else error(msg)
  }

  useEffect(() => {
    let isActive = true

    const cargarIpressUsuario = async () => {
      const codigoIpress = resolveCodigoIpressDesdeUsuario(user)
      if (!codigoIpress) {
        setIpressDefaults(null)
        return
      }

      try {
        const establecimiento = await obtenerEstablecimientoPorCodigoIpress(codigoIpress)
        if (!isActive) return
        setIpressDefaults(mapEstablecimientoToIpressFields(establecimiento))
      } catch {
        if (!isActive) return
        setIpressDefaults(null)
      }
    }

    cargarIpressUsuario()

    return () => {
      isActive = false
    }
  }, [user])

  useEffect(() => {
    if (!ipressDefaults) return

    const currentValues = getValues()
    Object.entries(ipressDefaults).forEach(([key, value]) => {
      if (isEmptyValue(value)) return
      if (!isEmptyValue(currentValues[key])) return
      setValue(key, value, { shouldDirty: false, shouldValidate: true })
    })
  }, [getValues, ipressDefaults, setValue])

  const [
    cuiIpressValue,
    ipressRazonSocialValue,
    ipressSedeValue,
    ipressRegionValue,
    ipressCategoriaValue,
  ] = watch(['cuiIpress', 'ipressRazonSocial', 'ipressSede', 'ipressRegion', 'ipressCategoria'])

  const isIpressAutofilledReadOnly = (fieldName, fieldValue) => {
    const defaultValue = ipressDefaults?.[fieldName]
    if (isEmptyValue(defaultValue)) return false
    return String(fieldValue ?? '').trim() === String(defaultValue).trim()
  }

  const buscarPaciente = async () => {
    if (!/^\d{8}$/.test(dni)) {
      showToast('Ingrese un DNI válido de 8 dígitos numéricos', 'error')
      return
    }
    setBuscandoPaciente(true)
    try {
      const asegurado = await buscarAsegurado(dni)

      let admisionLocal = null
      try {
        admisionLocal = await obtenerUltimaAdmisionPorDni(dni)
      } catch {
        admisionLocal = null
      }

      setPaciente(mergePacienteExistente(asegurado, admisionLocal))
      reset(createFormWithFiliacionLocal(admisionLocal, ipressDefaults))

      if (admisionLocal) {
        setFiliacionPrecargada({ id: admisionLocal.id, nroHc: dni })
        showToast('Asegurado encontrado. Se precargaron datos de la filiación existente')
      } else {
        setFiliacionPrecargada(null)
        showToast('Asegurado encontrado en el Padrón')
      }
    } catch (err) {
      const status = err.response?.status
      if (err.padronNotFound) {
        showToast(err.apiMessage || 'Asegurado no encontrado en el Padrón', 'error')
      } else if (status === 404) {
        showToast('DNI no encontrado en el Padrón de Asegurados', 'error')
      } else if (status === 401 || status === 403) {
        showToast('Sin acceso al Padrón. Verifique su sesión', 'error')
      } else {
        showToast('Error al consultar el Padrón. Intente nuevamente', 'error')
      }
      setPaciente(null)
      setFiliacionPrecargada(null)
      reset(applyIpressDefaults(createInitialForm(), ipressDefaults))
    } finally {
      setBuscandoPaciente(false)
    }
  }

  const { mutate: grabar, isPending } = useMutation({
    mutationFn: registrarAdmision,
    onSuccess: () => {
      showToast('Admisión registrada correctamente')
      limpiar()
    },
    onError: (err) => showToast(err.response?.data?.message || err.response?.data?.debugMessage || 'Error al registrar admisión', 'error'),
  })

  const colegiaturaRegister = register('profesionalColegiatura', {
    required: 'La colegiatura es requerida',
    maxLength: {
      value: MAX_LENGTHS.profesionalColegiatura,
      message: `La colegiatura no debe superar ${MAX_LENGTHS.profesionalColegiatura} caracteres`,
    },
    validate: (value) => /^\d*$/.test(value || '') || 'La colegiatura debe contener solo números',
  })

  const handleGrabar = (values) => {
    if (!paciente) {
      showToast('Busque al asegurado primero', 'error')
      return
    }

    grabar({
      dniPaciente: paciente.dniPaciente || dni,
      cartaGaratiaNro: values.cartaGaratiaNro,
      tipoSeguro: values.tipoSeguro,
      planSalud: values.planSalud,
      tipoCobertura: values.tipoCobertura,
      tipoBeneficio: values.tipoBeneficio,
      tipoAtencion: values.tipoAtencion,
      actividad: values.actividad,
      subActividad: values.subActividad,
      consultaMedica: values.consultaMedica,
      servicio: values.servicio,
      fechaAtencion: values.fechaAtencion,
      cuiIpress: values.cuiIpress,
      profesionalNombre: values.profesionalNombre,
      profesionalProfesion: values.profesionalProfesion,
      profesionalColegiatura: values.profesionalColegiatura,
    })
  }

  const limpiar = () => {
    setPaciente(null)
    setFiliacionPrecargada(null)
    setDni('')
    reset(applyIpressDefaults(createInitialForm(), ipressDefaults))
  }

  return (
    <div className="page">
      <form onSubmit={handleSubmit(handleGrabar)} noValidate>
        <div className="page-top">
          <div>
            <div className="page-title">Filiación</div>
            <div className="page-subtitle">Registro de filiación de paciente &mdash; Sistema HCE</div>
          </div>
          <div className="page-actions">
            <Button variant="secondary" size="sm" type="button" onClick={limpiar}>Limpiar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Grabar filiación'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader title="DATOS DEL ASEGURADO" />
          <CardBody>
            <div className={styles.searchRow}>
              <FormField label="Documento de Identidad (DNI)" required>
                <div className={styles.searchField}>
                  <div className={styles.dniFieldWrap}>
                    <Input
                      value={dni}
                      onChange={(e) => setDni(limpiarDni(e.target.value))}
                      placeholder="Ej: 45123678"
                      maxLength={MAX_LENGTHS.dni}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          buscarPaciente()
                        }
                      }}
                    />
                  </div>
                  <Button onClick={buscarPaciente} disabled={buscandoPaciente} variant="secondary" type="button">
                    <Search size={14} /> {buscandoPaciente ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </FormField>

              {filiacionPrecargada && (
                <div className={styles.prefillNotice}>
                  Filiación existente encontrada
                  {filiacionPrecargada.nroHc ? ` (HC: ${filiacionPrecargada.nroHc})` : ''}
                </div>
              )}
            </div>

            <div className="form-grid g3">
              <FormField label="Apellidos y nombres" className="span2">
                <Input readOnly value={paciente ? `${paciente.apellidosPaciente || ''}, ${paciente.nombresPaciente || ''}` : ''} placeholder="—" />
              </FormField>
              <FormField label="Situación">
                <Input readOnly value={paciente?.situacion || ''} placeholder="—" />
              </FormField>
              <FormField label="Fecha de Nacimiento">
                <Input readOnly value={paciente ? formatDate(paciente.fechaNac) : ''} placeholder="—" />
              </FormField>
              <FormField label="Edad">
                <Input readOnly highlight value={paciente ? calcEdad(paciente.fechaNac) : ''} placeholder="—" />
              </FormField>
              <FormField label="Condición">
                <Input readOnly value={paciente?.condicion || ''} placeholder="—" />
              </FormField>
              <FormField label="Sexo">
                <Input readOnly value={getSexoLabel(paciente?.sexo)} placeholder="—" />
              </FormField>
              <FormField label="Parentesco">
                <Input readOnly value={paciente?.parentesco || ''} placeholder="—" />
              </FormField>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="HISTORIA CLÍNICA" />
          <CardBody>
            <div className="form-grid g4">
              <FormField label="Nro HC (DNI)">
                <Input readOnly value={paciente ? dni : ''} placeholder="Se asigna automáticamente" />
              </FormField>
              <FormField label="Carta Garantía Nro" error={errors.cartaGaratiaNro?.message}>
                <Input
                  {...register('cartaGaratiaNro', {
                    maxLength: {
                      value: MAX_LENGTHS.cartaGarantia,
                      message: `La carta de garantía no debe superar ${MAX_LENGTHS.cartaGarantia} caracteres`,
                    },
                    pattern: {
                      value: /^[0-9A-Za-z-]*$/,
                      message: 'La carta de garantía solo debe contener números, letras y guiones',
                    },
                  })}
                  maxLength={MAX_LENGTHS.cartaGarantia}
                />
              </FormField>
              <FormField label="Tipo Seguro" error={errors.tipoSeguro?.message}>
                <Select {...register('tipoSeguro')}>
                  {TIPOS_SEGURO.map((o) => <option key={o}>{o}</option>)}
                </Select>
              </FormField>
              <FormField label="Plan de Salud" error={errors.planSalud?.message}>
                <Select {...register('planSalud')}>
                  {PLANES_SALUD.map((o) => <option key={o}>{o}</option>)}
                </Select>
              </FormField>
              <FormField label="Tipo Cobertura" error={errors.tipoCobertura?.message}>
                <Select {...register('tipoCobertura')}>
                  {TIPOS_COBERTURA.map((o) => <option key={o}>{o}</option>)}
                </Select>
              </FormField>
              <FormField label="Tipo Beneficio" error={errors.tipoBeneficio?.message}>
                <Select {...register('tipoBeneficio')}>
                  {TIPOS_BENEFICIO.map((o) => <option key={o}>{o}</option>)}
                </Select>
              </FormField>
              <FormField label="Tipo Atención" error={errors.tipoAtencion?.message}>
                <Select {...register('tipoAtencion')}>
                  {TIPOS_ATENCION.map((o) => <option key={o}>{o}</option>)}
                </Select>
              </FormField>
              <FormField label="Servicio / Especialidad" required error={errors.servicio?.message}>
                <Select
                  {...register('servicio', {
                    required: 'Seleccione el servicio',
                    maxLength: {
                      value: MAX_LENGTHS.servicio,
                      message: `El servicio no debe superar ${MAX_LENGTHS.servicio} caracteres`,
                    },
                  })}
                >
                  <option value="">— Seleccionar —</option>
                  {ESPECIALIDADES.map((o) => <option key={o}>{o}</option>)}
                </Select>
              </FormField>
              <FormField label="Fecha y Hora de Atención" required error={errors.fechaAtencion?.message}>
                <Input
                  {...register('fechaAtencion', {
                    required: 'La fecha de atención es requerida',
                    validate: (value) => (
                      value && value > toDateTimeLocal()
                        ? 'La fecha y hora de atención no puede ser futura'
                        : true
                    ),
                  })}
                  type="datetime-local"
                  max={maxFechaAtencion}
                />
              </FormField>
              <FormField label="Actividad" error={errors.actividad?.message}>
                <Input
                  {...register('actividad', {
                    maxLength: {
                      value: MAX_LENGTHS.actividad,
                      message: `La actividad no debe superar ${MAX_LENGTHS.actividad} caracteres`,
                    },
                  })}
                  maxLength={MAX_LENGTHS.actividad}
                />
              </FormField>
              <FormField label="Sub Actividad" error={errors.subActividad?.message}>
                <Input
                  {...register('subActividad', {
                    maxLength: {
                      value: MAX_LENGTHS.subActividad,
                      message: `La sub actividad no debe superar ${MAX_LENGTHS.subActividad} caracteres`,
                    },
                  })}
                  maxLength={MAX_LENGTHS.subActividad}
                />
              </FormField>
            </div>
          </CardBody>
        </Card>

        <div className={`highlight-block ${styles.ipressBlock}`}>
          <div className={styles.blockTitle}>Datos de la IPRESS</div>
          <div className="form-grid g4">
            <FormField label="CUI Nro" error={errors.cuiIpress?.message}>
              <Input
                {...register('cuiIpress', {
                  maxLength: {
                    value: MAX_LENGTHS.cuiIpress,
                    message: `El código CUI de la IPRESS no debe superar ${MAX_LENGTHS.cuiIpress} caracteres`,
                  },
                })}
                readOnly={isIpressAutofilledReadOnly('cuiIpress', cuiIpressValue)}
                placeholder="Código IPRESS"
                maxLength={MAX_LENGTHS.cuiIpress}
              />
            </FormField>
            <FormField label="Razón Social" error={errors.ipressRazonSocial?.message}>
              <Input
                {...register('ipressRazonSocial', {
                  maxLength: {
                    value: MAX_LENGTHS.ipressRazonSocial,
                    message: `La razón social de la IPRESS no debe superar ${MAX_LENGTHS.ipressRazonSocial} caracteres`,
                  },
                })}
                readOnly={isIpressAutofilledReadOnly('ipressRazonSocial', ipressRazonSocialValue)}
                maxLength={MAX_LENGTHS.ipressRazonSocial}
              />
            </FormField>
            <FormField label="Sede" error={errors.ipressSede?.message}>
              <Input
                {...register('ipressSede', {
                  maxLength: {
                    value: MAX_LENGTHS.ipressSede,
                    message: `La sede de la IPRESS no debe superar ${MAX_LENGTHS.ipressSede} caracteres`,
                  },
                })}
                readOnly={isIpressAutofilledReadOnly('ipressSede', ipressSedeValue)}
                maxLength={MAX_LENGTHS.ipressSede}
              />
            </FormField>
            <FormField label="Región" error={errors.ipressRegion?.message}>
              <Input
                {...register('ipressRegion', {
                  maxLength: {
                    value: MAX_LENGTHS.ipressRegion,
                    message: `La región de la IPRESS no debe superar ${MAX_LENGTHS.ipressRegion} caracteres`,
                  },
                })}
                readOnly={isIpressAutofilledReadOnly('ipressRegion', ipressRegionValue)}
                maxLength={MAX_LENGTHS.ipressRegion}
              />
            </FormField>
            <FormField label="Categoría" error={errors.ipressCategoria?.message}>
              <Input
                {...register('ipressCategoria', {
                  maxLength: {
                    value: MAX_LENGTHS.ipressCategoria,
                    message: `La categoría de la IPRESS no debe superar ${MAX_LENGTHS.ipressCategoria} caracteres`,
                  },
                })}
                readOnly={isIpressAutofilledReadOnly('ipressCategoria', ipressCategoriaValue)}
                placeholder="I-1, II-1, III-1..."
                maxLength={MAX_LENGTHS.ipressCategoria}
              />
            </FormField>
          </div>
        </div>

        <div className={`highlight-block green ${styles.profBlock}`}>
          <div className={`${styles.blockTitle} ${styles.blockTitleGreen}`}>Profesional que atiende</div>
          <div className="form-grid g3">
            <FormField label="Profesional Responsable" required error={errors.profesionalNombre?.message}>
              <Input
                {...register('profesionalNombre', {
                  required: 'El profesional responsable es requerido',
                  maxLength: {
                    value: MAX_LENGTHS.profesionalNombre,
                    message: `El profesional responsable no debe superar ${MAX_LENGTHS.profesionalNombre} caracteres`,
                  },
                  pattern: {
                    value: /^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                    message: 'El nombre del profesional solo puede contener letras y espacios',
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replaceAll(/[^A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
                  },
                })}
                placeholder="Apellidos y nombres"
                maxLength={MAX_LENGTHS.profesionalNombre}
              />
            </FormField>
            <FormField label="Profesión" error={errors.profesionalProfesion?.message}>
              <Select {...register('profesionalProfesion')}>
                {PROFESIONES.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </FormField>
            <FormField label="Colegiatura" error={errors.profesionalColegiatura?.message}>
              <Input
                {...colegiaturaRegister}
                onChange={(event) => {
                  const soloDigitos = event.target.value.replaceAll(/\D/g, '').slice(0, 8)
                  event.target.value = soloDigitos
                  colegiaturaRegister.onChange(event)
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="CMP / CDP..."
                maxLength={MAX_LENGTHS.profesionalColegiatura}
              />
            </FormField>
          </div>
        </div>
      </form>

      {toast && <Toast message={toast.msg} type={toast.error === true ? 'error' : 'success'} onClose={hideToast} />}
    </div>
  )
}