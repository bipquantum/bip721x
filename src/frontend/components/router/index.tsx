import { Route, Routes } from "react-router-dom";
import { useAuth } from "@ic-reactor/react";

import PrivateRoute from "./PrivateRoute";
import Dashboard from "../pages/dashboard";
import NewIPButton from "../pages/new-ip";
import Profile from "../pages/profile";
import Bips from "../pages/bips";
import Login from "../pages/login";
import Main from "../pages/main";
import About from "../pages/about";
import BipDetails from "../pages/bips/BipDetails";
import Copyright from "../pages/copyright";
import WhoAreYou from "../pages/who-you-are";
import ChatBot from "../pages/dashboard/ChatBot";
import WithHistory from "../pages/dashboard/WithHistory";

const Router = () => {
  const { identity } = useAuth({});

  return (
    <Routes>
      <Route path={"/"} element={<PrivateRoute element={<Main />} />} />
      <Route
        path={"/who-you-are"}
        element={<PrivateRoute element={<WhoAreYou />} />}
      />
      <Route
        path={"/dashboard"}
        element={<PrivateRoute element={<Dashboard/>} />}
      />
      <Route
        path={"/chat/:chatId"}
        element={<PrivateRoute element={<WithHistory principal={identity?.getPrincipal()} />} />}
      />
      <Route
        path={"/chat"}
        element={<PrivateRoute element={<WithHistory principal={identity?.getPrincipal()} />} />}
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
      <Route path={"/login"} element={<Login />} />
    </Routes>
  );
};

export default Router;
