import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { purchaseOrderService, PurchaseOrder } from "@/services/purchaseOrderService";

interface PurchaseOrderState {
  orders: PurchaseOrder[];
  currentPurchaseOrder: PurchaseOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: PurchaseOrderState = {
  orders: [],
  currentPurchaseOrder: null,
  loading: false,
  error: null,
};

export const fetchPurchaseOrders = createAsyncThunk(
  "purchaseOrders/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch purchase orders");
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrders/create",
  async (data: Partial<PurchaseOrder>, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create purchase order");
    }
  }
);

const purchaseOrderSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch purchase orders";
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      });
  },
});

export const { clearError } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;
