import React from "react";
import { Route, Routes, HashRouter } from "react-router-dom";
import IPList from "../IPList";
import Login from "../Login";
import PrivateRoute from "./PrivateRoute";

const Router = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path={"/"}
          element={<PrivateRoute element={<IPList />} />}
        ></Route>
        <Route path={"/login"} element={<Login />}></Route>
      </Routes>
    </HashRouter>
  );
};

export default Router;
