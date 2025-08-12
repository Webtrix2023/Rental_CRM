import { create } from 'zustand';

export const useChargerCreateStore = create((set) => ({
  isOpen: false,
  payload: {},
  callback: null, //
  openChargerCreate: (payload,callback=null) => set({ isOpen: true, payload,callback }),
  close: (result) => set((state) => {
    // Call callback if exists, and clear everything
    if (state.callback) state.callback(result);
    return { isOpen: false, payload: {}, callback: null };
  }),
}));
export const openChargerCreate = (payload) => {
  const store = useChargerCreateStore.getState();
  store.openChargerCreate(payload);
};

export const closeChargerCreate = () => {
  const store = useChargerCreateStore.getState();
  store.close();
};