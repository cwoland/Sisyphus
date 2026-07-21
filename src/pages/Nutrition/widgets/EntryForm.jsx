import { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { Input } from '../../../shared/ui/Input.jsx';
import { mealTypes } from '../../../entities/nutrition/mealTypes.js';


export const EntryForm = ({ date, entry, defaultMealType, onSubmit, onCancel, isSubmitting }) => {
  const [mealType, setMealType] = useState(entry?.meal_type || defaultMealType || 'breakfast');
  const [name, setName] = useState(entry?.name || '');
  const [calories, setCalories] = useState(entry?.calories ?? '');
  const [protein, setProtein] = useState(entry?.protein ?? '');
  const [fat, setFat] = useState(entry?.fat ?? '');
  const [carbs, setCarbs] = useState(entry?.carbs ?? '');
  const [error, setError] = useState('');

  const submit = () => {
    if (name.trim().length < 1) return setError('Введите название');
    if (calories === '' || Number(calories) < 0) return setError('Укажите калории');

    onSubmit({
      date,
      mealType,
      name: name.trim(),
      calories: Number(calories),
      protein: protein === '' ? 0 : Number(protein),
      fat: fat === '' ? 0 : Number(fat),
      carbs: carbs === '' ? 0 : Number(carbs),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {mealTypes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              onClick={() => setMealType(m.value)}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs transition-colors',
                mealType === m.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-muted hover:bg-surface-2'
              )}
            >
              <Icon size={18} />
              {m.label}
            </button>
          );
        })}
      </div>

      <Input
        label="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Например, Овсянка с бананом"
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text">Калории</label>
        <input
          type="number" inputMode="numeric" min="0"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="ккал"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MacroInput label="Белки, г" value={protein} onChange={setProtein} />
        <MacroInput label="Жиры, г" value={fat} onChange={setFat} />
        <MacroInput label="Углеводы, г" value={carbs} onChange={setCarbs} />
      </div>

      {error && <p className="text-sm text-crimson">{error}</p>}

      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>Отмена</Button>
        <Button className="flex-1" onClick={submit} isLoading={isSubmitting}>
          {entry ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </div>
  );
};

const MacroInput = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <label className="block text-xs text-text-muted">{label}</label>
    <input
      type="number" inputMode="decimal" min="0" step="0.1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0"
      className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-center text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
    />
  </div>
);