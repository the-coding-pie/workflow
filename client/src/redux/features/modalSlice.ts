import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModalObj } from "../../types";

const initialState: ModalObj = {
  modalType: null,
  modalProps: {},
  modalTitle: "",
  showCloseBtn: true,
  bgColor: "white",
  textColor: "",
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<ModalObj>) => {
      const modal = action.payload;

      state.modalType = modal.modalType;

      if (modal.modalProps) {
        state.modalProps = modal.modalProps;
      }

      if (modal.modalTitle) {
        state.modalTitle = modal.modalTitle;
      }

      if (Object.keys(modal).includes("showCloseBtn")) {
        state.showCloseBtn = modal.showCloseBtn;
      }

      if (modal.bgColor) {
        state.bgColor = modal.bgColor;
      }

      if (modal.textColor) {
        state.textColor = modal.textColor;
      }
    },
    hideModal: (state) => {
      state.modalType = null;
      state.modalProps = {};
      state.modalTitle = "";
      state.showCloseBtn = true;
      state.bgColor = "white";
      state.textColor = "";
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;

export default modalSlice.reducer;
