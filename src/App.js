import React, { useState } from "react";
import "./App1.css";
import "./components/ShowDetail.css";
import "./components/other/Navbar.css";
import "./components/Dashboard.css";
import "./components/CreateForm.css";
// import "./ShowDetail.css";
import { Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "./components/other/Navbar";
import Sidebar from "./components/other/Sidebar";
// import Home from "./components/Home";
import Job1 from "./components/Job1";
import CreateCustomerForm from "./components/CreateCustomerForm";
import Dashboard from "./components/Dashboard";
import CreateProductForm from "./components/CreateProductForm";
import CreateJobForm from "./components/CreateJobForm";
import Backlogs from "./components/Backlogs";
// import Login from "./components/Login";
// import Test from "./components/test";
import Edit from "./components/Edit";
import ShowDetail from "./components/ShowDetail";
import Login from "./components/Login";
import UnauthorizedPage from "./components/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectRoute";
import Main from "./Main";
import Register from "./components/Register";

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

