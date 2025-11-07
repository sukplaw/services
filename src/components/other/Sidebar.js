import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { IoDocumentText } from "react-icons/io5";
import { MdOutlineError, MdLogout, MdWork } from "react-icons/md";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";

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
          ...(role !== "admin"
      ? [
        {
          to: "/manage-user",
          name: "จัดการบัญชีผู้ใช้",
          icon: <HiUserGroup className="sidebar-icon" />,
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

