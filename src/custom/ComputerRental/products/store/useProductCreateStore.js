// import { create } from 'zustand';

// export const useProductCreateStore = create((set) => ({
//   isOpen: false,
//   payload: {},
//   openProductCreate: (payload) => set({ isOpen: true, payload }),
//   close: () => set({ isOpen: false, payload: {} })
// }));
// // ✅ Export a plain function for external use
// export const openProductCreate = (payload) => {
//   const store = useProductCreateStore.getState();
//   store.openProductCreate?.(payload);
// };

import { create } from 'zustand';

export const useProductCreateStore = create((set) => ({
  isOpen: false,
  payload: {},
  callback: null, //
  openProductCreate: (payload,callback=null) => set({ isOpen: true, payload,callback }),
  close: (result) => set((state) => {
    // Call callback if exists, and clear everything
    if (state.callback) state.callback(result);
    return { isOpen: false, payload: {}, callback: null };
  }),
}));
export const openProductCreate = (payload) => {
  const store = useProductCreateStore.getState();
  store.openProductCreate(payload);
};

export const closeProductCreate = () => {
    console.log("closed called");
  const store = useProductCreateStore.getState();
  store.close();
};