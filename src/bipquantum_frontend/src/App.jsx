import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import "../index.css";

// pages
import Layout from "./components/Layout";
import Dashbaord from "./pages/Home";

const App = () => {
  return (
    <BrowserRouter>
      <Route path="/" element={<Layout />}>
        <Route path="/dashboard" element={<Dashbaord />} />
      </Route>
    </BrowserRouter>
  );
};

export default App;
