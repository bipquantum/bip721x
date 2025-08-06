import { Navigate } from "react-router-dom";
import React from "react";
import { useAuth } from "@nfid/identitykit/react";

type PrivateRouteProps = {
  element: React.ReactNode;
};

function PrivateRoute({ element }: PrivateRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{element}</>;
}

export default PrivateRoute;
