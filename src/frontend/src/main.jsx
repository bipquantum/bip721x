import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";

import "./index.scss";
import store from "./store";
import IIProvider from "./components/IIProvider";
import Router from "./components/Router";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <IIProvider>
        <PrimeReactProvider>
          <Router />
        </PrimeReactProvider>
      </IIProvider>
    </Provider>
  </React.StrictMode>
);
