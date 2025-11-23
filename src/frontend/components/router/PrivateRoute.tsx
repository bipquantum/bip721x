import { Navigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "@nfid/identitykit/react";

type PrivateRouteProps = {
  element: React.ReactNode;
};

function PrivateRoute({ element }: PrivateRouteProps) {
  const { user } = useAuth();
  const location = useLocation();
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
    // Preserve the original URL (including query params) so we can redirect back after login
    const returnUrl = location.pathname + location.search;
    return <Navigate to="/login" state={{ returnUrl }} />;
  }

  return <>{element}</>;
}

export default PrivateRoute;
