import { createSlice } from "@reduxjs/toolkit";

const IPReducer = createSlice({
  name: "IP",
  initialState: {
    ipList: [],
  },
  reducers: {
    create: (state, { payload }) => {
      if (!payload?.list) return;
      state.ipList = payload.list;
    },
    add: (state, { payload }) => {
      if (!payload?.list) return;
      state.ipList = [...state.ipList, payload.ip];
    },
  },
});

export const { add, create } = IPReducer.actions;

export const reducer = IPReducer.reducer;
