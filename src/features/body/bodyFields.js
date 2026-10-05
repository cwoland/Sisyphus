export const BODY_FIELDS = [
  { key: 'weight', label: 'Вес', unit: 'кг', step: '0.1' },
  { key: 'biceps', label: 'Бицепс', unit: 'см', step: '0.5' },
  { key: 'chest', label: 'Грудь', unit: 'см', step: '0.5' },
  { key: 'waist', label: 'Талия', unit: 'см', step: '0.5' },
  { key: 'hip', label: 'Бедро', unit: 'см', step: '0.5' },
];

export const emptyBodyForm = (date) => ({
  date,
  weight: '',
  biceps: '',
  chest: '',
  waist: '',
  hip: '',
});
