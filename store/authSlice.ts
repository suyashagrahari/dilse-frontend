import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "local" | "google";
  theme?: "light" | "dark" | "system";
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Bypass ngrok browser interstitial page when using a tunnel
function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  if (API_URL.includes("ngrok")) headers["ngrok-skip-browser-warning"] = "true";
  return headers;
}

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || "Registration failed");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || "Login failed");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/google",
  async (
    {
      credential,
      profile,
    }: {
      credential: string;
      profile?: { email: string; name: string; picture: string; sub: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ credential, profile }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || "Google login failed");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const refreshAuth = createAsyncThunk(
  "auth/refresh",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token =
        state.auth.refreshToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("gifts_refresh_token")
          : null);

      if (!token) return rejectWithValue("No refresh token");

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ refreshToken: token }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || "Session expired");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    { name, avatar }: { name?: string; avatar?: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: apiHeaders({ Authorization: `Bearer ${token}` }),
        body: JSON.stringify({ name, avatar }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || "Update failed");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: apiHeaders({ Authorization: `Bearer ${token}` }),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || "Failed to change password");
      return data.message;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const updateTheme = createAsyncThunk(
  "auth/updateTheme",
  async (
    theme: "light" | "dark" | "system",
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: apiHeaders({ Authorization: `Bearer ${token}` }),
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || "Failed to update theme");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    return null;
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const token =
      state.auth.accessToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("gifts_access_token")
        : null);

    if (!token) return rejectWithValue("No token");

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: apiHeaders({ Authorization: `Bearer ${token}` }),
      });

      if (res.status === 401) {
        try {
          const refreshResult = await dispatch(refreshAuth()).unwrap();
          return refreshResult;
        } catch {
          return rejectWithValue("Session expired");
        }
      }

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return { user: data.data, accessToken: token };
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

function saveToStorage(accessToken: string, refreshToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("gifts_access_token", accessToken);
    localStorage.setItem("gifts_refresh_token", refreshToken);
  }
}

function clearStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gifts_access_token");
    localStorage.removeItem("gifts_refresh_token");
  }
}

function handleAuthFulfilled(
  state: AuthState,
  action: PayloadAction<{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }>
) {
  state.user = action.payload.user;
  state.accessToken = action.payload.accessToken;
  state.refreshToken = action.payload.refreshToken;
  state.isAuthenticated = true;
  state.isLoading = false;
  state.error = null;
  saveToStorage(action.payload.accessToken, action.payload.refreshToken);
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearStorage();
    },
    clearAuthError(state) {
      state.error = null;
    },
    hydrateAuth(state) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("gifts_access_token");
        const refresh = localStorage.getItem("gifts_refresh_token");
        if (token && refresh) {
          state.accessToken = token;
          state.refreshToken = refresh;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, handleAuthFulfilled)
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, handleAuthFulfilled)
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, handleAuthFulfilled)
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(refreshAuth.fulfilled, handleAuthFulfilled)
      .addCase(refreshAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        clearStorage();
      })

      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
        if (action.payload.accessToken) {
          state.accessToken = action.payload.accessToken;
        }
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
          saveToStorage(
            action.payload.accessToken,
            action.payload.refreshToken
          );
        }
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        clearStorage();
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.name = action.payload.name;
          state.user.avatar = action.payload.avatar;
          if (action.payload.theme) state.user.theme = action.payload.theme;
        }
      })

      .addCase(updateTheme.fulfilled, (state, action) => {
        if (state.user) {
          state.user.theme = action.payload.theme;
        }
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        clearStorage();
      });
  },
});

export const { logout, clearAuthError, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
