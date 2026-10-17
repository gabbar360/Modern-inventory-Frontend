import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { roleService, Role } from "@/services/roleService";

interface RoleState {
  roles: Role[];
  currentRole: Role | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  currentRole: null,
  loading: false,
  error: null,
};

export const fetchRoles = createAsyncThunk(
  "roles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await roleService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch roles");
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  "roles/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await roleService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch role");
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/create",
  async (data: Partial<Role>, { rejectWithValue }) => {
    try {
      return await roleService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create role");
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/update",
  async ({ id, data }: { id: string; data: Partial<Role> }, { rejectWithValue }) => {
    try {
      return await roleService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to update role");
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await roleService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to delete role");
    }
  }
);

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload || [];
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch roles";
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.currentRole = action.payload;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload && r._id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentRole } = roleSlice.actions;
export default roleSlice.reducer;
