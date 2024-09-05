import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "@ic-reactor/react";

import IPList from "../IPList";
import Login from "../Login";
import PrivateRoute from "./PrivateRoute";
import OwnedIPList from "../OwnedIPList";
import IP from "../pages/IP";

const Router = () => {
  const { identity } = useAuth({});

  return (
    <Routes>
      <Route path={"/"} element={<PrivateRoute element={<IPList />} />} />
      <Route
        path={"/myip"}
        element={
          <PrivateRoute
            element={<OwnedIPList ownerPrincipal={identity?.getPrincipal()} />}
          />
        }
      />
      <Route path={"/ip/:id"} element={<PrivateRoute element={<IP />} />} />
      <Route path={"/login"} element={<Login />} />
    </Routes>
  );
};

export default Router;
