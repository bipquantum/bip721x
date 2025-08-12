import { Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "@nfid/identitykit/react";

type PrivateRouteProps = {
  element: React.ReactNode;
};

function PrivateRoute({ element }: PrivateRouteProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{element}</>;
}

export default PrivateRoute;
