import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

import { api } from '../../../shared/lib/axios.js';
import { Button } from '../../../shared/ui/Button.jsx';

const STEPS = [
    {
        key: 'goal',
        title: 'Какая у тебя цель?',
        description: 'Выбери цель, которую хочешь достичь.',
        options: [
            {
                value: 'strength',
                label: 'Стать сильнее',
                hint: 'Акцент на силовых результатах',
            },
            {
                value: 'muscle',
                label: 'Набрать мышечную массу',
                hint: 'Акцент на мышечном росте и объеме',
            },
            {
                value: 'fitness',
                label: 'Поддерживать общую форму',
                hint: 'Развивать силу и поддерживать активность',
            },
        ],
    },
    {
        key: 'experience',
        title: 'Какой у тебя опыт?',
        description: 'Выбери свой уровень подготовки',
        options: [
            {
                value: 'beginner',
                label: 'Начинающий',
                hint: 'Ты делаешь первые шаги в тренировках и хочешь освоить базовые упражнения',
            },
            {
                value: 'intermediate',
                label: 'Опытный атлет',
                hint: 'Ты не первый день в зале, у тебя есть опыт тренировок и ты хочешь улучшить свои результаты',
            },
            {
                value: 'advanced',
                label: 'Про',
                hint: 'Спорт - часть твоей жизни, а жим 100 для тебя - light weight, baby!',
            },
        ],
    },
    {
        key: 'daysPerWeek',
        title: 'Сколько дней в неделю ты готов тренироваться?',
        description: 'Выбери количество тренировок в неделю',
        options: [
            { value: 2, label: '2 дня в неделю' },
            { value: 3, label: '3 дня в неделю' },
            { value: 4, label: '4 дня в неделю' },
            { value: 5, label: '5 дней в неделю' },
        ],
    },
    {
        key: 'durationMinutes',
        title: 'Сколько минут ты готов уделять тренировке?',
        description: 'Выбери длительность тренировки',
        options: [
            { value: 30, label: '30 минут' },
            { value: 45, label: '45 минут' },
            { value: 60, label: '60 минут' },
            { value: 90, label: '90 минут' },
        ],
    },
    {
        key: 'equipment',
        title: 'Какое оборудование ты готов использовать и где ты занимаешься?',
        description: 'Выбери доступное оборудование и место тренировок',
        options: [
            {
                value: 'full_gym',
                label: 'Оборудованный спортзал',
                hint: 'Доступ к тренажерам, свободным весам, блокам',
            },
            {
                value: 'limited_gym',
                label: 'Подвальная качалка',
                hint: 'Ограниченный набор оборудования, возможно только базовые упражнения',
            },
            {
                value: 'workout',
                label: 'Тренировки на улице',
                hint: 'Ты занимаешься на спортплощадке с собственным весом на турниках',
            },
            {
                value: 'home_gym',
                label: 'Дома',
                hint: 'Легкие домашние тренировки с минимальным оборудованием, например, гантелями или эспандерами',
            },
        ],
    },
    {
        key: 'preferences',
        title: 'Какие у тебя предпочтения в тренировках?',
        description: 'Выбери свои предпочтения и ограничения',
    },
];

const initialAnswers = {
    goal: '',
    experience: '',
    daysPerWeek: null,
    durationMinutes: null,
    equipment: '',
    preferences: '',
    confirmed: false,
};

export const AiProgramQuiz = ({ onGenerated, onCancel }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState(initialAnswers);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    const updateAnswer = (key, value) => {
        setAnswers((previous) => ({ ...previous, [key]: value }));
        setError('');
    };

    const canContinue = isLast
        ? answers.confirmed
        : answers[current.key] !== '' && answers[current.key] !== null;

    const goNext = () => {
        if (!canContinue) return;

        setError('');
        setStep((previous) => previous + 1);
    };

    const goBack = () => {
        setError('');

        if (step === 0) {
            onCancel();
            return;
        }

        setStep((previous) => previous - 1);
    };

    const generate = async () => {
        if (!answers.confirmed || isGenerating) return;

        setError('');
        setIsGenerating(true);

        try {
            const { data } = await api.post('/ai/program-generator', answers, { timeout: 90_000 });

            onGenerated(data.program);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Произошла ошибка при генерации программы. Попробуй еще раз.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 pb-4">
            <div>
                <div className="flex items-center justify-between gap-3 text-xs font-medium tex-text-muted">
                    <span>Анкета ИИ-тренера</span>
                    <span>
                        {step + 1} / {STEPS.length}
                    </span>
                </div>

                <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"
                    aria-hidden="true"
                >
                    <div
                        className="h-full rounded-full bg-terracotta transition-[width] duration-300"
                        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 text-terracotta-ink">
                    <Sparkles size={17} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Твой путь</span>
                </div>

                <h2 className="mt-2 font-display text-2xl font-bold text-text">
                    {current.title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {current.description}
                </p>
            </div>

            {current.options ? (
                <div className="space-y-2">
                    {current.options.map((option) => {
                        const selected = answers[current.key] === option.value;

                        return (
                            <button
                                key={String(option.value)}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => updateAnswer(current.key, current,value)}
                                className={clsx(
                                    'w-full rounded-2xl border p-4 text-left transition-colors',
                                    selected
                                        ? 'border-terracotta bg-terracotta/10'
                                        : 'border-border bg-surface-2 hover:border-border-strong'
                                )}
                            >
                                <span className="block font-semibold text-text">{option.label}</span>
                                {option.hint && (
                                    <span className="mt-1 block text-sm text-text-muted">{option.hint}</span>
                                )}
                            </button>
                        );
                    })}
        </div>
    ) : (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="ai-program-preferences"
                    className="sr-only"
                >
                    Пожелания к программе
                </label>
                <textarea
                    id="ai-program-preferences"
                    value={answers.preferences}
                    onChange={(event) => updateAnswer('preferences', event.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Необязательно"
                    className="w-full resize-y rounded-2xl border border-border-strong bg-surface px-4 py-3 text-base text-text outline-none focus:border-cta"
                />
                <p className="mt-1 text-right text-xs text-text-muted">
                    {answers.preferences.length} / 500
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-4 text-sm leading-relaxed text-text-muted">
                Программа будет черновиком: проверь упражнения и нагрузку перед сохранением.
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4 text-sm text-text">
                <input  
                    type="checkbox"
                    checked={answers.confirmed}
                    onChange={(event) => updateAnswer('confirmed', event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-terracotta"
                />
                <span>
                    Понимаю, что программа создается ИИ. Он может ошибаться.
                </span>
            </label>
        </div>
    )}

    {error && (
        <p
            role="alert"
            className="rounded-xl border border-crimson/30 bg-crimson/10 p-3 text-sm text-crimson"
        >
            {error}
        </p>
    )}

    <div className="flex items-center gap-3">
        <Button
            type="button"
            variant="secondary"
            onClick={goBack}
            disabled={isGenerating}
        >
            <ArrowLeft size={16} />
            Назад
        </Button>

        {isLast ? (
            <Button
                type="button"
                onClick={generate}
                disabled={!canContinue || isGenerating}
                className="flex-1"
            >
                <Sparkles size={16} />
                {isGenerating 
                    ? 'Генерирую программу...'
                    : 'Сгенерировать программу'}
            </Button>
        ) : (
            <Button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="flex-1"
            >
                <ArrowRight size={16} />
                Далее
            </Button>
        )}
    </div>

    {isGenerating && (
        <p
            role="status"
            className="text-center text-sm text-text-muted"
        >
            ИИ подбирает упражнения. Это может занять некоторое время.
        </p>
    )}
    </div>
    );
};