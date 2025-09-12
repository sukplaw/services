import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/other/Sidebar";
import Navbar from "./components/other/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
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
import NavProfileLinkBridge from "./components/NavProfileLinkBridge";
import Profile from "./components/Profile";

const Main = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div
      className="d-flex"
      style={{ backgroundColor: "#F0F0F0", minHeight: "100vh" }}
    >
      <Sidebar onCollapse={setSidebarCollapsed} />

      <div
        className={`flex-grow-1 d-flex flex-column transition-all`}
        style={{
          paddingLeft: isSidebarCollapsed ? "70px" : "250px",
          transition: "padding-left 0.3s ease",
        }}
      >
        <Navbar />
        <NavProfileLinkBridge />
        <div className="container-fluid mt-3">
          <Routes>
            <Route path="job" element={<Job1 />} />
            <Route path="incomplete-job" element={<Backlogs />} />
            <Route path="home" element={<Dashboard />} />
            <Route path="create-customer" element={<CreateCustomerForm />} />
            <Route path="create-product" element={<CreateProductForm />} />
            <Route path="create-job" element={<CreateJobForm />} />
            <Route path="show-job/:jobRef" element={<ShowDetail />} />
            <Route path="show-customer" element={<Edit />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Main;
