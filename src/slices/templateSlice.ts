import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { templateService } from "@/services/templateService";

interface TemplateState {
  templates: any[];
  loading: boolean;
  error: string | null;
}

const initialState: TemplateState = {
  templates: [],
  loading: false,
  error: null,
};

export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await templateService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch templates");
    }
  }
);

export const createTemplate = createAsyncThunk(
  "templates/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await templateService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || "Failed to create template");
    }
  }
);

const templateSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload || [];
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch templates";
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.unshift(action.payload);
      });
  },
});

export const { clearError } = templateSlice.actions;
export default templateSlice.reducer;
