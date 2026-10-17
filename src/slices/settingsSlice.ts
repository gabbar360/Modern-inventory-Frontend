import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { settingsService } from "@/services/settingsService";
import { Organization } from "@/types/auth.types";

interface SettingsState {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  organization: null,
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await settingsService.getSettings();
      return res.organization;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch settings");
    }
  }
);

export const updateSettings = createAsyncThunk(
  "settings/update",
  async (data: Partial<Organization>, { rejectWithValue }) => {
    try {
      const res = await settingsService.updateSettings(data);
      return res.organization;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update settings");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSettings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.organization = action.payload || null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch settings";
      })

      // updateSettings
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.organization = action.payload || null;
      });
  },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
