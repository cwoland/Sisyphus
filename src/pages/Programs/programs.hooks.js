import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getPrograms, getProgram, getPublicPrograms, createProgram, updateProgram, deleteProgram, forkProgram,
} from '../../entities/program/program.api.js';
import { getExercises, createExercise } from '../../entities/exercise/exercise.api.js';
import { scheduleProgram } from '../../entities/workout/workout.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';

export const usePrograms = () =>
    useQuery({ queryKey: ['programs'], queryFn: () => getPrograms() });

export const useProgram = (id) =>
    useQuery({ queryKey: ['program', id], queryFn: () => getProgram(id), enabled: !!id });

export const usePublicPrograms = (q = '', options = {}) =>
    useQuery({
        queryKey: ['programs', 'public', q],
        queryFn: () => getPublicPrograms(q),
        ...options,
    });

export const useExercises = (params) =>
    useQuery({ queryKey: ['exercises', params], queryFn: () => getExercises(params) });

export const useProgramMutations = () => {
    const qc = useQueryClient();

    const create = useMutation({
        mutationFn: createProgram,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['programs'] });
            toast.success('Маршрут твоего восхождения готов');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Не удалось создать программу'),
    });

    const update = useMutation({
        mutationFn: updateProgram,
        onSuccess: (program) => {
            qc.invalidateQueries({ queryKey: ['programs'] });
            qc.invalidateQueries({ queryKey: ['program', program.id] });
            toast.success('Программа обновлена');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Не удалось обновить программу'),
    });

    const remove = useMutation({
        mutationFn: deleteProgram,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['programs'] });
            toast.success('Программа удалена');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Не удалось удалить программу'),
    });

    const fork = useMutation({
        mutationFn: forkProgram,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['programs'] });
            toast.success('Программа скопирована');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Не удалось скопировать программу'),
    });

    const schedule = useMutation({
        mutationFn: scheduleProgram,
        onSuccess: (workouts) => {
            qc.invalidateQueries({ queryKey: ['workouts'] });
            toast.success(`В календарь добавлено ${workouts.length} тренировок`);
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Не удалось запланировать тренировку'),
    });

    return { create, update, remove, fork, schedule };
};

export const useCreateExercise = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createExercise,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
        onError: (e) => toast.error(e.response?.data?.message || 'Не удалось добавить упражнение'),
    });
};