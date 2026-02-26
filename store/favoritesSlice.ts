"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface FavoritesState {
  slugs: string[];
  loading: boolean;
  fetched: boolean;
}

import { API_URL, IS_NGROK } from "@/lib/config";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gifts_access_token");
}

function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  if (IS_NGROK) headers["ngrok-skip-browser-warning"] = "true";
  return headers;
}

export const fetchFavorites = createAsyncThunk(
  "favorites/fetch",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await fetch(`${API_URL}/favorites`, {
        headers: apiHeaders({ Authorization: `Bearer ${token}` }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      const slugs: string[] = data.data.favorites.map(
        (f: { templateSlug: string }) => f.templateSlug
      );
      return slugs;
    } catch {
      return rejectWithValue("Failed to fetch favorites");
    }
  }
);

export const toggleFavoriteAsync = createAsyncThunk(
  "favorites/toggle",
  async (slug: string, { getState, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Not authenticated");

    const state = getState() as { favorites: FavoritesState };
    const isFav = state.favorites.slugs.includes(slug);

    try {
      if (isFav) {
        const res = await fetch(`${API_URL}/favorites/${slug}`, {
          method: "DELETE",
          headers: apiHeaders({ Authorization: `Bearer ${token}` }),
        });
        if (!res.ok) {
          const data = await res.json();
          return rejectWithValue(data.error);
        }
        return { slug, action: "removed" as const };
      } else {
        const res = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: apiHeaders({ Authorization: `Bearer ${token}` }),
          body: JSON.stringify({ templateSlug: slug }),
        });
        if (!res.ok) {
          // 409 means it's already favorited on the backend — sync state
          if (res.status === 409) {
            return { slug, action: "added" as const };
          }
          const data = await res.json();
          return rejectWithValue(data.error);
        }
        return { slug, action: "added" as const };
      }
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

const initialState: FavoritesState = {
  slugs: [],
  loading: false,
  fetched: false,
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites(state) {
      state.slugs = [];
      state.fetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.slugs = action.payload;
        state.loading = false;
        state.fetched = true;
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.loading = false;
        state.fetched = true;
      })
      .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
        const { slug, action: act } = action.payload;
        if (act === "added" && !state.slugs.includes(slug)) {
          state.slugs.push(slug);
        } else if (act === "removed") {
          state.slugs = state.slugs.filter((s) => s !== slug);
        }
        state.fetched = true;
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;

export default favoritesSlice.reducer;
