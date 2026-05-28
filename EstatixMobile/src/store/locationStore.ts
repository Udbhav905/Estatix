// src/store/locationStore.ts
import { create } from 'zustand';

interface LocationStore {
  pickedLocation: { latitude: number; longitude: number } | null;
  setPickedLocation: (loc: { latitude: number; longitude: number } | null) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  pickedLocation: null,
  setPickedLocation: (loc) => set({ pickedLocation: loc }),
}));