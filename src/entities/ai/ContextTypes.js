import { MessageSquare, Dumbbell, Calendar, Apple } from 'lucide-react';

export const contextTypes = [
  { value: 'free', label: 'Свободный', icon: MessageSquare, description: 'Любые вопросы' },
  { value: 'program', label: 'Программа', icon: Dumbbell, description: 'Обсудить программу' },
  { value: 'workout', label: 'Тренировка', icon: Calendar, description: 'Разобрать тренировку' },
  { value: 'nutrition', label: 'Питание', icon: Apple, description: 'Анализ рациона' },
];

export const contextLabel = (value) =>
  contextTypes.find((c) => c.value === value)?.label || 'Диалог';

export const contextIcon = (value) =>
  contextTypes.find((c) => c.value === value)?.icon || MessageSquare;