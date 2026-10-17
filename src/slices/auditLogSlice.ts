import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auditLogService } from "@/services/auditLogService";

interface AuditLogState {
  logs: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AuditLogState = {
  logs: [],
  loading: false,
  error: null,
};

export const fetchAuditLogs = createAsyncThunk(
  "auditLogs/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await auditLogService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch audit logs");
    }
  }
);

const auditLogSlice = createSlice({
  name: "auditLogs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload || [];
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch audit logs";
      });
  },
});

export const { clearError } = auditLogSlice.actions;
export default auditLogSlice.reducer;
