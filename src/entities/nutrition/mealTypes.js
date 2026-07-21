import { Sunrise, Sun, Moon, Cookie } from 'lucide-react';

export const mealTypes = [
  { value: 'breakfast', label: 'Завтрак', icon: Sunrise },
  { value: 'lunch', label: 'Обед', icon: Sun },
  { value: 'dinner', label: 'Ужин', icon: Moon },
  { value: 'snack', label: 'Перекус', icon: Cookie },
];

export const mealTypeLabel = (value) =>
  mealTypes.find((m) => m.value === value)?.label || value;

export const mealTypeIcon = (value) =>
  mealTypes.find((m) => m.value === value)?.icon || Cookie;