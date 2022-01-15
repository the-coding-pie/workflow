import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SidebarMenuState {
  currentActiveMenu: number | null;
}

const initialState: SidebarMenuState = {
  currentActiveMenu: 1,
};

const sidebarMenu = createSlice({
  name: "sidebarMenu",
  initialState,
  reducers: {
    setCurrentActiveMenu: (state, action: PayloadAction<number | null>) => {
      state.currentActiveMenu = action.payload;
    },
  },
});

export const { setCurrentActiveMenu } = sidebarMenu.actions;

export default sidebarMenu.reducer;
