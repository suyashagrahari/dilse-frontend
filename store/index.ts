"use client";

import { configureStore } from "@reduxjs/toolkit";
import templateEditReducer from "./templateEditSlice";
import authReducer from "./authSlice";
import favoritesReducer from "./favoritesSlice";

export const store = configureStore({
  reducer: {
    templateEdit: templateEditReducer,
    auth: authReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
