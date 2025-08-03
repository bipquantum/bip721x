import { Navigate } from "react-router-dom";
import React, { useMemo } from "react";
import { useIdentity } from "@nfid/identitykit/react";

type PrivateRouteProps = {
  element: React.ReactNode;
};

function PrivateRoute({ element }: PrivateRouteProps) {
  const identity = useIdentity();
  const authenticated = useMemo(
    () => identity !== undefined && !identity.getPrincipal().isAnonymous(),
    [identity],
  );

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return <>{element}</>;
}

export default PrivateRoute;
