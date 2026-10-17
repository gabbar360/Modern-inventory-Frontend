import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { leadService, Lead } from "@/services/leadService";

interface LeadState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
}

const initialState: LeadState = {
  leads: [],
  loading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk(
  "leads/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await leadService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch leads");
    }
  }
);

export const createLead = createAsyncThunk(
  "leads/create",
  async (data: Partial<Lead>, { rejectWithValue }) => {
    try {
      return await leadService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create lead");
    }
  }
);

export const updateLead = createAsyncThunk(
  "leads/update",
  async ({ id, data }: { id: string; data: Partial<Lead> }, { rejectWithValue }) => {
    try {
      return await leadService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update lead");
    }
  }
);

export const deleteLead = createAsyncThunk(
  "leads/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await leadService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to delete lead");
    }
  }
);

const leadSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLeads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload || [];
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch leads";
      })

      // createLead
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })

      // updateLead
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })

      // deleteLead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter((l) => l.id !== action.payload);
      });
  },
});

export const { clearError } = leadSlice.actions;
export default leadSlice.reducer;
