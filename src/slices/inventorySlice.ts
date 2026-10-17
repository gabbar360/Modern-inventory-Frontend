import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { inventoryService, StockMovement, StockAdjustmentPayload } from "@/services/inventoryService";

interface InventoryState {
  stockLedger: any[];
  movements: StockMovement[];
  stockHealth: any;
  reorderAlerts: any[];
  reorderSuggestions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  stockLedger: [],
  movements: [],
  stockHealth: null,
  reorderAlerts: [],
  reorderSuggestions: [],
  loading: false,
  error: null,
};

export const fetchStockLedger = createAsyncThunk(
  "inventory/fetchStockLedger",
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      return await inventoryService.getStockLedger(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch stock ledger");
    }
  }
);

export const fetchStockMovements = createAsyncThunk(
  "inventory/fetchStockMovements",
  async (_, { rejectWithValue }) => {
    try {
      return await inventoryService.getMovements();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch movements");
    }
  }
);

export const fetchStockHealth = createAsyncThunk(
  "inventory/fetchStockHealth",
  async (_, { rejectWithValue }) => {
    try {
      return await inventoryService.getStockHealth();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch stock health");
    }
  }
);

export const adjustStock = createAsyncThunk(
  "inventory/adjustStock",
  async (data: StockAdjustmentPayload, { rejectWithValue }) => {
    try {
      return await inventoryService.adjustStock(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to adjust stock");
    }
  }
);

export const fetchReorderAlerts = createAsyncThunk(
  "inventory/fetchReorderAlerts",
  async (_, { rejectWithValue }) => {
    try {
      return await inventoryService.getReorderAlerts();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch reorder alerts");
    }
  }
);

export const fetchReorderSuggestions = createAsyncThunk(
  "inventory/fetchReorderSuggestions",
  async (_, { rejectWithValue }) => {
    try {
      return await inventoryService.getReorderSuggestions();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch reorder suggestions");
    }
  }
);

export const createReorderPO = createAsyncThunk(
  "inventory/createReorderPO",
  async (data: any, { rejectWithValue }) => {
    try {
      return await inventoryService.createReorderPO(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create reorder PO");
    }
  }
);

export const sendClearanceOffer = createAsyncThunk(
  "inventory/sendClearanceOffer",
  async (data: any, { rejectWithValue }) => {
    try {
      return await inventoryService.sendClearanceOffer(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to send clearance offer");
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStockLedger
      .addCase(fetchStockLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockLedger.fulfilled, (state, action) => {
        state.loading = false;
        state.stockLedger = action.payload || [];
      })
      .addCase(fetchStockLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch stock ledger";
      })

      // fetchStockMovements
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.movements = action.payload || [];
      })

      // fetchStockHealth
      .addCase(fetchStockHealth.fulfilled, (state, action) => {
        state.stockHealth = action.payload;
      })

      // adjustStock
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to adjust stock";
      })

      // fetchReorderAlerts
      .addCase(fetchReorderAlerts.fulfilled, (state, action) => {
        state.reorderAlerts = action.payload || [];
      })

      // fetchReorderSuggestions
      .addCase(fetchReorderSuggestions.fulfilled, (state, action) => {
        state.reorderSuggestions = action.payload || [];
      });
  },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
