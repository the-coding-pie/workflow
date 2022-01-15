import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SpaceMenuState {
  currentActiveSpace: string | null;
}

const initialState: SpaceMenuState = {
  currentActiveSpace: null,
};

const spaceMenu = createSlice({
  name: "spaceMenu",
  initialState,
  reducers: {
    setCurrentActiveSpace: (state, action: PayloadAction<string | null>) => {
      state.currentActiveSpace = action.payload;
    },
  },
});

export const { setCurrentActiveSpace } = spaceMenu.actions;

export default spaceMenu.reducer;
