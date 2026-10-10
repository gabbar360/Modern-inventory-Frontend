import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "@/lib/constants";
import { authApi } from "../api/authApi";
import { AuthState, User, Organization, AuthResponse } from "@/types/auth.types";
import { RootState } from "../index";

const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || null;
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  org: null,
  token: getInitialToken(),
  status: "loading",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: User; organization?: Organization; access_token?: string }>
    ) => {
      const { user, organization, access_token } = action.payload;
      if (user) state.user = user;
      if (organization) state.org = organization;
      if (access_token) {
        state.token = access_token;
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
        }
      }
      state.status = "authenticated";
    },
    logout: (state) => {
      state.user = null;
      state.org = null;
      state.token = null;
      state.status = "unauthenticated";
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
        if (!state.user) state.status = "loading";
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.org = action.payload.organization;
        state.status = "authenticated";
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
        state.user = null;
        state.org = null;
        state.status = "unauthenticated";
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        if (action.payload.access_token) {
          state.token = action.payload.access_token;
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.access_token);
          }
        }
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        if (action.payload.access_token) {
          state.token = action.payload.access_token;
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.access_token);
          }
        }
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.org = null;
        state.token = null;
        state.status = "unauthenticated";
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentOrg = (state: RootState) => state.auth.org;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === "authenticated";

export default authSlice.reducer;
