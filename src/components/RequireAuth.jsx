// src/components/RequireAuth.js
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRoles, children }) => {
  const { auth, refreshAccessToken } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const currentTime = Date.now();
      const tokenExpiryTime = auth.token_expiry * 1000; // Convert to milliseconds

      if (tokenExpiryTime - currentTime < 5 * 60 * 1000) {
        // Refresh if within 5 minutes of expiry
        await refreshAccessToken();
      }
      setIsLoading(false);
    };

    if (auth.accessToken && auth.token_expiry) {
      checkTokenExpiration();
    } else {
      setIsLoading(false); // No token available, finish loading immediately
    }
  }, [auth, refreshAccessToken]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!auth?.accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
