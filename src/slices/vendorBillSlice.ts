import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vendorBillService, VendorBill } from "@/services/vendorBillService";

interface VendorBillState {
  bills: VendorBill[];
  loading: boolean;
  error: string | null;
}

const initialState: VendorBillState = {
  bills: [],
  loading: false,
  error: null,
};

export const fetchVendorBills = createAsyncThunk(
  "vendorBills/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await vendorBillService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch vendor bills");
    }
  }
);

export const createVendorBill = createAsyncThunk(
  "vendorBills/create",
  async (data: Partial<VendorBill>, { rejectWithValue }) => {
    try {
      return await vendorBillService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create vendor bill");
    }
  }
);

const vendorBillSlice = createSlice({
  name: "vendorBills",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload || [];
      })
      .addCase(fetchVendorBills.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch vendor bills";
      })
      .addCase(createVendorBill.fulfilled, (state, action) => {
        state.bills.unshift(action.payload);
      });
  },
});

export const { clearError } = vendorBillSlice.actions;
export default vendorBillSlice.reducer;
