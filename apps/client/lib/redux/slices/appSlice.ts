import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  sidebarOpen: boolean;
}

const initialState: AppState = {
  isLoading: false,
  sidebarOpen: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { setLoading, toggleSidebar, setSidebarOpen } = appSlice.actions;
export default appSlice.reducer;
