import { Route, Routes } from "react-router-dom";
import { useAuth } from "@ic-reactor/react";

import PrivateRoute from "./PrivateRoute";
import Dashboard from "../pages/Dashboard";
import NewIP from "../pages/NewIP";
import Copyright from "../Copyright";
import Profile from "../pages/Profile";
import Bips from "../pages/Bips";
import LoginV2 from "../pages/Login";
import Main from "../pages/Main";
import About from "../pages/About";
import BipDetails from "../pages/Bips/BipDetails";

const Router = () => {
  const { identity } = useAuth({});

  return (
    <Routes>
      <Route path={"/"} element={<PrivateRoute element={<Main />} />} />
      <Route
        path={"/dashboard"}
        element={<PrivateRoute element={<Dashboard />} />}
      />
      <Route
        path={"/new"}
        element={
          <PrivateRoute
            element={<NewIP principal={identity?.getPrincipal()} />}
          />
        }
      />
      <Route
        path={"/copyright"}
        element={<PrivateRoute element={<Copyright />} />}
      />
      <Route
        path={"/profile"}
        element={<PrivateRoute element={<Profile />} />}
      />
      <Route
        path={"/bips"}
        element={
          <PrivateRoute
            element={<Bips principal={identity?.getPrincipal()} />}
          />
        }
      />
      <Route
        path={"/bip/:ipId"}
        element={
          <PrivateRoute
            element={<BipDetails principal={identity?.getPrincipal()} />}
          />
        }
      />
      <Route path={"/about"} element={<PrivateRoute element={<About />} />} />
      <Route path={"/login"} element={<LoginV2 />} />
    </Routes>
  );
};

export default Router;
