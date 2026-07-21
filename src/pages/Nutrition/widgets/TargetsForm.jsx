import { useState } from 'react';
import { Button } from '../../../shared/ui/Button.jsx';
import { clsx } from 'clsx';

export const TargetsForm = ({ targets, onSubmit, onCancel, isSubmitting }) => {
  const [calories, setCalories] = useState(targets?.calories ?? 2000);
  const [protein, setProtein] = useState(targets?.protein ?? 150);
  const [fat, setFat] = useState(targets?.fat ?? 60);
  const [carbs, setCarbs] = useState(targets?.carbs ?? 200);

  const submit = () => {
    onSubmit({
      calories: Number(calories),
      protein: Number(protein),
      fat: Number(fat),
      carbs: Number(carbs),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        Задайте дневные цели. Топливо для подъёма должно соответствовать нагрузке.
      </p>

      <Field label="Калории, ккал" value={calories} onChange={setCalories} />
      <div className="grid grid-cols-3 gap-2">
        <Field label="Белки, г" value={protein} onChange={setProtein} small />
        <Field label="Жиры, г" value={fat} onChange={setFat} small />
        <Field label="Углеводы, г" value={carbs} onChange={setCarbs} small />
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>Отмена</Button>
        <Button className="flex-1" onClick={submit} isLoading={isSubmitting}>Сохранить цели</Button>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, small }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-text">{label}</label>
    <input
      type="number" inputMode="numeric" min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        'w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent',
        small && 'text-center px-2'
      )}
    />
  </div>
);