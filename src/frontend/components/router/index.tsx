import { Route, Routes } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import Dashboard from "../pages/dashboard";
import NewIP from "../pages/new-ip";
import Profile from "../pages/profile";
import Bips from "../pages/bips";
import Login from "../pages/login";
import Main from "../pages/main";
import BipDetails from "../pages/bips/BipDetails";
import Copyright from "../pages/copyright";
import WhoAreYou from "../pages/poll";
import WithHistoryWrapper from "../pages/dashboard/WithHistoryWrapper";
import Wallet from "../pages/wallet";
import CertificatePage from "../pages/bips/CertificatePage";
import Plans from "../pages/plans";
import { useAuth } from "@nfid/identitykit/react";
import { useHotjarTracking } from "../hooks/useHotjarTracking";

const Router = () => {
  const { user } = useAuth();
  useHotjarTracking();

  return (
    <Routes>
      <Route path={"/"} element={<PrivateRoute element={<Main />} />} />
      <Route
        path={"/poll"}
        element={<PrivateRoute element={<WhoAreYou />} />}
      />
      <Route
        path={"/dashboard"}
        element={<PrivateRoute element={<Dashboard />} />}
      />
      <Route
        path={"/chat/:chatId"}
        element={
          <PrivateRoute
            element={
              <WithHistoryWrapper principal={user?.principal} />
            }
          />
        }
      />
      <Route
        path={"/marketplace"}
        element={<Bips />}
      />
      <Route
        path={"/new"}
        element={
          <PrivateRoute
            element={<NewIP principal={user?.principal} />}
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
        path={"/plans"}
        element={<PrivateRoute element={<Plans />} />}
      />
      <Route
        path={"/bips"}
        element={
          <PrivateRoute
            element={<Wallet principal={user?.principal} />}
          />
        }
      />
      <Route
        path={"/bip/:ipId"}
        element={<BipDetails principal={user?.principal} />}
      />
      <Route path={"/login"} element={<Login />} />
      <Route path="/bip/:intPropId/certificate" element={<CertificatePage />} />
    </Routes>
  );
};

export default Router;
