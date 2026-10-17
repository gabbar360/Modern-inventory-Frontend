import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "@/services/dashboardService";

interface DashboardState {
  stats: any;
  notifications: any[];
  whatsappStatus: any;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  notifications: [],
  whatsappStatus: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getStats();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch dashboard stats");
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  "dashboard/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getNotifications();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch notifications");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "dashboard/markNotificationRead",
  async (id: string, { rejectWithValue }) => {
    try {
      await dashboardService.markNotificationRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to mark notification as read");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch dashboard stats";
      })

      // notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload || [];
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((n) =>
          n.id === action.payload ? { ...n, is_read: true } : n
        );
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
