import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { expenseService, Expense } from "@/services/expenseService";

interface ExpenseState {
  expenses: Expense[];
  summary: any;
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  summary: null,
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await expenseService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch expenses");
    }
  }
);

export const fetchExpenseSummary = createAsyncThunk(
  "expenses/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      return await expenseService.getSummary();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch expense summary");
    }
  }
);

export const createExpense = createAsyncThunk(
  "expenses/create",
  async (data: Partial<Expense>, { rejectWithValue }) => {
    try {
      return await expenseService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to record expense");
    }
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await expenseService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to delete expense");
    }
  }
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchExpenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload || [];
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch expenses";
      })

      // fetchExpenseSummary
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      // createExpense
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })

      // deleteExpense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      });
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
