import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vendorService, Vendor } from "@/services/vendorService";

interface VendorState {
  vendors: Vendor[];
  currentVendor: Vendor | null;
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  vendors: [],
  currentVendor: null,
  loading: false,
  error: null,
};

export const fetchVendors = createAsyncThunk(
  "vendors/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await vendorService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch vendors");
    }
  }
);

export const createVendor = createAsyncThunk(
  "vendors/create",
  async (data: Partial<Vendor>, { rejectWithValue }) => {
    try {
      return await vendorService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create vendor");
    }
  }
);

export const updateVendor = createAsyncThunk(
  "vendors/update",
  async ({ id, data }: { id: string; data: Partial<Vendor> }, { rejectWithValue }) => {
    try {
      return await vendorService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update vendor");
    }
  }
);

export const deleteVendor = createAsyncThunk(
  "vendors/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await vendorService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to delete vendor");
    }
  }
);

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentVendor: (state) => {
      state.currentVendor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchVendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload || [];
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch vendors";
      })

      // createVendor
      .addCase(createVendor.fulfilled, (state, action) => {
        state.vendors.unshift(action.payload);
      })

      // updateVendor
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
      })

      // deleteVendor
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter((v) => v.id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
