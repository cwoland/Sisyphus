import { Dumbbell, Repeat } from 'lucide-react';

export const PROGRAM_KINDS = [
  {
    value: 'strength',
    label: 'Силовая',
    icon: Dumbbell,
    hint: 'Упражнения по очереди, подходы с отдыхом между ними',
  },
  {
    value: 'crossfit',
    label: 'Кроссфит',
    icon: Repeat,
    hint: 'День — это круг: все упражнения подряд, отдых после раунда',
  },
];

export const programKindLabel = (value) =>
  PROGRAM_KINDS.find((k) => k.value === value)?.label || 'Силовая';
