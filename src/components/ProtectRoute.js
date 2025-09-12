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


// import React from "react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, requiredPermission }) => {
//   const token = localStorage.getItem("tokenKey");
//   const userPermission = localStorage.getItem("permission"); // ต้องเก็บ permission ลงใน localStorage ด้วย

//   if (!token) {
//     // ไม่มี Token, Redirect ไปหน้า Login
//     return <Navigate to="/" replace />;
//   }

//   if (requiredPermission && userPermission !== requiredPermission) {
//     // มี Token แต่สิทธิ์ไม่พอ, Redirect ไปหน้าที่เหมาะสม
//     return <Navigate to="/unauthorized" replace />; // หรือหน้าอื่น
//   }

//   return children;
// };

// export default ProtectedRoute;



// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   return token ? children : <Navigate to="/login" />;
// };

