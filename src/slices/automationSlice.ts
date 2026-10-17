import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { automationService } from "@/services/automationService";

interface AutomationState {
  rules: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AutomationState = {
  rules: [],
  loading: false,
  error: null,
};

export const fetchAutomationRules = createAsyncThunk(
  "automation/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await automationService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch automation rules");
    }
  }
);

export const createAutomationRule = createAsyncThunk(
  "automation/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await automationService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create automation rule");
    }
  }
);

export const toggleAutomationRule = createAsyncThunk(
  "automation/toggle",
  async ({ id, is_active }: { id: string; is_active: boolean }, { rejectWithValue }) => {
    try {
      return await automationService.toggle(id, is_active);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to toggle automation rule");
    }
  }
);

const automationSlice = createSlice({
  name: "automation",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAutomationRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAutomationRules.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = action.payload || [];
      })
      .addCase(fetchAutomationRules.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch automation rules";
      })
      .addCase(createAutomationRule.fulfilled, (state, action) => {
        state.rules.unshift(action.payload);
      });
  },
});

export const { clearError } = automationSlice.actions;
export default automationSlice.reducer;
