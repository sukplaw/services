import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  DatePicker,
  Select,
  Space,
  Row,
  Col,
  Card,
  Statistic,
  Tooltip,
  Skeleton,
  Empty,
  Spin,
  Tag,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/th";
import locale from "antd/es/date-picker/locale/th_TH";
import ApexCharts from "react-apexcharts";
import axios from "axios";

// icons
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

import { useNavigate } from "react-router-dom";

dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);
dayjs.locale("th");

const { Option } = Select;

export default function Dashboard() {
  // -------------------- State --------------------
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalCount, setTotalCount] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
  const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });

  const [dateType, setDateType] = useState("day");
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [statusCounts, setStatusCounts] = useState([]);

  const statusIcons = useMemo(
    () => [
      { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
      { name: "สั่งอะไหล่", icon: <MdBorderColor /> },
      { name: "เริ่มการซ่อม", icon: <MdBorderColor /> },
      { name: "ซ่อมสำเร็จ", icon: <FaTools /> },
      { name: "รอทดสอบ", icon: <FaFileAlt /> },
      { name: "รอจัดส่ง", icon: <FaTruck /> },
      { name: "จัดส่งสำเร็จ", icon: <FaTruckLoading /> },
      { name: "ปิดงาน", icon: <FaCheck /> },
      { name: "ยกเลิกการเคลมสินค้า", icon: <TbBasketCancel /> },
    ],
    []
  );

  // -------------------- Chart Options Template --------------------
  const baseChart = useMemo(
    () => ({
      chart: { toolbar: { show: false }, fontFamily: "inherit" },
      xaxis: { categories: [], labels: { style: { fontSize: "12px" } } },
      yaxis: {
        labels: { style: { fontSize: "12px" } },
        forceNiceScale: true,
      },
      grid: { borderColor: "#f0f0f0" },
      dataLabels: { enabled: false },
      tooltip: {
        theme: "light",
        style: { fontSize: "12px" },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        markers: { radius: 12 },
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "45%",
        },
      },
      stroke: { width: 3, curve: "smooth" },
    }),
    []
  );

  const [categoryChart, setCategoryChart] = useState({
    options: { ...baseChart, colors: ["#6366F1"] },
    series: [{ name: "จำนวน (ครั้ง)", data: [] }],
  });
  const [customerChart, setCustomerChart] = useState({
    options: { ...baseChart, colors: ["#22C55E"] },
    series: [{ name: "จำนวนลูกค้า", data: [] }],
  });
  const [productChart, setProductChart] = useState({
    options: { ...baseChart, colors: ["#F59E0B"] },
    series: [{ name: "จำนวนสินค้า", data: [] }],
  });

  // -------------------- Helpers --------------------
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

  const disableDatePass = (current) => {
    if (!current) return false;
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

  // -------------------- Data Fetch --------------------
  const getData = async () => {
    setLoading(true);
    try {
      const url = "http://localhost:3302/get-dashboard";
      const response = await axios.get(url);
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Compute --------------------
  const filterAndCount = () => {
    if (!data?.length) {
      setTotalCount(0);
      setTopCategory({ name: "-", count: 0 });
      setTopCustomer({ name: "-", count: 0 });
      setCategoryChart((p) => ({
        ...p,
        options: { ...p.options, xaxis: { categories: [] } },
        series: [{ ...p.series[0], data: [] }],
      }));
      setCustomerChart((p) => ({
        ...p,
        options: { ...p.options, xaxis: { categories: [] } },
        series: [{ ...p.series[0], data: [] }],
      }));
      setProductChart((p) => ({
        ...p,
        options: { ...p.options, xaxis: { categories: [] } },
        series: [{ ...p.series[0], data: [] }],
      }));
      setStatusCounts(
        statusIcons.map((s) => ({
          ...s,
          count: 0,
        }))
      );
      return;
    }

    // 1) Filter by selected granular date
    const filtered = data.filter((item) =>
      dayjs(item.createAt).isSame(selectedDate, dateType)
    );

    // Keep latest record per jobRef (by updateAt)
    const latestJobByRef = new Map();
    filtered.forEach((item) => {
      const exist = latestJobByRef.get(item.jobRef);
      if (!exist || dayjs(item.updateAt).isAfter(dayjs(exist.updateAt))) {
        latestJobByRef.set(item.jobRef, item);
      }
    });

    // Count
    const categoryCount = {};
    const customerCount = {};
    const productCount = {};
    let totalUnits = 0;

    latestJobByRef.forEach((item) => {
      totalUnits += item.unit || 0;
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      customerCount[item.username] = (customerCount[item.username] || 0) + 1;
      productCount[item.sku] =
        (productCount[item.sku] || 0) + 1;
    });

    setTotalCount(totalUnits);

    // Top category
    const topCat = Object.entries(categoryCount).reduce(
      (acc, [k, v]) => (v > acc.count ? { name: k, count: v } : acc),
      { name: "-", count: 0 }
    );
    setTopCategory(topCat);

    // Top customer
    const topCus = Object.entries(customerCount).reduce(
      (acc, [k, v]) => (v > acc.count ? { name: k, count: v } : acc),
      { name: "-", count: 0 }
    );
    setTopCustomer(topCus);

    // Update charts
    setCategoryChart((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        xaxis: { categories: Object.keys(categoryCount) },
      },
      series: [{ ...prev.series[0], data: Object.values(categoryCount) }],
    }));
    setCustomerChart((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        xaxis: { categories: Object.keys(customerCount) },
      },
      series: [{ ...prev.series[0], data: Object.values(customerCount) }],
    }));
    setProductChart((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        xaxis: { categories: Object.keys(productCount) },
      },
      series: [{ ...prev.series[0], data: Object.values(productCount) }],
    }));

    // 2) Status as-of selected date (latest record up to that date)
    const latestAsOf = new Map();
    data.forEach((item) => {
      const upd = dayjs(item.updateAt);
      if (upd.isSameOrBefore(selectedDate, "day")) {
        const exist = latestAsOf.get(item.jobRef);
        if (!exist || upd.isAfter(dayjs(exist.updateAt))) {
          latestAsOf.set(item.jobRef, item);
        }
      }
    });

    const statusCountMap = {};
    latestAsOf.forEach((item) => {
      statusCountMap[item.jobStatus] =
        (statusCountMap[item.jobStatus] || 0) + 1;
    });

    setStatusCounts(
      statusIcons.map((s) => ({
        ...s,
        count: statusCountMap[s.name] || 0,
      }))
    );
  };

  // -------------------- Effects --------------------
  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      filterAndCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedDate, dateType]);

  // -------------------- Handlers --------------------
  const handleDateChange = (value) => setSelectedDate(value);
  const handleDateTypeChange = (value) => setDateType(value);

  const navigate = useNavigate();
  const handletoJob = () => navigate("/Job");
  const handleStatusClick = (name) => navigate(`/jobs-by-status/${name}`);

  // -------------------- UI --------------------
  const FilterBar = (
    <Card
      size="small"
      style={{
        borderRadius: 14,
        border: "1px solid #eef0f3",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div
        className="d-flex justify-content-between align-items-center flex-wrap gap-2"
        style={{ rowGap: 12 }}
      >
        <div className="d-flex align-items-center gap-2">
          <BiFilterAlt size={20} className="text-primary" />
          <span className="fw-semibold">ตัวกรอง</span>
          <Tooltip title="เลือกช่วงเวลาในการสรุปและแสดงผลข้อมูล">
            <InfoCircleOutlined style={{ color: "#94a3b8", marginLeft: 6 }} />
          </Tooltip>
        </div>

        <Space.Compact>
          <DatePicker
            disabledDate={disableDatePass}
            locale={locale}
            value={selectedDate}
            onChange={handleDateChange}
            format={
              dateType === "day"
                ? "DD MMM YYYY"
                : dateType === "month"
                ? "MMM YYYY"
                : "YYYY"
            }
            placeholder={
              dateType === "day"
                ? "เลือกวันที่"
                : dateType === "month"
                ? "เลือกเดือน"
                : "เลือกปี"
            }
            style={{ minWidth: 160 }}
          />
          <Select
            value={dateType}
            onChange={handleDateTypeChange}
            style={{ width: 120 }}
          >
            <Option value="day">วัน</Option>
            <Option value="month">เดือน</Option>
            <Option value="year">ปี</Option>
          </Select>
        </Space.Compact>
      </div>
    </Card>
  );

  const SummaryCard = ({ icon, title, value, suffix, gradient }) => (
    <Card
      style={{
        borderRadius: 16,
        background:
          gradient || "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 10px 20px rgba(2,6,23,0.04)",
        border: "1px solid #eef0f3",
        height: "100%",
      }}
      bodyStyle={{ padding: 18 }}
    >
      <div className="d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.6)",
            color: "#0f172a",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
            fontSize: 22,
          }}
        >
          {icon}
        </div>
        <div className="flex-grow-1">
          <div className="text-muted small">{title}</div>
          <Statistic
            value={value}
            suffix={suffix}
            valueStyle={{ fontSize: 22, lineHeight: "26px" }}
          />
        </div>
      </div>
    </Card>
  );

  const ChartCard = ({ title, children, extra }) => (
    <Card
      title={
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold">{title}</span>
          {extra}
        </div>
      }
      style={{
        borderRadius: 16,
        border: "1px solid #eef0f3",
        boxShadow: "0 10px 20px rgba(2,6,23,0.04)",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div
        style={{
          height: 360,
          background: "#fafafa",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </Card>
  );

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-center mb-4 mt-4">Dashboard</h1>

      {/* Filter bar */}
      <div className="mb-4">{FilterBar}</div>

      {/* Summary */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : (
            <SummaryCard
              icon={<BiPackage />}
              title={`จำนวนสินค้าที่รับเคลมต่อ${getTitleSuffix()}`}
              value={totalCount}
              gradient="linear-gradient(135deg,#EEF2FF 0%,#E0E7FF 100%)"
            />
          )}
        </Col>

        <Col xs={24} sm={8}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : (
            <SummaryCard
              icon={<BiBarChart />}
              title={`ประเภทสินค้าที่ถูกเคลมสูงสุดประจำ${getTitleSuffix()}`}
              value={`${topCategory.name}`}
              suffix={
                <Tag color="geekblue" style={{ marginLeft: 8 }}>
                  {topCategory.count} ชิ้น
                </Tag>
              }
              gradient="linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 100%)"
            />
          )}
        </Col>

        <Col xs={24} sm={8}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : (
            <SummaryCard
              icon={<BiUser />}
              title={`ลูกค้าที่ส่งเคลมมากที่สุดประจำ${getTitleSuffix()}`}
              value={`${topCustomer.name}`}
              suffix={
                <Tag color="green" style={{ marginLeft: 8 }}>
                  {topCustomer.count} รายการ
                </Tag>
              }
              gradient="linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 100%)"
            />
          )}
        </Col>
      </Row>

      {/* Product Top (full width) */}
      <Row className="mb-4">
        <Col span={24}>
          <ChartCard
            title={`จำนวนสินค้าที่เคลมสูงสุดประจำ${getTitleSuffix()}`}
            extra={
              <Tooltip title="รวมจำนวนครั้งที่พบสินค้าในงานเคลม">
                <InfoCircleOutlined style={{ color: "#94a3b8" }} />
              </Tooltip>
            }
          >
            {loading ? (
              <Spin />
            ) : productChart.options.xaxis.categories.length > 0 ? (
              <ApexCharts
                options={{
                  ...productChart.options,
                  chart: { ...productChart.options.chart, type: "line" },
                }}
                series={productChart.series}
                type="line"
                width="100%"
                height="100%"
              />
            ) : (
              <Empty description="ยังไม่มีข้อมูลในช่วงที่เลือก" />
            )}
          </ChartCard>
        </Col>
      </Row>

      {/* Category + Customer */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12}>
          <ChartCard
            title={`ประเภทสินค้าที่ถูกเคลมสูงสุดประจำ${getTitleSuffix()}`}
            extra={
              <Tooltip title="จำนวนงาน/ประเภท">
                <InfoCircleOutlined style={{ color: "#94a3b8" }} />
              </Tooltip>
            }
          >
            {loading ? (
              <Spin />
            ) : categoryChart.options.xaxis.categories.length > 0 ? (
              <ApexCharts
                options={{
                  ...categoryChart.options,
                  chart: { ...categoryChart.options.chart, type: "bar" },
                }}
                series={categoryChart.series}
                type="bar"
                width="100%"
                height="100%"
              />
            ) : (
              <Empty description="ยังไม่มีข้อมูลในช่วงที่เลือก" />
            )}
          </ChartCard>
        </Col>

        <Col xs={24} sm={12}>
          <ChartCard
            title={`ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำ${getTitleSuffix()}`}
            extra={
              <Tooltip title="จำนวนลูกค้า/รายชื่อ">
                <InfoCircleOutlined style={{ color: "#94a3b8" }} />
              </Tooltip>
            }
          >
            {loading ? (
              <Spin />
            ) : customerChart.options.xaxis.categories.length > 0 ? (
              <ApexCharts
                options={{
                  ...customerChart.options,
                  chart: { ...customerChart.options.chart, type: "bar" },
                }}
                series={customerChart.series}
                type="bar"
                width="100%"
                height="100%"
              />
            ) : (
              <Empty description="ยังไม่มีข้อมูลในช่วงที่เลือก" />
            )}
          </ChartCard>
        </Col>
      </Row>

      {/* Status Board */}
      <Card
        style={{
          borderRadius: 16,
          border: "1px solid #eef0f3",
          boxShadow: "0 10px 20px rgba(2,6,23,0.04)",
        }}
        bodyStyle={{ padding: 18 }}
      >
        <h3 className="text-center mb-3">{`สถานะงานประจำ${getTitleSuffix()}`}</h3>
        <Row gutter={[12, 12]} justify="center">
          {(loading ? statusIcons : statusCounts).map((item, idx) => (
            <Col
              key={idx}
              xs={12}
              sm={8}
              md={6}
              lg={6}
              xl={6}
              onClick={() => !loading && handleStatusClick(item.name)}
            >
              <div
                className="d-flex flex-column align-items-center text-center"
                style={{
                  border: "1px solid #eef0f3",
                  borderRadius: 14,
                  padding: 12,
                  height: 110,
                  transition: "transform .15s ease, box-shadow .15s ease",
                  cursor: loading ? "default" : "pointer",
                  background: "#ffffff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(2,6,23,0.06)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <span
                  className="mb-2"
                  style={{ fontSize: 24, color: "#0f172a" }}
                >
                  {item.icon}
                </span>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  {item.name}
                </div>
                <div className="fw-bold" style={{ fontSize: 22 }}>
                  {loading ? (
                    <Skeleton.Input style={{ width: 40 }} active />
                  ) : (
                    item.count
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="mt-4 text-center">
          <Button
            type="primary"
            style={{
              backgroundColor: "#213f66",
              width: 200,
              height: 40,
              borderRadius: 10,
            }}
            onClick={handletoJob}
          >
            ไปที่หน้างาน
          </Button>
        </div>
      </Card>
    </div>
  );
}



// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Button,
//   DatePicker,
//   Select,
//   Space,
//   Row,
//   Col,
//   Card,
//   Statistic,
//   Tooltip,
//   Skeleton,
//   Empty,
//   Spin,
//   Tag,
// } from "antd";
// import { InfoCircleOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
// import weekOfYear from "dayjs/plugin/weekOfYear";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";
// import ApexCharts from "react-apexcharts";
// import axios from "axios";

// // icons
// import { BiFilterAlt, BiBarChart, BiUser, BiPackage } from "react-icons/bi";
// import { MdBorderColor } from "react-icons/md";
// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
//   FaTruckLoading,
// } from "react-icons/fa";
// import { TbBasketCancel } from "react-icons/tb";

// import { useNavigate } from "react-router-dom";

// dayjs.extend(isSameOrBefore);
// dayjs.extend(weekOfYear);
// dayjs.extend(customParseFormat);
// dayjs.locale("th");

// const { Option } = Select;

// export default function Dashboard() {
//   // -------------------- State --------------------
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [totalCount, setTotalCount] = useState(0);
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
//   const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });

//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());

//   const [statusCounts, setStatusCounts] = useState([]);

//   const statusIcons = useMemo(
//     () => [
//       { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
//       { name: "สั่งอะไหล่", icon: <MdBorderColor /> },
//       { name: "เริ่มการซ่อม", icon: <MdBorderColor /> },
//       { name: "ซ่อมสำเร็จ", icon: <FaTools /> },
//       { name: "รอทดสอบ", icon: <FaFileAlt /> },
//       { name: "รอจัดส่ง", icon: <FaTruck /> },
//       { name: "จัดส่งสำเร็จ", icon: <FaTruckLoading /> },
//       { name: "ปิดงาน", icon: <FaCheck /> },
//       { name: "ยกเลิกการเคลมสินค้า", icon: <TbBasketCancel /> },
//     ],
//     []
//   );

//   // -------------------- Chart Options Template --------------------
//   const baseChart = useMemo(
//     () => ({
//       chart: { toolbar: { show: false }, fontFamily: "inherit" },
//       xaxis: { categories: [], labels: { style: { fontSize: "12px" } } },
//       yaxis: {
//         labels: { style: { fontSize: "12px" } },
//         forceNiceScale: true,
//       },
//       grid: { borderColor: "#f0f0f0" },
//       dataLabels: { enabled: false },
//       tooltip: {
//         theme: "light",
//         style: { fontSize: "12px" },
//       },
//       legend: {
//         show: true,
//         position: "top",
//         horizontalAlign: "right",
//         markers: { radius: 12 },
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 8,
//           columnWidth: "45%",
//         },
//       },
//       stroke: { width: 3, curve: "smooth" },
//     }),
//     []
//   );

//   const [categoryChart, setCategoryChart] = useState({
//     options: { ...baseChart, colors: ["#6366F1"] },
//     series: [{ name: "จำนวน (ครั้ง)", data: [] }],
//   });
//   const [customerChart, setCustomerChart] = useState({
//     options: { ...baseChart, colors: ["#22C55E"] },
//     series: [{ name: "จำนวนลูกค้า", data: [] }],
//   });
//   const [productChart, setProductChart] = useState({
//     options: { ...baseChart, colors: ["#F59E0B"] },
//     series: [{ name: "จำนวนสินค้า", data: [] }],
//   });

//   // -------------------- Helpers --------------------
//   const getTitleSuffix = () => {
//     switch (dateType) {
//       case "month":
//         return "เดือน";
//       case "year":
//         return "ปี";
//       case "day":
//       default:
//         return "วัน";
//     }
//   };

//   const disableDatePass = (current) => {
//     if (!current) return false;
//     switch (dateType) {
//       case "day":
//         return current.isAfter(dayjs(), "day");
//       case "month":
//         return current.isAfter(dayjs(), "month");
//       case "year":
//         return current.isAfter(dayjs(), "year");
//       default:
//         return false;
//     }
//   };

//   // -------------------- Data Fetch --------------------
//   const getData = async () => {
//     setLoading(true);
//     try {
//       const url = "http://localhost:3302/get-dashboard";
//       const response = await axios.get(url);
//       setData(response.data || []);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------- Compute --------------------
//   const filterAndCount = () => {
//     if (!data?.length) {
//       setTotalCount(0);
//       setTopCategory({ name: "-", count: 0 });
//       setTopCustomer({ name: "-", count: 0 });
//       setCategoryChart((p) => ({
//         ...p,
//         options: { ...p.options, xaxis: { categories: [] } },
//         series: [{ ...p.series[0], data: [] }],
//       }));
//       setCustomerChart((p) => ({
//         ...p,
//         options: { ...p.options, xaxis: { categories: [] } },
//         series: [{ ...p.series[0], data: [] }],
//       }));
//       setProductChart((p) => ({
//         ...p,
//         options: { ...p.options, xaxis: { categories: [] } },
//         series: [{ ...p.series[0], data: [] }],
//       }));
//       setStatusCounts(
//         statusIcons.map((s) => ({
//           ...s,
//           count: 0,
//         }))
//       );
//       return;
//     }

//     // 1) Filter by selected granular date
//     const filtered = data.filter((item) =>
//       dayjs(item.createAt).isSame(selectedDate, dateType)
//     );

//     // Keep latest record per jobRef (by updateAt)
//     const latestJobByRef = new Map();
//     filtered.forEach((item) => {
//       const exist = latestJobByRef.get(item.jobRef);
//       if (!exist || dayjs(item.updateAt).isAfter(dayjs(exist.updateAt))) {
//         latestJobByRef.set(item.jobRef, item);
//       }
//     });

//     // Count
//     const categoryCount = {};
//     const customerCount = {};
//     const productCount = {};
//     let totalUnits = 0;

//     latestJobByRef.forEach((item) => {
//       totalUnits += item.unit || 0;
//       categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
//       customerCount[item.username] = (customerCount[item.username] || 0) + 1;
//       productCount[item.sku] =
//         (productCount[item.sku] || 0) + 1;
//     });

//     setTotalCount(totalUnits);

//     // Top category
//     const topCat = Object.entries(categoryCount).reduce(
//       (acc, [k, v]) => (v > acc.count ? { name: k, count: v } : acc),
//       { name: "-", count: 0 }
//     );
//     setTopCategory(topCat);

//     // Top customer
//     const topCus = Object.entries(customerCount).reduce(
//       (acc, [k, v]) => (v > acc.count ? { name: k, count: v } : acc),
//       { name: "-", count: 0 }
//     );
//     setTopCustomer(topCus);

//     // Update charts
//     setCategoryChart((prev) => ({
//       ...prev,
//       options: {
//         ...prev.options,
//         xaxis: { categories: Object.keys(categoryCount) },
//       },
//       series: [{ ...prev.series[0], data: Object.values(categoryCount) }],
//     }));
//     setCustomerChart((prev) => ({
//       ...prev,
//       options: {
//         ...prev.options,
//         xaxis: { categories: Object.keys(customerCount) },
//       },
//       series: [{ ...prev.series[0], data: Object.values(customerCount) }],
//     }));
//     setProductChart((prev) => ({
//       ...prev,
//       options: {
//         ...prev.options,
//         xaxis: { categories: Object.keys(productCount) },
//       },
//       series: [{ ...prev.series[0], data: Object.values(productCount) }],
//     }));

//     // 2) Status as-of selected date (latest record up to that date)
//     const latestAsOf = new Map();
//     data.forEach((item) => {
//       const upd = dayjs(item.updateAt);
//       if (upd.isSameOrBefore(selectedDate, "day")) {
//         const exist = latestAsOf.get(item.jobRef);
//         if (!exist || upd.isAfter(dayjs(exist.updateAt))) {
//           latestAsOf.set(item.jobRef, item);
//         }
//       }
//     });

//     const statusCountMap = {};
//     latestAsOf.forEach((item) => {
//       statusCountMap[item.jobStatus] =
//         (statusCountMap[item.jobStatus] || 0) + 1;
//     });

//     setStatusCounts(
//       statusIcons.map((s) => ({
//         ...s,
//         count: statusCountMap[s.name] || 0,
//       }))
//     );
//   };

//   // -------------------- Effects --------------------
//   useEffect(() => {
//     getData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     filterAndCount();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [data, selectedDate, dateType]);

//   // -------------------- Handlers --------------------
//   const handleDateChange = (value) => setSelectedDate(value);
//   const handleDateTypeChange = (value) => setDateType(value);

//   const navigate = useNavigate();
//   const handletoJob = () => navigate("/Job");
//   const handleStatusClick = (name) => navigate(`/jobs-by-status/${name}`);

//   // -------------------- UI --------------------
//   const FilterBar = (
//     <Card
//       size="small"
//       style={{
//         borderRadius: 14,
//         border: "1px solid #eef0f3",
//         boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
//       }}
//       bodyStyle={{ padding: 16 }}
//     >
//       <div
//         className="d-flex justify-content-between align-items-center flex-wrap gap-2"
//         style={{ rowGap: 12 }}
//       >
//         <div className="d-flex align-items-center gap-2">
//           <BiFilterAlt size={20} className="text-primary" />
//           <span className="fw-semibold">ตัวกรอง</span>
//           <Tooltip title="เลือกช่วงเวลาในการสรุปและแสดงผลข้อมูล">
//             <InfoCircleOutlined style={{ color: "#94a3b8", marginLeft: 6 }} />
//           </Tooltip>
//         </div>

//         <Space.Compact>
//           <DatePicker
//             disabledDate={disableDatePass}
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format={
//               dateType === "day"
//                 ? "DD MMM YYYY"
//                 : dateType === "month"
//                 ? "MMM YYYY"
//                 : "YYYY"
//             }
//             placeholder={
//               dateType === "day"
//                 ? "เลือกวันที่"
//                 : dateType === "month"
//                 ? "เลือกเดือน"
//                 : "เลือกปี"
//             }
//             style={{ minWidth: 160 }}
//           />
//           <Select
//             value={dateType}
//             onChange={handleDateTypeChange}
//             style={{ width: 120 }}
//           >
//             <Option value="day">วัน</Option>
//             <Option value="month">เดือน</Option>
//             <Option value="year">ปี</Option>
//           </Select>
//         </Space.Compact>
//       </div>
//     </Card>
//   );

//   const SummaryCard = ({ icon, title, value, suffix, gradient }) => (
//     <Card
//       style={{
//         borderRadius: 16,
//         background:
//           gradient || "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
//         boxShadow: "0 10px 20px rgba(2,6,23,0.04)",
//         border: "1px solid #eef0f3",
//         height: "100%",
//       }}
//       bodyStyle={{ padding: 18 }}
//     >
//       <div className="d-flex align-items-center gap-3">
//         <div
//           className="d-flex align-items-center justify-content-center"
//           style={{
//             width: 48,
//             height: 48,
//             borderRadius: 12,
//             backgroundColor: "rgba(255,255,255,0.6)",
//             color: "#0f172a",
//             boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
//             fontSize: 22,
//           }}
//         >
//           {icon}
//         </div>
//         <div className="flex-grow-1">
//           <div className="text-muted small">{title}</div>
//           <Statistic
//             value={value}
//             suffix={suffix}
//             valueStyle={{ fontSize: 22, lineHeight: "26px" }}
//           />
//         </div>
//       </div>
//     </Card>
//   );

//   const ChartCard = ({ title, children, extra }) => (
//     <Card
//       title={
//         <div className="d-flex align-items-center gap-2">
//           <span className="fw-semibold">{title}</span>
//           {extra}
//         </div>
//       }
//       style={{
//         borderRadius: 16,
//         border: "1px solid #eef0f3",
//         boxShadow: "0 10px 20px rgba(2,6,23,0.04)",
//       }}
//       bodyStyle={{ padding: 16 }}
//     >
//       <div
//         style={{
//           height: 360,
//           background: "#fafafa",
//           borderRadius: 12,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           overflow: "hidden",
//         }}
//       >
//         {children}
//       </div>
//     </Card>
//   );

//   return (
//     <div style={{ padding: 20 }}>
//       <h1 className="text-center mb-4 mt-4">Dashboard</h1>

//       {/* Filter bar */}
//       <div className="mb-4">{FilterBar}</div>

//       {/* Summary */}
//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           {loading ? (
//             <Skeleton active paragraph={{ rows: 2 }} />
//           ) : (
//             <SummaryCard
//               icon={<BiPackage />}
//               title={`จำนวนสินค้าที่รับเคลมต่อ${getTitleSuffix()}`}
//               value={totalCount}
//               gradient="linear-gradient(135deg,#EEF2FF 0%,#E0E7FF 100%)"
//             />
//           )}
//         </Col>

//         <Col xs={24} sm={8}>
//           {loading ? (
//             <Skeleton active paragraph={{ rows: 2 }} />
//           ) : (
//             <SummaryCard
//               icon={<BiBarChart />}
//               title={`ประเภทสินค้าที่ถูกเคลมสูงสุดประจำ${getTitleSuffix()}`}
//               value={`${topCategory.name}`}
//               suffix={
//                 <Tag color="geekblue" style={{ marginLeft: 8 }}>
//                   {topCategory.count} ชิ้น
//                 </Tag>
//               }
//               gradient="linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 100%)"
//             />
//           )}
//         </Col>

//         <Col xs={24} sm={8}>
//           {loading ? (
//             <Skeleton active paragraph={{ rows: 2 }} />
//           ) : (
//             <SummaryCard
//               icon={<BiUser />}
//               title={`ลูกค้าที่ส่งเคลมมากที่สุดประจำ${getTitleSuffix()}`}
//               value={`${topCustomer.name}`}
//               suffix={
//                 <Tag color="green" style={{ marginLeft: 8 }}>
//                   {topCustomer.count} รายการ
//                 </Tag>
//               }
//               gradient="linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 100%)"
//             />
//           )}
//         </Col>
//       </Row>

//       {/* Product Top (full width) */}
//       <Row className="mb-4">
//         <Col span={24}>
//           <ChartCard
//             title={`จำนวนสินค้าที่เคลมสูงสุดประจำ${getTitleSuffix()}`}
//             extra={
//               <Tooltip title="รวมจำนวนครั้งที่พบสินค้าในงานเคลม">
//                 <InfoCircleOutlined style={{ color: "#94a3b8" }} />
//               </Tooltip>
//             }
//           >
//             {loading ? (
//               <Spin />
//             ) : productChart.options.xaxis.categories.length > 0 ? (
//               <ApexCharts
//                 options={{
//                   ...productChart.options,
//                   chart: { ...productChart.options.chart, type: "line" },
//                 }}
//                 series={productChart.series}
//                 type="line"
//                 width="100%"
//                 height="100%"
//               />
//             ) : (
//               <Empty description="ยังไม่มีข้อมูลในช่วงที่เลือก" />
//             )}
//           </ChartCard>
//         </Col>
//       </Row>

//       {/* Category + Customer */}
//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={12}>
//           <ChartCard
//             title={`ประเภทสินค้าที่ถูกเคลมสูงสุดประจำ${getTitleSuffix()}`}
//             extra={
//               <Tooltip title="จำนวนงาน/ประเภท">
//                 <InfoCircleOutlined style={{ color: "#94a3b8" }} />
//               </Tooltip>
//             }
//           >
//             {loading ? (
//               <Spin />
//             ) : categoryChart.options.xaxis.categories.length > 0 ? (
//               <ApexCharts
//                 options={{
//                   ...categoryChart.options,
//                   chart: { ...categoryChart.options.chart, type: "bar" },
//                 }}
//                 series={categoryChart.series}
//                 type="bar"
//                 width="100%"
//                 height="100%"
//               />
//             ) : (
//               <Empty description="ยังไม่มีข้อมูลในช่วงที่เลือก" />
//             )}
//           </ChartCard>
//         </Col>

//         <Col xs={24} sm={12}>
//           <ChartCard
//             title={`ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำ${getTitleSuffix()}`}
//             extra={
//               <Tooltip title="จำนวนลูกค้า/รายชื่อ">
//                 <InfoCircleOutlined style={{ color: "#94a3b8" }} />
//               </Tooltip>
//             }
//           >
//             {loading ? (
//               <Spin />
//             ) : customerChart.options.xaxis.categories.length > 0 ? (
//               <ApexCharts
//                 options={{
//                   ...customerChart.options,
//                   chart: { ...customerChart.options.chart, type: "bar" },
//                 }}
//                 series={customerChart.series}
//                 type="bar"
//                 width="100%"
//                 height="100%"
//               />
//             ) : (
//               <Empty description="ยังไม่มีข้อมูลในช่วงที่เลือก" />
//             )}
//           </ChartCard>
//         </Col>
//       </Row>

//       {/* Status Board */}
//       <Card
//         style={{
//           borderRadius: 16,
//           border: "1px solid #eef0f3",
//           boxShadow: "0 10px 20px rgba(2,6,23,0.04)",
//         }}
//         bodyStyle={{ padding: 18 }}
//       >
//         <h3 className="text-center mb-3">{`สถานะงานประจำ${getTitleSuffix()}`}</h3>
//         <Row gutter={[12, 12]} justify="center">
//           {(loading ? statusIcons : statusCounts).map((item, idx) => (
//             <Col
//               key={idx}
//               xs={12}
//               sm={8}
//               md={6}
//               lg={6}
//               xl={6}
//               onClick={() => !loading && handleStatusClick(item.name)}
//             >
//               <div
//                 className="d-flex flex-column align-items-center text-center"
//                 style={{
//                   border: "1px solid #eef0f3",
//                   borderRadius: 14,
//                   padding: 12,
//                   height: 110,
//                   transition: "transform .15s ease, box-shadow .15s ease",
//                   cursor: loading ? "default" : "pointer",
//                   background: "#ffffff",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.boxShadow =
//                     "0 10px 20px rgba(2,6,23,0.06)";
//                   e.currentTarget.style.transform = "translateY(-2px)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.boxShadow = "none";
//                   e.currentTarget.style.transform = "none";
//                 }}
//               >
//                 <span
//                   className="mb-2"
//                   style={{ fontSize: 24, color: "#0f172a" }}
//                 >
//                   {item.icon}
//                 </span>
//                 <div className="text-muted" style={{ fontSize: 13 }}>
//                   {item.name}
//                 </div>
//                 <div className="fw-bold" style={{ fontSize: 22 }}>
//                   {loading ? (
//                     <Skeleton.Input style={{ width: 40 }} active />
//                   ) : (
//                     item.count
//                   )}
//                 </div>
//               </div>
//             </Col>
//           ))}
//         </Row>

//         <div className="mt-4 text-center">
//           <Button
//             type="primary"
//             style={{
//               backgroundColor: "#213f66",
//               width: 200,
//               height: 40,
//               borderRadius: 10,
//             }}
//             onClick={handletoJob}
//           >
//             ไปที่หน้างาน
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// }




// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
// } from "react-bootstrap";
// import DatePicker from "antd/es/date-picker";
// import Select from "antd/es/select";
// import ApexCharts from "react-apexcharts";
// import dayjs from "dayjs";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import weekOfYear from "dayjs/plugin/weekOfYear";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import locale from "antd/es/date-picker/locale/th_TH";
// import axios from "axios";
// import {
//   BiFilterAlt,
//   BiBarChart,
//   BiUser,
//   BiPackage,
// } from "react-icons/bi";
// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
//   FaTruckLoading,
// } from "react-icons/fa";
// import { MdBorderColor } from "react-icons/md";
// import { TbBasketCancel } from "react-icons/tb";
// import { useNavigate } from "react-router-dom";

// dayjs.extend(isSameOrBefore);
// dayjs.extend(weekOfYear);
// dayjs.extend(customParseFormat);
// dayjs.locale("th");

// const { Option } = Select;

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
//   const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });
//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [statusCounts, setStatusCounts] = useState([]);

//   const navigate = useNavigate();

//   const statusIcons = [
//     { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
//     { name: "สั่งอะไหล่", icon: <MdBorderColor /> },
//     { name: "ซ่อมสำเร็จ", icon: <FaTools /> },
//     { name: "รอทดสอบ", icon: <FaFileAlt /> },
//     { name: "รอจัดส่ง", icon: <FaTruck /> },
//     { name: "จัดส่งสำเร็จ", icon: <FaTruckLoading /> },
//     { name: "ปิดงาน", icon: <FaCheck /> },
//     { name: "ยกเลิกการเคลมสินค้า", icon: <TbBasketCancel /> },
//   ];

//   const [chartOptions, setChartOptions] = useState({
//     options: {
//       chart: { id: "basic-bar", toolbar: { show: false } },
//       xaxis: { categories: [] },
//       plotOptions: { bar: { borderRadius: 5 } },
//       colors: ["#4F46E5"],
//     },
//     series: [{ name: "หน่วย (Unit)", data: [] }],
//   });

//   const [customerChartOptions, setCustomerChartOptions] = useState({
//     options: {
//       chart: { toolbar: { show: false } },
//       xaxis: { categories: [] },
//       plotOptions: { bar: { borderRadius: 5 } },
//       colors: ["#22C55E"],
//     },
//     series: [{ name: "จำนวนลูกค้า", data: [] }],
//   });

//   const [productChartOptions, setProductChartOptions] = useState({
//     options: {
//       chart: { toolbar: { show: false } },
//       xaxis: { categories: [] },
//       plotOptions: { bar: { borderRadius: 5 } },
//       colors: ["#EC9838FF"],
//     },
//     series: [{ name: "จำนวนสินค้า", data: [] }],
//   });

//   useEffect(() => {
//     getData();
//   }, []);

//   useEffect(() => {
//     if (data.length > 0) {
//       filterAndCount();
//     }
//   }, [data, selectedDate, dateType]);

//   const getData = async () => {
//     try {
//       const res = await axios.get("http://localhost:3302/get-dashboard");
//       setData(res.data);
//     } catch (err) {
//       console.error("Error:", err);
//     }
//   };

//   const filterAndCount = () => {
//     const dailyFiltered = data.filter((item) =>
//       dayjs(item.createAt).isSame(selectedDate, dateType)
//     );

//     const latestJobsMap = new Map();
//     dailyFiltered.forEach((item) => {
//       const existing = latestJobsMap.get(item.jobRef);
//       if (!existing || dayjs(item.updateAt).isAfter(dayjs(existing.updateAt))) {
//         latestJobsMap.set(item.jobRef, item);
//       }
//     });

//     const categoryCount = {};
//     const customerCount = {};
//     const productCount = {};
//     let totalUnits = 0;

//     latestJobsMap.forEach((item) => {
//       totalUnits += item.unit || 0;
//       categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
//       customerCount[item.username] = (customerCount[item.username] || 0) + 1;
//       productCount[item.sku] =
//         (productCount[item.sku] || 0) + 1;
//     });

//     setTotalCount(totalUnits);

//     const topCat = Object.entries(categoryCount).reduce(
//       (a, b) => (b[1] > a[1] ? { name: b[0], count: b[1] } : a),
//       { name: "-", count: 0 }
//     );
//     const topCus = Object.entries(customerCount).reduce(
//       (a, b) => (b[1] > a[1] ? { name: b[0], count: b[1] } : a),
//       { name: "-", count: 0 }
//     );

//     setTopCategory(topCat);
//     setTopCustomer(topCus);

//     setChartOptions((prev) => ({
//       ...prev,
//       options: { ...prev.options, xaxis: { categories: Object.keys(categoryCount) } },
//       series: [{ ...prev.series[0], data: Object.values(categoryCount) }],
//     }));

//     setCustomerChartOptions((prev) => ({
//       ...prev,
//       options: { ...prev.options, xaxis: { categories: Object.keys(customerCount) } },
//       series: [{ ...prev.series[0], data: Object.values(customerCount) }],
//     }));

//     setProductChartOptions((prev) => ({
//       ...prev,
//       options: { ...prev.options, xaxis: { categories: Object.keys(productCount) } },
//       series: [{ ...prev.series[0], data: Object.values(productCount) }],
//     }));

//     const jobStatusMap = new Map();
//     data.forEach((item) => {
//       const updated = dayjs(item.updateAt);
//       if (updated.isSameOrBefore(selectedDate)) {
//         const existing = jobStatusMap.get(item.jobRef);
//         if (!existing || updated.isAfter(dayjs(existing.updateAt))) {
//           jobStatusMap.set(item.jobRef, item);
//         }
//       }
//     });

//     const statusCount = {};
//     jobStatusMap.forEach((item) => {
//       statusCount[item.jobStatus] = (statusCount[item.jobStatus] || 0) + 1;
//     });

//     const updatedStatusCounts = statusIcons.map((s) => ({
//       ...s,
//       count: statusCount[s.name] || 0,
//     }));
//     setStatusCounts(updatedStatusCounts);
//   };

//   const getTitleSuffix = () =>
//     dateType === "month" ? "เดือน" : dateType === "year" ? "ปี" : "วัน";

//   return (
//     <Container fluid className="py-4">
//       <h2 className="mb-4 text-center">📊 Dashboard</h2>

//       <div className="d-flex justify-content-end mb-4 gap-2">
//         <DatePicker
//           locale={locale}
//           value={selectedDate}
//           onChange={(val) => setSelectedDate(val)}
//           format="DD MMM YYYY"
//           picker={dateType}
//         />
//         <Select
//           value={dateType}
//           onChange={setDateType}
//           style={{ width: 100 }}
//         >
//           <Option value="day">วัน</Option>
//           <Option value="month">เดือน</Option>
//           <Option value="year">ปี</Option>
//         </Select>
//       </div>

//       <Row className="mb-4">
//         <Col md={4}>
//           <Card className="shadow-sm">
//             <Card.Body>
//               <Card.Title><BiPackage /> จำนวน Unit รวม</Card.Title>
//               <Card.Text className="display-6 fw-bold text-primary">
//                 {totalCount}
//               </Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="shadow-sm">
//             <Card.Body>
//               <Card.Title><BiBarChart /> หมวดหมู่ยอดนิยม</Card.Title>
//               <Card.Text className="fs-4">{topCategory.name} ({topCategory.count})</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="shadow-sm">
//             <Card.Body>
//               <Card.Title><BiUser /> ลูกค้ายอดนิยม</Card.Title>
//               <Card.Text className="fs-4">{topCustomer.name} ({topCustomer.count})</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Row className="mb-4">
//         <Col md={6}>
//           <Card className="shadow-sm">
//             <Card.Body>
//               <Card.Title>📈 จำนวนหมวดหมู่ ({getTitleSuffix()})</Card.Title>
//               <ApexCharts
//                 options={chartOptions.options}
//                 series={chartOptions.series}
//                 type="bar"
//                 height={300}
//               />
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={6}>
//           <Card className="shadow-sm">
//             <Card.Body>
//               <Card.Title>🧍 ลูกค้า ({getTitleSuffix()})</Card.Title>
//               <ApexCharts
//                 options={customerChartOptions.options}
//                 series={customerChartOptions.series}
//                 type="bar"
//                 height={300}
//               />
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Row className="mb-4">
//         <Col>
//           <Card className="shadow-sm">
//             <Card.Body>
//               <Card.Title>🛍️ สินค้า ({getTitleSuffix()})</Card.Title>
//               <ApexCharts
//                 options={productChartOptions.options}
//                 series={productChartOptions.series}
//                 type="bar"
//                 height={300}
//               />
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Row xs={1} md={4} className="g-3">
//         {statusCounts.map((status, index) => (
//           <Col key={index}>
//             <Card className="shadow-sm h-100" style={{ cursor: "pointer" }} onClick={() => navigate("/JobTable")}>
//               <Card.Body className="text-center">
//                 <div className="fs-2 mb-2 text-secondary">{status.icon}</div>
//                 <Card.Title className="fs-6">{status.name}</Card.Title>
//                 <Card.Text className="fw-bold text-dark">{status.count}</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </Container>
//   );
// }







// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   DatePicker,
//   Select,
//   Space,
//   Dropdown,
//   Row,
//   Col,
//   Card,
// } from "antd";
// import dayjs from "dayjs";
// import weekOfYear from "dayjs/plugin/weekOfYear";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import ApexCharts from "react-apexcharts";
// import { BiFilterAlt, BiBarChart, BiUser, BiPackage } from "react-icons/bi";
// import { MdBorderColor } from "react-icons/md";
// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
//   FaTruckLoading,
// } from "react-icons/fa";
// import { TbBasketCancel } from "react-icons/tb";
// import axios from "axios";
// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";
// import { useNavigate, useParams } from "react-router-dom";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// // import mockData2 from "./mockData2";
// dayjs.extend(isSameOrBefore);
// dayjs.extend(weekOfYear);
// dayjs.extend(customParseFormat);
// dayjs.locale("th");

// const { Option } = Select;

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
//   const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });
//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [statusCounts, setStatusCounts] = useState([]);

//   const statusIcons = [
//     { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
//     { name: "สั่งอะไหล่", icon: <MdBorderColor /> },
//     { name: "ซ่อมสำเร็จ", icon: <FaTools /> },
//     { name: "รอทดสอบ", icon: <FaFileAlt /> },
//     { name: "รอจัดส่ง", icon: <FaTruck /> },
//     { name: "จัดส่งสำเร็จ", icon: <FaTruckLoading /> },
//     { name: "ปิดงาน", icon: <FaCheck /> },
//     { name: "ยกเลิกการเคลมสินค้า", icon: <TbBasketCancel /> },
//   ];

//   const [chartOptions, setChartOptions] = useState({
//     options: {
//       chart: {
//         id: "basic-bar",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [],
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#4F46E5"],
//     },
//     series: [
//       {
//         name: "หน่วย (Unit)",
//         data: [],
//       },
//     ],
//   });

//   const [customerChartOptions, setCustomerChartOptions] = useState({
//     options: {
//       chart: {
//         id: "customer-bar-chart",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [],
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#22C55E"],
//     },
//     series: [
//       {
//         name: "จำนวนลูกค้า",
//         data: [],
//       },
//     ],
//   });

//   const [productrChartOptions, setProductChartOptions] = useState({
//     options: {
//       chart: {
//         id: "product-bar-chart",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [],
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#EC9838FF"],
//     },
//     series: [
//       {
//         name: "จำนวนสินค้า",
//         data: [],
//       },
//     ],
//   });

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-dashboard";
//       const response = await axios.get(url);
//       setData(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const getTitleSuffix = () => {
//     switch (dateType) {
//       case "month":
//         return "เดือน";
//       case "year":
//         return "ปี";
//       case "day":
//       default:
//         return "วัน";
//     }
//   };

//   // const getData = async () => {
//   //   try {
//   //     // const url = "http://localhost:3302/get-dashboard";
//   //     // const response = await axios.get(url);
//   //     setData(mockData2);
//   //     console.log(mockData2);
//   //   } catch (error) {
//   //     console.error("Error fetching data:", error);
//   //   }
//   // };

//   const filterAndCount = () => {
//     // 1. ส่วนสำหรับคำนวณข้อมูลรายวัน: totalUnits, topCategory, topCustomer และข้อมูลสำหรับกราฟ
//     const dailyFiltered = data.filter((item) => {
//       const itemDate = dayjs(item.createAt);
//       return itemDate.isSame(selectedDate, dateType);
//     });

//     const dailyJobsMap = new Map();
//     dailyFiltered.forEach((item) => {
//       const existingJob = dailyJobsMap.get(item.jobRef);
//       if (
//         !existingJob ||
//         dayjs(item.updateAt).isAfter(dayjs(existingJob.updateAt))
//       ) {
//         dailyJobsMap.set(item.jobRef, item);
//       }
//     });

//     const categoryCount = {};
//     const customerCount = {};
//     const productCount = {};
//     let totalUnits = 0;

//     dailyJobsMap.forEach((item) => {
//       totalUnits += item.unit || 0;
//       const cat = item.category;
//       categoryCount[cat] = (categoryCount[cat] || 0) + 1;
//       const cus = item.username;
//       customerCount[cus] = (customerCount[cus] || 0) + 1;
//       const prod = item.sku;
//       productCount[prod] = (productCount[prod] || 0) + 1;
//     });

//     setTotalCount(totalUnits);
//     let topCat = { name: "-", count: 0 };
//     for (const [cat, count] of Object.entries(categoryCount)) {
//       if (count > topCat.count) {
//         topCat = { name: cat, count };
//       }
//     }
//     setTopCategory(topCat);

//     let topcus = { name: "-", count: 0 };
//     for (const [cus, count] of Object.entries(customerCount)) {
//       if (count > topcus.count) {
//         topcus = { name: cus, count };
//       }
//     }
//     setTopCustomer(topcus);

//     // อัปเดตกราฟประเภทสินค้า
//     const claimCategories = Object.keys(categoryCount);
//     const unit = Object.values(categoryCount);
//     setChartOptions((prevState) => ({
//       ...prevState,
//       options: {
//         ...prevState.options,
//         xaxis: {
//           categories: claimCategories,
//         },
//       },
//       series: [
//         {
//           ...prevState.series[0],
//           data: unit,
//         },
//       ],
//     }));

//     // อัปเดตกราฟลูกค้า
//     const customerNames = Object.keys(customerCount);
//     const customerCounts = Object.values(customerCount);
//     setCustomerChartOptions((prevState) => ({
//       ...prevState,
//       options: {
//         ...prevState.options,
//         xaxis: {
//           categories: customerNames,
//         },
//       },
//       series: [
//         {
//           ...prevState.series[0],
//           data: customerCounts,
//         },
//       ],
//     }));

//     // อัปเดตกราฟจำนวนสินค้าที่เคลม
//     const productCountNames = Object.keys(productCount);
//     const productCounts = Object.values(productCount);
//     setProductChartOptions((prevState) => ({
//       ...prevState,
//       options: {
//         ...prevState.options,
//         xaxis: {
//           categories: productCountNames,
//         },
//       },
//       series: [
//         {
//           ...prevState.series[0],
//           data: productCounts,
//         },
//       ],
//     }));

//     // 2. ส่วนสำหรับคำนวณสถานะงาน: statusCounts
//     const jobsAsOfSelectedDate = new Map();
//     data.forEach((item) => {
//       const itemUpdateDate = dayjs(item.updateAt);
//       if (itemUpdateDate.isSameOrBefore(selectedDate, "day")) {
//         const existingJob = jobsAsOfSelectedDate.get(item.jobRef);
//         if (
//           !existingJob ||
//           itemUpdateDate.isAfter(dayjs(existingJob.updateAt))
//         ) {
//           jobsAsOfSelectedDate.set(item.jobRef, item);
//         }
//       }
//     });

//     const statusCountMap = {};
//     jobsAsOfSelectedDate.forEach((item) => {
//       const status = item.jobStatus;
//       statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//     });

//     const updatedStatusCounts = statusIcons.map((item) => {
//       const count = statusCountMap[item.name] || 0;
//       return { ...item, count };
//     });
//     setStatusCounts(updatedStatusCounts);
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   useEffect(() => {
//     if (data.length > 0) {
//       filterAndCount();
//     }
//   }, [data, selectedDate, dateType]);

//   const handleDateChange = (value) => {
//     setSelectedDate(value);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             disabledDate={disableDatePass}
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker
//             disabledDate={disableDatePass}
//             locale={locale}
//             picker="month"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker
//             disabledDate={disableDatePass}
//             locale={locale}
//             picker="year"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const disableDatePass = (current) => {
//     if (!current) {
//       return false;
//     }

//     switch (dateType) {
//       case "day":
//         return current.isAfter(dayjs(), "day");
//       case "month":
//         return current.isAfter(dayjs(), "month");
//       case "year":
//         return current.isAfter(dayjs(), "year");
//       default:
//         return false;
//     }
//   };

//   const navigate = useNavigate();

//   const handletoJob = () => {
//     navigate("/Job");
//   };

//   const handleStatusClick = (record) => {
//     navigate(`/jobs-by-status/${record}`);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1 className="text-center mb-5 mt-5">Dashboard</h1>
//       <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-4">
//         <Space.Compact>
//           {renderDatePicker()}
//           <Select
//             value={dateType}
//             onChange={handleDateTypeChange}
//             style={{ width: "100px" }}
//           >
//             <Option value="day">วัน</Option>
//             <Option value="month">เดือน</Option>
//             <Option value="year">ปี</Option>
//           </Select>
//         </Space.Compact>
//       </div>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiPackage />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">{totalCount}</h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   จำนวนสินค้าที่รับเคลมต่อ{getTitleSuffix()}
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiBarChart />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCategory.name}, {topCategory.count} ชิ้น
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ประเภทสินค้าที่ถูกเคลมสูงสุดประจำ{getTitleSuffix()}
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiUser />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCustomer.name}, {topCustomer.count} รายการ
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำ{getTitleSuffix()}
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Row className="mb-4">
//         <Col >
//           <Card
//             style={{
//               minHeight: '500px',  // สูงขึ้นกว่าเดิม
//               maxHeight: '80vh',   // สูงสุดไม่เกิน 80% ของความสูงหน้าจอ
//               overflow: 'auto',    // เผื่อเกิด scroll เมื่อเนื้อหามาก
//             }}>
//             <h3 className="mb-3">
//               จำนวนสินค้าที่เคลมสูงสุดประจำ{getTitleSuffix()}
//             </h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "300px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {productrChartOptions.options.xaxis.categories.length > 0 ? (
//                 <ApexCharts
//                   options={productrChartOptions.options}
//                   series={productrChartOptions.series}
//                   type="line"
//                   width="100%"
//                   height="100%"
//                 />
//               ) : (
//                 <div className="flex justify-center items-center h-full">
//                   <p>กำลังโหลดข้อมูล...</p>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Row gutter={[16, 16]} className="mb-4">

//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">
//               ประเภทสินค้าที่ถูกเคลมสูงสุดประจำ{getTitleSuffix()}
//             </h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "300px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {chartOptions.options.xaxis.categories.length > 0 ? (
//                 <ApexCharts
//                   options={chartOptions.options}
//                   series={chartOptions.series}
//                   type="line"
//                   width="100%"
//                   height="100%"
//                 />
//               ) : (
//                 <div className="flex justify-center items-center h-full">
//                   <p>กำลังโหลดข้อมูล...</p>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">
//               ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำ{getTitleSuffix()}
//             </h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "300px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {customerChartOptions.options.xaxis.categories.length > 0 ? (
//                 <ApexCharts
//                   options={customerChartOptions.options}
//                   series={customerChartOptions.series}
//                   type="bar"
//                   width="100%"
//                   height="100%"
//                 />
//               ) : (
//                 <div className="flex justify-center items-center h-full">
//                   <p>กำลังโหลดข้อมูล...</p>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Card>
//         <h3 className="text-center mb-4">สถานะงานประจำ{getTitleSuffix()}</h3>
//         <Row gutter={[16, 16]} justify="center">
//           {statusCounts.map((item, index) => (
//             <Col
//               key={index}
//               xs={12}
//               sm={8}
//               md={4}
//               className="text-center"
//               onClick={() => handleStatusClick(item.name)}
//               style={{ cursor: "pointer" }}
//             >
//               <div className="d-flex flex-column align-items-center ">
//                 <span className="fs-3 mb-2 ">{item.icon}</span>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   {item.name}
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   {item.count}
//                 </span>
//               </div>
//             </Col>
//           ))}
//         </Row>
//         <div className="mt-4 text-center">
//           <Button
//             type="primary"
//             style={{ backgroundColor: "#213f66", width: "200px" }}
//             onClick={handletoJob}
//           >
//             ไปที่หน้างาน
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// }

///////////////////////////////////อันที่ใช้ได้
// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   DatePicker,
//   Select,
//   Space,
//   Dropdown,
//   Row,
//   Col,
//   Card,
// } from "antd";
// import dayjs from "dayjs";
// import weekOfYear from "dayjs/plugin/weekOfYear";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import ApexCharts from "react-apexcharts";
// import { BiFilterAlt, BiBarChart, BiUser, BiPackage } from "react-icons/bi";
// import { MdBorderColor } from "react-icons/md";
// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
//   FaTruckLoading,
// } from "react-icons/fa";
// import { TbBasketCancel } from "react-icons/tb";
// import axios from "axios";
// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";
// import { useNavigate, useParams } from "react-router-dom";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// dayjs.extend(isSameOrBefore);
// dayjs.extend(weekOfYear);
// dayjs.extend(customParseFormat);
// dayjs.locale("th");

// const { Option } = Select;

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
//   const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });
//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [statusCounts, setStatusCounts] = useState([]);

//   const statusIcons = [
//     { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
//     { name: "สั่งอะไหล่", icon: <MdBorderColor /> },
//     { name: "ซ่อมสำเร็จ", icon: <FaTools /> },
//     { name: "รอทดสอบ", icon: <FaFileAlt /> },
//     { name: "รอจัดส่ง", icon: <FaTruck /> },
//     { name: "จัดส่งสำเร็จ", icon: <FaTruckLoading /> },
//     { name: "ปิดงาน", icon: <FaCheck /> },
//     { name: "ยกเลิกการเคลมสินค้า", icon: <TbBasketCancel /> },
//   ];

//   // const getData = async () => {
//   //   try {
//   //     const url = "http://localhost:3302/get-dashboard";
//   //     const response = await axios.get(url);
//   //     setData(response.data);
//   //     console.log(response.data);
//   //   } catch (error) {
//   //     console.error("Error fetching data:", error);
//   //   }
//   // };

//   ///////////////////////////// ประเภทสินค้าที่ถูกเคลม ////////////////////////////////
//   const [chartOptions, setChartOptions] = useState({
//     options: {
//       chart: {
//         id: "basic-bar",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [], // จะถูกแทนที่ด้วย 'category' ที่ไม่ซ้ำกัน
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#4F46E5"],
//     },
//     series: [
//       {
//         name: "หน่วย (Unit)",
//         data: [], // จะถูกแทนที่ด้วย 'unit' ที่รวมยอดแล้ว
//       },
//     ],
//   });

//   /////////////////////////////////////// ลูกค้าที่ส่งเคลมสินค้ามากที่สุด /////////////////////////////////////
//   const [customerChartOptions, setCustomerChartOptions] = useState({
//     options: {
//       chart: {
//         id: "customer-bar-chart",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [], // จะถูกแทนที่ด้วย 'customer' ที่ไม่ซ้ำกัน
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#22C55E"],
//     },
//     series: [
//       {
//         name: "จำนวนลูกค้า",
//         data: [], // จะถูกแทนที่ด้วยจำนวนลูกค้าแต่ละประเภท
//       },
//     ],
//   });

//   const [productrChartOptions, setProductChartOptions] = useState({
//     options: {
//       chart: {
//         id: "product-bar-chart",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [], // จะถูกแทนที่ด้วย 'customer' ที่ไม่ซ้ำกัน
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#EC9838FF"],
//     },
//     series: [
//       {
//         name: "จำนวนลูกค้า",
//         data: [], // จะถูกแทนที่ด้วยจำนวนลูกค้าแต่ละประเภท
//       },
//     ],
//   });

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-dashboard";
//       const response = await axios.get(url);
//       const rawData = response.data;

//       // หมวดหมู่คงที่สำหรับสินค้า
//       const staticClaim = ["ประเภทที่ 1", "ประเภทที่ 2", "ประเภทที่ 3"];

//       // รวมยอด unit สำหรับ category ที่ซ้ำกัน
//       const aggregatedClaimData = rawData.reduce((acc, item) => {
//         const { category, unit } = item;
//         acc[category] = (acc[category] || 0) + unit;
//         return acc;
//       }, {});

//       // สร้างข้อมูลสำหรับกราฟสินค้าจากหมวดหมู่คงที่
//       const claimCategories = staticClaim;
//       const unit = claimCategories.map((cat) => aggregatedClaimData[cat] || 0);

//       // รวมยอดลูกค้าจากข้อมูลที่มีอยู่จริง
//       const aggregatedCustomerData = rawData.reduce((acc, item) => {
//         const customer = item.username || "ลูกค้าไม่ระบุ"; // สมมติว่ามี customer field
//         acc[customer] = (acc[customer] || 0) + 1; // นับจำนวนครั้ง
//         return acc;
//       }, {});

//       // สร้างข้อมูลสำหรับกราฟลูกค้าจาก aggregated data
//       const customerNames = Object.keys(aggregatedCustomerData);
//       const customerCounts = Object.values(aggregatedCustomerData);

//       //////////////////////////////// จำนวนสินค้าที่เคลม ///////////////////////////
//       const aggregatedProductData = rawData.reduce((acc, item) => {
//         const customer = item.sku || "ลูกค้าไม่ระบุ"; // สมมติว่ามี customer field
//         acc[customer] = (acc[customer] || 0) + 1; // นับจำนวนครั้ง
//         return acc;
//       }, {});

//       // สร้างข้อมูลสำหรับกราฟลูกค้าจาก aggregated data
//       const productCountNames = Object.keys(aggregatedProductData);
//       const productCounts = Object.values(aggregatedProductData);

//       // อัปเดต state ของข้อมูลและกราฟสินค้า
//       setData(rawData);
//       setChartOptions((prevState) => ({
//         ...prevState,
//         options: {
//           ...prevState.options,
//           xaxis: {
//             categories: claimCategories,
//           },
//         },
//         series: [
//           {
//             ...prevState.series[0],
//             data: unit,
//           },
//         ],
//       }));

//       // อัปเดต state ของกราฟลูกค้า
//       setCustomerChartOptions((prevState) => ({
//         ...prevState,
//         options: {
//           ...prevState.options,
//           xaxis: {
//             categories: customerNames,
//           },
//         },
//         series: [
//           {
//             ...prevState.series[0],
//             data: customerCounts,
//           },
//         ],
//       }));

//       setProductChartOptions((prevState) => ({
//         ...prevState,
//         options: {
//           ...prevState.options,
//           xaxis: {
//             categories: productCountNames,
//           },
//         },
//         series: [
//           {
//             ...prevState.series[0],
//             data: productCounts,
//           },
//         ],
//       }));
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const filterAndCount = () => {
//     // 1. ส่วนสำหรับคำนวณข้อมูลรายวัน: totalUnits, topCategory, topCustomer
//     //    โดยจะนับเฉพาะรายการที่ถูกสร้างขึ้น (createAt) ในวันที่เลือกเท่านั้น
//     const dailyFiltered = data.filter((item) => {
//       const itemDate = dayjs(item.createAt);
//       return itemDate.isSame(selectedDate, dateType);
//     });

//     const dailyJobsMap = new Map();
//     dailyFiltered.forEach((item) => {
//       const existingJob = dailyJobsMap.get(item.jobRef);
//       // เลือกรายการที่มีการอัปเดตล่าสุด ณ วันที่สร้างงานนั้นๆ
//       if (
//         !existingJob ||
//         dayjs(item.updateAt).isAfter(dayjs(existingJob.updateAt))
//       ) {
//         dailyJobsMap.set(item.jobRef, item);
//       }
//     });

//     const categoryCount = {};
//     const customerCount = {};
//     let totalUnits = 0;

//     dailyJobsMap.forEach((item) => {
//       totalUnits += item.unit || 0;
//       const cat = item.category;
//       categoryCount[cat] = (categoryCount[cat] || 0) + 1;
//       const cus = item.username;
//       customerCount[cus] = (customerCount[cus] || 0) + 1;
//     });

//     setTotalCount(totalUnits);
//     let topCat = { name: "-", count: 0 };
//     for (const [cat, count] of Object.entries(categoryCount)) {
//       if (count > topCat.count) {
//         topCat = { name: cat, count };
//       }
//     }
//     setTopCategory(topCat);

//     let topcus = { name: "-", count: 0 };
//     for (const [cus, count] of Object.entries(customerCount)) {
//       if (count > topcus.count) {
//         topcus = { name: cus, count };
//       }
//     }
//     setTopCustomer(topcus);

//     // ---
//     // 2. ส่วนสำหรับคำนวณสถานะงาน: statusCounts
//     //    โค้ดส่วนนี้ยังคงเดิมตามที่คุณต้องการ **ห้ามแก้ไขเด็ดขาด**
//     const jobsAsOfSelectedDate = new Map();

//     data.forEach((item) => {
//       const itemUpdateDate = dayjs(item.updateAt);
//       if (itemUpdateDate.isSameOrBefore(selectedDate, "day")) {
//         const existingJob = jobsAsOfSelectedDate.get(item.jobRef);
//         if (
//           !existingJob ||
//           itemUpdateDate.isAfter(dayjs(existingJob.updateAt))
//         ) {
//           jobsAsOfSelectedDate.set(item.jobRef, item);
//         }
//       }
//     });

//     const statusCountMap = {};
//     jobsAsOfSelectedDate.forEach((item) => {
//       const status = item.jobStatus;
//       statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//     });

//     const updatedStatusCounts = statusIcons.map((item) => {
//       const count = statusCountMap[item.name] || 0;
//       return { ...item, count };
//     });
//     setStatusCounts(updatedStatusCounts);
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   useEffect(() => {
//     if (data.length > 0) {
//       filterAndCount();
//     }
//   }, [data, selectedDate, dateType]);

//   const handleDateChange = (value) => {
//     setSelectedDate(value);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             disabledDate={disableDatePass}
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker
//             disabledDate={disableDatePass}
//             locale={locale}
//             picker="month"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker
//             disabledDate={disableDatePass}
//             locale={locale}
//             picker="year"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const disableDatePass = (current) => {
//     // const today = dayjs();
//     //   return current && current.isBefore(today, 'day');
//     if (!current) {
//       return false;
//     }

//     switch (dateType) {
//       case "day":
//         return current.isAfter(dayjs(), "day");
//       case "month":
//         return current.isAfter(dayjs(), "month");
//       case "year":
//         return current.isAfter(dayjs(), "year");
//       default:
//         return false;
//     }
//   };

//   const navigate = useNavigate();

//   const handletoJob = () => {
//     navigate("/Job");
//   };

//   const handleStatusClick = (record) => {
//     navigate(`/jobs-by-status/${record}`);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1 className="text-center mb-5 mt-5">Dashboard</h1>
//       <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-4">
//         {/* <Space>
//           <Dropdown>
//             <Button>
//               <BiFilterAlt /> สถานะ
//             </Button>
//           </Dropdown>
//         </Space> */}

//         <Space.Compact>
//           {renderDatePicker()}
//           <Select
//             value={dateType}
//             onChange={handleDateTypeChange}
//             style={{ width: "100px" }}
//           >
//             <Option value="day">วัน</Option>
//             <Option value="month">เดือน</Option>
//             <Option value="year">ปี</Option>
//           </Select>
//         </Space.Compact>
//       </div>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiPackage />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">{totalCount}</h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   จำนวนสินค้าที่รับเคลมต่อวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiBarChart />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCategory.name}, {topCategory.count} ชิ้น
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ประเภทสินค้าที่ถูกเคลมสูงสุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiUser />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCustomer.name}, {topCustomer.count} รายการ
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">จำนวนสินค้าที่เคลมสูงสุดประจำวัน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "300px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {productrChartOptions.options.xaxis.categories.length > 0 ? (
//                 <ApexCharts
//                   options={productrChartOptions.options}
//                   series={productrChartOptions.series}
//                   type="bar"
//                   width="100%"
//                   height="100%"
//                 />
//               ) : (
//                 <div className="flex justify-center items-center h-full">
//                   <p>กำลังโหลดข้อมูล...</p>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">ประเภทสินค้าที่ถูกเคลมสูงสุดประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "300px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {chartOptions.options.xaxis.categories.length > 0 ? (
//                 <ApexCharts
//                   options={chartOptions.options}
//                   series={chartOptions.series}
//                   type="line"
//                   width="100%"
//                   height="100%"
//                 />
//               ) : (
//                 <div className="flex justify-center items-center h-full">
//                   <p>กำลังโหลดข้อมูล...</p>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำวัน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "300px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {customerChartOptions.options.xaxis.categories.length > 0 ? (
//                 <ApexCharts
//                   options={customerChartOptions.options}
//                   series={customerChartOptions.series}
//                   type="bar"
//                   width="100%"
//                   height="100%"
//                 />
//               ) : (
//                 <div className="flex justify-center items-center h-full">
//                   <p>กำลังโหลดข้อมูล...</p>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Card>
//         <h3 className="text-center mb-4">จำนวนสถานะงานที่ค้าง</h3>
//         <Row gutter={[16, 16]} justify="center">
//           {statusCounts.map((item, index) => (
//             <Col
//               key={index}
//               xs={12}
//               sm={8}
//               md={4}
//               className="text-center"
//               onClick={() => handleStatusClick(item.name)}
//               style={{ cursor: "pointer" }}
//             >
//               <div className="d-flex flex-column align-items-center ">
//                 <span className="fs-3 mb-2 ">{item.icon}</span>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   {item.name}
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   {item.count}
//                 </span>
//               </div>
//             </Col>
//           ))}
//         </Row>
//         <div className="mt-4 text-center">
//           <Button
//             type="primary"
//             style={{ backgroundColor: "#213f66", width: "200px" }}
//             onClick={handletoJob}
//           >
//             ไปที่หน้างาน
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   DatePicker,
//   Select,
//   Space,
//   Dropdown,
//   Row,
//   Col,
//   Card,
// } from "antd";
// import dayjs from "dayjs";
// import weekOfYear from "dayjs/plugin/weekOfYear";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import { BiFilterAlt, BiBarChart, BiUser, BiPackage } from "react-icons/bi";
// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
// } from "react-icons/fa";
// import { TbBasketCancel } from "react-icons/tb";
// import axios from "axios";
// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";
// dayjs.extend(weekOfYear);
// dayjs.extend(customParseFormat);
// dayjs.locale("th");

// const { Option } = Select;

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
//   const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });
//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [statusCounts, setStatusCounts] = useState([]);

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-dashboard";
//       const response = await axios.get(url);
//       setData(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   useEffect(() => {
//     if (data.length > 0) {
//       filterAndCount();
//     }
//   }, [data, selectedDate, dateType]);
//   const filterAndCount = () => {
//     const filtered = data.filter((item) => {
//       const itemDate = dayjs(item.createAt);
//       return itemDate.isSame(selectedDate, dateType);
//     });
//     setTotalCount(filtered.length);
//     console.log("filtered", filtered);

//     const categoryCount = {};
//     const customerCount = {};
//     const statusCountMap = {};

//     filtered.forEach((item) => {
//       const cat = item.category;
//       categoryCount[cat] = (categoryCount[cat] || 0) + 1;
//       const cus = item.username;
//       customerCount[cus] = (customerCount[cus] || 0) + 1;
//       const status = item.jobStatus;
//       statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//     });

//     let topCat = { name: "-", count: 0 };
//     for (const [cat, count] of Object.entries(categoryCount)) {
//       if (count > topCat.count) {
//         topCat = { name: cat, count };
//       }
//     }

//     let topcus = { name: "-", count: 0 };
//     for (const [cus, count] of Object.entries(customerCount)) {
//       if (count > topcus.count) {
//         topcus = { name: cus, count };
//       }
//     }

//     const updatedStatusCounts = statusIcons.map((item) => {
//       const count = statusCountMap[item.name] || 0;
//       return { ...item, count };
//     });

//     setTopCategory(topCat);
//     setTopCustomer(topcus);
//     setStatusCounts(updatedStatusCounts);
//   };

//   const handleDateChange = (value) => {
//     setSelectedDate(value);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="month"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="year"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const statusIcons = [
//     { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
//     { name: "สั่งอะไหล่", icon: <FaTools /> },
//     { name: "ซ่อมสำเร็จ", icon: <FaCheck /> },
//     { name: "รอทดสอบ", icon: <FaFileAlt /> },
//     { name: "รอจัดส่ง", icon: <FaTruck /> },
//     { name: "จัดส่งสำเร็จ", icon: <BiPackage /> },
//     { name: "ยกเลิกการเคลมสินค้า", icon: <TbBasketCancel /> },
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1 className="text-center mb-4">Dashboard</h1>
//       <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-4">
//         <Space>
//           <Dropdown
//             menu={
//               {
//                 /* ...menuProps */
//               }
//             }
//           >
//             <Button>
//               <BiFilterAlt /> สถานะ
//             </Button>
//           </Dropdown>
//         </Space>

//         <Space.Compact>
//           {renderDatePicker()}
//           <Select
//             value={dateType}
//             onChange={handleDateTypeChange}
//             style={{ width: "100px" }}
//           >
//             <Option value="day">วัน</Option>
//             <Option value="month">เดือน</Option>
//             <Option value="year">ปี</Option>
//           </Select>
//         </Space.Compact>
//       </div>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiPackage />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">{totalCount}</h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   จำนวนสินค้าที่รับเคลมต่อวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiBarChart />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCategory.name}, {topCategory.count} ชิ้น
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ประเภทสินค้าที่ถูกเคลมสูงสุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiUser />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCustomer.name}, {topCustomer.count} รายการ
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">จำนวนสินค้าที่ค้นหาสูงสุดประจำวัน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Card>
//         <h3 className="text-center mb-4">จำนวนสถานะงานที่ค้าง</h3>
//         <Row gutter={[16, 16]} justify="center">
//           {statusCounts.map((item, index) => (
//             <Col key={index} xs={12} sm={8} md={4} className="text-center">
//               <div className="d-flex flex-column align-items-center">
//                 <span className="fs-3 mb-2">{item.icon}</span>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   {item.name}
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   {item.count}
//                 </span>
//               </div>
//             </Col>
//           ))}
//         </Row>
//         <div className="mt-4 text-center">
//           <Button
//             type="primary"
//             style={{ backgroundColor: "#213f66", width: "200px" }}
//           >
//             ไปที่หน้างาน
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import {
//   Button,
//   DatePicker,
//   Select,
//   Space,
//   Dropdown,
//   Row,
//   Col,
//   Card,
// } from "antd";
// import dayjs from "dayjs";
// import weekOfYear from "dayjs/plugin/weekOfYear";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import { BiFilterAlt, BiBarChart, BiUser, BiPackage } from "react-icons/bi";
// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
// } from "react-icons/fa";
// import axios from "axios";

// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";
// import { useEffect } from "react";
// dayjs.extend(weekOfYear);
// dayjs.extend(customParseFormat);
// dayjs.locale("th");

// const { Option } = Select;

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
//   const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });
//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());

//   const getData = () => {
//     const url = "http://localhost:3302/get-dashboard";
//     axios
//       .get(url)
//       .then((response) => {
//         setData(response.data);
//         console.log(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   };

//   const filterAndCount = () => {
//     const filtered = data.filter((item) => {
//       const itemDate = dayjs(item.createAt);
//       return itemDate.isSame(selectedDate, dateType);
//     });
//     setTotalCount(filtered.length);

//     const categoryCount = {};
//     const customerCount = {};

//     filtered.forEach((item) => {
//       const cat = item.category;
//       categoryCount[cat] = (categoryCount[cat] || 0) + 1;
//       const cus = item.username;

//       customerCount[cus] = (customerCount[cus] || 0) + 1;
//     });

//     let topCat = { name: "-", count: 0 };
//     for (const [cat, count] of Object.entries(categoryCount)) {
//       if (count > topCat.count) {
//         topCat = { name: cat, count };
//       }
//     }

//     // Find top cusuct
//     let topcus = { name: "-", count: 0 }; // Changed from topCustomers
//     for (const [cus, count] of Object.entries(customerCount)) {
//       if (count > topcus.count) {
//         // Corrected the comparison
//         topcus = { name: cus, count };
//       }
//     }

//     setTopCategory(topCat);
//     setTopCustomer(topcus);
//   };

//   const handleDateChange = (value) => {
//     setSelectedDate(value);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="month"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="year"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const menuItems = [
//     { key: "1", label: "เริ่มงาน" },
//     { key: "2", label: "สั่งอะไหล่" },
//     { key: "3", label: "ซ่อมเสร็จ" },
//     { key: "4", label: "รอทดสอบ" },
//     { key: "5", label: "รอจัดส่ง" },
//     { key: "6", label: "จัดส่งแล้ว" },
//   ];

//   const handleMenuClick = (e) => {
//     console.log("Clicked item:", e.key);
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
//   };

//   const statusIcons = [
//     { name: "เริ่มงาน", icon: <FaRegLightbulb />, count: 1 },
//     { name: "สั่งอะไหล่", icon: <FaTools />, count: 8 },
//     { name: "ซ่อมสำเร็จ", icon: <FaCheck />, count: 0 },
//     { name: "รอทดสอบ", icon: <FaFileAlt />, count: 1 },
//     { name: "รอจัดส่ง", icon: <FaTruck />, count: 1 },
//     { name: "จัดส่งสำเร็จ", icon: <BiPackage />, count: 3 },
//   ];

//   useEffect(() => {
//     filterAndCount();
//     getData();
//   }, [selectedDate, dateType]);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1 className="text-center mb-4">Dashboard</h1>
//       <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-4">
//         <Space>
//           <Dropdown menu={menuProps} trigger={["click"]}>
//             <Button>
//               <BiFilterAlt /> สถานะ
//             </Button>
//           </Dropdown>
//         </Space>

//         <Space.Compact>
//           {renderDatePicker()}
//           <Select
//             value={dateType}
//             onChange={handleDateTypeChange}
//             style={{ width: "100px" }}
//           >
//             <Option value="day">วัน</Option>
//             <Option value="month">เดือน</Option>
//             <Option value="year">ปี</Option>
//           </Select>
//         </Space.Compact>
//       </div>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiPackage />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">{totalCount}</h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   จำนวนสินค้าที่รับเคลมต่อวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiBarChart />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCategory.name}, {topCategory.count} ชิ้น
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ประเภทสินค้าที่ถูกเคลมสูงสุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiUser />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCustomer.name}, {topCustomer.count} รายการ
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">จำนวนสินค้าที่ค้นหาสูงสุดประจำวัน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Card>
//         <h3 className="text-center mb-4">จำนวนสถานะงานที่ค้าง</h3>
//         <Row gutter={[16, 16]} justify="center">
//           {statusIcons.map((item, index) => (
//             <Col key={index} xs={12} sm={8} md={4} className="text-center">
//               <div className="d-flex flex-column align-items-center">
//                 <span className="fs-3 mb-2">{item.icon}</span>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   {item.name}
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   {item.count}
//                 </span>
//               </div>
//             </Col>
//           ))}
//         </Row>
//         <div className="mt-4 text-center">
//           <Button
//             type="primary"
//             style={{ backgroundColor: "#213f66", width: "200px" }}
//           >
//             ไปที่หน้างาน
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { Button } from "antd";
// import { DatePicker, Select, Space, Dropdown } from "antd";
// import dayjs from "dayjs";
// import weekOfYear from "dayjs/plugin/weekOfYear";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import { BiFilterAlt } from "react-icons/bi";
// import { FaRegLightbulb } from "react-icons/fa";
// import { LuWrench } from "react-icons/lu";
// import { HiOutlineDocumentText } from "react-icons/hi";
// import { RiFileEditLine } from "react-icons/ri";
// import { PiCarFill } from "react-icons/pi";
// import { PiSealCheckBold } from "react-icons/pi";
// import "dayjs/locale/th"; // Import Thai locale for dayjs
// dayjs.extend(weekOfYear);
// dayjs.extend(customParseFormat);
// dayjs.locale("th"); // Set dayjs to use Thai locale
// const { Option } = Select;

// export default function Dashboard() {
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [dateType, setDateType] = useState("day");

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     console.log("Selected Date: ", date ? date.format("DD-MM-YYYY") : null);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//     console.log("Selected Date Type: ", value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker.MonthPicker
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker.YearPicker
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return (
//           <DatePicker
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//     }
//   };

//   const menuItems = [
//     {
//       key: "1",
//       label: "เริ่มงาน",
//     },
//     {
//       key: "2",
//       label: "สั่งอะไหล่",
//     },
//     {
//       key: "3",
//       label: "ซ่อมเสร็จ",
//     },
//     {
//       key: "4",
//       label: "ซ่อมเสร็จ",
//     },
//     {
//       key: "5",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "6",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "7",
//       label: "จัดส่งแล้ว",
//     },
//   ];

//   const handleMenuClick = (e) => {
//     console.log("Clicked item:", e.key);
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
//   };

//   return (
//     <div
//       style={{
//         backgroundColor: "#FFFFFF",
//         margin: "20px",
//         padding: "20px",
//         borderRadius: "10px",
//         boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//       }}
//     >
//       <h1 className="text-dark mb-4 mt-5 text-center">Dashboard</h1>
//       <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-4">
//         <Space className="button">
//           <Dropdown menu={menuProps} trigger={["click"]}>
//             <Button
//               type="primary"
//               style={{
//                 backgroundColor: "#F7F7F7",
//                 color: "#616161",
//                 borderColor: "none",
//               }}
//               className="button"
//             >
//               <BiFilterAlt type="primary" className="button-icon" />
//               สถานะ
//             </Button>
//           </Dropdown>
//         </Space>

//         <Space direction="vertical" size={12}>
//           <Space.Compact style={{ width: "100%" }}>
//             {renderDatePicker()}
//             <Select
//               value={dateType}
//               onChange={handleDateTypeChange}
//               className="date-selector"
//               //   style={{ width: "100px" }}
//             >
//               <Option value="day">วัน</Option>
//               <Option value="month">เดือน</Option>
//               <Option value="year">ปี</Option>
//             </Select>
//           </Space.Compact>
//         </Space>
//       </div>

//       <div className="d-flex justify-content-between gap-4 mb-4 flex-wrap">
//         <div
//           className="d-flex align-items-center rounded-3 p-4"
//           style={{
//             backgroundColor: "white",
//             width: "30%",
//             boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <div className="me-3 fs-3 text-dark">
//             <i className="fas fa-box"></i>
//           </div>
//           <div>
//             <h2 className="mb-1 fs-5">1 ชิ้น</h2>
//             <p className="text-muted mb-0 fs-6" style={{ fontSize: "0.8rem" }}>
//               จำนวนสินค้าที่รับเคลมต่อวัน
//             </p>
//           </div>
//         </div>
//         <div
//           className="d-flex align-items-center rounded-3 p-4"
//           style={{
//             backgroundColor: "white",
//             width: "30%",
//             boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <div className="me-3 fs-3 text-dark">
//             <i className="fas fa-th"></i>
//           </div>
//           <div>
//             <h2 className="mb-1 fs-5">เครื่องช่วยฟัง</h2>
//             <p className="text-muted mb-0 fs-6" style={{ fontSize: "0.8rem" }}>
//               ประเภทสินค้าที่ถูกเคลมสูงที่สุดประจำวัน
//             </p>
//           </div>
//         </div>
//         <div
//           className="d-flex align-items-center rounded-3 p-4"
//           style={{
//             backgroundColor: "white",
//             width: "30%",
//             boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <div className="me-3 fs-3 text-dark">
//             <i className="fas fa-users"></i>
//           </div>
//           <div>
//             <h2 className="mb-1 fs-5">สมปอง, 1 รายการ</h2>
//             <p className="text-muted mb-0 fs-6" style={{ fontSize: "0.8rem" }}>
//               ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำวัน
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="d-flex justify-content-between gap-4 mb-4 flex-wrap">
//         <div
//           className="rounded-3 p-4"
//           style={{
//             backgroundColor: "white",
//             width: "30%",
//             boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <h3 className="mb-3">จำนวนสินค้าที่ค้นหาสูงสุดประจำวัน</h3>
//           <div
//             className="d-flex justify-content-center align-items-center text-muted"
//             style={{
//               height: "150px",
//               backgroundColor: "#e0e0e0",
//               fontSize: "0.9rem",
//             }}
//           >
//             Placeholder for Chart
//           </div>
//         </div>
//         <div
//           className="rounded-3 p-4"
//           style={{
//             backgroundColor: "white",
//             width: "30%",
//             boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <h3 className="mb-3">ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำเดือน</h3>
//           <div
//             className="d-flex justify-content-center align-items-center text-muted"
//             style={{
//               height: "150px",
//               backgroundColor: "#e0e0e0",
//               fontSize: "0.9rem",
//             }}
//           >
//             Placeholder for Chart
//           </div>
//         </div>
//         <div
//           className="rounded-3 p-4"
//           style={{
//             backgroundColor: "white",
//             width: "30%",
//             boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <h3 className="mb-3">ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำเดือน</h3>
//           <div
//             className="d-flex justify-content-center align-items-center text-muted"
//             style={{
//               height: "150px",
//               backgroundColor: "#e0e0e0",
//               fontSize: "0.9rem",
//             }}
//           >
//             Placeholder for Chart
//           </div>
//         </div>
//       </div>

//       <div
//         className="text-center rounded-3 p-4"
//         style={{
//           backgroundColor: "white",
//           boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <h3 className="mb-4">จำนวนสถานะงานที่ค้าง</h3>
//         <div
//           className="d-grid gap-4 mb-4"
//           style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
//         >
//           <div className="d-flex flex-column align-items-center">
//             <i
//               className="fas fa-lightbulb"
//               style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//             ></i>
//             <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//               เริ่มงาน
//             </p>
//             <FaRegLightbulb />
//             <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//               1
//             </span>
//           </div>
//           <div className="d-flex flex-column align-items-center">
//             <i
//               className="fas fa-box-open"
//               style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//             ></i>
//             <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//               สั่งอะไหล่
//             </p>
//             <LuWrench />
//             <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//               8
//             </span>
//           </div>
//           <div className="d-flex flex-column align-items-center">
//             <i
//               className="fas fa-file"
//               style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//             ></i>
//             <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//               ซ่อมสำเร็จ
//             </p>
//             <HiOutlineDocumentText />
//             <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//               0
//             </span>
//           </div>
//           <div className="d-flex flex-column align-items-center">
//             <i
//               className="fas fa-check-circle"
//               style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//             ></i>
//             <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//               รอทดสอบ
//             </p>
//             <RiFileEditLine />
//             <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//               1
//             </span>
//           </div>
//           <div className="d-flex flex-column align-items-center">
//             <i
//               className="fas fa-redo-alt"
//               style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//             ></i>
//             <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//               รอจัดส่ง
//             </p>
//             <PiCarFill />
//             <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//               1
//             </span>
//           </div>
//           <div className="d-flex flex-column align-items-center">
//             <i
//               className="fas fa-clipboard-check"
//               style={{ fontSize: "1.5rem", marginBottom: "5px" }}
//             ></i>
//             <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//               จัดส่งสำเร็จ
//             </p>
//             <PiSealCheckBold />
//             <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//               3
//             </span>
//           </div>
//         </div>
//         <button
//           style={{
//             backgroundColor: "#213f66",
//             color: "white",
//             padding: "10px 20px",
//             border: "none",
//             borderRadius: "20px",
//             cursor: "pointer",
//             display: "block",
//             width: "200px",
//             margin: "0 auto",
//           }}
//         >
//           ไปที่หน้างาน
//         </button>
//       </div>
//     </div>
//   );
// }
