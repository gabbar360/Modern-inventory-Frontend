import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { journalService } from "@/services/journalService";

interface JournalState {
  entries: any[];
  loading: boolean;
  error: string | null;
}

const initialState: JournalState = {
  entries: [],
  loading: false,
  error: null,
};

export const fetchJournalEntries = createAsyncThunk(
  "journal/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await journalService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch journal entries");
    }
  }
);

const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournalEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload || [];
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch journal entries";
      });
  },
});

export const { clearError } = journalSlice.actions;
export default journalSlice.reducer;
