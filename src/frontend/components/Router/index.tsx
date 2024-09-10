import { Route, Routes } from "react-router-dom";
import { useAuth } from "@ic-reactor/react";

import IPList, { FilterType } from "../IPList";
import Login from "../Login";
import PrivateRoute from "./PrivateRoute";
import IP from "../pages/IP";
import Dashboard from "../pages/Dashboard";
import NewIP from "../pages/NewIP";
import Copyright from "../Copyright";
import Profile from "../pages/Profile";
import Bips from "../pages/Bips";
import LoginV2 from "../pages/Login";
import Main from "../pages/Main";
import About from "../pages/About";

const Router = () => {
  const { identity } = useAuth({});

  return (
    <Routes>
      <Route path={"/"} element={<PrivateRoute element={<Main />} />} />
      <Route
        path={"/dashboard"}
        element={<PrivateRoute element={<Dashboard />} />}
      />
      <Route path={"/new"} element={<PrivateRoute element={<NewIP />} />} />
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
            element={
              <Bips
                principal={identity?.getPrincipal()}
                filterBy={FilterType.LISTED}
              />
            }
          />
        }
      />
      <Route path={"/about"} element={<PrivateRoute element={<About />} />} />
      <Route path={"/login"} element={<LoginV2 />} />
    </Routes>
    // <Routes>
    //   <Route path={"/"} element={<PrivateRoute element={<IPList />} />} />
    //   <Route
    //     path={"/myip"}
    //     element={
    //       <PrivateRoute
    //         element={<OwnedIPList ownerPrincipal={identity?.getPrincipal()} />}
    //       />
    //     }
    //   />
    //   <Route path={"/ip/:id"} element={<PrivateRoute element={<IP />} />} />
    //   <Route path={"/login"} element={<Login />} />
    // </Routes>
  );
};

export default Router;
