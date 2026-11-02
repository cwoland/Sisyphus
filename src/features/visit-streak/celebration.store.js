import { create } from 'zustand';

export const useVisitCelebration = create((set) => ({
  celebration: null,
  show: (celebration) => set({ celebration }),
  dismiss: () => set({ celebration: null }),
}));
