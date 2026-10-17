import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { challanService, DeliveryChallan } from "@/services/challanService";

interface ChallanState {
  challans: DeliveryChallan[];
  loading: boolean;
  error: string | null;
}

const initialState: ChallanState = {
  challans: [],
  loading: false,
  error: null,
};

export const fetchChallans = createAsyncThunk(
  "challans/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await challanService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch challans");
    }
  }
);

export const createChallan = createAsyncThunk(
  "challans/create",
  async (data: Partial<DeliveryChallan>, { rejectWithValue }) => {
    try {
      return await challanService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create challan");
    }
  }
);

const challanSlice = createSlice({
  name: "challans",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChallans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallans.fulfilled, (state, action) => {
        state.loading = false;
        state.challans = action.payload || [];
      })
      .addCase(fetchChallans.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch challans";
      })
      .addCase(createChallan.fulfilled, (state, action) => {
        state.challans.unshift(action.payload);
      });
  },
});

export const { clearError } = challanSlice.actions;
export default challanSlice.reducer;
