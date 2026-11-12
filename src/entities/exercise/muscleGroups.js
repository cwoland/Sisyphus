export const muscleGroups = [
  { value: 'chest', label: 'Грудь' },
  { value: 'back', label: 'Спина' },
  { value: 'legs', label: 'Ноги' },
  { value: 'shoulders', label: 'Плечи' },
  { value: 'arms', label: 'Руки' },
  { value: 'core', label: 'Кор' },
  { value: 'cardio', label: 'Кардио' },
];

export const equipmentTypes = [
  { value: 'barbell', label: 'Штанга' },
  { value: 'dumbbell', label: 'Гантели' },
  { value: 'machine', label: 'Тренажёр' },
  { value: 'bodyweight', label: 'Своё тело' },
  { value: 'cable', label: 'Блок' },
];

export const muscleGroupLabel = (value) =>
  muscleGroups.find((g) => g.value === value)?.label || value;

export const muscleDetails = [
  {
    value: 'chest',
    label: 'Грудные мышцы',
    group: 'chest',
    image: '/art/muscles/chest.png',
  },
  {
    value: 'trapezius',
    label: 'Трапеция',
    group: 'back',
    image: '/art/muscles/trapezius.png',
  },
  {
    value: 'upper_lats',
    label: 'Верх спины и широчайшие',
    group: 'back',
    image: '/art/muscles/upper-lats.png',
  },
  {
    value: 'lower_lats',
    label: 'Нижняя часть широчайших',
    group: 'back',
    image: '/art/muscles/lower-lats.png',
  },
  {
    value: 'lower_back',
    label: 'Разгибатели спины',
    group: 'back',
    image: '/art/muscles/lower-back.png',
  },
  {
    value: 'anterior_deltoid',
    label: 'Передняя дельта',
    group: 'shoulders',
    image: '/art/muscles/anterior-deltoid.png',
  },
  {
    value: 'lateral_deltoid',
    label: 'Средняя дельта',
    group: 'shoulders',
    image: '/art/muscles/lateral-deltoid.png',
  },
  {
    value: 'posterior_deltoid',
    label: 'Задняя дельта',
    group: 'shoulders',
    image: '/art/muscles/posterior-deltoid.png',
  },
  {
    value: 'biceps',
    label: 'Бицепс',
    group: 'arms',
    image: '/art/muscles/biceps.png',
  },
  {
    value: 'triceps',
    label: 'Трицепс',
    group: 'arms',
    image: '/art/muscles/triceps-a.png',
  },
  {
    value: 'forearm_pronators',
    label: 'Предплечья: пронаторы',
    group: 'arms',
    image: '/art/muscles/forearm-a.png',
  },
  {
    value: 'forearm_supinators',
    label: 'Предплечья: супинаторы',
    group: 'arms',
    image: '/art/muscles/forearm-b.png',
  },
  {
    value: 'core',
    label: 'Мышцы кора',
    group: 'core',
    image: '/art/muscles/abs.png',
  },
  {
    value: 'quadriceps',
    label: 'Квадрицепс',
    group: 'legs',
    image: '/art/muscles/quadriceps.png',
  },
  {
    value: 'hamstrings',
    label: 'Задняя поверхность бедра',
    group: 'legs',
    image: '/art/muscles/hamstrings.png',
  },
  {
    value: 'adductors',
    label: 'Приводящие мышцы',
    group: 'legs',
    image: '/art/muscles/adductors.png',
  },
  {
    value: 'abductors',
    label: 'Отводящие мышцы',
    group: 'legs',
    image: '/art/muscles/abductors.png',
  },
  {
    value: 'calves',
    label: 'Икроножные мышцы',
    group: 'legs',
    image: '/art/muscles/calves.png',
  },
  {
    value: 'glutes',
    label: 'Ягодичные мышцы',
    group: 'legs',
    image: '/art/muscles/glutes.png',
  },
];

export const getMuscleDetail = (value) =>
  muscleDetails.find((item) => item.value === value);

export const getMuscleDetailsForGroup = (group) =>
  muscleDetails.filter((item) => item.group === group);