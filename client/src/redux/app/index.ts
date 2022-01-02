import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import sidebarReducer from "../features/sidebarSlice";

const combinedReducer = combineReducers({
  auth: authReducer,
  sidebar: sidebarReducer,
});

// empty store when logout
const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/logoutUser") {
    state = undefined;
  }

  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
