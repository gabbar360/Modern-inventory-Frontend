import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dispatchService } from "@/services/dispatchService";

interface DispatchState {
  dispatches: any[];
  activeTracking: any;
  loading: boolean;
  error: string | null;
}

const initialState: DispatchState = {
  dispatches: [],
  activeTracking: null,
  loading: false,
  error: null,
};

export const fetchDispatches = createAsyncThunk(
  "dispatch/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await dispatchService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch dispatches");
    }
  }
);

export const createDispatch = createAsyncThunk(
  "dispatch/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await dispatchService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create dispatch");
    }
  }
);

export const trackDispatch = createAsyncThunk(
  "dispatch/track",
  async (id: string, { rejectWithValue }) => {
    try {
      return await dispatchService.track(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to track dispatch");
    }
  }
);

export const cancelDispatch = createAsyncThunk(
  "dispatch/cancel",
  async (id: string, { rejectWithValue }) => {
    try {
      await dispatchService.cancel(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to cancel dispatch");
    }
  }
);

const dispatchSlice = createSlice({
  name: "dispatch",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearActiveTracking: (state) => {
      state.activeTracking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDispatches
      .addCase(fetchDispatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatches.fulfilled, (state, action) => {
        state.loading = false;
        state.dispatches = action.payload || [];
      })
      .addCase(fetchDispatches.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch dispatches";
      })

      // trackDispatch
      .addCase(trackDispatch.fulfilled, (state, action) => {
        state.activeTracking = action.payload;
      })

      // createDispatch
      .addCase(createDispatch.fulfilled, (state, action) => {
        state.dispatches.unshift(action.payload);
      })

      // cancelDispatch
      .addCase(cancelDispatch.fulfilled, (state, action) => {
        state.dispatches = state.dispatches.filter((d) => d.id !== action.payload);
      });
  },
});

export const { clearError, clearActiveTracking } = dispatchSlice.actions;
export default dispatchSlice.reducer;
