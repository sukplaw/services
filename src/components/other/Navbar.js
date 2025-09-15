import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { FaBell, FaRegBell } from "react-icons/fa";
import { LuCalendarDays } from "react-icons/lu";
import { BsFillPersonVcardFill } from "react-icons/bs";
import { Badge } from "antd";

export default function Navbar() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // สมมุติ warningCount เป็น 0 เพื่อแทนที่ WarningContext
  const warningCount = 0;

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userFromApi = res.data.user;
        setRole(userFromApi.role || "Guest");
        setUser(() => ({
          username: userFromApi.username,
        }));
        console.log(user);
        console.log(role);
        console.log(userFromApi);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.error("Token is invalid or expired.");
        } else {
          console.error("Failed to fetch user data from API:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    getData();

    // const storedUser = localStorage.getItem("user");
    // if (storedUser) {
    //   try {
    //     const user = JSON.parse(storedUser);
    //     setUsername(user.username || user.name || user.email || "Guest");
    //     setRole(user.role || "Guest");
    //     console.log("User role from localStorage:", user.role);
    //   } catch (error) {
    //     console.error("Failed to parse user data from localStorage", error);
    //     setUsername("Guest");
    //     setRole("Guest");
    //   }
    // }
  }, []);

  const handleWarningClick = () => navigate("/Home");

  return (
    <nav className="navbar navbar-expand-lg new-navbar px-3 px-lg-4">
      <div className="container-fluid">
        <button
          className="navbar-toggler new-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2 gap-lg-3">
            {/* Notification */}
            <li className="nav-item">
              <button
                className={`icon-pill ${
                  warningCount > 0 ? "pill-danger pulse" : "pill-muted"
                }`}
                onClick={warningCount > 0 ? handleWarningClick : undefined}
                title={
                  warningCount > 0 ? "ดูการแจ้งเตือน" : "ไม่มีการแจ้งเตือน"
                }
              >
                <Badge count={warningCount} overflowCount={99}>
                  {warningCount > 0 ? (
                    <FaBell className="icon-lg" style={{ color: "white" }} />
                  ) : (
                    <FaRegBell className="icon-lg" />
                  )}
                </Badge>
              </button>
            </li>

            {/* Date chip */}
            <li className="nav-item">
              <div className="date-chip">
                <LuCalendarDays className="me-2" />
                {selectedDate.format("DD MMM YYYY")}
              </div>
            </li>

            <li className="nav-item d-none d-sm-block">
              <span className="username-chip  ">
                <BsFillPersonVcardFill />{" "}
                {localStorage.getItem("username") ||
                  sessionStorage.getItem("username") ||
                  username ||
                  "Guest"}
              </span>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="avatar-gradient me-2">
                  {(
                    localStorage.getItem("username") ||
                    sessionStorage.getItem("username") ||
                    username ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="d-none d-lg-inline text-white-50">Menu</span>
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end new-dropdown"
                aria-labelledby="navbarDropdownMenuLink"
              >
                <li>
                  <a className="dropdown-item" href="#">
                    Profile
                  </a>
                </li>
                {role === "super service" && (
                  <li>
                    <a className="dropdown-item" href="#">
                      Register Service
                    </a>
                  </li>
                )}
                <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

// import React, { useContext, useState, useEffect } from "react";
// import { Badge } from "antd";
// import { LuCalendarDays } from "react-icons/lu";
// import { FaRegBell, FaBell } from "react-icons/fa";
// import dayjs from "dayjs";
// import { WarningContext } from "../WarningContext";
// import { useNavigate } from "react-router-dom";
// import { BsFillPersonVcardFill } from "react-icons/bs";

// export default function Navbar() {
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [username, setUsername] = useState("");
//   const warningCount = useContext(WarningContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // const storedUser = localStorage.getItem("user");
//     // if (storedUser) {
//     //   const user = JSON.parse(storedUser);
//     //   setUsername(user.username || user.name || "");
//     // }
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       try {
//         const user = JSON.parse(storedUser);
//         setUsername(user.username || user.name || user.email || "Guest");
//       } catch (error) {
//         console.error("Failed to parse user data from localStorage", error);
//         setUsername("Guest");
//       }
//     }
//   }, []);

//   const handleWarningClick = () => navigate("/Home");

//   return (
//     <nav className="navbar navbar-expand-lg new-navbar px-3 px-lg-4">
//       <div className="container-fluid">
//         {/* Brand / Title (ปรับเป็นโลโก้คุณได้) */}
//         {/* <a
//           className="navbar-brand d-flex align-items-center gap-2 text-white fw-bold"
//           href="#"
//         >
//           <span className="brand-badge">HM</span>
//           <span className="d-none d-sm-inline">HealthMonitor</span>
//         </a> */}

//         <button
//           className="navbar-toggler new-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto align-items-center gap-2 gap-lg-3">
//             {/* Notification */}
//             <li className="nav-item">
//               <button
//                 className={`icon-pill ${
//                   warningCount > 0 ? "pill-danger pulse" : "pill-muted"
//                 }`}
//                 onClick={warningCount > 0 ? handleWarningClick : undefined}
//                 title={
//                   warningCount > 0 ? "ดูการแจ้งเตือน" : "ไม่มีการแจ้งเตือน"
//                 }
//               >
//                 <Badge count={warningCount} overflowCount={99}>
//                   {warningCount > 0 ? (
//                     <FaBell className="icon-lg" style={{ color: "white" }} />
//                   ) : (
//                     <FaRegBell className="icon-lg" />
//                   )}
//                 </Badge>
//               </button>
//             </li>

//             {/* Date chip */}
//             <li className="nav-item">
//               <div className="date-chip">
//                 <LuCalendarDays className="me-2" />
//                 {selectedDate.format("DD MMM YYYY")}
//               </div>
//             </li>

//             <li className="nav-item d-none d-sm-block">
//               <span className="username-chip  ">
//                 <BsFillPersonVcardFill />{" "}
//                 {localStorage.getItem("username") ||
//                   sessionStorage.getItem("username") ||
//                   username ||
//                   "Guest"}
//               </span>
//             </li>

//             <li className="nav-item dropdown">
//               <a
//                 className="nav-link dropdown-toggle d-flex align-items-center"
//                 href="#"
//                 id="navbarDropdownMenuLink"
//                 role="button"
//                 data-bs-toggle="dropdown"
//                 aria-expanded="false"
//               >
//                 <div className="avatar-gradient me-2">
//                   {(
//                     localStorage.getItem("username") ||
//                     sessionStorage.getItem("username") ||
//                     username ||
//                     "U"
//                   )
//                     .charAt(0)
//                     .toUpperCase()}
//                 </div>
//                 <span className="d-none d-lg-inline text-white-50">Menu</span>
//               </a>
//               <ul
//                 className="dropdown-menu dropdown-menu-end new-dropdown"
//                 aria-labelledby="navbarDropdownMenuLink"
//               >
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Profile
//                   </a>
//                 </li>
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Register Service
//                   </a>
//                 </li>
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Settings
//                   </a>
//                 </li>
//               </ul>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// import React, { useContext, useState, useEffect } from "react";
// import { Badge, DatePicker, Space } from "antd";
// import { LuCalendarDays } from "react-icons/lu";
// import { FaRegBell, FaBell } from "react-icons/fa";
// import dayjs from "dayjs";
// import { WarningContext } from "../WarningContext";
// import { useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [username, setUsername] = useState("");
//   const warningCount = useContext(WarningContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       setUsername(user.username || user.name || "");
//     }
//   }, []);

//   const handleDateChange = (date) => setSelectedDate(date);

//   const handleWarningClick = () => navigate("/Home");

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light custom-navbar px-4">
//       <div className="container-fluid">
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
//             {/* Notification */}
//             <li className="nav-item me-3">
//               <div className="nav-link">
//                 <Badge count={warningCount} overflowCount={99}>
//                   {warningCount > 0 ? (
//                     <FaBell
//                       style={{
//                         fontSize: "24px",
//                         color: "#dc3545",
//                         cursor: "pointer",
//                       }}
//                       onClick={handleWarningClick}
//                     />
//                   ) : (
//                     <FaRegBell style={{ fontSize: "24px", color: "#6c757d" }} />
//                   )}
//                 </Badge>
//               </div>
//             </li>

//             {/* Date Picker */}
//             <li className="nav-item me-3">
//               <Space direction="vertical" size={12}>
//                 <DatePicker
//                   value={selectedDate}
//                   format="DD-MM-YYYY"
//                   onChange={handleDateChange}
//                   prefix={<LuCalendarDays />}
//                   style={{ width: "150px" }}
//                   disabled
//                 />
//               </Space>
//             </li>

//             {/* Username */}
//             <li className="nav-item me-3">
//               <span className="nav-link fw-semibold text-muted">
//                 👤{" "}
//                 {localStorage.getItem("username") ||
//                   sessionStorage.getItem("username") ||
//                   username ||
//                   "Guest"}
//               </span>
//             </li>

//             {/* Profile Dropdown */}
//             <li className="nav-item dropdown">
//               <a
//                 className="nav-link dropdown-toggle d-flex align-items-center"
//                 href="#"
//                 id="navbarDropdownMenuLink"
//                 role="button"
//                 data-bs-toggle="dropdown"
//                 aria-expanded="false"
//               >
//                 <div
//                   className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold me-2"
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     backgroundColor: "#1abc9c",
//                   }}
//                 >
//                   {username ? username.charAt(0).toUpperCase() : "U"}
//                 </div>
//               </a>
//               <ul
//                 className="dropdown-menu dropdown-menu-end"
//                 aria-labelledby="navbarDropdownMenuLink"
//               >
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Profile
//                   </a>
//                 </li>
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Settings
//                   </a>
//                 </li>
//                 <li>
//                   <hr className="dropdown-divider" />
//                 </li>
//                 <li>
//                   <a
//                     className="dropdown-item text-danger"
//                     href="#"
//                     onClick={() => {
//                       localStorage.removeItem("user");
//                       window.location.reload();
//                     }}
//                   >
//                     Logout
//                   </a>
//                 </li>
//               </ul>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// Navbar.jsx
// import React, { useContext, useState, useEffect } from "react";
// import { Badge } from "antd";
// import { LuCalendarDays } from "react-icons/lu";
// import { FaRegBell, FaBell } from "react-icons/fa";
// import dayjs from "dayjs";
// import { WarningContext } from "../WarningContext";
// import { useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [username, setUsername] = useState("");
//   const warningCount = useContext(WarningContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       setUsername(user.username || user.name || "");
//     }
//   }, []);

//   const handleWarningClick = () => navigate("/Home");

//   return (
//     <nav className="navbar navbar-expand-lg new-navbar px-3 px-lg-4">
//       <div className="container-fluid">
//         {/* Brand / Title (ปรับเป็นโลโก้คุณได้) */}
//         {/* <a
//           className="navbar-brand d-flex align-items-center gap-2 text-white fw-bold"
//           href="#"
//         >
//           <span className="brand-badge">HM</span>
//           <span className="d-none d-sm-inline">HealthMonitor</span>
//         </a> */}

//         <button
//           className="navbar-toggler new-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto align-items-center gap-2 gap-lg-3">
//             {/* Notification */}
//             <li className="nav-item">
//               <button
//                 className={`icon-pill ${
//                   warningCount > 0 ? "pill-danger pulse" : "pill-muted"
//                 }`}
//                 onClick={warningCount > 0 ? handleWarningClick : undefined}
//                 title={
//                   warningCount > 0 ? "ดูการแจ้งเตือน" : "ไม่มีการแจ้งเตือน"
//                 }
//               >
//                 <Badge count={warningCount} overflowCount={99}>
//                   {warningCount > 0 ? (
//                     <FaBell className="icon-lg" style={{ color: "white" }} />
//                   ) : (
//                     <FaRegBell className="icon-lg" />
//                   )}
//                 </Badge>
//               </button>
//             </li>

//             {/* Date chip (อ่านอย่างเดียว เหมือนของเดิมที่ disabled) */}
//             <li className="nav-item">
//               <div className="date-chip">
//                 <LuCalendarDays className="me-2" />
//                 {selectedDate.format("DD MMM YYYY")}
//               </div>
//             </li>

//             {/* Username */}
//             <li className="nav-item d-none d-sm-block">
//               <span className="username-chip">
//                 👤{" "}
//                 {localStorage.getItem("username") ||
//                   sessionStorage.getItem("username") ||
//                   username ||
//                   "Guest"}
//               </span>
//             </li>

//             {/* Profile Dropdown */}
//             <li className="nav-item dropdown">
//               <a
//                 className="nav-link dropdown-toggle d-flex align-items-center"
//                 href="#"
//                 id="navbarDropdownMenuLink"
//                 role="button"
//                 data-bs-toggle="dropdown"
//                 aria-expanded="false"
//               >
//                 <div className="avatar-gradient me-2">
//                   {(
//                     localStorage.getItem("username") ||
//                     sessionStorage.getItem("username") ||
//                     username ||
//                     "U"
//                   )
//                     .charAt(0)
//                     .toUpperCase()}
//                 </div>
//                 <span className="d-none d-lg-inline text-white-50">Menu</span>
//               </a>
//               <ul
//                 className="dropdown-menu dropdown-menu-end new-dropdown"
//                 aria-labelledby="navbarDropdownMenuLink"
//               >
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Profile
//                   </a>
//                 </li>
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Settings
//                   </a>
//                 </li>
//                 <li>
//                   <hr className="dropdown-divider" />
//                 </li>
//                 <li>
//                   <a
//                     className="dropdown-item text-danger"
//                     href="#"
//                     onClick={() => {
//                       localStorage.removeItem("user");
//                       window.location.reload();
//                     }}
//                   >
//                     Logout
//                   </a>
//                 </li>
//               </ul>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// import React, { useContext, useState, useEffect } from "react";
// import { Badge, DatePicker, Space } from "antd";
// import { LuCalendarDays } from "react-icons/lu";
// import { FaRegBell, FaBell } from "react-icons/fa";
// import dayjs from "dayjs";
// import { WarningContext } from "../WarningContext";
// import { useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [username, setUsername] = useState(""); // เพิ่ม state
//   const warningCount = useContext(WarningContext);
//   const navigate = useNavigate();

//   // ✅ โหลดข้อมูล user จาก localStorage
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       setUsername(user.username); // หรือจะใช้ user.name ก็แล้วแต่โครงสร้าง
//     }
//   }, []);

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//   };

//   const handleWarningClick = () => {
//     navigate("/Home");
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4">
//       <div className="container-fluid">
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
//             {/* Notification */}
//             <li className="nav-item me-3">
//               <div className="nav-link">
//                 <Badge count={warningCount} overflowCount={99}>
//                   {warningCount > 0 ? (
//                     <FaBell
//                       style={{
//                         fontSize: "24px",
//                         color: "#dc3545",
//                         cursor: "pointer",
//                       }}
//                       onClick={handleWarningClick}
//                     />
//                   ) : (
//                     <FaRegBell style={{ fontSize: "24px", color: "#6c757d" }} />
//                   )}
//                 </Badge>
//               </div>
//             </li>

//             {/* Date Picker */}
//             <li className="nav-item me-3">
//               <Space direction="vertical" size={12}>
//                 <DatePicker
//                   value={selectedDate}
//                   format="DD-MM-YYYY"
//                   onChange={handleDateChange}
//                   prefix={<LuCalendarDays />}
//                   placeholder="เลือกวันที่"
//                   style={{ width: "150px" }}
//                   className="form-control"
//                   disabled
//                 />
//               </Space>
//             </li>

//             {/* ✅ Username Display */}
//             <li className="nav-item me-3">
//               <span className="nav-link fw-semibold text-muted">
//                 👤 {localStorage.getItem("username") || sessionStorage.getItem("username") || "Guest"}
//               </span>
//             </li>

//             {/* Profile Dropdown */}
//             <li className="nav-item dropdown">
//               <a
//                 className="nav-link dropdown-toggle d-flex align-items-center"
//                 href="#"
//                 id="navbarDropdownMenuLink"
//                 role="button"
//                 data-bs-toggle="dropdown"
//                 aria-expanded="false"
//               >
//                 <div
//                   className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold me-2"
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     backgroundColor: "#1abc9c",
//                   }}
//                 >
//                   {username ? username.charAt(0).toUpperCase() : "U"}
//                 </div>
//               </a>
//               <ul
//                 className="dropdown-menu dropdown-menu-end"
//                 aria-labelledby="navbarDropdownMenuLink"
//               >
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Profile
//                   </a>
//                 </li>
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Settings
//                   </a>
//                 </li>
//                 <li>
//                   <hr className="dropdown-divider" />
//                 </li>
//                 <li>
//                   <a
//                     className="dropdown-item"
//                     href="#"
//                     onClick={() => {
//                       localStorage.removeItem("user");
//                       window.location.reload();
//                     }}
//                   >
//                     Logout
//                   </a>
//                 </li>
//               </ul>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// import React, { useContext, useState } from "react";
// import { Badge, DatePicker, Space } from "antd";
// import { LuCalendarDays } from "react-icons/lu";
// import { FaRegBell, FaBell } from "react-icons/fa";
// import dayjs from "dayjs";
// import { WarningContext } from "../WarningContext"; // Assuming this context exists
// import { useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const warningCount = useContext(WarningContext);
//   const navigate = useNavigate();

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     // You can add more logic here, like making an API call
//   };

//   const handleWarningClick = () => {
//     navigate("/Home");
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4">
//       <div className="container-fluid">
//         {/* <a className="navbar-brand fw-bold text-primary" href="#">
//           YourAppName
//         </a> */}
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
//             {/* Notification Badge */}
//             <li className="nav-item me-3">
//               <div className="nav-link">
//                 <Badge count={warningCount} overflowCount={99}>
//                   {warningCount > 0 ? (
//                     <FaBell
//                       style={{
//                         fontSize: "24px",
//                         color: "#dc3545",
//                         cursor: "pointer",
//                       }}
//                       onClick={handleWarningClick}
//                     />
//                   ) : (
//                     <FaRegBell style={{ fontSize: "24px", color: "#6c757d" }} />
//                   )}
//                 </Badge>
//               </div>
//             </li>

//             {/* Date Picker */}
//             <li className="nav-item me-3">
//               <Space direction="vertical" size={12}>
//                 <DatePicker
//                   value={selectedDate}
//                   format="DD-MM-YYYY"
//                   onChange={handleDateChange}
//                   prefix={<LuCalendarDays />}
//                   placeholder="เลือกวันที่"
//                   style={{ width: "150px" }}
//                   className="form-control" // Use Bootstrap's form-control class for styling
//                   disabled
//                 />
//               </Space>
//             </li>

//             {/* Service Text */}
//             <li className="nav-item me-3">
//               <span className="nav-link fw-semibold text-muted">{โชว์ในอันนี้}}</span>
//             </li>

//             {/* Profile Dropdown */}
//             <li className="nav-item dropdown">
//               <a
//                 className="nav-link dropdown-toggle d-flex align-items-center"
//                 href="#"
//                 id="navbarDropdownMenuLink"
//                 role="button"
//                 data-bs-toggle="dropdown"
//                 aria-expanded="false"
//               >
//                 <div
//                   className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold me-2"
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     backgroundColor: "#1abc9c",
//                   }}
//                 >
//                   S
//                 </div>
//               </a>
//               <ul
//                 className="dropdown-menu dropdown-menu-end"
//                 aria-labelledby="navbarDropdownMenuLink"
//               >
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Profile
//                   </a>
//                 </li>
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Settings
//                   </a>
//                 </li>
//                 <li>
//                   <hr className="dropdown-divider" />
//                 </li>
//                 <li>
//                   <a className="dropdown-item" href="#">
//                     Logout
//                   </a>
//                 </li>
//               </ul>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// import React, { useContext, useState } from "react";
// import { Badge, DatePicker, Space } from "antd";
// import { LuCalendarDays } from "react-icons/lu";
// import { FaRegBell } from "react-icons/fa6";
// import { FaBell } from "react-icons/fa";
// import dayjs from "dayjs";
// import { WarningContext } from "../WarningContext";
// import { useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const [selectedDate, setSelectedDate] = useState(dayjs);
//   const warningCount = useContext(WarningContext);
//   const navigate = useNavigate();

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     console.log("Selected Date: ", date ? date.format("DD-MM-YYYY") : null);
//   };

//   const bellIconStyle = {
//     fontSize: "24px",
//     color: "red",
//   };

//   const handleWarning = () => {
//     navigate("/Home");
//   };

//   return (
//     <header className="d-flex justify-content-end align-items-center navbar mr-5">
//       <div className="d-flex align-items-center">
//         <div className="me-5">
//           <Badge count={warningCount} overflowCount={99}>
//             {warningCount > 0 ? (
//               <FaBell
//                 style={bellIconStyle}
//                 className="toggle-icon"
//                 onClick={() => handleWarning()}
//               />
//             ) : (
//               <FaRegBell className="toggle-icon" />
//             )}
//           </Badge>
//         </div>

//         <Space direction="vertical" size={12}>
//           <DatePicker
//             value={selectedDate}
//             format="DD-MM-YYYY"
//             onChange={handleDateChange}
//             prefix={<LuCalendarDays />}
//             placeholder="เลือกวันที่"
//             style={{ width: "100%", height: "40px" }}
//             className="standalone-datepicker"
//             disabled
//           />
//         </Space>
//         <span
//           //   style={{ marginRight: "20px", fontSize: "1.1rem" }}
//           className="me-5 ms-5"
//         >
//           Service
//         </span>
//         <div
//           className="rounded-circle d-flex justify-content-center align-items-center fw-bold me-5"
//           style={{
//             width: "40px",
//             height: "40px",
//             backgroundColor: "#1abc9c",
//             marginRight: "10px",
//           }}
//         >
//           S
//         </div>
//         <i className="fas fa-chevron-down text-dark"></i>
//       </div>
//     </header>
//   );
// }
