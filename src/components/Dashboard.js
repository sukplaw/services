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

  // 1) ใส่ไว้เหนือ JSX (นอก .map ก็ได้)
  const STATUS_PALETTES = {
    เริ่มงาน: { from: "#60a5fa", to: "#3b82f6", bg: "#eff6ff" }, // ฟ้าเริ่มงาน
    สั่งอะไหล่: { from: "#22d3ee", to: "#06b6d4", bg: "#ecfeff" }, // ฟ้าน้ำทะเล
    เริ่มการซ่อม: { from: "#a78bfa", to: "#6366f1", bg: "#f5f3ff" }, // ม่วงลงมือซ่อม
    ซ่อมสำเร็จ: { from: "#34d399", to: "#10b981", bg: "#ecfdf5" }, // เขียวสำเร็จ
    รอทดสอบ: { from: "#f59e0b", to: "#f97316", bg: "#fff7ed" }, // เหลือง/ส้ม รอ
    รอจัดส่ง: { from: "#0ea5e9", to: "#0284c7", bg: "#e0f2fe" }, // ฟ้า รอจัดส่ง
    จัดส่งสำเร็จ: { from: "#22c55e", to: "#16a34a", bg: "#ecfdf5" }, // เขียวสำเร็จ
    ปิดงาน: { from: "#059669", to: "#047857", bg: "#ecfdf5" }, // เขียวเข้ม ปิดงาน
    ยกเลิกการเคลมสินค้า: { from: "#ef4444", to: "#dc2626", bg: "#fef2f2" }, // แดง ยกเลิก
  };

  // เผื่อชื่อไม่ตรง/ไม่มีในแมป ให้มีสำรอง
  const FALLBACKS = [
    { from: "#60a5fa", to: "#3b82f6", bg: "#eff6ff" },
    { from: "#a78bfa", to: "#6366f1", bg: "#f5f3ff" },
    { from: "#34d399", to: "#10b981", bg: "#ecfdf5" },
    { from: "#f59e0b", to: "#ef4444", bg: "#fff7ed" },
    { from: "#22d3ee", to: "#06b6d4", bg: "#ecfeff" },
    { from: "#f472b6", to: "#ec4899", bg: "#fff1f2" },
  ];

  const getPalette = (name, idx) =>
    STATUS_PALETTES[name] ?? FALLBACKS[idx % FALLBACKS.length];

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

    console.log("Data inside latestJobByRef:");
    latestJobByRef.forEach((item) => {
      console.log(item.sku);
      totalUnits += item.unit || 0;
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      customerCount[item.username] = (customerCount[item.username] || 0) + 1;
      if (item.sku) {
        productCount[item.sku] = (productCount[item.sku] || 0) + 1;
      }
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
        xaxis: { categories: Object.keys(categoryCount) || [] },
      },
      series: [{ ...prev.series[0], data: Object.values(categoryCount) || [] }],
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

    console.log("categoryCount", categoryCount);
    console.log("customerCount", customerCount);
    console.log("productCount", productCount);

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
      <h1 className="text-center mb-5 mt-4">Dashboard</h1>

      {/* Filter bar */}
      <div className="mb-4">{FilterBar}</div>
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

      {/* Summary */}
      {/* Charts: 3 อันในแถวเดียว + ทุกอันเป็น Bar */}
      <Row gutter={[16, 16]} className="mb-4">
        {/* Products */}
        <Col xs={24} sm={8}>
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
                  chart: { ...productChart.options.chart, type: "bar" },
                  plotOptions: { bar: { columnWidth: "55%", borderRadius: 6 } },
                  dataLabels: { enabled: false },
                }}
                series={productChart.series}
                type="bar"
                width="100%"
                height="100%"
              />
            ) : (
              <Empty description="ยังไม่มีข้อมูลในช่วงที่เลือก" />
            )}
          </ChartCard>
        </Col>

        {/* Categories */}
        <Col xs={24} sm={8}>
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
                  plotOptions: { bar: { columnWidth: "55%", borderRadius: 6 } },
                  dataLabels: { enabled: false },
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

        {/* Customers */}
        <Col xs={24} sm={8}>
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
                  plotOptions: { bar: { columnWidth: "55%", borderRadius: 6 } },
                  dataLabels: { enabled: false },
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
          boxShadow: "0 10px 20px rgba(2,6,23,0.06)",
        }}
        bodyStyle={{ padding: 18 }}
      >
        <h3 className="text-center mt-5 mb-5">{`สถานะงานประจำ${getTitleSuffix()}`}</h3>

        <Row gutter={[14, 14]}>
          {(loading ? statusIcons : statusCounts).map((item, idx) => {
            const c = getPalette(item.name, idx); // ← ดึงสีตามสถานะ

            return (
              <Col
                key={idx}
                xs={24} // มือถือ 1 คอลัมน์
                sm={12} // จอเล็ก 2 คอลัมน์
                md={8} // >= md เป็น 3 คอลัมน์
                lg={8}
                xl={8}
                onClick={() => !loading && handleStatusClick(item.name)}
              >
                <div
                  className="status-box"
                  style={{
                    // กรอบไล่สี + พื้นขาวด้านใน
                    background: `linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg, ${c.from}, ${c.to}) border-box`,
                    border: "1px solid transparent",
                  }}
                >
                  <div
                    className="status-icon"
                    style={{
                      background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                    }}
                  >
                    <span className="status-icon-inner">{item.icon}</span>
                  </div>

                  <div className="status-content">
                    <div className="status-name">{item.name}</div>
                    <div className="status-count">
                      {loading ? (
                        <Skeleton.Input
                          style={{ width: 48 }}
                          active
                          size="small"
                        />
                      ) : (
                        item.count
                      )}
                    </div>
                    {!loading && (
                      <div className="status-hint">แตะเพื่อดูรายละเอียด</div>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>

        <div className="mt-5 text-center">
          <Button
            type="primary"
            style={{
              background: "linear-gradient(90deg, #0ea5e9, #6366f1)",
              width: 220,
              height: 42,
              borderRadius: 10,
              border: "none",
              boxShadow: "0 10px 20px rgba(2,6,23,0.08)",
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