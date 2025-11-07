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
  const [overdueCount, setOverdueCount] = useState(0);

  // ถ้า backend เก็บเฉพาะชื่อไฟล์ ให้แปลงเป็น URL เต็ม
  const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:3302";
  const toAbsoluteImageUrl = (val) => {
    if (!val) return "";
    // ถ้าเป็น full URL หรือ path เริ่มด้วย / ให้คืนค่าให้ถูกต้อง
    if (/^https?:\/\//i.test(val)) return val;
    if (val.startsWith("/")) return `${apiBase}${val}`;
    // คาดว่าเก็บเป็นชื่อไฟล์ -> serve จาก /uploads
    return `${apiBase}/uploads/${val}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) return;

        // ดึง profile
        const profileRes = await axios.get("http://localhost:3302/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userFromApi = profileRes.data.user;
        setRole(userFromApi.role || "Guest");
        setServiceRef(userFromApi.serviceRef || "Guest");
        // แปลงเป็น URL เต็มก่อนใช้งาน
        setImageUrl(toAbsoluteImageUrl(userFromApi.service_image || ""));

        // ดึงงานทั้งหมดจาก /get-job
        const jobRes = await axios.get("http://localhost:3302/api/jobs");

        const jobs = jobRes.data || [];

        const now = dayjs();
        // กรองเฉพาะงานที่:
        // 1. expected_completion_date < วันนี้
        // 2. jobStatus != "เสร็จ" และ != "completed"
        const overdueJobs = jobs.filter((job) => {
          const dueDateRaw = job.expected_completion_date;
          const statusRaw = job.jobStatus;

          console.log("🔍 Checking job:", job.job_id, dueDateRaw, statusRaw);

          // ตรวจว่ามี expected_completion_date หรือไม่
          if (!dueDateRaw) {
            console.log(" → Skip: no expected_completion_date");
            return false;
          }

          const dueDate = dayjs(dueDateRaw);
          if (!dueDate.isValid()) {
            console.log(" → Skip: invalid date:", dueDateRaw);
            return false;
          }

          // เลือกเอาวันที่วันนี้หรือล่วงหน้า
          const isOverdueDate = dueDate.isSameOrBefore(now, "day");

          // ตรวจสถานะ “เสร็จงาน” ในหลายรูปแบบ
          const statusNormalized = statusRaw?.trim()?.toLowerCase();

          const completedStatuses = [
            "เสร็จงาน",
            "completed",
            "done",
            // เพิ่ม status ที่ระบบคุณใช้
          ];

          const isCompleted = completedStatuses.includes(statusNormalized);

          console.log(" → isOverdueDate:", isOverdueDate, "isCompleted:", isCompleted);

          // ถ้าเลยหรือวันนี้ และยังไม่เสร็จ
          return isOverdueDate && !isCompleted;
        });

        console.log("✅ Overdue jobs (list):", overdueJobs.map((j) => j.job_id));
        console.log("Overdue count:", overdueJobs.length);

        setOverdueCount(overdueJobs.length);
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
            {/* <li className="nav-item">
              <button
                className={`icon-pill ${
                  overdueCount > 0 ? "pill-danger pulse" : "pill-muted"
                }`}
                onClick={overdueCount > 0 ? handleWarningClick : undefined}
                title={
                  overdueCount > 0
                    ? `มีงานที่ครบกำหนดหรือเลยกำหนด ${overdueCount} งาน`
                    : "ไม่มีงานที่ครบกำหนด"
                }
              >
                <Badge count={overdueCount} overflowCount={99}>
                  {overdueCount > 0 ? (
                    <FaBell className="icon-lg" style={{ color: "white" }} />
                  ) : (
                    <FaRegBell className="icon-lg" />
                  )}
                </Badge>
              </button>
            </li> */}

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
