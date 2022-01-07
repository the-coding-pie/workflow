import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ToastObj } from "../../types";

interface ToastState {
  toasts: ToastObj[];
}

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<ToastObj>) => {
      // if the new toast already doesn't exists on the array, then only include it
      let contains = false;

      state.toasts.forEach((toast) => {
        if (
          action.payload.msg === toast.msg &&
          action.payload.kind === toast.kind
        ) {
          contains = true;
        }
      });

      if (!contains) {
        state.toasts.push(action.payload);
      }
    },
    removeToast: (state, action: PayloadAction<ToastObj>) => {
      state.toasts = state.toasts.filter(
        (t) => action.payload.msg !== t.msg && action.payload.kind !== t.kind
      );
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;

export default toastSlice.reducer;
