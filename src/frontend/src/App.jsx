import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import "../index.css";

// pages
import Layout from "./components/Layout";
import Dashbaord from "./pages/Home";

const App = () => {
  const defaultTheme = createTheme({ palette: { mode: "light" } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <BrowserRouter>
        <Route path="/" element={<Layout />}>
          <Route path="/dashboard" element={<Dashbaord />} />
        </Route>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
