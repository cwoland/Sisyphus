import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { History } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.jsx';
import { Input } from '../../../shared/ui/Input.jsx';
import { useRecentFoods } from '../nutrition.hooks.js';
import { mealTypes } from '../../../entities/nutrition/mealTypes.js';
import { FoodSearch } from './FoodSearch.jsx';
import { portionOf } from '../../../entities/nutrition/portion.js';

export const EntryForm = ({ date, entry, defaultMealType, onSubmit, onCancel, isSubmitting }) => {
  const [mealType, setMealType] = useState(entry?.meal_type || defaultMealType || 'breakfast');
  const [name, setName] = useState(entry?.name || '');
  const [calories, setCalories] = useState(entry?.calories ?? '');
  const [protein, setProtein] = useState(entry?.protein ?? '');
  const [fat, setFat] = useState(entry?.fat ?? '');
  const [carbs, setCarbs] = useState(entry?.carbs ?? '');
  const [error, setError] = useState('');

  const [term, setTerm] = useState('');
  const [picked, setPicked] = useState(false);

  const [step, setStep] = useState(entry ? 'form' : 'search');
  const [product, setProduct] = useState(null);
  const [grams, setGrams] = useState(entry?.grams ?? 100);

  const pick = (item) => {
    if (item.entry) {
      setName(item.entry.name);

      setCalories(String(Math.round(Number(item.entry.calories))));

      setProtein(String(Number(item.entry.protein)));
      setFat(String(Number(item.entry.fat)));
      setCarbs(String(Number(item.entry.carbs)));
      setProduct(null);
    } else {
      setProduct(item);
      setName(item.brand ? `${item.name}, ${item.brand}` : item.name);
    }
    setStep('form');
  };

  const [portionFor, setPortionFor] = useState(null);
  const portionKey = product ? `${product.barcode}:${grams}` : null;

  if (portionKey && portionFor !== portionKey) {
    const p = portionOf(product, grams);
    setCalories(String(p.calories));
    setProtein(String(p.protein));
    setFat(String(p.fat));
    setCarbs(String(p.carbs));
    setPortionFor(portionKey);
  }

  useEffect(() => {
    const t = setTimeout(() => setTerm(name.trim()), 250);
    return () => clearTimeout(t);
  }, [name]);

  const canSuggest = !entry && !picked && term.length >= 2;
  const suggestionsQuery = useRecentFoods(term, { enabled: canSuggest });
  const suggestions = canSuggest ? (suggestionsQuery.data || []) : [];

  const applySuggestion = (s) => {
    setName(s.name);
    setCalories(String(Math.round(Number(s.calories))));
    setProtein(String(Number(s.protein)));
    setFat(String(Number(s.fat)));
    setCarbs(String(Number(s.carbs)));
    setPicked(true);
  };

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
      barcode: product?.barcode ?? entry?.barcode ?? null,
      grams: product ? Number(grams) : entry?.grams ?? null,
    });
  };

  if (step === 'search') {
    return <FoodSearch onPick={pick} onManual={() => setStep('form')} />;
  }

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

      <div className="relative">
        <Input
          label="Название"
          value={name}
          onChange={(e) => { setName(e.target.value); setPicked(false); }}
          placeholder="Например, Овсянка с бананом"
        />

        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s.name}
                onClick={() => applySuggestion(s)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-surface-2"
              >
                <History size={14} className="shrink-0 text-text-muted" />
                <span className="min-w-0 flex-1 truncate text-sm text-text">{s.name}</span>
                <span className="shrink-0 text-xs text-text-muted">
                  {Math.round(Number(s.calories))} ккал
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {product && (
        <div className="space-y-1.5">
          <label htmlFor="entry-grams" className="block text-sm font-medium text-text">
            Сколько грамм
          </label>
          <div className="flex items-center gap-2">
            <input
              id="entry-grams"
              type="number"
              inputMode="numeric"
              min="1"
              max="5000"
              step="10"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="w-28 rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text focus:border-cta focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {[50, 100, 150, 200].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrams(g)}
                  className="min-h-[36px] rounded-lg bg-surface-2 px-2.5 text-sm tabular-nums text-text-muted transition-colors hover:text-text"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-muted">
            {Math.round(product.kcal_100g)} ккал на 100 г. - КБЖУ пересчитываются сами
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text">Калории</label>
        <input
          type="number" inputMode="numeric" min="0"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="ккал"
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
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
      className="w-full rounded-lg border border-border-strong bg-surface px-2 py-2 text-center text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
    />
  </div>
);