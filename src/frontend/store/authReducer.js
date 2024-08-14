import { createSlice } from "@reduxjs/toolkit";

const authReducer = createSlice({
  name: "auth",
  initialState: {
    actor: null,
    authenticating: false,
    authenticated: false,
    userAccountPrincipal: null,
  },
  reducers: {
    toggleAuthenticating: (state) => {
      state.authenticating = !state.authenticating;
    },
    signIn: (state, { payload }) => {
      if (!payload.actor) return;
      state.authenticated = true;
      state.actor = payload.actor;
      state.userAccountPrincipal = payload.userAccountPrincipal;
      state.authenticating = false;
    },
    signOut: (state) => {
      state.actor = null;
      state.authenticated = false;
      state.userAccountPrincipal = null;
      state.authenticating = false;
    },
  },
});

export const { signIn, signOut, toggleAuthenticating } = authReducer.actions;

export const reducer = authReducer.reducer;
