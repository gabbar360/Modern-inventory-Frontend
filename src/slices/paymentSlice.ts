import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService, Payment } from "@/services/paymentService";

interface PaymentState {
  payments: Payment[];
  creditNotes: any[];
  debitNotes: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  creditNotes: [],
  debitNotes: [],
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  "payments/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await paymentService.getPayments(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch payments");
    }
  }
);

export const createPayment = createAsyncThunk(
  "payments/create",
  async (data: Partial<Payment>, { rejectWithValue }) => {
    try {
      return await paymentService.createPayment(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to record payment");
    }
  }
);

export const fetchCreditNotes = createAsyncThunk(
  "payments/fetchCreditNotes",
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.getCreditNotes();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch credit notes");
    }
  }
);

export const createCreditNote = createAsyncThunk(
  "payments/createCreditNote",
  async (data: any, { rejectWithValue }) => {
    try {
      return await paymentService.createCreditNote(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create credit note");
    }
  }
);

export const fetchDebitNotes = createAsyncThunk(
  "payments/fetchDebitNotes",
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.getDebitNotes();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch debit notes");
    }
  }
);

export const createDebitNote = createAsyncThunk(
  "payments/createDebitNote",
  async (data: any, { rejectWithValue }) => {
    try {
      return await paymentService.createDebitNote(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create debit note");
    }
  }
);

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPayments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload || [];
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch payments";
      })

      // createPayment
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
      })

      // creditNotes
      .addCase(fetchCreditNotes.fulfilled, (state, action) => {
        state.creditNotes = action.payload || [];
      })
      .addCase(createCreditNote.fulfilled, (state, action) => {
        state.creditNotes.unshift(action.payload);
      })

      // debitNotes
      .addCase(fetchDebitNotes.fulfilled, (state, action) => {
        state.debitNotes = action.payload || [];
      })
      .addCase(createDebitNote.fulfilled, (state, action) => {
        state.debitNotes.unshift(action.payload);
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
