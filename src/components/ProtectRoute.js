import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userPermission =
    localStorage.getItem("permission") || sessionStorage.getItem("permission");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermission && userPermission !== requiredPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;


