import { configureStore } from "@reduxjs/toolkit";

import * as ipReducer from "./IPReducer";
import * as appReducer from "./appReducer";
import * as authReducer from "./authReducer";

const store = configureStore({
  reducer: {
    authReducer: authReducer.reducer,
    ipReducer: ipReducer.reducer,
    appReducer: appReducer.reducer,
  },
  devTools: true,
});

export default store;
