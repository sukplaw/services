import React, { useState } from "react";
import "./App1.css";
import "./components/ShowDetail.css";
import "./components/other/Navbar.css";
import "./components/Dashboard.css";
import "./components/CreateForm.css";
import { Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Login from "./components/Login";
import UnauthorizedPage from "./components/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectRoute";
import Main from "./Main";

function App() {
  // const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
export default App;

