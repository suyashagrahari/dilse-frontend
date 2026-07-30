"use client";

import { configureStore } from "@reduxjs/toolkit";
import templateEditReducer from "./templateEditSlice";
import authReducer from "./authSlice";
import favoritesReducer from "./favoritesSlice";
import { analyticsMiddleware } from "./analyticsMiddleware";

export const store = configureStore({
  reducer: {
    templateEdit: templateEditReducer,
    auth: authReducer,
    favorites: favoritesReducer,
  },
  // Appended to the defaults (thunk, serializability checks) rather than
  // replacing them, so existing dispatch behaviour is unchanged. The middleware
  // is a read-only observer: it forwards every action untouched before doing
  // anything. See store/analyticsMiddleware.ts.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(analyticsMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
