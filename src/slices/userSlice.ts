import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "@/services/userService";

interface UserState {
  users: any[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch users");
    }
  }
);

export const inviteUser = createAsyncThunk(
  "users/invite",
  async (data: { email: string; name: string; role: string }, { rejectWithValue }) => {
    try {
      return await userService.inviteUser(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to invite user");
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "users/updateRole",
  async ({ id, role }: { id: string; role: string }, { rejectWithValue }) => {
    try {
      return await userService.updateUserRole(id, role);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update user role");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch users";
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
