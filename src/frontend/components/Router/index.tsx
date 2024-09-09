import { Route, Routes } from "react-router-dom";
import { useAuth } from "@ic-reactor/react";

import IPList, { FilterType } from "../IPList";
import Login from "../Login";
import PrivateRoute from "./PrivateRoute";
import IP from "../pages/IP";

const Router = () => {
  const { identity } = useAuth({});

  return (
    <Routes>
      <Route path={"/"} element={<PrivateRoute element={<IPList principal={identity?.getPrincipal()} filterBy={FilterType.LISTED}/>} />} />
      <Route
        path={"/myip"}
        element={
          <PrivateRoute
            element={<IPList principal={identity?.getPrincipal()} filterBy={FilterType.OWNED} />}
          />
        }
      />
      <Route path={"/ip/:id"} element={<PrivateRoute element={<IP />} />} />
      <Route path={"/login"} element={<Login />} />
    </Routes>
  );
};

export default Router;
