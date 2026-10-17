import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { brandService, Brand } from "@/services/brandService";

interface BrandState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

const initialState: BrandState = {
  brands: [],
  loading: false,
  error: null,
};

export const fetchBrands = createAsyncThunk(
  "brands/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await brandService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch brands");
    }
  }
);

export const createBrand = createAsyncThunk(
  "brands/create",
  async (data: Partial<Brand>, { rejectWithValue }) => {
    try {
      return await brandService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create brand");
    }
  }
);

const brandSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload || [];
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch brands";
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.unshift(action.payload);
      });
  },
});

export const { clearError } = brandSlice.actions;
export default brandSlice.reducer;
