import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    accessToken: null,
    isAuthChecked: false,

    setUser: (user) => set({ user }),
    setAccessToken: (accessToken) => set({ accessToken }),
    setAuthChecked: (value) => set({ isAuthChecked: value }),


    login: (user, accessToken) => set({ user, accessToken, isAuthChecked: true }),

    logout: () => set({ user: null, accessToken: null, isAuthChecked: true}),
}));