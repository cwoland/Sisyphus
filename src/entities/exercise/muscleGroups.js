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