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
import DetailsView from "../pages/profile/DetailsView";
import { useIdentity } from "@nfid/identitykit/react";

const Router = () => {
  const identity = useIdentity();

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
              <WithHistoryWrapper principal={identity?.getPrincipal()!} />
            }
          />
        }
      />
      <Route
        path={"/marketplace"}
        element={<Bips principal={identity?.getPrincipal()!} />}
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
            element={<Wallet principal={identity?.getPrincipal()} />}
          />
        }
      />
      <Route
        path={"/bip/:ipId"}
        element={<BipDetails principal={identity?.getPrincipal()} />}
      />
      <Route path={"/view"} element={<DetailsView />} />
      <Route path={"/login"} element={<Login />} />
      <Route path="/bip/:intPropId/certificate" element={<CertificatePage />} />
    </Routes>
  );
};

export default Router;
