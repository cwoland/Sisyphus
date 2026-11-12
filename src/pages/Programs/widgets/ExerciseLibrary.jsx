import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, Search, X } from 'lucide-react';
import { clsx } from 'clsx';

import { useExercises } from '../programs.hooks.js';

import {
  muscleGroups,
  muscleGroupLabel,
  equipmentTypes,
  getMuscleDetail,
} from '../../../entities/exercise/muscleGroups.js';
import { saveExerciseTechniqueNote } from '../../../entities/exercise/exercise.api.js';

import { Sheet } from '../../../shared/ui/Sheet.jsx';
import { SkeletonList } from '../../../shared/ui/Skeleton.jsx';
import { Button } from '../../../shared/ui/Button.jsx';

const GROUP_IMAGES = {
  chest: '/art/muscles/chest.png',
  back: '/art/muscles/upper-lats.png',
  legs: '/art/muscles/quadriceps.png',
  shoulders: '/art/muscles/deltoid.png',
  arms: '/art/muscles/biceps.png',
  core: '/art/muscles/abs.png',
};

const getExerciseImage = (exercise) => getMuscleDetail(exercise.muscle_detail)?.image || GROUP_IMAGES[exercise.muscle_group];

const getEquipmentLabel = (value) =>
  equipmentTypes.find((item) => item.value === value)?.label ||
  value ||
  'Оборудование не указано';

const getTrackingLabel = (value) => {
  switch (value) {
    case 'weight_reps':
      return 'Вес и повторения';

    case 'reps':
      return 'Повторения';

    case 'duration':
      return 'Время';

    default:
      return null;
  }
};

const FilterChip = ({
  active,
  children,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={clsx(
      'min-h-10 shrink-0 rounded-xl border px-4 text-sm font-medium transition-colors',
      active
        ? 'border-terracotta bg-terracotta/10 text-terracotta-ink'
        : 'border-border bg-surface text-text-muted hover:border-border-strong'
    )}
  >
    {children}
  </button>
);

const ExerciseCard = ({
  exercise,
  onOpen,
}) => {
  const image = getExerciseImage(exercise);
  const tracking = getTrackingLabel(exercise.tracking);

  return (
    <button
      type="button"
      onClick={() => onOpen(exercise)}
      className="group relative isolate flex min-h-36 w-full overflow-hidden rounded-2xl border border-border bg-surface text-left transition-colors hover:border-border-strong"
    >
      {image && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[48%] bg-white"
          />

          <img
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            draggable="false"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[48%] select-none object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[55%] bg-gradient-to-r from-surface via-surface/40 to-transparent"
          />
        </>
      )}

      <span className="relative flex min-h-36 max-w-[70%] flex-col items-start justify-center gap-2 p-4">
        <span className="rounded-lg bg-terracotta/10 px-2 py-1 text-[11px] font-semibold text-terracotta-ink">
          {getMuscleDetail(exercise.muscle_detail)?.label || muscleGroupLabel(exercise.muscle_group) ||
            'Без группы'}
        </span>

        <span className="break-words font-display text-lg font-bold leading-tight text-text">
          {exercise.name}
        </span>

        <span className="text-xs leading-relaxed text-text-muted">
          {getEquipmentLabel(exercise.equipment)}
          {tracking && ` · ${tracking}`}
        </span>

        <span className="text-xs font-semibold text-terracotta-ink">
          Открыть упражнение →
        </span>
      </span>
    </button>
  );
};

const ExerciseDetail = ({ exercise, onNoteSaved }) => {
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(exercise.personal_technique || '');
  const [error, setError] = useState('');
  const image = getExerciseImage(exercise);
  const tracking = getTrackingLabel(exercise.tracking);
  const detail = getMuscleDetail(exercise.muscle_detail);

  const sharedTechnique =   
    typeof exercise.technique === 'string'
      ? exercise.technique.trim()
      : '';

  const personalTechnique = 
    typeof exercise.personal_technique === 'string'
      ? exercise.personal_technique.trim()
      : '';

  const displayedTechnique = personalTechnique || sharedTechnique;

  const saveNote = useMutation({
    mutationFn: saveExerciseTechniqueNote,
    onSuccess: async (saved) => {
      setError('');

      onNoteSaved({
        ...exercise,
        personal_technique: saved.technique,
      });

      await queryClient.invalidateQueries({
        queryKey: ['exercises'],
      });

      setEditing(false);
    },

    onError: (requestError) => {
      setError(requestError.response?.data?.message || 'Не удалось сохранить описание. Попробуй ещё раз');
    },
  });

  const handleSave = () => {
    if (saveNote.isPending) return;

    setError('');

    saveNote.mutate({
      exerciseId: exercise.id,
      technique: note,
    });
  };

  return (
    <div className="space-y-5 pb-4">
      <section className="relative isolate min-h-56 overflow-hidden rounded-2xl border border-border bg-surface-2">
        {image && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[55%] bg-white"
            />
            <img
              src={image}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[55%] bg-white"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-surface-2 via-surface-2/90 to-transparent"
            />
          </>
        )}

        <div className="flex min-h-56 max-w-[70%] flex-col items-start justify-end p-5">
          <span className="rounded-lg bg-terracotta/10 px-2 py-1 text-[11px] font-semibold text-terracotta-ink">
            {detail?.label || muscleGroupLabel(exercise.muscle_group) || 'Без группы'}
          </span>

          <h2 className="mt-3 break-words font-display text-2xl font-extrabold leading-tight text-text">
            {exercise.name}
          </h2>

          <p className="mt-2 text-sm text-text-muted">
            {getEquipmentLabel(exercise.equipment)}
          </p>

          {tracking && (
            <p className="mt-1 text-xs text-text-muted">
              Учёт: {tracking.toLocaleLowerCase('ru')}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-terracotta-ink">
            Техника
          </p>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setNote(personalTechnique);
                setError('');
                setEditing(true);
              }}
              className="min-h-11 rounded-lg px-2 text-sm font-semibold text-terracotta-ink"
            >
              {personalTechnique
                ? 'изменить заметку'
                : 'Добавить заметку'}
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-3 space-y-3">
            <label
              htmlFor="exercise-technique-note"
              className="block text-sm text-text-muted"
            >
              Личное описание техники
            </label>

            <textarea
              id="exercise-technique-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={5000}
              rows={6}
              placeholder="Добавь свои подсказки к упражнению"
              className="w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text outline-none focus:border-cta"
            />
            <div className="flex justify-between gap-3 text-xs text-text-muted">
              <span>Заметку видишь только ты.</span>
              <span>{note.length} / 5000</span>
            </div>

            {error && (
              <p 
                role="alert"
                className="text-sm text-crimson"
              >
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleSave}
                isLoading={saveNote.isLoading}
              >Сохранить</Button>

              <Button
                type="button"
                variant="secondary"
                disabled={saveNote.isPending}
                onClick={() => {
                  setNote(personalTechnique);
                  setError('');
                  setEditing(false);
                }}
              >Отмена</Button>
            </div>
          </div>
        ) : displayedTechnique ? (
          <>
            {personalTechnique && (
              <p className="mt-3 text-xs font-medium text-text-muted">Твоя заметка</p>
            )}

            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text">
              {displayedTechnique}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-text-muted">
            Описание пока не добавлено.
          </p>
        )}
      </section>
    </div>
  );
};

export const ExerciseLibrary = () => {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [selectedExercise, setSelectedExercise] =
    useState(null);

  const exercisesQuery = useExercises();

  const exercises = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('ru');

    return (exercisesQuery.data || []).filter((exercise) => {
      const matchesGroup =
        !group || exercise.muscle_group === group;

      const matchesSearch =
        !term ||
        exercise.name
          ?.toLocaleLowerCase('ru')
          .includes(term);

      return matchesGroup && matchesSearch;
    });
  }, [exercisesQuery.data, group, search]);

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Найти упражнение"
            aria-label="Поиск упражнения"
            className="w-full rounded-2xl border border-border-strong bg-surface py-3 pl-11 pr-11 text-base text-text outline-none transition-colors focus:border-cta"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Очистить поиск"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted hover:bg-surface-2"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Мышечная группа"
        >
          <FilterChip
            active={!group}
            onClick={() => setGroup('')}
          >
            Все
          </FilterChip>

          {muscleGroups.map((item) => (
            <FilterChip
              key={item.value}
              active={group === item.value}
              onClick={() => setGroup(item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>

        {exercisesQuery.isLoading ? (
          <SkeletonList count={5} />
        ) : exercisesQuery.isError ? (
          <div
            role="alert"
            className="rounded-2xl border border-border bg-surface p-5 text-sm text-text-muted"
          >
            Не удалось загрузить упражнения.

            <button
              type="button"
              onClick={() => exercisesQuery.refetch()}
              className="ml-2 font-semibold text-terracotta-ink underline"
            >
              Попробовать снова
            </button>
          </div>
        ) : exercises.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <Dumbbell
              size={24}
              className="mx-auto text-text-muted"
            />

            <p className="mt-3 font-semibold text-text">
              Упражнения не найдены
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Попробуй другое название или мышечную группу.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-text-muted">
              Найдено: {exercises.length}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onOpen={setSelectedExercise}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Sheet
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title="Упражнение"
      >
        {selectedExercise && (
          <ExerciseDetail
            key={selectedExercise.id}
            exercise={selectedExercise}
            onNoteSaved={setSelectedExercise}
          />
        )}
      </Sheet>
    </>
  );
};
