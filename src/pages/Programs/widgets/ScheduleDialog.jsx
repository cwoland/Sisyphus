import { useState } from 'react';
import { clsx } from 'clsx';
import { Sheet } from '../../../shared/ui/Sheet.jsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { Input } from '../../../shared/ui/Input.jsx';
import { todayApi } from '../../../shared/lib/date.js';

const WEEKDAYS = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
  { value: 0, label: 'Вс' },
];

export const ScheduleDialog = ({ isOpen, onClose, program, onSchedule, isScheduling }) => {
  const [startDate, setStartDate] = useState(todayApi());
  const [weeksCount, setWeeksCount] = useState(4);
  const [weekdays, setWeekdays] = useState([1, 3, 5]);

  const toggleDay = (value) => {
    setWeekdays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleSchedule = () => {
    onSchedule({
      programId: program.id,
      startDate,
      weekdays: [...weekdays].sort((a, b) => a - b),
      weeksCount: Number(weeksCount),
    });
  };

  const totalWorkouts = weekdays.length * weeksCount;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Запланировать в календарь">
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Выберите дни тренировок — остальные станут днями отдыха. Программа разложится по ним циклически.
        </p>

        <Input
          label="Дата начала"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-text">Дни тренировок</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button
                key={d.value}
                onClick={() => toggleDay(d.value)}
                className={clsx(
                  'flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-medium transition-colors',
                  weekdays.includes(d.value)
                    ? 'border-accent bg-accent text-white'
                    : 'border-border text-text-muted hover:bg-surface-2'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text">Количество недель</label>
          <input
            type="number" min="1" max="52"
            value={weeksCount}
            onChange={(e) => setWeeksCount(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="rounded-xl bg-surface-2 p-3 text-sm text-text-muted">
          Будет создано тренировок:{' '}
          <span className="font-semibold text-text">{totalWorkouts}</span>
          {' '}({weekdays.length} {weekdays.length === 1 ? 'день' : 'дней'} × {weeksCount} нед.)
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Отмена</Button>
          <Button className="flex-1" onClick={handleSchedule} isLoading={isScheduling} disabled={weekdays.length === 0}>
            Запланировать
          </Button>
        </div>
      </div>
    </Sheet>
  );
};