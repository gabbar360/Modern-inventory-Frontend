import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "@/lib/constants";
import { authService } from "@/services/authService";
import { AuthState, User, Organization, LoginPayload, RegisterPayload } from "@/types/auth.types";
import { RootState } from "@/store/store";

const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || null;
  }
  return null;
};

const initialState: AuthState & { loading: boolean; error: string | null } = {
  user: null,
  org: null,
  token: getInitialToken(),
  status: getInitialToken() ? "loading" : "unauthenticated",
  loading: false,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Registration failed");
    }
  }
);

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const data = await authService.getCurrentUser();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || error.message || "Authentication check failed");
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: Partial<Organization>, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Profile update failed");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

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
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.org = null;
      state.token = null;
      state.status = "unauthenticated";
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.org = action.payload.organization;
        state.token = action.payload.access_token || null;
        state.status = "authenticated";
        if (action.payload.access_token && typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.access_token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Login failed";
        state.status = "unauthenticated";
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.org = action.payload.organization;
        state.token = action.payload.access_token || null;
        state.status = "authenticated";
        if (action.payload.access_token && typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.access_token);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Registration failed";
      })

      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.org = action.payload.organization;
        state.status = "authenticated";
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.org = null;
        state.status = "unauthenticated";
        state.token = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      })

      // updateProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (action.payload.organization) {
          state.org = action.payload.organization;
        }
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
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

export const { setCredentials, logout, clearError } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentOrg = (state: RootState) => state.auth.org;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === "authenticated";

export default authSlice.reducer;
