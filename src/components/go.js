import React, { useState, useEffect } from "react";
import {
  Button,
  DatePicker,
  Select,
  Space,
  Dropdown,
  Row,
  Col,
  Card,
} from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ApexCharts from "react-apexcharts";
import { BiFilterAlt, BiBarChart, BiUser, BiPackage } from "react-icons/bi";
import { MdBorderColor } from "react-icons/md";
import {
  FaRegLightbulb,
  FaTools,
  FaCheck,
  FaFileAlt,
  FaTruck,
  FaTruckLoading,
} from "react-icons/fa";
import { TbBasketCancel } from "react-icons/tb";
import axios from "axios";
import "dayjs/locale/th";
import locale from "antd/es/date-picker/locale/th_TH";
import { useNavigate, useParams } from "react-router-dom";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import mockData2 from "./mockData2";
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);
dayjs.locale("th");

const { Option } = Select;

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
  const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });
  const [dateType, setDateType] = useState("day");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusCounts, setStatusCounts] = useState([]);

  const statusIcons = [
    { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
    { name: "สั่งอะไหล่", icon: <MdBorderColor /> },
    { name: "ซ่อมสำเร็จ", icon: <FaTools /> },
    { name: "รอทดสอบ", icon: <FaFileAlt /> },
    { name: "รอจัดส่ง", icon: <FaTruck /> },
    { name: "จัดส่งสำเร็จ", icon: <FaTruckLoading /> },
    { name: "ปิดงาน", icon: <FaCheck /> },
    { name: "ยกเลิกการเคลมสินค้า", icon: <TbBasketCancel /> },
  ];

  const [chartOptions, setChartOptions] = useState({
    options: {
      chart: {
        id: "basic-bar",
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: [],
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          horizontal: false,
        },
      },
      colors: ["#4F46E5"],
    },
    series: [
      {
        name: "หน่วย (Unit)",
        data: [],
      },
    ],
  });

  const [customerChartOptions, setCustomerChartOptions] = useState({
    options: {
      chart: {
        id: "customer-bar-chart",
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: [],
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          horizontal: false,
        },
      },
      colors: ["#22C55E"],
    },
    series: [
      {
        name: "จำนวนลูกค้า",
        data: [],
      },
    ],
  });

  const [productrChartOptions, setProductChartOptions] = useState({
    options: {
      chart: {
        id: "product-bar-chart",
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: [],
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          horizontal: false,
        },
      },
      colors: ["#EC9838FF"],
    },
    series: [
      {
        name: "จำนวนสินค้า",
        data: [],
      },
    ],
  });

  const getData = async () => {
    try {
      const url = "http://localhost:3302/get-dashboard";
      const response = await axios.get(url);
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getTitleSuffix = () => {
    switch (dateType) {
      case "month":
        return "เดือน";
      case "year":
        return "ปี";
      case "day":
      default:
        return "วัน";
    }
  };

  // const getData = async () => {
  //   try {
  //     // const url = "http://localhost:3302/get-dashboard";
  //     // const response = await axios.get(url);
  //     setData(mockData2);
  //     console.log(mockData2);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  const filterAndCount = () => {
    // 1. ส่วนสำหรับคำนวณข้อมูลรายวัน: totalUnits, topCategory, topCustomer และข้อมูลสำหรับกราฟ
    const dailyFiltered = data.filter((item) => {
      const itemDate = dayjs(item.createAt);
      return itemDate.isSame(selectedDate, dateType);
    });

    const dailyJobsMap = new Map();
    dailyFiltered.forEach((item) => {
      const existingJob = dailyJobsMap.get(item.jobRef);
      if (
        !existingJob ||
        dayjs(item.updateAt).isAfter(dayjs(existingJob.updateAt))
      ) {
        dailyJobsMap.set(item.jobRef, item);
      }
    });

    const categoryCount = {};
    const customerCount = {};
    const productCount = {};
    let totalUnits = 0;

    dailyJobsMap.forEach((item) => {
      totalUnits += item.unit || 0;
      const cat = item.category;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      const cus = item.username;
      customerCount[cus] = (customerCount[cus] || 0) + 1;
      const prod = item.product_name;
      productCount[prod] = (productCount[prod] || 0) + 1;
    });

    setTotalCount(totalUnits);
    let topCat = { name: "-", count: 0 };
    for (const [cat, count] of Object.entries(categoryCount)) {
      if (count > topCat.count) {
        topCat = { name: cat, count };
      }
    }
    setTopCategory(topCat);

    let topcus = { name: "-", count: 0 };
    for (const [cus, count] of Object.entries(customerCount)) {
      if (count > topcus.count) {
        topcus = { name: cus, count };
      }
    }
    setTopCustomer(topcus);

    // อัปเดตกราฟประเภทสินค้า
    const claimCategories = Object.keys(categoryCount);
    const unit = Object.values(categoryCount);
    setChartOptions((prevState) => ({
      ...prevState,
      options: {
        ...prevState.options,
        xaxis: {
          categories: claimCategories,
        },
      },
      series: [
        {
          ...prevState.series[0],
          data: unit,
        },
      ],
    }));

    // อัปเดตกราฟลูกค้า
    const customerNames = Object.keys(customerCount);
    const customerCounts = Object.values(customerCount);
    setCustomerChartOptions((prevState) => ({
      ...prevState,
      options: {
        ...prevState.options,
        xaxis: {
          categories: customerNames,
        },
      },
      series: [
        {
          ...prevState.series[0],
          data: customerCounts,
        },
      ],
    }));

    // อัปเดตกราฟจำนวนสินค้าที่เคลม
    const productCountNames = Object.keys(productCount);
    const productCounts = Object.values(productCount);
    setProductChartOptions((prevState) => ({
      ...prevState,
      options: {
        ...prevState.options,
        xaxis: {
          categories: productCountNames,
        },
      },
      series: [
        {
          ...prevState.series[0],
          data: productCounts,
        },
      ],
    }));

    // 2. ส่วนสำหรับคำนวณสถานะงาน: statusCounts
    const jobsAsOfSelectedDate = new Map();
    data.forEach((item) => {
      const itemUpdateDate = dayjs(item.updateAt);
      if (itemUpdateDate.isSameOrBefore(selectedDate, "day")) {
        const existingJob = jobsAsOfSelectedDate.get(item.jobRef);
        if (
          !existingJob ||
          itemUpdateDate.isAfter(dayjs(existingJob.updateAt))
        ) {
          jobsAsOfSelectedDate.set(item.jobRef, item);
        }
      }
    });

    const statusCountMap = {};
    jobsAsOfSelectedDate.forEach((item) => {
      const status = item.jobStatus;
      statusCountMap[status] = (statusCountMap[status] || 0) + 1;
    });

    const updatedStatusCounts = statusIcons.map((item) => {
      const count = statusCountMap[item.name] || 0;
      return { ...item, count };
    });
    setStatusCounts(updatedStatusCounts);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      filterAndCount();
    }
  }, [data, selectedDate, dateType]);

  const handleDateChange = (value) => {
    setSelectedDate(value);
  };

  const handleDateTypeChange = (value) => {
    setDateType(value);
  };

  const renderDatePicker = () => {
    switch (dateType) {
      case "day":
        return (
          <DatePicker
            disabledDate={disableDatePass}
            locale={locale}
            value={selectedDate}
            onChange={handleDateChange}
            format="DD MMM YYYY"
            placeholder="เลือกวันที่"
          />
        );
      case "month":
        return (
          <DatePicker
            disabledDate={disableDatePass}
            locale={locale}
            picker="month"
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="เลือกเดือน"
          />
        );
      case "year":
        return (
          <DatePicker
            disabledDate={disableDatePass}
            locale={locale}
            picker="year"
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="เลือกปี"
          />
        );
      default:
        return null;
    }
  };

  const disableDatePass = (current) => {
    if (!current) {
      return false;
    }

    switch (dateType) {
      case "day":
        return current.isAfter(dayjs(), "day");
      case "month":
        return current.isAfter(dayjs(), "month");
      case "year":
        return current.isAfter(dayjs(), "year");
      default:
        return false;
    }
  };

  const navigate = useNavigate();

  const handletoJob = () => {
    navigate("/Job");
  };

  const handleStatusClick = (record) => {
    navigate(`/jobs-by-status/${record}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 className="text-center mb-5 mt-5">Dashboard</h1>
      <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-4">
        <Space.Compact>
          {renderDatePicker()}
          <Select
            value={dateType}
            onChange={handleDateTypeChange}
            style={{ width: "100px" }}
          >
            <Option value="day">วัน</Option>
            <Option value="month">เดือน</Option>
            <Option value="year">ปี</Option>
          </Select>
        </Space.Compact>
      </div>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card>
            <div className="d-flex align-items-center">
              <div className="me-3 fs-3 text-dark">
                <BiPackage />
              </div>
              <div>
                <h2 className="mb-1 fs-5">{totalCount}</h2>
                <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                  จำนวนสินค้าที่รับเคลมต่อ{getTitleSuffix()}
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div className="d-flex align-items-center">
              <div className="me-3 fs-3 text-dark">
                <BiBarChart />
              </div>
              <div>
                <h2 className="mb-1 fs-5">
                  {topCategory.name}, {topCategory.count} ชิ้น
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                  ประเภทสินค้าที่ถูกเคลมสูงสุดประจำ{getTitleSuffix()}
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div className="d-flex align-items-center">
              <div className="me-3 fs-3 text-dark">
                <BiUser />
              </div>
              <div>
                <h2 className="mb-1 fs-5">
                  {topCustomer.name}, {topCustomer.count} รายการ
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                  ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำ{getTitleSuffix()}
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col >
          <Card
            style={{
              minHeight: '500px',  // สูงขึ้นกว่าเดิม
              maxHeight: '80vh',   // สูงสุดไม่เกิน 80% ของความสูงหน้าจอ
              overflow: 'auto',    // เผื่อเกิด scroll เมื่อเนื้อหามาก
            }}>
            <h3 className="mb-3">
              จำนวนสินค้าที่เคลมสูงสุดประจำ{getTitleSuffix()}
            </h3>
            <div
              className="d-flex justify-content-center align-items-center text-muted"
              style={{
                height: "300px",
                backgroundColor: "#f0f0f0",
                fontSize: "0.9rem",
              }}
            >
              {productrChartOptions.options.xaxis.categories.length > 0 ? (
                <ApexCharts
                  options={productrChartOptions.options}
                  series={productrChartOptions.series}
                  type="line"
                  width="100%"
                  height="100%"
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p>กำลังโหลดข้อมูล...</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">

        <Col xs={24} sm={8}>
          <Card>
            <h3 className="mb-3">
              ประเภทสินค้าที่ถูกเคลมสูงสุดประจำ{getTitleSuffix()}
            </h3>
            <div
              className="d-flex justify-content-center align-items-center text-muted"
              style={{
                height: "300px",
                backgroundColor: "#f0f0f0",
                fontSize: "0.9rem",
              }}
            >
              {chartOptions.options.xaxis.categories.length > 0 ? (
                <ApexCharts
                  options={chartOptions.options}
                  series={chartOptions.series}
                  type="line"
                  width="100%"
                  height="100%"
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p>กำลังโหลดข้อมูล...</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <h3 className="mb-3">
              ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำ{getTitleSuffix()}
            </h3>
            <div
              className="d-flex justify-content-center align-items-center text-muted"
              style={{
                height: "300px",
                backgroundColor: "#f0f0f0",
                fontSize: "0.9rem",
              }}
            >
              {customerChartOptions.options.xaxis.categories.length > 0 ? (
                <ApexCharts
                  options={customerChartOptions.options}
                  series={customerChartOptions.series}
                  type="bar"
                  width="100%"
                  height="100%"
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p>กำลังโหลดข้อมูล...</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <h3 className="text-center mb-4">สถานะงานประจำ{getTitleSuffix()}</h3>
        <Row gutter={[16, 16]} justify="center">
          {statusCounts.map((item, index) => (
            <Col
              key={index}
              xs={12}
              sm={8}
              md={4}
              className="text-center"
              onClick={() => handleStatusClick(item.name)}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex flex-column align-items-center ">
                <span className="fs-3 mb-2 ">{item.icon}</span>
                <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                  {item.name}
                </p>
                <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
                  {item.count}
                </span>
              </div>
            </Col>
          ))}
        </Row>
        <div className="mt-4 text-center">
          <Button
            type="primary"
            style={{ backgroundColor: "#213f66", width: "200px" }}
            onClick={handletoJob}
          >
            ไปที่หน้างาน
          </Button>
        </div>
      </Card>
    </div>
  );
} ปรับหน้านี้ทั้งหน้าให้สวยกว่านี้ ขนาดเท่าเดิม แต่ขอดีไซด์สวยๆ 
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { IoDocumentText, IoPeopleCircleSharp } from "react-icons/io5";
import { BsBarChartLineFill } from "react-icons/bs";
import { MdOutlineError } from "react-icons/md";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { MdLogout, MdWork } from "react-icons/md";

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // const handleToggle = () => setIsCollapsed(!isCollapsed);
  const handleToggle = () => {
    const newCollapse = !isCollapsed;
    setIsCollapsed(newCollapse);
    onCollapse(newCollapse); // แจ้ง App
  };
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
    {
      to: "/create-job",
      name: "เพิ่มงานซ่อม",
      icon: <MdWork className="sidebar-icon" />,
    },

  ];

  const logoutItem = { to: "/logout", name: "ออกจากระบบ", icon: <MdLogout /> };
  const clearAuthData = () => {
    ["token", "permission"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  return (
    <>
      <style>
        {`
   .sidebar {
     width: 250px;
     background-color: #f8f9fa;
     box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
     position: fixed;
     height: 100vh;
     top: 0;
     left: 0;
     padding: 1rem;
     transition: width 0.3s ease;
     overflow: hidden;
     display: flex;
     flex-direction: column;
     border-right: 1px solid #dee2e6;
     z-index: 1000;
   }
   .sidebar.collapsed {
     width: 70px;
   }
   .sidebar-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 1rem;
     padding-bottom: 1rem;
     border-bottom: 1px solid #dee2e6;
   }
   .sidebar-brand {
     font-size: 1.5rem;
     white-space: nowrap;
     overflow: hidden;
     opacity: 1;
     transition: opacity 0.3s ease, max-width 0.3s ease;
   }
   .sidebar.collapsed .sidebar-brand {
     opacity: 0;
     max-width: 0;
     margin-right: 0 !important;
   }
   .sidebar-text {
     white-space: nowrap;
     overflow: hidden;
     opacity: 1;
     max-width: 100%;
     transition: opacity 0.3s ease, max-width 0.3s ease;
   }
   .sidebar.collapsed .sidebar-text {
     opacity: 0;
     max-width: 0;
   }
   .nav-link {
     font-size: 1.1rem;
     display: flex;
     align-items: center;
     border-radius: 0.5rem;
     transition: all 0.3s ease;
     padding: 0.75rem 1rem;
     color: #000;
     text-decoration: none;
   }
   .nav-link.active {
     background-color: #007bff;
     color: white !important;
   }
   .nav-link.active .sidebar-icon {
     color: white !important;
   }
   .nav-link:hover {
     background-color: #e2e6ea;
     color: #000;
   }
   .nav-link:hover .sidebar-icon {
     color: #007bff;
   }
   .sidebar-icon {
     font-size: 1.5rem;
     margin-right: 1rem;
     flex-shrink: 0;
     transition: margin 0.3s ease, color 0.3s ease;
     width: 1.5rem;
     height: 1.5rem;
     display: flex;
     align-items: center;
     justify-content: center;
   }
   /* ปรับตอน sidebar ย่อ */
   .sidebar.collapsed .nav-link {
     justify-content: center;  /* ให้ไอคอนอยู่กลาง */
     padding-left: 0;
     padding-right: 0;
   }
   .sidebar.collapsed .sidebar-icon {
     margin-right: 0;
   }
   /* ปรับ text ให้หายไป */
   .sidebar.collapsed .sidebar-text {
     display: none;
   }

   .toggle-btn {
     background-color: #fff;
     border-radius: 50%;
     width: 40px;
     height: 40px;
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
     transition: all 0.3s ease;
     border: none;
     cursor: pointer;
     display: flex;
     align-items: center;
     justify-content: center;
     color: #6c757d;
   }
   .toggle-btn:hover {
     box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
     color: #000;
   }
   .toggle-btn-container {
     position: fixed;
     top: 2rem;
     left: 230px;
     z-index: 1001;
     transition: left 0.3s ease;
   }
   .toggle-btn-container.collapsed {
     left: 50px;
   }
   .nav-item {
     margin-bottom: 0.5rem;
   }
   @media (max-width: 768px) {
     .sidebar {
       left: -250px;
       width: 250px;
     }
     .sidebar:not(.collapsed) {
       left: 0;
     }
   }
 `}
      </style>

      <div
        className={`d-flex flex-column sidebar ${isCollapsed ? "collapsed" : ""
          }`}
      >
        <div className="sidebar-header">
          <h1 className="h4 text-primary sidebar-brand justify-content-center align-item-center">
            {" "}
            Service System
          </h1>
        </div>
        <nav className="flex-grow-1">
          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link text-dark ${location.pathname === item.to ? "active" : ""
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
            className="nav-link text-danger"
            style={{ cursor: "pointer" }}
            onClick={handleLogout}>
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

export default Sidebar; อันนี้sidebarซึ่งไม่ต้องทำไร ให้ดูขนาดเฉยๆ 

import React, { useContext, useState, useEffect } from "react";
import { Badge, DatePicker, Space } from "antd";
import { LuCalendarDays } from "react-icons/lu";
import { FaRegBell, FaBell } from "react-icons/fa";
import dayjs from "dayjs";
import { WarningContext } from "../WarningContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [username, setUsername] = useState(""); // เพิ่ม state
  const warningCount = useContext(WarningContext);
  const navigate = useNavigate();

  // ✅ โหลดข้อมูล user จาก localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username); // หรือจะใช้ user.name ก็แล้วแต่โครงสร้าง
    }
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleWarningClick = () => {
    navigate("/Home");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
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
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            {/* Notification */}
            <li className="nav-item me-3">
              <div className="nav-link">
                <Badge count={warningCount} overflowCount={99}>
                  {warningCount > 0 ? (
                    <FaBell
                      style={{
                        fontSize: "24px",
                        color: "#dc3545",
                        cursor: "pointer",
                      }}
                      onClick={handleWarningClick}
                    />
                  ) : (
                    <FaRegBell style={{ fontSize: "24px", color: "#6c757d" }} />
                  )}
                </Badge>
              </div>
            </li>

            {/* Date Picker */}
            <li className="nav-item me-3">
              <Space direction="vertical" size={12}>
                <DatePicker
                  value={selectedDate}
                  format="DD-MM-YYYY"
                  onChange={handleDateChange}
                  prefix={<LuCalendarDays />}
                  placeholder="เลือกวันที่"
                  style={{ width: "150px" }}
                  className="form-control"
                  disabled
                />
              </Space>
            </li>

            {/* ✅ Username Display */}
            <li className="nav-item me-3">
              <span className="nav-link fw-semibold text-muted">
                👤 {localStorage.getItem("username") || sessionStorage.getItem("username") || "Guest"}
              </span>
            </li>

            {/* Profile Dropdown */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold me-2"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#1abc9c",
                  }}
                >
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </div>
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdownMenuLink"
              >
                <li>
                  <a className="dropdown-item" href="#">
                    Profile
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => {
                      localStorage.removeItem("user");
                      window.location.reload();
                    }}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}อันนี้navbar ซึ่งให้ดูขนาดเฉยๆ ปรับแค่โค้ดแรกให้design สวย ทันสมัย ดูใช้งานง่ายกว่านี้ 



