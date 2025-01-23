import { Route, Routes } from "react-router-dom";
import { useAuth } from "@ic-reactor/react";

import PrivateRoute from "./PrivateRoute.js";
import Dashboard from "../pages/dashboard/index.js";
import NewIPButton from "../pages/new-ip/index.js";
import Profile from "../pages/profile/index.js";
import Bips from "../pages/bips/index.js";
import Login from "../pages/login/index.js";
import Main from "../pages/main/index.js";
import About from "../pages/about/index.js";
import BipDetails from "../pages/bips/BipDetails.js";
import Copyright from "../pages/copyright/index.js";
import WhoAreYou from "../pages/poll/index.js";
import WithHistoryWrapper from "../pages/dashboard/WithHistoryWrapper.js";
import Wallet from "../pages/wallet/index.js";

const Router = () => {
  const { identity } = useAuth({});

  return (
    <Routes>
      <Route path={"/"} element={<PrivateRoute element={<Main />} />} />
      <Route
        path={"/poll"}
        element={<PrivateRoute element={<WhoAreYou />} />}
      />
      <Route
        path={"/dashboard"}
        element={<PrivateRoute element={<Dashboard/>} />}
      />
      <Route
        path={"/chat/:chatId"}
        element={<PrivateRoute element={<WithHistoryWrapper principal={identity?.getPrincipal()} />} />}
      />
      <Route
        path={"/marketplace"}
        element={<Bips/>}
      />
      <Route
        path={"/new"}
        element={
          <PrivateRoute
            element={<NewIPButton principal={identity?.getPrincipal()} />}
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
            element={<Wallet principal={identity?.getPrincipal()} />}
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
      <Route path={"/login"} element={<Login />} />
    </Routes>
  );
};

export default Router;
