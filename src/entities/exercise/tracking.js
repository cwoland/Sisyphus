export const TRACKING_MODES = [
  { value: 'weight_reps', label: 'Вес и повторы', hint: 'Штанга, гантели, тренажёры' },
  { value: 'reps', label: 'Только повторы', hint: 'Свой вес: подтягивания, отжимания' },
  { value: 'duration', label: 'Время', hint: 'Планка, кардио, удержания' },
];

export const trackingOf = (exerciseOrSet) => exerciseOrSet?.tracking || 'weight_reps';

export const trackingLabel = (value) =>
  TRACKING_MODES.find((m) => m.value === value)?.label || 'Вес и повторы';

export const targetLabel = (tracking) => (tracking === 'duration' ? 'Время' : 'Повторы');

export const formatDuration = (sec) => {
  const total = Math.max(0, Math.round(Number(sec) || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const describeSet = (set) => {
  const mode = trackingOf(set);
  if (mode === 'duration') return set.duration_sec != null ? formatDuration(set.duration_sec) : '—';
  if (mode === 'reps') {
    const reps = set.reps ?? '—';
    return set.weight != null ? `${Number(set.weight)} кг × ${reps}` : `${reps} повт`;
  }
  return `${set.weight != null ? Number(set.weight) : '—'} кг × ${set.reps ?? '—'}`;
};