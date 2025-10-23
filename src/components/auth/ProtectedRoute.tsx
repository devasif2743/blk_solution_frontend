import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../api/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // ✅ Save the last visited path (used after login)
  useEffect(() => {
    if (user && location.pathname !== "/login") {
      localStorage.setItem("lastVisited", location.pathname);
    }
  }, [user, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  // 🚫 If no user, go to login (not dashboard)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ If logged in, render requested page
  return <>{children}</>;
};

export default ProtectedRoute;
