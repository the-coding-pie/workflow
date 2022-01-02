import { createSlice } from "@reduxjs/toolkit";

interface SidebarState {
  show: boolean;
}

const initialState: SidebarState = {
  show: true,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    showSidebar: (state) => {
      state.show = true;
    },
    hideSidebar: (state) => {
      state.show = false;
    },
  },
});

export const { showSidebar, hideSidebar } = sidebarSlice.actions;

export default sidebarSlice.reducer;
