import { create } from 'zustand';

let idCounter = 0;

export const useToastStore = create((set, get) => ({
    toasts: [],

    addToast: (message, type = 'info', duration = 3000) => {
        const id = ++idCounter;
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));

        if (duration) {
            setTimeout(() => get().removeToast(id), duration);
        }
        return id;
    },

    removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },
}));

export const toast = {
    success: (msg) => useToastStore.getState().addToast(msg, 'success'),
    error: (msg) => useToastStore.getState().addToast(msg, 'error'),
    info: (msg) => useToastStore.getState().addToast(msg, 'info'),
};