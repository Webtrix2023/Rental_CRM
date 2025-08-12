import { create } from 'zustand';

export const useCustomerCreateStore = create((set) => ({
  isOpen: false,
  payload: {},
  callback: null, //
  openCustomerCreate: (payload,callback=null) => set({ isOpen: true, payload,callback }),
  close: (result) => set((state) => {
    // Call callback if exists, and clear everything
    if (state.callback) state.callback(result);
    return { isOpen: false, payload: {}, callback: null };
  }),
}));
export const openCustomerCreate = (payload) => {
  const store = useCustomerCreateStore.getState();
  store.openCustomerCreate(payload);
};

export const closeCustomerCreate = () => {
    console.log("closed called");
  const store = useCustomerCreateStore.getState();
  store.close();
};