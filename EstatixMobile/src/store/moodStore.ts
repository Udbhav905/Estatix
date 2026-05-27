import { create } from 'zustand';

export type MoodType = 'calm' | 'luxury' | 'budget' | 'nature' | null;

interface MoodState {
  activeMood: MoodType;
  setMood: (mood: MoodType) => void;
  clearMood: () => void;
  getFilterParams: () => { minPrice?: number; maxPrice?: number; category?: string };
}

export const useMoodStore = create<MoodState>((set, get) => ({
  activeMood: null,
  setMood: (mood) => set((state) => ({
    // If the same mood is tapped again, toggle it off (back to "all")
    activeMood: state.activeMood === mood ? null : mood,
  })),
  clearMood: () => set({ activeMood: null }),
  getFilterParams: () => {
    const mood = get().activeMood;
    if (!mood) return {}; // No filter — show all latest properties
    switch (mood) {
      case 'calm': return { category: 'Villa' };
      case 'luxury': return { minPrice: 500000, category: 'Penthouse' };
      case 'budget': return { maxPrice: 200000 };
      case 'nature': return { category: 'Farmhouse' };
      default: return {};
    }
  },
}));