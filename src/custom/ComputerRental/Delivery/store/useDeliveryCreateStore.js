import { create } from 'zustand';

export const useDeliveryCreateStore = create((set) => ({
  isOpen: false,
  payload: {},
  openDeliveryCreate: (payload) => set({ isOpen: true, payload }),
  close: () => set({ isOpen: false, payload: {} })
}));
export const openDeliveryCreate = (payload) => {
  const store = useDeliveryCreateStore.getState();
  store.openDeliveryCreate(payload);
};

export const closeTaskCreate = () => {
    console.log("closed called");
  const store = useDeliveryCreateStore.getState();
  store.close();
};