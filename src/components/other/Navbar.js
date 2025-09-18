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
  const [serviceRef, setServiceRef] = useState("");
  const [role, setRole] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [imageUrl, setImageUrl] = useState(""); // <-- เพิ่มบรรทัดนี้
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) return;

        // ดึง profile
        const profileRes = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userFromApi = profileRes.data.user;
        setRole(userFromApi.role || "Guest");
        setServiceRef(userFromApi.serviceRef || "Guest");
        setImageUrl(userFromApi.service_image || ""); // <-- เพิ่มบรรทัดนี้

        // ดึงงานทั้งหมดจาก /get-job
        const jobRes = await axios.get("http://localhost:3302/get-job");

        const jobs = jobRes.data || [];

        // กรองเฉพาะงานที่:
        // 1. expected_completion_date < วันนี้
        // 2. jobStatus != "เสร็จ" และ != "completed"
        const overdueJobs = jobs.filter((job) => {
          const dueDate = dayjs(job.expected_completion_date);
          const isOverdue = dueDate.isBefore(dayjs(), "day");
          const isIncomplete =
            job.jobStatus !== "เสร็จ" && job.jobStatus !== "completed";

          return isOverdue && isIncomplete;
        });

        // ตั้งค่าแจ้งเตือน
        setWarningCount(overdueJobs.length);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

  const handleWarningClick = () => navigate("/incomplete-job");
  const toRegister = () => navigate("/register");

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
                className={`icon-pill ${warningCount > 0 ? "pill-danger pulse" : "pill-muted"
                  }`}
                onClick={warningCount > 0 ? handleWarningClick : undefined}
                title={
                  warningCount > 0 ? "ดูการแจ้งเตือน" : "ไม่มีการแจ้งเตือน"
                }
              >
                <Badge count={warningCount} overflowCount={99}>
                  {warningCount > 0 ? (
                    <FaBell className="icon-lg" style={{ color: "red" }} />
                  ) : (
                    <FaRegBell className="icon-lg" style={{ color: "white" }} />
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
              <span className="serviceRef-chip text-white">
                <BsFillPersonVcardFill />{" "}
                {localStorage.getItem("serviceRef") ||
                  sessionStorage.getItem("serviceRef") ||
                  serviceRef ||
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
                  {imageUrl ? (
                    // ถ้ามี imageUrl ให้แสดงรูปภาพ
                    <img
                      src={imageUrl}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    // ถ้าไม่มี imageUrl ให้แสดงตัวอักษรเหมือนเดิม
                    (
                      localStorage.getItem("serviceRef") ||
                      sessionStorage.getItem("serviceRef") ||
                      serviceRef ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()
                  )}
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
                    <a className="dropdown-item" href="#" onClick={toRegister}>
                      Register Service
                    </a>
                  </li>
                )}
                {/* <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li> */}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
