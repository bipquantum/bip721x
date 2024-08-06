import React, { useEffect } from "react";
import { Route, Routes, HashRouter } from "react-router-dom";
import { useInternetIdentity } from "@internet-identity-labs/react-ic-ii-auth";
import Home from "../../pages/Home";
import UserProfile from "../../pages/UserProfile";
import CreateIP from "../../pages/CreateIP";
import { useDispatch, useSelector } from "react-redux";
import getActor from "../../../utils/getActor";
import { signIn, toggleAuthenticating } from "../../store/authReducer";
import AppAppBar from "../AppAppBar";
import { CssBaseline, Divider } from "@mui/material";
import Footer from "../Footer";

const Router = () => {
  const { signout, authenticate, isAuthenticated, identity } =
    useInternetIdentity();

  const dispatch = useDispatch();

  const authState = useSelector((state) => state.authReducer);

  useEffect(() => {
    processInitialAuth();
  }, []);

  useEffect(() => {
    processAuth();
  }, [isAuthenticated]);

  const processAuth = async () => {
    if (isAuthenticated) {
      const createdActor = await getActor(identity);
      dispatch(
        signIn({
          actor: createdActor,
          userAccountPrincipal: identity,
        })
      );
    }
  };

  const processInitialAuth = async () => {
    dispatch(toggleAuthenticating());
    try {
      if (isAuthenticated) {
        await authenticate();
        await processAuth();
      }
    } catch (error) {
      console.log("ERROR: ", error);
      // TODO: handle error
    } finally {
      dispatch(toggleAuthenticating());
    }
  };

  return (
    <HashRouter>
      <CssBaseline />
      <AppAppBar />
      <div style={{ marginTop: "8rem" }}></div>
      <Routes>
        <Route exact path={"/"} element={<Home />}></Route>
        <Route exact path={"/ip/create"} element={<CreateIP />}></Route>
        <Route exact path={"/profile"} element={<UserProfile />}></Route>
      </Routes>
      <div style={{ marginTop: "8rem" }}></div>
      <Divider />
      <Footer />
    </HashRouter>
  );
};

export default Router;
