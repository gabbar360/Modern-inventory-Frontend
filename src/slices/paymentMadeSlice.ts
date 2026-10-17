import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentMadeService, PaymentMade } from "@/services/paymentMadeService";

interface PaymentMadeState {
  paymentsMade: PaymentMade[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentMadeState = {
  paymentsMade: [],
  loading: false,
  error: null,
};

export const fetchPaymentsMade = createAsyncThunk(
  "paymentsMade/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await paymentMadeService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch payments made");
    }
  }
);

export const createPaymentMade = createAsyncThunk(
  "paymentsMade/create",
  async (data: Partial<PaymentMade>, { rejectWithValue }) => {
    try {
      return await paymentMadeService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create payment made");
    }
  }
);

const paymentMadeSlice = createSlice({
  name: "paymentsMade",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentsMade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentsMade.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentsMade = action.payload || [];
      })
      .addCase(fetchPaymentsMade.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch payments made";
      })
      .addCase(createPaymentMade.fulfilled, (state, action) => {
        state.paymentsMade.unshift(action.payload);
      });
  },
});

export const { clearError } = paymentMadeSlice.actions;
export default paymentMadeSlice.reducer;
