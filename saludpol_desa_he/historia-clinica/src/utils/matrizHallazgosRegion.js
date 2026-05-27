const MAPA_COHERENCIA = {
  'Cardiovascular__Dolor precordial': ['Cardiovascular', 'Tórax y Pulmones'],
  'Cardiovascular__Palpitaciones': ['Cardiovascular'],
  'Cardiovascular__Disnea de esfuerzo': ['Cardiovascular', 'Tórax y Pulmones'],
  'Cardiovascular__Edemas': ['Cardiovascular', 'Extremidades'],
  'Cardiovascular__Síncope': ['Neurológico', 'Cardiovascular'],

  'Respiratorio__Tos': ['Tórax y Pulmones'],
  'Respiratorio__Expectoración': ['Tórax y Pulmones'],
  'Respiratorio__Hemoptisis': ['Tórax y Pulmones'],
  'Respiratorio__Disnea en reposo': ['Tórax y Pulmones', 'Cardiovascular'],
  'Respiratorio__Sibilancias': ['Tórax y Pulmones'],

  'Digestivo__Náuseas': ['Abdomen'],
  'Digestivo__Vómitos': ['Abdomen'],
  'Digestivo__Diarrea': ['Abdomen'],
  'Digestivo__Estreñimiento': ['Abdomen'],
  'Digestivo__Dolor abdominal': ['Abdomen'],
  'Digestivo__Melena': ['Abdomen'],

  'Genitourinario__Disuria': ['Abdomen'],
  'Genitourinario__Poliuria': ['Abdomen'],
  'Genitourinario__Hematuria': ['Abdomen'],
  'Genitourinario__Incontinencia': ['Abdomen'],

  'Musculoesquelético__Artralgia': ['Extremidades'],
  'Musculoesquelético__Mialgia': ['Extremidades'],
  'Musculoesquelético__Limitación funcional': ['Extremidades'],
  'Musculoesquelético__Tumefacción articular': ['Extremidades'],

  'Neurológico__Cefalea': ['Neurológico'],
  'Neurológico__Mareos': ['Neurológico'],
  'Neurológico__Temblor': ['Neurológico'],
  'Neurológico__Convulsiones': ['Neurológico'],
  'Neurológico__Alteración de conciencia': ['Neurológico'],
}

export function getRequiredRegions(revisionSistemas = []) {
  const regions = new Set()
    ; (revisionSistemas || [])
      .filter((item) => item.presente === 'S')
      .forEach((item) => {
        const key = `${item.sistema}__${item.sintoma}`
        MAPA_COHERENCIA[key]?.forEach((r) => regions.add(r))
      })
  return regions
}
