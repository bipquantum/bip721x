import { createSlice } from "@reduxjs/toolkit";

const appReducer = createSlice({
  name: "app",
  initialState: {
    isSmallScreen: false,
  },
  reducers: {
    setSmallScreen: (state, { payload }) => {
      state.isSmallScreen = payload.isSmallScreen;
    },
  },
});

export const { setSmallScreen } = appReducer.actions;

export const reducer = appReducer.reducer;
