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
  const [serviceRef, setserviceRef] = useState("");
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
          serviceRef: userFromApi.serviceRef,
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
    //     setserviceRef(user.serviceRef || user.name || user.email || "Guest");
    //     setRole(user.role || "Guest");
    //     console.log("User role from localStorage:", user.role);
    //   } catch (error) {
    //     console.error("Failed to parse user data from localStorage", error);
    //     setserviceRef("Guest");
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
                  {(
                    localStorage.getItem("serviceRef") ||
                    sessionStorage.getItem("serviceRef") ||
                    serviceRef ||
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
