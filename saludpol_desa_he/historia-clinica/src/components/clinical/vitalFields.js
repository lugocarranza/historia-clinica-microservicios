const VARIANT_CONFIG = {
  triage: {
    paSistolicaName: 'PA Sistolica',
    paDiastolicaName: 'PA Diastolica',
    fcName: 'FC',
    frName: 'FR',
    temperatureLabel: 'Temp (°C)',
    temperatureName: 'Temp (°C)',
    temperatureDecimalMessage: 'La Temp (°C) debe tener hasta 1 decimal',
    temperatureWarning: 'Temperatura inusual (<33 o >42)',
    satLabel: 'SatO2 (%)',
    satName: 'SatO2 (%)',
    satDecimalMessage: 'La SatO2 (%) debe tener hasta 2 decimales',
    satWarning: 'Saturacion fuera del rango esperado (<60 o >100)',
    vitalsRequired: true,
  },
  soap: {
    paSistolicaName: 'PA Sistólica (max)',
    paDiastolicaName: 'PA Diastólica (min)',
    fcName: 'FC',
    frName: 'FR',
    temperatureLabel: 'Temp °C',
    temperatureName: 'temperatura',
    temperatureDecimalMessage: 'La temperatura debe ser numérica con 1 decimal',
    temperatureWarning: 'Temperatura fuera del rango esperado (<33 o >42)',
    satLabel: 'SatO2 %',
    satName: 'saturación O2',
    satDecimalMessage: 'La saturación O2 debe ser numérica con hasta 2 decimales',
    satWarning: 'Saturación fuera del rango esperado (<60 o >100)',
    weightLabel: 'Peso kg',
    weightPlaceholder: '',
    weightType: undefined,
    weightRulesRequired: false,
    weightWarning: 'Revisar peso ingresado',
    heightLabel: 'Talla cm',
    heightPlaceholder: '',
    heightType: undefined,
    heightRulesRequired: false,
    heightWarning: 'Revisar talla ingresada',
    vitalsRequired: false,
  },
  exam: {
    paSistolicaName: 'PA sistólica',
    paDiastolicaName: 'PA diastólica',
    fcName: 'FC (lpm)',
    frName: 'FR (rpm)',
    temperatureLabel: 'Temp (°C)',
    temperatureName: 'Temp (°C)',
    temperatureDecimalMessage: 'La Temp (°C) debe tener hasta 1 decimal',
    temperatureWarning: 'Temperatura inusual (<33 o >42)',
    satLabel: 'SatO2 (%)',
    satName: 'SatO2 (%)',
    satDecimalMessage: 'La SatO2 (%) debe tener hasta 2 decimales',
    satWarning: 'Saturación fuera del rango esperado (<60 o >100)',
    weightLabel: 'Peso (kg)',
    weightPlaceholder: '70',
    weightType: 'number',
    weightRulesRequired: true,
    weightWarning: 'Revisar peso ingresado',
    heightLabel: 'Talla (cm)',
    heightPlaceholder: '170',
    heightType: 'number',
    heightRulesRequired: true,
    heightWarning: 'Revisar talla ingresada',
    vitalsRequired: true,
  },
}

const getVariantConfig = (variant) => VARIANT_CONFIG[variant] || VARIANT_CONFIG.soap

const integerRule = (label, min, max, required = false) => ({
  ...(required ? { required: `La ${label} es requerida` } : {}),
  validate: (value) => { // NOSONAR (S3800 RHF validate)
    if (!required && (value === '' || value === undefined)) return true
    if (!/^\d+$/.test(value || '')) return `La ${label} debe ser un número entero`
    const number = Number(value)
    return (number >= min && number <= max) || `La ${label} debe tener un mínimo de ${min} y un máximo de ${max}`
  },
})

const decimalRule = (label, pattern, decimalMessage, min, max, required = false) => ({
  ...(required ? { required: `La ${label} es requerida` } : {}),
  validate: (value) => { // NOSONAR (S3800 RHF validate)
    if (!required && (value === '' || value === undefined)) return true
    if (!pattern.test(value || '')) return decimalMessage
    const number = Number(value)
    return (number >= min && number <= max) || `La ${label} debe tener un mínimo de ${min} y un máximo de ${max}`
  },
})

const weightRule = (required) => ({
  ...(required ? { required: 'Este campo es requerido' } : {}),
  validate: (value) => { // NOSONAR (S3800 RHF validate)
    if (!required && (value === '' || value === undefined)) return true
    if (!/^\d+(?:\.\d{1,2})?$/.test(value || '')) {
      return required ? 'El campo debe tener hasta 2 decimales' : 'El peso debe ser numérico con hasta 2 decimales'
    }
    const number = Number(value)
    return required
      ? true
      : (number >= 10 && number <= 200) || 'El peso debe tener un mínimo de 10kg y un máximo de 200kg'
  },
})

const heightRule = (required) => ({
  ...(required ? { required: 'Este campo es requerido' } : {}),
  validate: (value) => { // NOSONAR (S3800 RHF validate)
    if (!required && (value === '' || value === undefined)) return true
    if (!/^\d+(?:\.\d)?$/.test(value || '')) {
      return required ? 'El campo debe tener hasta 1 decimal' : 'La talla debe ser numérica con 1 decimal'
    }
    const number = Number(value)
    return required
      ? true
      : (number >= 60 && number <= 200) || 'La talla debe tener un mínimo de 60cm y un máximo de 2m'
  },
})

const outOfRangeWarning = (message, min, max) => (value) => {
  const number = Number(value)
  if (value && (number < min || number > max)) return message
  return null
}

export function getVitalFields(variant) {
  const config = getVariantConfig(variant)
  const vitalsRequired = config.vitalsRequired

  return [
    {
      key: 'paSistolica',
      label: 'PA Sistólica (max) (mmHg)',
      placeholder: '120',
      type: 'number',
      inputMode: 'numeric',
      step: '1',
      min: '40',
      rules: integerRule(config.paSistolicaName, 40, 300, vitalsRequired),
      getWarning: outOfRangeWarning('Valor fuera del rango normal (<60 o >250)', 60, 250),
    },
    {
      key: 'paDiastolica',
      label: 'PA Diastólica (min) (mmHg)',
      placeholder: '80',
      type: 'number',
      inputMode: 'numeric',
      step: '1',
      min: '20',
      rules: integerRule(config.paDiastolicaName, 20, 200, vitalsRequired),
      getWarning: outOfRangeWarning('Valor fuera del rango normal (<30 o >150)', 30, 150),
    },
    {
      key: 'fc',
      label: 'FC (lpm)',
      placeholder: '72',
      type: 'number',
      inputMode: 'numeric',
      step: '1',
      min: '20',
      max: '250',
      rules: integerRule(config.fcName, 20, 250, vitalsRequired),
      getWarning: outOfRangeWarning('Frecuencia cardíaca inusual (<30 o >200)', 30, 200),
    },
    {
      key: 'fr',
      label: 'FR (rpm)',
      placeholder: '16',
      type: 'number',
      inputMode: 'numeric',
      step: '1',
      min: '5',
      max: '80',
      rules: integerRule(config.frName, 5, 80, vitalsRequired),
      getWarning: outOfRangeWarning('Frecuencia respiratoria inusual (<6 o >50)', 6, 50),
    },
    {
      key: 'temperatura',
      label: config.temperatureLabel,
      placeholder: '36.5',
      type: config.weightType,
      inputMode: 'decimal',
      step: '0.1',
      min: '30',
      max: '45',
      rules: decimalRule(
        config.temperatureName,
        /^\d+(?:\.\d)?$/,
        config.temperatureDecimalMessage,
        30,
        45,
        vitalsRequired,
      ),
      getWarning: outOfRangeWarning(config.temperatureWarning, 33, 42),
    },
    {
      key: 'satO2',
      label: config.satLabel,
      placeholder: '98',
      type: config.weightType,
      inputMode: 'decimal',
      step: '0.01',
      min: '50',
      max: '100',
      rules: decimalRule(
        config.satName,
        /^\d+(?:\.\d{1,2})?$/,
        config.satDecimalMessage,
        50,
        100,
        vitalsRequired,
      ),
      getWarning: outOfRangeWarning(config.satWarning, 60, 100),
    },
    ...(variant === 'triage' ? [
      {
        key: 'glasgow',
        label: 'Glasgow (3-15)',
        placeholder: '15',
        type: 'number',
        inputMode: 'numeric',
        step: '1',
        min: '3',
        max: '15',
        rules: integerRule('Glasgow', 3, 15),
        getWarning: outOfRangeWarning('Score de Glasgow severo (<9)', 9, 15),
      },
      {
        key: 'eva',
        label: 'EVA Dolor (0-10)',
        placeholder: '0',
        type: 'number',
        inputMode: 'numeric',
        step: '1',
        min: '0',
        max: '10',
        rules: integerRule('EVA', 0, 10),
        getWarning: outOfRangeWarning('Dolor severo (EVA >= 7)', 0, 6),
      },
    ] : [
      {
        key: 'peso',
        label: config.weightLabel,
        placeholder: config.weightPlaceholder,
        type: config.weightType,
        inputMode: 'decimal',
        step: '0.01',
        rules: weightRule(config.weightRulesRequired),
        getWarning: outOfRangeWarning(config.weightWarning, 40, 150),
      },
      {
        key: 'talla',
        label: config.heightLabel,
        placeholder: config.heightPlaceholder,
        type: config.heightType,
        inputMode: 'decimal',
        step: '0.1',
        rules: heightRule(config.heightRulesRequired),
        getWarning: outOfRangeWarning(config.heightWarning, 100, 220),
      },
    ]),
  ]
}
