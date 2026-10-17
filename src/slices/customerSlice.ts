import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerService, Customer } from "@/services/customerService";

interface CustomerState {
  customers: Customer[];
  currentCustomer: any;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await customerService.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch customers");
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await customerService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch customer");
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/create",
  async (data: Partial<Customer>, { rejectWithValue }) => {
    try {
      return await customerService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create customer");
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/update",
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      return await customerService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update customer");
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await customerService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to delete customer");
    }
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload || [];
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch customers";
      })

      // fetchCustomerById
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.currentCustomer = action.payload;
      })

      // createCustomer
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload);
      })

      // updateCustomer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer?.customer?.id === action.payload.id) {
          state.currentCustomer.customer = action.payload;
        }
      })

      // deleteCustomer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentCustomer } = customerSlice.actions;
export default customerSlice.reducer;
