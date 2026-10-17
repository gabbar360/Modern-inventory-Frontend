import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { warehouseService, Warehouse } from "@/services/warehouseService";

interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
}

const initialState: WarehouseState = {
  warehouses: [],
  loading: false,
  error: null,
};

export const fetchWarehouses = createAsyncThunk(
  "warehouses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch warehouses");
    }
  }
);

export const createWarehouse = createAsyncThunk(
  "warehouses/create",
  async (data: Partial<Warehouse>, { rejectWithValue }) => {
    try {
      return await warehouseService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create warehouse");
    }
  }
);

const warehouseSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload || [];
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch warehouses";
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.warehouses.unshift(action.payload);
      });
  },
});

export const { clearError } = warehouseSlice.actions;
export default warehouseSlice.reducer;
