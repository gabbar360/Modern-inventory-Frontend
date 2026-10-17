import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "@/lib/constants";

interface UiState {
  sidebarCollapsed: boolean;
  searchModalOpen: boolean;
  quickAddOpen: boolean;
  activeFilter: string;
  searchQuery: string;
}

const getInitialSidebarState = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true";
  }
  return false;
};

const initialState: UiState = {
  sidebarCollapsed: getInitialSidebarState(),
  searchModalOpen: false,
  quickAddOpen: false,
  activeFilter: "all",
  searchQuery: "",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(state.sidebarCollapsed));
      }
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(action.payload));
      }
    },
    setSearchModalOpen: (state, action: PayloadAction<boolean>) => {
      state.searchModalOpen = action.payload;
    },
    setQuickAddOpen: (state, action: PayloadAction<boolean>) => {
      state.quickAddOpen = action.payload;
    },
    setActiveFilter: (state, action: PayloadAction<string>) => {
      state.activeFilter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setSearchModalOpen,
  setQuickAddOpen,
  setActiveFilter,
  setSearchQuery,
} = uiSlice.actions;

export const selectSidebarCollapsed = (state: any) => state.ui.sidebarCollapsed;
export const selectSearchModalOpen = (state: any) => state.ui.searchModalOpen;
export const selectActiveFilter = (state: any) => state.ui.activeFilter;
export const selectSearchQuery = (state: any) => state.ui.searchQuery;

export default uiSlice.reducer;
