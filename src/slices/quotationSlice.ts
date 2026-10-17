import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { quotationService, Quotation } from "@/services/quotationService";

interface QuotationState {
  quotations: Quotation[];
  currentQuotation: Quotation | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuotationState = {
  quotations: [],
  currentQuotation: null,
  loading: false,
  error: null,
};

export const fetchQuotations = createAsyncThunk(
  "quotations/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await quotationService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch quotations");
    }
  }
);

export const fetchQuotationById = createAsyncThunk(
  "quotations/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await quotationService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch quotation");
    }
  }
);

export const createQuotation = createAsyncThunk(
  "quotations/create",
  async (data: Partial<Quotation>, { rejectWithValue }) => {
    try {
      return await quotationService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create quotation");
    }
  }
);

export const updateQuotationStatus = createAsyncThunk(
  "quotations/updateStatus",
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      return await quotationService.updateStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update quotation status");
    }
  }
);

export const convertQuotationToSO = createAsyncThunk(
  "quotations/convert",
  async (id: string, { rejectWithValue }) => {
    try {
      return await quotationService.convertToSalesOrder(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to convert quotation");
    }
  }
);

const quotationSlice = createSlice({
  name: "quotations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentQuotation: (state) => {
      state.currentQuotation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchQuotations
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations = action.payload || [];
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch quotations";
      })

      // fetchQuotationById
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.currentQuotation = action.payload;
      })

      // createQuotation
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.quotations.unshift(action.payload);
      });
  },
});

export const { clearError, clearCurrentQuotation } = quotationSlice.actions;
export default quotationSlice.reducer;
