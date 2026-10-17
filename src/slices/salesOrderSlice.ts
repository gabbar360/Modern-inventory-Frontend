import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { salesOrderService, SalesOrder } from "@/services/salesOrderService";

interface SalesOrderState {
  orders: SalesOrder[];
  currentOrder: SalesOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalesOrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

export const fetchSalesOrders = createAsyncThunk(
  "salesOrders/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await salesOrderService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch sales orders");
    }
  }
);

export const fetchSalesOrderById = createAsyncThunk(
  "salesOrders/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await salesOrderService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch sales order");
    }
  }
);

export const createSalesOrder = createAsyncThunk(
  "salesOrders/create",
  async (data: Partial<SalesOrder>, { rejectWithValue }) => {
    try {
      return await salesOrderService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create sales order");
    }
  }
);

export const updateSalesOrderStatus = createAsyncThunk(
  "salesOrders/updateStatus",
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      return await salesOrderService.updateStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update sales order status");
    }
  }
);

const salesOrderSlice = createSlice({
  name: "salesOrders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSalesOrders
      .addCase(fetchSalesOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchSalesOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch sales orders";
      })

      // fetchSalesOrderById
      .addCase(fetchSalesOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })

      // createSalesOrder
      .addCase(createSalesOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      });
  },
});

export const { clearError, clearCurrentOrder } = salesOrderSlice.actions;
export default salesOrderSlice.reducer;
