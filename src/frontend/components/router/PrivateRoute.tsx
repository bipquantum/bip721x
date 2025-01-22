import { Navigate } from "react-router-dom";
import {  useAgent } from "@nfid/identitykit/react";
import React from "react";

type PrivateRouteProps = {
  element: React.ReactNode;
};

function PrivateRoute({ element }: PrivateRouteProps) {
  
  const isLocal = false;
  const customHost = isLocal ? 'http://localhost:4943' : 'https://icp-api.io';
  const authenticatedAgent = useAgent({
    host: customHost,
    retryTimes: 10,
  });

  // @todo
  //if (!authenticatedAgent) {
    //console.log("Navigating to /login");
    //return <Navigate to="/login" />;
  //}

  return <>{element}</>;
}

export default PrivateRoute;
