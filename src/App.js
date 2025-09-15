import React, { useState } from "react";
import "./App1.css";
import "./components/ShowDetail.css";
import "./components/other/Navbar.css";
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
      <Route path="/register" element={<Register />} />
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
    //   <Routes>
    //     <Route path="/" element={<Login />} />
    //     <Route path="/unauthorized" element={<UnauthorizedPage />} />
    //     <Route path="/job" element={
    //       <ProtectedRoute>
    //         <Main
    //           isSidebarCollapsed={isSidebarCollapsed}
    //           setSidebarCollapsed={setSidebarCollapsed}
    //         />
    //       </ProtectedRoute>
    //     } />
    //   </Routes>
    // <div
    //   className="d-flex"
    //   style={{ backgroundColor: "#F0F0F0", minHeight: "100vh" }}
    // >
    //   <Sidebar onCollapse={setSidebarCollapsed} />

    //   {/* Content Area */}
    //   <div
    //     className={`flex-grow-1 d-flex flex-column transition-all`}
    //     style={{
    //       paddingLeft: isSidebarCollapsed ? "70px" : "250px", // เปลี่ยนตาม sidebar
    //       transition: "padding-left 0.3s ease",
    //     }}
    //   >
    //     <Navbar />
    //     <div className="container-fluid mt-3">
    //       <Routes>
    //         <Route path="/job" element={<Job1 />} />
    //         <Route path="/incomplete-job" element={<Backlogs />} />
    //         <Route path="/" element={<Dashboard />} />
    //         <Route path="/create-customer" element={<CreateCustomerForm />} />
    //         <Route path="/create-product" element={<CreateProductForm />} />
    //         <Route path="/create-job" element={<CreateJobForm />} />
    //         <Route path="/show-job/:jobRef" element={<ShowDetail />} />
    //         <Route path="/show-customer" element={<Edit />} />
    //       </Routes>
    //     </div>
    //   </div>
    // </div>
  );
}
export default App;

// import React, { useState } from "react";
// import "./App1.css";
// import "./ShowDetail.css";
// import { Route, Routes } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Navbar from "./components/other/Navbar";
// import Sidebar from "./components/other/Sidebar";
// // import Home from "./components/Home";
// import Job1 from "./components/Job1";
// import CreateCustomerForm from "./components/CreateCustomerForm";
// import Dashboard from "./components/Dashboard";
// import CreateProductForm from "./components/CreateProductForm";
// import CreateJobForm from "./components/CreateJobForm";
// import Backlogs from "./components/Backlogs";
// // import Login from "./components/Login";
// // import Test from "./components/test";
// import Edit from "./components/Edit";
// import ShowDetail from "./components/ShowDetail";

// function App() {
//   const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

//   return (
//     <div
//       className="d-flex"
//       style={{ backgroundColor: "#F0F0F0", minHeight: "100vh" }}
//     >
//       <Sidebar onCollapse={setSidebarCollapsed} />

//       {/* Content Area */}
//       <div
//         className={`flex-grow-1 d-flex flex-column transition-all`}
//         style={{
//           paddingLeft: isSidebarCollapsed ? "70px" : "250px", // เปลี่ยนตาม sidebar
//           transition: "padding-left 0.3s ease",
//         }}
//       >
//         <Navbar />
//         <div className="container-fluid mt-3">
//           <Routes>
//             <Route path="/job" element={<Job1 />} />
//             <Route path="/incomplete-job" element={<Backlogs />} />
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/create-customer" element={<CreateCustomerForm />} />
//             <Route path="/create-product" element={<CreateProductForm />} />
//             <Route path="/create-job" element={<CreateJobForm />} />
//             <Route path="/show-job/:jobRef" element={<ShowDetail />} />
//             <Route path="/show-customer" element={<Edit />} />
//           </Routes>
//         </div>
//       </div>
//     </div>
//   );
// }
// export default App;

// import React, { useState, useEffect } from "react";
// import "./App.css";
// import { Route, Routes } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import Navbar from "./components/other/Navbar";
// import Sidebar from "./components/other/Sidebar";
// import Job from "./components/Job";
// import CreateCustomerForm from "./components/CreateCustomerForm";
// import Dashboard from "./components/Dashboard";
// import CreateProductForm from "./components/CreateProductForm";
// import CreateJobForm from "./components/CreateJobForm";
// // import Test from "./components/test";
// import Edit from "./components/Edit";
// import ShowDetail from "./components/ShowDetail";
// import HomeTest from "./components/HomeTest";
// import Backlogs from "./components/Backlogs";
// import Customer from "./components/Customer";
// import Login from "./components/Login";
// import { LoadingProvider } from "./components/LoadingContext";
// import { WarningContext } from "./components/WarningContext";
// import axios from "axios";
// import dayjs from "dayjs";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import JobStatusTable from "./components/JobStatusTable";
// import ProtectedRoute from "./components/ProtectRoute";
// import UnauthorizedPage from "./components/UnauthorizedPage";
// import ProtectedLayout from "./components/useMockWarningCount";
// import Timeline from "./components/TimeLine";
// dayjs.extend(isSameOrBefore);
// function App() {
//   const [data, setData] = useState([]);
//   const [warningCount, setWarningCount] = useState(0);

//   const fetchData = async () => {
//     try {
//       const response = await axios.get("http://localhost:3302/get-job");
//       setData(response.data);
//       // คำนวณจำนวนการแจ้งเตือนเมื่อได้ข้อมูลมา
//       countWarnings(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const countWarnings = (data) => {
//     if (!data || data.length === 0) {
//       setWarningCount(0);
//       return;
//     }

//     // กรองและนับเฉพาะรายการที่เหลือเวลาน้อยกว่าหรือเท่ากับ 2 วัน
//     const count = data.filter((item) => {
//       const expectedDate = dayjs(item.expected_completion_date);
//       const today = dayjs();
//       const remainingDays = expectedDate.diff(today, "day");
//       return remainingDays <= 2 && remainingDays >= 0;
//     }).length;

//     setWarningCount(count);
//   };

//   useEffect(() => {
//     fetchData();
//     // ดึงข้อมูลใหม่ทุก 1 นาที (60000 มิลลิวินาที)
//     const interval = setInterval(fetchData, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <LoadingProvider>
//       <Routes>
//         {/* Public Route: ทุกคนเข้าถึงได้ */}
//         <Route path="/" element={<Login />} />
//         <Route path="/unauthorized" element={<UnauthorizedPage />} />

//         {/* Protected Routes: ต้องล็อกอินก่อนถึงจะเข้าได้ */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <ProtectedLayout />
//             </ProtectedRoute>
//           }
//         >
//           {/*
//             Route ย่อยเหล่านี้จะถูกแสดงผลใน <Outlet />
//             การป้องกันสิทธิ์เพิ่มเติมจะถูกใช้กับบาง Route โดยตรง
//           */}
//           <Route path="job" element={<Job />} />
//           <Route path="dashboard" element={<Dashboard />} />

//           {/* Route นี้ต้องมีสิทธิ์ "full_admin" เท่านั้นถึงจะเข้าได้ */}
//           <Route
//             path="create-product"
//             element={
//               <ProtectedRoute requiredPermission="full_admin">
//                 <CreateProductForm />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="create-job" element={<CreateJobForm />} />
//           <Route path="create-customer" element={<CreateCustomerForm />} />
//           <Route path="show-job/:jobRef" element={<ShowDetail />} />
//           <Route
//             path="jobs-by-status/:jobStatus"
//             element={<JobStatusTable />}
//           />

//           {/* แก้ไขให้มีการป้องกันสิทธิ์ด้วย ProtectedRoute */}
//           <Route
//             path="show-customer"
//             element={
//               <ProtectedRoute requiredPermission="editor">
//                 <Edit />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="show-home" element={<HomeTest />} />
//           <Route path="home" element={<Backlogs />} />
//           <Route path="test" element={<Customer />} />
//           <Route path="timeline" element={<Timeline />} />
//         </Route>
//       </Routes>
//     </LoadingProvider>
//   );
// }

// export default App;

// import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// // ไม่จำเป็นต้อง import App.css ถ้าคุณใช้แต่ Bootstrap และ inline styles
// // import "./App.css";

// const Dashboard = () => {
//   return (
//     // Replaced .container
//     <div
//       className="d-flex"
//       style={{ backgroundColor: "#F0F0F0", minHeight: "100vh" }}
//     >
//       {/* Sidebar */}
//       {/* Replaced .sidebar */}
//       <div
//         className="text-white p-4 d-flex flex-column"
//         style={{
//           width: "250px",
//           backgroundColor: "#0f4c75",
//           boxSizing: "border-box",
//           position: "fixed",
//           height: "100vh",
//           left: 0,
//           top: 0,
//         }}
//       >
//         <div className="d-flex align-items-center mb-4 fs-5 fw-bold">
//           <img
//             src="/path/to/user-icon.png"
//             alt="user icon"
//             className="me-2"
//             style={{ width: "40px" }}
//           />
//           <span>service system</span>
//         </div>
//         <nav className="flex-grow-1">
//           <ul className="list-unstyled p-0">
//             <li className="mb-2">
//               <a
//                 href="#home"
//                 className="d-block text-white text-decoration-none p-2 rounded"
//               >
//                 <i className="fas fa-home me-2"></i>
//                 หน้าแรก
//               </a>
//             </li>
//             <li className="mb-2" style={{ backgroundColor: "#f7b731" }}>
//               <a
//                 href="#dashboard"
//                 className="d-block text-dark text-decoration-none p-2 rounded"
//               >
//                 <i className="fas fa-chart-line me-2"></i>
//                 Dashboard
//               </a>
//             </li>
//             <li className="mb-2" style={{ marginTop: "20px" }}>
//               <a
//                 href="#logout"
//                 className="d-block text-white text-decoration-none p-2 rounded"
//               >
//                 <i className="fas fa-sign-out-alt me-2"></i>
//                 Log Out
//               </a>
//             </li>
//           </ul>
//         </nav>
//       </div>

//       {/* Main content */}
//       {/* Replaced .content */}
//       <div
//         className="flex-grow-1 d-flex flex-column"
//         style={{ paddingLeft: "250px" }}
//       >
//         {/* Navbar */}
//         {/* Replaced .navbar */}
//         <header
//           className="d-flex justify-content-end align-items-center"
//           style={{
//             backgroundColor: "#FFFEFE",
//             padding: "10px 20px",
//             boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
//             position: "sticky",
//             top: 0,
//             zIndex: 10,
//             color: "black",
//           }}
//         >
//           <div className="d-flex align-items-center">
//             <span style={{ marginRight: "20px", fontSize: "1.1rem" }}>
//               Wed, 6 Aug 2025
//             </span>
//             <span style={{ marginRight: "20px", fontSize: "1.1rem" }}>
//               Service
//             </span>
//             <div
//               className="rounded-circle d-flex justify-content-center align-items-center fw-bold me-2"
//               style={{
//                 width: "40px",
//                 height: "40px",
//                 backgroundColor: "#1abc9c",
//                 marginRight: "10px",
//               }}
//             >
//               S
//             </div>
//             <i className="fas fa-chevron-down text-dark"></i>
//           </div>
//         </header>

//         {/* Dashboard content */}
//         {/* Replaced .dashboard-content */}
//         <div
//           style={{
//             backgroundColor: "#FFFFFF",
//             margin: "20px",
//             padding: "20px",
//             borderRadius: "10px",
//           }}
//         >
//           <h1 className="text-dark">Dashboard</h1>
//           <div className="d-flex align-items-center mb-4">
//             <div
//               className="d-flex align-items-center rounded-pill"
//               style={{
//                 backgroundColor: "white",
//                 padding: "8px 15px",
//                 marginRight: "10px",
//                 fontSize: "0.9rem",
//               }}
//             >
//               <i className="fas fa-calendar-alt me-2 text-dark"></i>
//               <span>Wed, 6 Aug 2025</span>
//               <i className="fas fa-chevron-down ms-2 text-dark"></i>
//             </div>
//             <div
//               className="d-flex align-items-center rounded-pill"
//               style={{
//                 backgroundColor: "white",
//                 padding: "8px 15px",
//                 marginRight: "10px",
//                 fontSize: "0.9rem",
//               }}
//             >
//               <span>วัน</span>
//               <i className="fas fa-chevron-down ms-2 text-dark"></i>
//             </div>
//             <div
//               className="d-flex align-items-center rounded-pill"
//               style={{
//                 backgroundColor: "white",
//                 padding: "8px 15px",
//                 fontSize: "0.9rem",
//               }}
//             >
//               <span>เลือกสถานะ:</span>
//               <i className="fas fa-chevron-down ms-2 text-dark"></i>
//             </div>
//           </div>

//           <div className="d-flex justify-content-between gap-4 mb-4">
//             <div
//               className="d-flex align-items-center rounded-3"
//               style={{
//                 backgroundColor: "white",
//                 padding: "20px",
//                 width: "30%",
//                 boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//               }}
//             >
//               <div className="me-3 fs-3 text-dark">
//                 <i className="fas fa-box"></i>
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">1 ชิ้น</h2>
//                 <p
//                   className="text-muted mb-0 fs-6"
//                   style={{ fontSize: "0.8rem" }}
//                 >
//                   จำนวนสินค้าที่ค้นหาต่อวัน
//                 </p>
//               </div>
//             </div>
//             <div
//               className="d-flex align-items-center rounded-3"
//               style={{
//                 backgroundColor: "white",
//                 padding: "20px",
//                 width: "30%",
//                 boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//               }}
//             >
//               <div className="me-3 fs-3 text-dark">
//                 <i className="fas fa-th"></i>
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">เครื่องช่วยฟัง</h2>
//                 <p
//                   className="text-muted mb-0 fs-6"
//                   style={{ fontSize: "0.8rem" }}
//                 >
//                   ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำวัน
//                 </p>
//               </div>
//             </div>
//             <div
//               className="d-flex align-items-center rounded-3"
//               style={{
//                 backgroundColor: "white",
//                 padding: "20px",
//                 width: "30%",
//                 boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//               }}
//             >
//               <div className="me-3 fs-3 text-dark">
//                 <i className="fas fa-users"></i>
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">สมปอง, 1 รายการ</h2>
//                 <p
//                   className="text-muted mb-0 fs-6"
//                   style={{ fontSize: "0.8rem" }}
//                 >
//                   ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="d-flex justify-content-between gap-4 mb-4">
//             <div
//               style={{
//                 backgroundColor: "white",
//                 borderRadius: "10px",
//                 padding: "20px",
//                 width: "30%",
//                 boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//               }}
//             >
//               <h3>จำนวนสินค้าที่ค้นหาสูงสุดประจำวัน</h3>
//               <div
//                 className="d-flex justify-content-center align-items-center text-muted"
//                 style={{
//                   height: "150px",
//                   backgroundColor: "#e0e0e0",
//                   fontSize: "0.9rem",
//                 }}
//               >
//                 Placeholder for Chart
//               </div>
//             </div>
//             <div
//               style={{
//                 backgroundColor: "white",
//                 borderRadius: "10px",
//                 padding: "20px",
//                 width: "30%",
//                 boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//               }}
//             >
//               <h3>ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำเดือน</h3>
//               <div
//                 className="d-flex justify-content-center align-items-center text-muted"
//                 style={{
//                   height: "150px",
//                   backgroundColor: "#e0e0e0",
//                   fontSize: "0.9rem",
//                 }}
//               >
//                 Placeholder for Chart
//               </div>
//             </div>
//             <div
//               style={{
//                 backgroundColor: "white",
//                 borderRadius: "10px",
//                 padding: "20px",
//                 width: "30%",
//                 boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//               }}
//             >
//               <h3>ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำเดือน</h3>
//               <div
//                 className="d-flex justify-content-center align-items-center text-muted"
//                 style={{
//                   height: "150px",
//                   backgroundColor: "#e0e0e0",
//                   fontSize: "0.9rem",
//                 }}
//               >
//                 Placeholder for Chart
//               </div>
//             </div>
//           </div>

//           <div
//             className="text-center"
//             style={{
//               backgroundColor: "white",
//               borderRadius: "10px",
//               padding: "20px",
//               boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//             }}
//           >
//             <h3 className="mb-4">จำนวนสถานะงานที่ค้าง</h3>
//             <div
//               className="d-grid gap-4 mb-4"
//               style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
//             >
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-lightbulb"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   เริ่มต้น
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   1
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-box-open"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   รอของ
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   8
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-file"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   ช่องลง
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   0
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-check-circle"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   รับเรื่อง
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   1
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-redo-alt"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   รอดำเนินการ
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   1
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-clipboard-check"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   ปิดงานแล้ว
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   3
//                 </span>
//               </div>
//             </div>

//             <button
//               style={{
//                 backgroundColor: "#3498db",
//                 color: "white",
//                 padding: "10px 20px",
//                 border: "none",
//                 borderRadius: "20px",
//                 cursor: "pointer",
//                 display: "block",
//                 width: "200px",
//                 margin: "0 auto",
//               }}
//             >
//               ไปที่หน้างาน
//             </button>
//           </div>

//           <div
//             className="text-center"
//             style={{
//               backgroundColor: "white",
//               borderRadius: "10px",
//               padding: "20px",
//               boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//             }}
//           >
//             <h3 className="mb-4">จำนวนสถานะงานที่ค้าง</h3>
//             <div
//               className="d-grid gap-4 mb-4"
//               style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
//             >
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-lightbulb"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   เริ่มต้น
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   1
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-box-open"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   รอของ
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   8
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-file"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   ช่องลง
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   0
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-check-circle"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   รับเรื่อง
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   1
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-redo-alt"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   รอดำเนินการ
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   1
//                 </span>
//               </div>
//               <div className="d-flex flex-column align-items-center">
//                 <i
//                   className="fas fa-clipboard-check"
//                   style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//                 ></i>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   ปิดงานแล้ว
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   3
//                 </span>
//               </div>
//             </div>

//             <button
//               style={{
//                 backgroundColor: "#3498db",
//                 color: "white",
//                 padding: "10px 20px",
//                 border: "none",
//                 borderRadius: "20px",
//                 cursor: "pointer",
//                 display: "block",
//                 width: "200px",
//                 margin: "0 auto",
//               }}
//             >
//               ไปที่หน้างาน
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// import React from "react";
// import "./App.css";

// const Dashboard = () => {
//   return (
//     <div className="container">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <img src="/path/to/user-icon.png" alt="user icon" />
//           <span>service system</span>
//         </div>
//         <nav className="sidebar-nav">
//           <ul>
//             <li>
//               <a href="#home">
//                 <i className="fas fa-home"></i>
//                 หน้าแรก
//               </a>
//             </li>
//             <li className="active">
//               <a href="#dashboard">
//                 <i className="fas fa-chart-line"></i>
//                 Dashboard
//               </a>
//             </li>
//             <li>
//               <a href="#logout">
//                 <i className="fas fa-sign-out-alt"></i>
//                 Log Out
//               </a>
//             </li>
//           </ul>
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="main-content">
//         {/* Navbar */}
//         <header className="navbar">
//           <div className="navbar-right">
//             <span className="navbar-date">Wed, 6 Aug 2025</span>
//             <span className="navbar-service">Service</span>
//             <div className="navbar-user-icon">S</div>
//             <i className="fas fa-chevron-down"></i>
//           </div>
//         </header>

//         {/* Dashboard content */}
//         <div className="dashboard-content">
//           <h1>Dashboard</h1>
//           <div className="dashboard-header">
//             <div className="date-picker">
//               <i className="fas fa-calendar-alt"></i>
//               <span>Wed, 6 Aug 2025</span>
//               <i className="fas fa-chevron-down"></i>
//             </div>
//             <div className="dropdown">
//               <span>วัน</span>
//               <i className="fas fa-chevron-down"></i>
//             </div>
//             <div className="dropdown">
//               <span>เลือกสถานะ:</span>
//               <i className="fas fa-chevron-down"></i>
//             </div>
//           </div>

//           <div className="stats-cards">
//             <div className="card">
//               <div className="card-icon">
//                 <i className="fas fa-box"></i>
//               </div>
//               <div className="card-text">
//                 <h2>1 ชิ้น</h2>
//                 <p>จำนวนสินค้าที่ค้นหาต่อวัน</p>
//               </div>
//             </div>
//             <div className="card">
//               <div className="card-icon">
//                 <i className="fas fa-th"></i>
//               </div>
//               <div className="card-text">
//                 <h2>เครื่องช่วยฟัง</h2>
//                 <p>ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำวัน</p>
//               </div>
//             </div>
//             <div className="card">
//               <div className="card-icon">
//                 <i className="fas fa-users"></i>
//               </div>
//               <div className="card-text">
//                 <h2>สมปอง, 1 รายการ</h2>
//                 <p>ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำวัน</p>
//               </div>
//             </div>
//           </div>

//           <div className="charts-section">
//             <div className="chart">
//               <h3>จำนวนสินค้าที่ค้นหาสูงสุดประจำวัน</h3>
//               <div className="chart-placeholder">
//                 {/* <img
//                   src="https://i.imgur.com/example-chart-image-1.png"
//                   alt="Line chart"
//                 /> */}
//               </div>
//             </div>
//             <div className="chart">
//               <h3>ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำเดือน</h3>
//               <div className="chart-placeholder">
//                 {/* <img
//                   src="https://i.imgur.com/example-chart-image-2.png"
//                   alt="Bar chart"
//                 /> */}
//               </div>
//             </div>
//             <div className="chart">
//               <h3>ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำเดือน</h3>
//               <div className="chart-placeholder">
//                 {/* <img
//                   src="https://i.imgur.com/example-chart-image-3.png"
//                   alt="Bar chart"
//                 /> */}
//               </div>
//             </div>
//           </div>

//           <div className="task-summary">
//             <h3>จำนวนสถานะงานที่ค้าง</h3>
//             <div className="task-grid">
//               <div className="task-item">
//                 <i className="fas fa-lightbulb"></i>
//                 <p>เริ่มต้น</p>
//                 <span>1</span>
//               </div>
//               <div className="task-item">
//                 <i className="fas fa-box-open"></i>
//                 <p>รอของ</p>
//                 <span>8</span>
//               </div>
//               <div className="task-item">
//                 <i className="fas fa-file"></i>
//                 <p>ช่องลง</p>
//                 <span>0</span>
//               </div>
//               <div className="task-item">
//                 <i className="fas fa-check-circle"></i>
//                 <p>รับเรื่อง</p>
//                 <span>1</span>
//               </div>
//               <div className="task-item">
//                 <i className="fas fa-redo-alt"></i>
//                 <p>รอดำเนินการ</p>
//                 <span>1</span>
//               </div>
//               <div className="task-item">
//                 <i className="fas fa-clipboard-check"></i>
//                 <p>ปิดงานแล้ว</p>
//                 <span>3</span>
//               </div>
//             </div>
//             <button className="goto-button">ไปที่หน้างาน</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
