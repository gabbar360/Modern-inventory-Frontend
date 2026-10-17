import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invoiceService, Invoice } from "@/services/invoiceService";

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
};

export const fetchInvoices = createAsyncThunk(
  "invoices/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await invoiceService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch invoices");
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  "invoices/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await invoiceService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch invoice");
    }
  }
);

export const createInvoice = createAsyncThunk(
  "invoices/create",
  async (data: Partial<Invoice>, { rejectWithValue }) => {
    try {
      return await invoiceService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create invoice");
    }
  }
);

export const updateInvoice = createAsyncThunk(
  "invoices/update",
  async ({ id, data }: { id: string; data: Partial<Invoice> }, { rejectWithValue }) => {
    try {
      return await invoiceService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update invoice");
    }
  }
);

export const generateEwayBill = createAsyncThunk(
  "invoices/generateEwayBill",
  async ({ id, payload }: { id: string; payload?: any }, { rejectWithValue }) => {
    try {
      return await invoiceService.generateEwayBill(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to generate e-Way Bill");
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchInvoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload || [];
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch invoices";
      })

      // fetchInvoiceById
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.currentInvoice = action.payload;
      })

      // createInvoice
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
      });
  },
});

export const { clearError, clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
