// store/uiStore.ts
import { create } from "zustand";

export interface Room {
  id: number;
  roomNumber: number;
  status: "READY" | "OCCUPIED" | "DIRTY" | "CLEANING" | "MAINTENANCE";
  expectedCheckout?: string;
}

interface UIStore {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
}));
