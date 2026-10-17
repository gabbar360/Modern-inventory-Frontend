import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reportService } from "@/services/reportService";

interface ReportState {
  metrics: any;
  pnl: any;
  pnlInvoices: any[];
  pnlProducts: any[];
  gstSummary: any;
  receivablesAging: any;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  metrics: null,
  pnl: null,
  pnlInvoices: [],
  pnlProducts: [],
  gstSummary: null,
  receivablesAging: null,
  loading: false,
  error: null,
};

export const fetchMetrics = createAsyncThunk(
  "reports/fetchMetrics",
  async (_, { rejectWithValue }) => {
    try {
      return await reportService.getMetrics();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch metrics");
    }
  }
);

export const fetchPnL = createAsyncThunk(
  "reports/fetchPnL",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await reportService.getPnL(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch PnL");
    }
  }
);

export const fetchPnLInvoices = createAsyncThunk(
  "reports/fetchPnLInvoices",
  async (_, { rejectWithValue }) => {
    try {
      return await reportService.getPnLInvoices();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch invoice PnL");
    }
  }
);

export const fetchPnLProducts = createAsyncThunk(
  "reports/fetchPnLProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await reportService.getPnLProducts();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch product PnL");
    }
  }
);

export const fetchGstSummary = createAsyncThunk(
  "reports/fetchGstSummary",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await reportService.getGstSummary(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch GST summary");
    }
  }
);

export const fetchReceivablesAging = createAsyncThunk(
  "reports/fetchReceivablesAging",
  async (_, { rejectWithValue }) => {
    try {
      return await reportService.getReceivablesAging();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch receivables aging");
    }
  }
);

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch metrics";
      })
      .addCase(fetchPnL.fulfilled, (state, action) => {
        state.pnl = action.payload;
      })
      .addCase(fetchPnLInvoices.fulfilled, (state, action) => {
        state.pnlInvoices = action.payload || [];
      })
      .addCase(fetchPnLProducts.fulfilled, (state, action) => {
        state.pnlProducts = action.payload || [];
      })
      .addCase(fetchGstSummary.fulfilled, (state, action) => {
        state.gstSummary = action.payload;
      })
      .addCase(fetchReceivablesAging.fulfilled, (state, action) => {
        state.receivablesAging = action.payload;
      });
  },
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;
