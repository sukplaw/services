import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { IoDocumentText } from "react-icons/io5";
import { MdOutlineError, MdLogout, MdWork } from "react-icons/md";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = () => {
    const newCollapse = !isCollapsed;
    setIsCollapsed(newCollapse);
    onCollapse(newCollapse);
  };

  // ✅ Get user role from storage (local or session)
  const role = localStorage.getItem("permission") || sessionStorage.getItem("permission");
  console.log(role);

  const menuItems = [
    {
      to: "/home",
      name: "หน้าหลัก",
      icon: <GoHomeFill className="sidebar-icon" />,
    },
    {
      to: "/incomplete-job",
      name: "งานค้าง",
      icon: <MdOutlineError className="sidebar-icon" />,
    },
    {
      to: "/job",
      name: "งานทั้งหมด",
      icon: <IoDocumentText className="sidebar-icon" />,
    },
    ...(role !== "admin"
      ? [
        {
          to: "/create-job",
          name: "เพิ่มงานซ่อม",
          icon: <MdWork className="sidebar-icon" />,
        },
      ]
      : []),
  ];

  const logoutItem = { to: "/logout", name: "ออกจากระบบ", icon: <MdLogout /> };

  const clearAuthData = () => {
    ["token", "permission", "role"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  return (
    <>
      <style>{`
        /* ✅ เพิ่มตัวแปรสีสำหรับไล่สีวิ่ง */
        :root {
          --g1: #312e81;
          --g2: #0e7490;
          --g3: #166534;
        }

        .sidebar {
          display: flex;
          width: 250px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          flex-direction: column;
          padding: 1rem;

          /* 🎨 พื้นหลังใหม่: ไล่สีวิ่งแบบ navbar อันแรก (เข้ม ชัด ไม่จาง) */
          background: linear-gradient(120deg, var(--g1), var(--g2), var(--g3));
          background-size: 300% 300%;
          animation: sidebarGradient 14s ease infinite;

          /* คงสไตล์ขอบ/เงาเดิม */
          border-right: 1px solid rgba(255,255,255,0.18);
          box-shadow: 2px 0 6px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(8px);

          transition: width 0.3s ease;
          overflow: hidden;
        }

        /* ⏱ keyframes ขยับไล่สี */
        @keyframes sidebarGradient{
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .sidebar.collapsed { width: 70px; }

        .sidebar-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #dee2e6;
        }

        .sidebar.collapsed .sidebar-brand {
          opacity: 0;
          max-width: 0;
          margin-right: 0 !important;
        }

        .sidebar-brand {
          font-size: 1.5rem;
          white-space: nowrap;
          overflow: hidden;
          opacity: 1;
          transition: opacity 0.3s ease, max-width 0.3s ease;
        }

        .nav-link {
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          padding: 0.75rem 1rem;
          color: #ffffff;
          text-decoration: none;
          /* ✅ คงตำแหน่ง/สัดส่วนเดิมทั้งหมด */
        }
        .nav-link.active {
          background: linear-gradient(90deg, rgba(255,255,255,.25), rgba(255,255,255,.12));
          color: #fff;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.25), 0 8px 18px rgba(0,0,0,.18);
        }
          .nav-link.active .sidebar-icon{ color:#fffff; }
          
        // .nav-link:hover {
        //   background-color: #f1f3f5;
        //   color: #000;
        // }
        .nav-link.active .sidebar-icon { color: #ffffff; }
        

        .sidebar-icon {
          font-size: 1.5rem;
          margin-right: 1rem;
          flex-shrink: 0;
        }
        .sidebar.collapsed .sidebar-text { display: none; }

        .sidebar.collapsed .nav-link {
          justify-content: center;  /* ให้ไอคอนอยู่กลาง */
          padding-left: 0;
          padding-right: 0;
        }

        .sidebar.collapsed .sidebar-icon {
          margin-right: 0;
        }

        .toggle-btn-container {
          position: fixed;
          top: 1.5rem;
          left: 230px;
          transition: left 0.3s ease;
          z-index: 2000;
        }
        .toggle-btn-container.collapsed { left: 50px; }

        .toggle-btn {
          background-color: #fff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          border: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          transition: all 0.3s ease;
        }
        .toggle-btn:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.25);
          color: #000;
        }
        .
      `}</style>

      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h1 className="h5 text-white m-0 sidebar-brand">Service System</h1>
        </div>

        <nav className="flex-grow-1">
          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link ${location.pathname === item.to ? "active" : ""
                    }`}
                >
                  <div className="sidebar-icon">{item.icon}</div>
                  <span className="sidebar-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <div
            className="nav-link text-white fw-bold logout-link"
            style={{ cursor: "pointer" }}
            onClick={handleLogout}
          >
            <div className="sidebar-icon">{logoutItem.icon}</div>
            <span className="sidebar-text">{logoutItem.name}</span>
          </div>
        </div>
      </div>

      <div className={`toggle-btn-container ${isCollapsed ? "collapsed" : ""}`}>
        <button className="toggle-btn" onClick={handleToggle}>
          {isCollapsed ? (
            <FaArrowAltCircleRight size={24} />
          ) : (
            <FaArrowAltCircleLeft size={24} />
          )}
        </button>
      </div>
    </>
  );
};

export default Sidebar;

// import React, { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { GoHomeFill } from "react-icons/go";
// import { IoDocumentText } from "react-icons/io5";
// import { MdOutlineError, MdLogout, MdWork } from "react-icons/md";
// import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

// const Sidebar = ({ onCollapse }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const location = useLocation();

//   const handleToggle = () => {
//     const newCollapse = !isCollapsed;
//     setIsCollapsed(newCollapse);
//     onCollapse(newCollapse);
//   };

//   const menuItems = [
//     {
//       to: "/home",
//       name: "หน้าหลัก",
//       icon: <GoHomeFill className="sidebar-icon" />,
//     },
//     {
//       to: "/incomplete-job",
//       name: "งานค้าง",
//       icon: <MdOutlineError className="sidebar-icon" />,
//     },
//     {
//       to: "/job",
//       name: "งานทั้งหมด",
//       icon: <IoDocumentText className="sidebar-icon" />,
//     },
//     {
//       to: "/create-job",
//       name: "เพิ่มงานซ่อม",
//       icon: <MdWork className="sidebar-icon" />,
//     },
//   ];

//   const logoutItem = { to: "/logout", name: "ออกจากระบบ", icon: <MdLogout /> };

//   const clearAuthData = () => {
//     ["token", "permission"].forEach((key) => {
//       localStorage.removeItem(key);
//       sessionStorage.removeItem(key);
//     });
//   };

//   const navigate = useNavigate();
//   const handleLogout = () => {
//     clearAuthData();
//     navigate("/");
//   };

//   return (
//     <>
//       <style>{`
//         .sidebar {
//           width: 250px;
//           height: 100vh;
//           position: fixed;
//           top: 0;
//           left: 0;
//           z-index: 1000;
//           display: flex;
//           flex-direction: column;
//           padding: 1rem;

//           /* 👇 background style ใหม่ (อ่อน+โปร่ง เหมือน navbar) */
//           background: rgba(255, 255, 255, 0.9);
//           backdrop-filter: blur(10px);
//           border-right: 1px solid #dee2e6;
//           box-shadow: 2px 0 6px rgba(0, 0, 0, 0.08);

//           transition: width 0.3s ease;
//           overflow: hidden;
//         }
//         .sidebar.collapsed { width: 70px; }

//         .sidebar-header {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           margin-bottom: 1rem;
//           padding-bottom: 1rem;
//           border-bottom: 1px solid #dee2e6;
//         }

//         .nav-link {
//           font-size: 1.1rem;
//           display: flex;
//           align-items: center;
//           border-radius: 0.5rem;
//           transition: all 0.3s ease;
//           padding: 0.75rem 1rem;
//           color: #333;
//           text-decoration: none;
//         }
//         .nav-link.active {
//           background-color: #007bff;
//           color: white !important;
//         }
//         .nav-link:hover {
//           background-color: #f1f3f5;
//           color: #000;
//         }

//         .sidebar-icon {
//           font-size: 1.5rem;
//           margin-right: 1rem;
//           flex-shrink: 0;
//         }
//         .sidebar.collapsed .sidebar-text { display: none; }

//         .toggle-btn-container {
//           position: fixed;
//           top: 1.5rem;
//           left: 230px;
//           transition: left 0.3s ease;
//           z-index: 1001;
//         }
//         .toggle-btn-container.collapsed { left: 50px; }

//         .toggle-btn {
//           background-color: #fff;
//           border-radius: 50%;
//           width: 40px;
//           height: 40px;
//           border: none;
//           box-shadow: 0 4px 8px rgba(0,0,0,0.15);
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #6c757d;
//           transition: all 0.3s ease;
//         }
//         .toggle-btn:hover {
//           box-shadow: 0 6px 12px rgba(0,0,0,0.25);
//           color: #000;
//         }
//       `}</style>

//       <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
//         <div className="sidebar-header">
//           <h1 className="h5 text-primary m-0">Service System</h1>
//         </div>
//         <nav className="flex-grow-1">
//           <ul className="nav flex-column">
//             {menuItems.map((item) => (
//               <li className="nav-item" key={item.to}>
//                 <Link
//                   to={item.to}
//                   className={`nav-link ${
//                     location.pathname === item.to ? "active" : ""
//                   }`}
//                 >
//                   <div className="sidebar-icon">{item.icon}</div>
//                   <span className="sidebar-text">{item.name}</span>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         <div className="mt-auto">
//           <div
//             className="nav-link text-danger"
//             style={{ cursor: "pointer" }}
//             onClick={handleLogout}
//           >
//             <div className="sidebar-icon">{logoutItem.icon}</div>
//             <span className="sidebar-text">{logoutItem.name}</span>
//           </div>
//         </div>
//       </div>

//       <div className={`toggle-btn-container ${isCollapsed ? "collapsed" : ""}`}>
//         <button className="toggle-btn" onClick={handleToggle}>
//           {isCollapsed ? (
//             <FaArrowAltCircleRight size={24} />
//           ) : (
//             <FaArrowAltCircleLeft size={24} />
//           )}
//         </button>
//       </div>
//     </>
//   );
// };

// export default Sidebar;

// import React, { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { GoHomeFill } from "react-icons/go";
// import { IoDocumentText } from "react-icons/io5";
// import { MdOutlineError, MdLogout, MdWork } from "react-icons/md";
// import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

// const Sidebar = ({ onCollapse }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const location = useLocation();

//   const handleToggle = () => {
//     const newCollapse = !isCollapsed;
//     setIsCollapsed(newCollapse);
//     onCollapse(newCollapse); // ✅ logic เดิม
//   };

//   const menuItems = [
//     {
//       to: "/home",
//       name: "หน้าหลัก",
//       icon: <GoHomeFill className="sidebar-icon" />,
//     },
//     {
//       to: "/incomplete-job",
//       name: "งานค้าง",
//       icon: <MdOutlineError className="sidebar-icon" />,
//     },
//     {
//       to: "/job",
//       name: "งานทั้งหมด",
//       icon: <IoDocumentText className="sidebar-icon" />,
//     },
//     {
//       to: "/create-job",
//       name: "เพิ่มงานซ่อม",
//       icon: <MdWork className="sidebar-icon" />,
//     },
//   ];

//   const logoutItem = { to: "/logout", name: "ออกจากระบบ", icon: <MdLogout /> };

//   const clearAuthData = () => {
//     ["token", "permission"].forEach((key) => {
//       localStorage.removeItem(key);
//       sessionStorage.removeItem(key);
//     });
//   };

//   const navigate = useNavigate();
//   const handleLogout = () => {
//     clearAuthData();
//     navigate("/");
//   };

//   return (
//     <>
//       <style>{`
//         :root{
//           --g1:#4f46e5; /* indigo-600 */
//           --g2:#06b6d4; /* cyan-500 */
//           --g3:#22c55e; /* emerald-500 */
//         }

//         .sidebar{
//           width: 260px;
//           height: 100vh;
//           position: fixed; top:0; left:0; z-index: 1000;
//           display:flex; flex-direction:column;
//           padding: 18px 14px;

//           /* 🔥 ไล่สีวิ่งแบบ Navbar ดีไซน์แรก (เข้ม ชัด ไม่จาง) */
//           background: linear-gradient(120deg, var(--g1), var(--g2), var(--g3));
//           background-size: 300% 300%;
//           animation: sidebarGradient 14s ease infinite;

//           border-right: 1px solid rgba(255,255,255,.18);
//           box-shadow: 0 12px 28px rgba(0,0,0,.35);
//           backdrop-filter: blur(8px);

//           transition: width .28s ease;
//           overflow: hidden;
//         }
//         @keyframes sidebarGradient{
//           0%{ background-position: 0% 50%; }
//           50%{ background-position: 100% 50%; }
//           100%{ background-position: 0% 50%; }
//         }

//         .sidebar.collapsed{ width: 84px; }

//         /* Header / Brand */
//         .sidebar-header{
//           display:flex; align-items:center; gap:10px;
//           padding: 8px 10px 16px 10px;
//           border-bottom: 1px dashed rgba(255,255,255,.25);
//           margin-bottom: 14px;
//         }
//         .brand-badge{
//           width:38px; height:38px; border-radius:12px;
//           display:grid; place-items:center;
//           background: rgba(255,255,255,.95); color:#0f172a; font-weight:800;
//           box-shadow: 0 6px 16px rgba(0,0,0,.25);
//           flex-shrink:0;
//         }
//         .sidebar-title{
//           color:#fff; font-weight:800; letter-spacing:.2px;
//           white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
//           opacity: .95;
//           transition: opacity .25s ease, max-width .25s ease;
//         }
//         .sidebar.collapsed .sidebar-title{ opacity:0; max-width:0; }

//         /* Nav */
//         .nav{ margin-top: 6px; }
//         .nav-item{ margin-bottom: 6px; }

//         .nav-link{
//           display:flex; align-items:center; gap:12px;
//           padding: 10px 12px;
//           border-radius: 14px;
//           text-decoration:none;
//           color: rgba(255,255,255,.92);
//           background: transparent;
//           transition: background .2s ease, transform .12s ease, color .2s ease;
//           position: relative;
//         }
//         .nav-link:hover{
//           background: rgba(255,255,255,.16);
//           transform: translateY(-1px);
//         }

//         .sidebar-icon{
//           width:22px; height:22px;
//           display:grid; place-items:center;
//           color: rgba(255,255,255,.92);
//           flex-shrink:0;
//           filter: drop-shadow(0 2px 6px rgba(0,0,0,.2));
//         }

//         .sidebar-text{
//           white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
//           font-weight: 600;
//         }
//         .sidebar.collapsed .sidebar-text{ display:none; }

//         /* Active: pill + glow + indicator bar (ใช้ gradient สีเดียวกัน) */
//         .nav-link.active{
//           background: linear-gradient(90deg, rgba(255,255,255,.25), rgba(255,255,255,.12));
//           color: #fff;
//           box-shadow: inset 0 0 0 1px rgba(255,255,255,.25), 0 8px 18px rgba(0,0,0,.18);
//         }
//         .nav-link.active .sidebar-icon{ color:#fff; }
//         .nav-link.active::before{
//           content:"";
//           position:absolute; left:6px; top:8px; bottom:8px; width:4px;
//           border-radius:6px;
//           background: linear-gradient(180deg, var(--g1), var(--g2), var(--g3));
//           box-shadow: 0 0 0 2px rgba(255,255,255,.12);
//         }
//         .sidebar.collapsed .nav-link.active::before{ left: 10px; }

//         /* Logout */
//         .logout{
//           margin-top:auto;
//           padding-top: 8px;
//           border-top: 1px dashed rgba(255,255,255,.25);
//         }
//         .logout .nav-link{
//           color: #ffe4e6;
//         }
//         .logout .nav-link:hover{
//           background: rgba(239,68,68,.2);
//           color: #fff;
//         }

//         /* Toggle floating button */
//         .toggle-btn-container{
//           position: fixed; top: 18px; left: 240px;
//           transition: left .28s ease; z-index: 1001;
//         }
//         .sidebar.collapsed ~ .toggle-btn-container{ left: 64px; }

//         .toggle-btn{
//           background: rgba(255,255,255,.95);
//           width: 42px; height: 42px; border-radius: 999px;
//           border: none; cursor:pointer;
//           display:grid; place-items:center;
//           box-shadow: 0 10px 22px rgba(0,0,0,.25);
//           transition: transform .15s ease, box-shadow .2s ease;
//           color: #0f172a;
//         }
//         .toggle-btn:hover{ transform: translateY(-1px); box-shadow: 0 12px 26px rgba(0,0,0,.3); }

//         /* Mobile */
//         @media (max-width: 768px){
//           .sidebar{ left: -260px; width: 260px; }
//           .sidebar:not(.collapsed){ left:0; }
//           .toggle-btn-container{ left: 10px !important; top: 14px; }
//         }
//       `}</style>

//       <div
//         className={`d-flex flex-column sidebar ${
//           isCollapsed ? "collapsed" : ""
//         }`}
//       >
//         <div className="sidebar-header">
//           <div className="brand-badge">SS</div>
//           <div className="sidebar-title">Service System</div>
//         </div>

//         <nav className="flex-grow-1">
//           <ul className="nav flex-column">
//             {menuItems.map((item) => (
//               <li className="nav-item" key={item.to}>
//                 <Link
//                   to={item.to}
//                   className={`nav-link ${
//                     location.pathname === item.to ? "active" : ""
//                   }`}
//                 >
//                   <div className="sidebar-icon">{item.icon}</div>
//                   <span className="sidebar-text">{item.name}</span>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         <div className="logout">
//           <div
//             className="nav-link"
//             style={{ cursor: "pointer" }}
//             onClick={handleLogout}
//           >
//             <div className="sidebar-icon">{logoutItem.icon}</div>
//             <span className="sidebar-text">{logoutItem.name}</span>
//           </div>
//         </div>
//       </div>

//       <div className="toggle-btn-container">
//         <button className="toggle-btn" onClick={handleToggle}>
//           {isCollapsed ? (
//             <FaArrowAltCircleRight size={24} />
//           ) : (
//             <FaArrowAltCircleLeft size={24} />
//           )}
//         </button>
//       </div>
//     </>
//   );
// };

// export default Sidebar;

// import React, { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { GoHomeFill } from "react-icons/go";
// import { IoDocumentText, IoPeopleCircleSharp } from "react-icons/io5";
// import { BsBarChartLineFill } from "react-icons/bs";
// import { MdOutlineError } from "react-icons/md";
// import { FaArrowAltCircleLeft } from "react-icons/fa";
// import { FaArrowAltCircleRight } from "react-icons/fa";
// import { MdLogout, MdWork } from "react-icons/md";

// const Sidebar = ({ onCollapse }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const location = useLocation();

//   // const handleToggle = () => setIsCollapsed(!isCollapsed);
//   const handleToggle = () => {
//     const newCollapse = !isCollapsed;
//     setIsCollapsed(newCollapse);
//     onCollapse(newCollapse); // แจ้ง App
//   };
//   const menuItems = [
//     {
//       to: "/home",
//       name: "หน้าหลัก",
//       icon: <GoHomeFill className="sidebar-icon" />,
//     },
//     {
//       to: "/incomplete-job",
//       name: "งานค้าง",
//       icon: <MdOutlineError className="sidebar-icon" />,
//     },
//     {
//       to: "/job",
//       name: "งานทั้งหมด",
//       icon: <IoDocumentText className="sidebar-icon" />,
//     },
//     {
//       to: "/create-job",
//       name: "เพิ่มงานซ่อม",
//       icon: <MdWork className="sidebar-icon" />,
//     },

//   ];

//   const logoutItem = { to: "/logout", name: "ออกจากระบบ", icon: <MdLogout /> };
//   const clearAuthData = () => {
//     ["token", "permission"].forEach((key) => {
//       localStorage.removeItem(key);
//       sessionStorage.removeItem(key);
//     });
//   };

//   const navigate = useNavigate();
//   const handleLogout = () => {
//     clearAuthData();
//     navigate("/");
//   };

//   return (
//     <>
//       <style>
//         {`
//    .sidebar {
//      width: 250px;
//      background-color: #f8f9fa;
//      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//      position: fixed;
//      height: 100vh;
//      top: 0;
//      left: 0;
//      padding: 1rem;
//      transition: width 0.3s ease;
//      overflow: hidden;
//      display: flex;
//      flex-direction: column;
//      border-right: 1px solid #dee2e6;
//      z-index: 1000;
//    }
//    .sidebar.collapsed {
//      width: 70px;
//    }
//    .sidebar-header {
//      display: flex;
//      justify-content: space-between;
//      align-items: center;
//      margin-bottom: 1rem;
//      padding-bottom: 1rem;
//      border-bottom: 1px solid #dee2e6;
//    }
//    .sidebar-brand {
//      font-size: 1.5rem;
//      white-space: nowrap;
//      overflow: hidden;
//      opacity: 1;
//      transition: opacity 0.3s ease, max-width 0.3s ease;
//    }
//    .sidebar.collapsed .sidebar-brand {
//      opacity: 0;
//      max-width: 0;
//      margin-right: 0 !important;
//    }
//    .sidebar-text {
//      white-space: nowrap;
//      overflow: hidden;
//      opacity: 1;
//      max-width: 100%;
//      transition: opacity 0.3s ease, max-width 0.3s ease;
//    }
//    .sidebar.collapsed .sidebar-text {
//      opacity: 0;
//      max-width: 0;
//    }
//    .nav-link {
//      font-size: 1.1rem;
//      display: flex;
//      align-items: center;
//      border-radius: 0.5rem;
//      transition: all 0.3s ease;
//      padding: 0.75rem 1rem;
//      color: #000;
//      text-decoration: none;
//    }
//    .nav-link.active {
//      background-color: #007bff;
//      color: white !important;
//    }
//    .nav-link.active .sidebar-icon {
//      color: white !important;
//    }
//    .nav-link:hover {
//      background-color: #e2e6ea;
//      color: #000;
//    }
//    .nav-link:hover .sidebar-icon {
//      color: #007bff;
//    }
//    .sidebar-icon {
//      font-size: 1.5rem;
//      margin-right: 1rem;
//      flex-shrink: 0;
//      transition: margin 0.3s ease, color 0.3s ease;
//      width: 1.5rem;
//      height: 1.5rem;
//      display: flex;
//      align-items: center;
//      justify-content: center;
//    }
//    /* ปรับตอน sidebar ย่อ */
//    .sidebar.collapsed .nav-link {
//      justify-content: center;  /* ให้ไอคอนอยู่กลาง */
//      padding-left: 0;
//      padding-right: 0;
//    }
//    .sidebar.collapsed .sidebar-icon {
//      margin-right: 0;
//    }
//    /* ปรับ text ให้หายไป */
//    .sidebar.collapsed .sidebar-text {
//      display: none;
//    }

//    .toggle-btn {
//      background-color: #fff;
//      border-radius: 50%;
//      width: 40px;
//      height: 40px;
//      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//      transition: all 0.3s ease;
//      border: none;
//      cursor: pointer;
//      display: flex;
//      align-items: center;
//      justify-content: center;
//      color: #6c757d;
//    }
//    .toggle-btn:hover {
//      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
//      color: #000;
//    }
//    .toggle-btn-container {
//      position: fixed;
//      top: 2rem;
//      left: 230px;
//      z-index: 1001;
//      transition: left 0.3s ease;
//    }
//    .toggle-btn-container.collapsed {
//      left: 50px;
//    }
//    .nav-item {
//      margin-bottom: 0.5rem;
//    }
//    @media (max-width: 768px) {
//      .sidebar {
//        left: -250px;
//        width: 250px;
//      }
//      .sidebar:not(.collapsed) {
//        left: 0;
//      }
//    }
//  `}
//       </style>

//       <div
//         className={`d-flex flex-column sidebar ${isCollapsed ? "collapsed" : ""
//           }`}
//       >
//         <div className="sidebar-header">
//           <h1 className="h4 text-primary sidebar-brand justify-content-center align-item-center">
//             {" "}
//             Service System
//           </h1>
//         </div>
//         <nav className="flex-grow-1">
//           <ul className="nav flex-column">
//             {menuItems.map((item) => (
//               <li className="nav-item" key={item.to}>
//                 <Link
//                   to={item.to}
//                   className={`nav-link text-dark ${location.pathname === item.to ? "active" : ""
//                     }`}
//                 >
//                   <div className="sidebar-icon">{item.icon}</div>
//                   <span className="sidebar-text">{item.name}</span>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>
//         <div className="mt-auto">

//           <div
//             className="nav-link text-danger"
//             style={{ cursor: "pointer" }}
//             onClick={handleLogout}>
//             <div className="sidebar-icon">{logoutItem.icon}</div>
//             <span className="sidebar-text">{logoutItem.name}</span>
//           </div>
//         </div>
//       </div>
//       <div className={`toggle-btn-container ${isCollapsed ? "collapsed" : ""}`}>
//         <button className="toggle-btn" onClick={handleToggle}>
//           {isCollapsed ? (
//             <FaArrowAltCircleRight size={24} />
//           ) : (
//             <FaArrowAltCircleLeft size={24} />
//           )}
//         </button>
//       </div>
//     </>
//   );
// };

// export default Sidebar;

// import React, { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { GoHomeFill } from "react-icons/go";
// import { IoDocumentText, IoPeopleCircleSharp } from "react-icons/io5";
// import { BsBarChartLineFill } from "react-icons/bs";
// import { MdOutlineError } from "react-icons/md";
// import { FaArrowAltCircleLeft } from "react-icons/fa";
// import { FaArrowAltCircleRight } from "react-icons/fa";
// import { MdLogout, MdWork } from "react-icons/md";

// const Sidebar = ({ onCollapse }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const location = useLocation();

//   // const handleToggle = () => setIsCollapsed(!isCollapsed);
//   const handleToggle = () => {
//     const newCollapse = !isCollapsed;
//     setIsCollapsed(newCollapse);
//     onCollapse(newCollapse); // แจ้ง App
//   };
//   const menuItems = [
//     {
//       to: "/home",
//       name: "หน้าหลัก",
//       icon: <GoHomeFill className="sidebar-icon" />,
//     },
//     {
//       to: "/incomplete-job",
//       name: "งานค้าง",
//       icon: <MdOutlineError className="sidebar-icon" />,
//     },
//     {
//       to: "/job",
//       name: "งานทั้งหมด",
//       icon: <IoDocumentText className="sidebar-icon" />,
//     },
//     {
//       to: "/create-job",
//       name: "เพิ่มงานซ่อม",
//       icon: <MdWork className="sidebar-icon" />,
//     },
//     // {
//     //   to: "/show-customer",
//     //   name: "เพิ่มงานซ่อม",
//     //   icon: <MdWork className="sidebar-icon" />,
//     // },
//     // {
//     //   to: "/create-customer",
//     //   name: "สร้างลูกค้า",
//     //   icon: (
//     //     <svg
//     //       xmlns="http:www.w3.org/2000/svg"
//     //       className="bi bi-person-fill"
//     //       viewBox="0 0 16 16"
//     //       fill="currentColor"
//     //     >
//     //       <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
//     //     </svg>
//     //   ),
//     // },
//     // {
//     //   to: "/create-product",
//     //   name: "สร้างสินค้า",
//     //   icon: (
//     //     <svg
//     //       xmlns="http:www.w3.org/2000/svg"
//     //       className="bi bi-box-seam-fill"
//     //       viewBox="0 0 16 16"
//     //       fill="currentColor"
//     //     >
//     //       <path d="M10.985 1.52A1 1 0 0 0 10.5 1H5.5a1 1 0 0 0-.485.52L.375 9.485A.5.5 0 0 0 .5 10h15a.5.5 0 0 0 .125-.515z" />
//     //     </svg>
//     //   ),
//     // },

//     // {
//     //   to: "/show-customer",
//     //   name: "แสดงลูกค้า",
//     //   icon: (
//     //     <svg
//     //       xmlns="http:www.w3.org/2000/svg"
//     //       className="bi bi-people-fill"
//     //       viewBox="0 0 16 16"
//     //       fill="currentColor"
//     //     >
//     //       <path d="M7 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H7z" />
//     //     </svg>
//     //   ),
//     // },
//   ];

//   const logoutItem = { to: "/logout", name: "ออกจากระบบ", icon: <MdLogout /> };
//   const clearAuthData = () => {
//     ["token", "permission"].forEach((key) => {
//       localStorage.removeItem(key);
//       sessionStorage.removeItem(key);
//     });
//   };

//   // const handleLogout = () => {
//   //   clearAuthData();
//   //   window.location.href = "/";
//   // };
//   const navigate = useNavigate();
//   const handleLogout = () => {
//     clearAuthData();
//     navigate("/");
//   };

//   return (
//     <>
//       <style>
//         {`
//    .sidebar {
//      width: 250px;
//      background-color: #f8f9fa;
//      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//      position: fixed;
//      height: 100vh;
//      top: 0;
//      left: 0;
//      padding: 1rem;
//      transition: width 0.3s ease;
//      overflow: hidden;
//      display: flex;
//      flex-direction: column;
//      border-right: 1px solid #dee2e6;
//      z-index: 1000;
//    }
//    .sidebar.collapsed {
//      width: 70px;
//    }
//    .sidebar-header {
//      display: flex;
//      justify-content: space-between;
//      align-items: center;
//      margin-bottom: 1rem;
//      padding-bottom: 1rem;
//      border-bottom: 1px solid #dee2e6;
//    }
//    .sidebar-brand {
//      font-size: 1.5rem;
//      white-space: nowrap;
//      overflow: hidden;
//      opacity: 1;
//      transition: opacity 0.3s ease, max-width 0.3s ease;
//    }
//    .sidebar.collapsed .sidebar-brand {
//      opacity: 0;
//      max-width: 0;
//      margin-right: 0 !important;
//    }
//    .sidebar-text {
//      white-space: nowrap;
//      overflow: hidden;
//      opacity: 1;
//      max-width: 100%;
//      transition: opacity 0.3s ease, max-width 0.3s ease;
//    }
//    .sidebar.collapsed .sidebar-text {
//      opacity: 0;
//      max-width: 0;
//    }
//    .nav-link {
//      font-size: 1.1rem;
//      display: flex;
//      align-items: center;
//      border-radius: 0.5rem;
//      transition: all 0.3s ease;
//      padding: 0.75rem 1rem;
//      color: #000;
//      text-decoration: none;
//    }
//    .nav-link.active {
//      background-color: #007bff;
//      color: white !important;
//    }
//    .nav-link.active .sidebar-icon {
//      color: white !important;
//    }
//    .nav-link:hover {
//      background-color: #e2e6ea;
//      color: #000;
//    }
//    .nav-link:hover .sidebar-icon {
//      color: #007bff;
//    }
//    .sidebar-icon {
//      font-size: 1.5rem;
//      margin-right: 1rem;
//      flex-shrink: 0;
//      transition: margin 0.3s ease, color 0.3s ease;
//      width: 1.5rem;
//      height: 1.5rem;
//      display: flex;
//      align-items: center;
//      justify-content: center;
//    }
//    /* ปรับตอน sidebar ย่อ */
//    .sidebar.collapsed .nav-link {
//      justify-content: center;  /* ให้ไอคอนอยู่กลาง */
//      padding-left: 0;
//      padding-right: 0;
//    }
//    .sidebar.collapsed .sidebar-icon {
//      margin-right: 0;
//    }
//    /* ปรับ text ให้หายไป */
//    .sidebar.collapsed .sidebar-text {
//      display: none;
//    }

//    .toggle-btn {
//      background-color: #fff;
//      border-radius: 50%;
//      width: 40px;
//      height: 40px;
//      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//      transition: all 0.3s ease;
//      border: none;
//      cursor: pointer;
//      display: flex;
//      align-items: center;
//      justify-content: center;
//      color: #6c757d;
//    }
//    .toggle-btn:hover {
//      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
//      color: #000;
//    }
//    .toggle-btn-container {
//      position: fixed;
//      top: 2rem;
//      left: 230px;
//      z-index: 1001;
//      transition: left 0.3s ease;
//    }
//    .toggle-btn-container.collapsed {
//      left: 50px;
//    }
//    .nav-item {
//      margin-bottom: 0.5rem;
//    }
//    @media (max-width: 768px) {
//      .sidebar {
//        left: -250px;
//        width: 250px;
//      }
//      .sidebar:not(.collapsed) {
//        left: 0;
//      }
//    }
//  `}
//       </style>

//       <div
//         className={`d-flex flex-column sidebar ${isCollapsed ? "collapsed" : ""
//           }`}
//       >
//         <div className="sidebar-header">
//           <h1 className="h4 text-primary sidebar-brand justify-content-center align-item-center">
//             {" "}
//             Service System
//           </h1>
//         </div>
//         <nav className="flex-grow-1">
//           <ul className="nav flex-column">
//             {menuItems.map((item) => (
//               <li className="nav-item" key={item.to}>
//                 <Link
//                   to={item.to}
//                   className={`nav-link text-dark ${location.pathname === item.to ? "active" : ""
//                     }`}
//                 >
//                   <div className="sidebar-icon">{item.icon}</div>
//                   <span className="sidebar-text">{item.name}</span>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>
//         <div className="mt-auto">
//           {/* <Link to={logoutItem.to} className="nav-link text-danger">
//             <div className="sidebar-icon">{logoutItem.icon}</div>
//             <span className="sidebar-text">{logoutItem.name}</span>
//           </Link> */}
//           <div
//             className="nav-link text-danger"
//             style={{ cursor: "pointer" }}
//             onClick={handleLogout}>
//             <div className="sidebar-icon">{logoutItem.icon}</div>
//             <span className="sidebar-text">{logoutItem.name}</span>
//           </div>
//         </div>
//       </div>
//       <div className={`toggle-btn-container ${isCollapsed ? "collapsed" : ""}`}>
//         <button className="toggle-btn" onClick={handleToggle}>
//           {isCollapsed ? (
//             <FaArrowAltCircleRight size={24} />
//           ) : (
//             <FaArrowAltCircleLeft size={24} />
//           )}
//         </button>
//       </div>
//     </>
//   );
// };

// export default Sidebar;

// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { GoHomeFill } from "react-icons/go";
// import { IoDocumentText, IoPeopleCircleSharp } from "react-icons/io5";
// import { BsBarChartLineFill } from "react-icons/bs";
// import { RiLogoutBoxLine } from "react-icons/ri";
// import { FaArrowRight } from "react-icons/fa";
// import { FaArrowLeft } from "react-icons/fa6";

// export default function Sidebar() {
//   const location = useLocation();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const handleToggle = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   return (
//     <div
//       className={`p-4 d-flex flex-column sidebar ${
//         isCollapsed ? "collapsed" : ""
//       }`}
//     >
//       {/* ส่วนหัวของ Sidebar ที่มีโลโก้และชื่อระบบ */}
//       <div
//         className="d-flex align-items-center mb-4 fs-5 fw-bold sidebar-logo"
//         style={{ justifyContent: isCollapsed ? "center" : "start" }}
//       >
//         <IoPeopleCircleSharp style={{ width: "50px", height: "50px" }} />
//         {!isCollapsed && <h3>Service System</h3>}
//       </div>

//       <nav className="flex-grow-1">
//         <ul className="list-unstyled p-0 sidebar-menu">
//           {/* เมนูหน้าหลัก */}
//           <li
//             className={`mb-4 menu-item ${
//               location.pathname === "/Home" ? "active" : ""
//             }`}
//           >
//             <Link to="/Home">
//               <GoHomeFill className="sidebar-icon" />
//               <span className="sidebar-text">หน้าหลัก</span>
//             </Link>
//           </li>

//           {/* เมนูงานทั้งหมด */}
//           <li
//             className={`mb-4 menu-item ${
//               location.pathname === "/job" ? "active" : ""
//             }`}
//           >
//             <Link to="/job">
//               <IoDocumentText className="sidebar-icon" />
//               <span className="sidebar-text">งานทั้งหมด</span>
//             </Link>
//           </li>

//           {/* เมนู Dashboard */}
//           <li
//             className={`mb-4 menu-item ${
//               location.pathname === "/dashboard" ? "active" : ""
//             }`}
//           >
//             <Link to="/dashboard">
//               <BsBarChartLineFill className="sidebar-icon" />
//               <span className="sidebar-text">Dashboard</span>
//             </Link>
//           </li>

//           {/* เมนูอื่นๆ ของคุณ (ปรับปรุงตามโค้ดของคุณ) */}
//           <li className="mb-4">
//             <Link
//               to="/show-customer"
//               className="text-decoration-none text d-flex align-items-center"
//             >
//               <span className="sidebar-text">สร้างลูกค้า</span>
//             </Link>
//           </li>

//           <li className="mb-4">
//             <Link
//               to="/timeline"
//               className="text-decoration-none text d-flex align-items-center"
//             >
//               <span className="sidebar-text">timeline</span>
//             </Link>
//           </li>

//           <li className="mb-4">
//             <Link
//               to="show-home"
//               className="text-decoration-none text d-flex align-items-center"
//             >
//               <span className="sidebar-text">home</span>
//             </Link>
//           </li>

//           {/* เมนูออกจากระบบ */}
//           <li className="d-flex align-item-end">
//             <Link to="/logout">
//               <RiLogoutBoxLine className="sidebar-icon" />
//               <span className="sidebar-text">ออกจากระบบ</span>
//             </Link>
//           </li>
//           <li>
//             <Link to="/test" className="text-decoration-none">
//               <span className="sidebar-text">test</span>
//             </Link>
//           </li>
//         </ul>
//       </nav>

//       {/* ปุ่มสำหรับย่อ/ขยาย Sidebar */}
//       <div
//         style={{
//           padding: "10px 20px",
//           textAlign: "center",
//         }}
//       >
//         <button onClick={handleToggle} className="btn btn-primary">
//           {isCollapsed ? <FaArrowRight /> : <FaArrowLeft />}
//         </button>
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import { GoHomeFill } from "react-icons/go";
// import { BsBarChartLineFill } from "react-icons/bs";
// import { RiLogoutBoxLine } from "react-icons/ri";
// import { IoPeopleCircleSharp, IoDocumentText } from "react-icons/io5";
// import { Link } from "react-router-dom";

// export default function Sidebar() {
//   return (
//     <div
//       className="p-4 d-flex flex-column sidebar-logo"
//       style={{
//         width: "250px",
//         backgroundColor: "#FFFFF",
//         boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//         boxSizing: "border-box",
//         position: "fixed",
//         height: "100vh",
//         left: 0,
//         top: 0,
//       }}
//     >
//       <div className="d-flex align-items-center mb-4 fs-5 fw-bold">
//         <IoPeopleCircleSharp style={{ width: "50px", height: "50px" }} />
//         <h3>Service System</h3>
//       </div>
//       <nav className="flex-grow-1">
//         <ul className="list-unstyled p-0">
//           <li className="mb-4 sidebar-active">
//             {/* <a
//               href="#home"
//               className="d-block text-white text-decoration-none p-2 rounded"
//             >
//               <i className="fas fa-home me-2"></i>
//               หน้าแรก
//             </a> */}
//             <Link
//               to="/Home"
//               className="text-decoration-none text d-flex align-items-center"
//             >
//               <GoHomeFill className="sidebar-icon" />
//               <span className="sidebar-text">หน้าหลัก</span>
//             </Link>
//           </li>
//           <li className="mb-4 sidebar-active">
//             <Link
//               to="/job"
//               className="text-decoration-none text d-flex align-items-center"
//             >
//               <IoDocumentText className="sidebar-icon" />
//               <span className="sidebar-text">งานทั้งหมด</span>
//             </Link>
//           </li>
//           <li className="mb-4 sidebar-active">
//             {/* <a
//               href="#dashboard"
//               className="d-block text-dark text-decoration-none p-2 rounded"
//             >
//               <i className="fas fa-chart-line me-2"></i>
//               Dashboard
//             </a> */}
//             <Link
//               to="/dashboard"
//               className="text-decoration-none text d-flex align-items-center"
//             >
//               <BsBarChartLineFill className="sidebar-icon" />
//               <span className="sidebar-text">Dashboard</span>
//             </Link>
//           </li>
//           <li>
//             <Link to="/create-customer" className="text-decoration-none">
//               <span className="sidebar-text">สร้างลูกค้า</span>
//             </Link>
//           </li>
//           <li>
//             <Link to="/create-product" className="text-decoration-none">
//               <span className="sidebar-text">สร้างสินค้า</span>
//             </Link>
//           </li>
//           <li>
//             <Link to="/create-job" className="text-decoration-none">
//               <span className="sidebar-text">สร้างงาน</span>
//             </Link>
//           </li>
//           <li>
//             <Link to="/show-customer" className="text-decoration-none">
//               <span className="sidebar-text">แสดงลูกค้า</span>
//             </Link>
//           </li>
//           <li>
//             <Link to="/show-home" className="text-decoration-none">
//               <span className="sidebar-text">แสดงหน้าแรก</span>
//             </Link>
//           </li>
//           <li>
//             <Link to="/show-job" className="text-decoration-none">
//               <span className="sidebar-text">แสดงรายละเอียดงาน</span>
//             </Link>
//           </li>
//           <li>
//             <Link to="/test" className="text-decoration-none">
//               <span className="sidebar-text">เทส</span>
//             </Link>
//           </li>
//           {/* <li className="mb-2" style={{ marginTop: "20px" }}> */}
//           <li className="d-flex align-item-end">
//             {/* <a
//               href="#logout"
//               className="d-block text-white text-decoration-none p-2 rounded"
//             >
//               <i className="fas fa-sign-out-alt me-2"></i>
//               Log Out
//             </a> */}
//             <Link to="/logout" className="text-decoration-none">
//               <RiLogoutBoxLine className="sidebar-icon" />
//               <span className="sidebar-text">ออกจากระบบ</span>
//             </Link>
//           </li>
//         </ul>
//       </nav>
//     </div>
//   );
// }
