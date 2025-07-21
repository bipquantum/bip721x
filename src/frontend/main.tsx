import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import "./index.css";

const isLocal = import.meta.env.VITE_DFX_NETWORK === "local";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  isLocal ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  ),
);
