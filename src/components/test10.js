import React, { useContext, useState, useEffect } from "react";
import { Badge } from "antd";
import { LuCalendarDays } from "react-icons/lu";
import { FaRegBell, FaBell } from "react-icons/fa";
import dayjs from "dayjs";
import { WarningContext } from "../WarningContext";
import { useNavigate } from "react-router-dom";
import { BsFillPersonVcardFill } from "react-icons/bs";

export default function Navbar() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [username, setUsername] = useState("");
  const warningCount = useContext(WarningContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username || user.name || "");
    }
  }, []);

  const handleWarningClick = () => navigate("/Home");

  return (
    <nav className="navbar navbar-expand-lg new-navbar px-3 px-lg-4">
      <div className="container-fluid">
        {/* Brand / Title (ปรับเป็นโลโก้คุณได้) */}
        {/* <a
          className="navbar-brand d-flex align-items-center gap-2 text-white fw-bold"
          href="#"
        >
          <span className="brand-badge">HM</span>
          <span className="d-none d-sm-inline">HealthMonitor</span>
        </a> */}

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

            {/* Username */}
            <li className="nav-item d-none d-sm-block">
              <span className="username-chip  ">
                <BsFillPersonVcardFill />{" "}
                {localStorage.getItem("username") ||
                  sessionStorage.getItem("username") ||
                  username ||
                  "Guest"}
              </span>
            </li>

            {/* Profile Dropdown (เหลือแค่ Profile / Settings) */}
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
                <li>
                  <a className="dropdown-item" href="#">
                    Register Service
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li>
                {/* ลบเส้นแบ่งและ Logout ออก ตามคำขอ */}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
