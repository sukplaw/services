import React, { useState, useEffect } from "react";
import { Table, Input, Form } from "antd";
import axios from "axios";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Backlogs() {
  const [data, setData] = useState([]);
  const [searchData, setSearchData] = useState("");
  const navigate = useNavigate();
  const [changedStatus] = useState({}); // read-only ในหน้านี้

  // ---------- ดึงข้อมูล (คงแบบ test10 เดิม) ----------
  const getData = () => {
    const url = "http://localhost:3302/api/jobs";
    axios
      .get(url)
      .then((response) => {
        setData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  // ---------- Helpers progress (คงจาก test10 เดิม) ----------
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
  const daysBetween = (a, b) => {
    const ms = b.getTime() - a.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };
  // คืนค่า: { percentRemaining, remainingDays, colorClass, labelText }
  const computeTimeProgress = (createAtISO, expectedISO) => {
    const now = new Date();
    const start = new Date(createAtISO);
    const end = new Date(expectedISO);
    const totalMs = Math.max(1, end.getTime() - start.getTime());
    const remainingDays = daysBetween(now, end);

    let percentRemaining = ((end.getTime() - now.getTime()) / totalMs) * 100;
    if (remainingDays <= 0) {
      percentRemaining = 100;
    } else {
      percentRemaining = clamp(Math.round(percentRemaining), 0, 100);
    }

    // โทนสีแบบเดียวกับ test11 (success/warning/danger + overdue ใช้ danger)
    let colorClass = "bg-success";
    if (remainingDays <= 5 && remainingDays >= 3) colorClass = "bg-warning";
    if (remainingDays <= 2) colorClass = "bg-danger";

    const labelText =
      remainingDays < 0
        ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
        : remainingDays === 0
        ? "ครบเวลาดำเนินการ"
        : `${remainingDays} วัน`;

    return { percentRemaining, remainingDays, colorClass, labelText };
  };

  // ---------- คงรูปแบบการกรอง/ค้นหา (test10 เดิม) ----------
  const handleSearch = (e) => setSearchData(e.target.value);

  const filterData = data.filter((item) => {
    const searchableFields = [
      "jobRef",
      "product_name",
      "serialNumber",
      "sku",
      "username",
      "serviceRef",
      "jobStatus",
      "createAt",
      "remainingTime",
      "updateAt",
      "updateBy",
    ];
    const matchesSearch = searchableFields.some((field) => {
      const fieldValue = item[field];
      return (
        typeof fieldValue === "string" &&
        fieldValue.toLowerCase().includes(searchData.toLowerCase())
      );
    });
    return matchesSearch;
  });

  // โชว์เฉพาะงานที่ “ใกล้ครบกำหนด ≤ 2 วัน” (ตรรกะเดิม)
  const countRemainingTimeWarning = (input) => {
    return input
      .filter((item) => {
        const end = new Date(item.expected_completion_date);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days <= 2; // เตือน
      })
      .map((item) => {
        const end = new Date(item.expected_completion_date);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return { ...item, remainingTime: days };
      });
  };

  const handleClick = (record) => navigate(`/show-job/${record.jobRef}`);

  // ---------- คอลัมน์แบบ test11 (ชิปสถานะ + progress pretty + badge) ----------
  const mobileOnlyColumn = {
    title: "รายละเอียด",
    key: "mobileDetails",
    align: "left",
    responsive: ["xs"],
    render: (_, record) => (
      <div style={{ lineHeight: 1.35 }}>
        <div className="fw-semibold">
          <span
            className="badge rounded-pill text-bg-primary"
            style={{ fontSize: ".85rem" }}
          >
            {record.jobRef}
          </span>{" "}
          • {record.product_name}
        </div>
        <div className="text-muted" style={{ fontSize: ".9rem" }}>
          {record.username} • {record.jobStatus}
        </div>
      </div>
    ),
  };

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "job",
      key: "job",
      align: "center",
      render: (t, record, i) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {/* จุดแดงเตือนงานใกล้กำหนด เหมือน test11 */}
          <span className="red-dot" title="งานใกล้กำหนด"></span>
          <span>{i + 1}</span>
        </div>
      ),
      responsive: ["sm"],
      className: "align-middle",
    },
    {
      title: "เลขงาน",
      dataIndex: "jobRef",
      key: "jobRef",
      align: "center",
      sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
      render: (t) => (
        <span
          className="badge rounded-pill text-bg-danger"
          style={{ fontSize: ".85rem" }}
        >
          {t}
        </span>
      ),
      responsive: ["xs", "sm", "md"],
      className: "align-middle",
    },
    {
      title: "สินค้า",
      dataIndex: "product_name",
      key: "product_name",
      align: "center",
      render: (t) => <span className="text-dark">{t}</span>,
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      responsive: ["md"],
      className: "align-middle",
    },
    {
      title: "Serial Number",
      dataIndex: "serialNumber",
      key: "serialNumber",
      align: "center",
      responsive: ["xl"], // ✅ แก้ไข: แสดงเฉพาะจอกว้างพิเศษ
      className: "align-middle text-muted",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      align: "center",
      responsive: ["lg"], // ✅ แก้ไข: แสดงเฉพาะจอใหญ่ขึ้นไป
      className: "align-middle",
    },
    {
      title: "ชื่อลูกค้า",
      dataIndex: "username",
      key: "username",
      align: "center",
      responsive: ["md"],
      className: "align-middle",
    },
    {
      title: "ชื่อผู้เปิดงาน",
      dataIndex: "serviceRef",
      key: "serviceRef",
      align: "center",
      responsive: ["lg"], // ✅ แก้ไข: แสดงเฉพาะจอใหญ่ขึ้นไป
      className: "align-middle",
    },
    {
      title: "สถานะ",
      key: "jobStatus",
      dataIndex: "jobStatus",
      align: "center",
      className: "align-middle",
      responsive: ["md"],
      render: (status, record) => {
        const currentStatus = changedStatus[record.jobRef] || status;
        let dotClass = "orange";
        if (currentStatus === "สั่งอะไหล่") dotClass = "amber";
        else if (currentStatus === "เริ่มการซ่อม") dotClass = "red";
        else if (currentStatus === "ซ่อมสำเร็จ") dotClass = "brown";
        else if (currentStatus === "รอทดสอบ") dotClass = "blue";
        else if (currentStatus === "รอจัดส่ง") dotClass = "purple";
        else if (currentStatus === "จัดส่งสำเร็จ") dotClass = "green";
        else if (currentStatus === "ยกเลิกการเคลมสินค้า") dotClass = "cancel";

        return (
          <span className="ui-chip">
            <span className={`chip-dot ${dotClass}`} />
            {currentStatus}
          </span>
        );
      },
    },
    {
      title: "วันที่เปิดงาน",
      dataIndex: "createAt",
      key: "createAt",
      align: "center",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
      responsive: ["md"],
      className: "align-middle",
    },
    {
      title: "ระยะเวลาที่ดำเนินการคงเหลือ",
      dataIndex: "remainingTime",
      key: "remainingTime",
      align: "center",
      sorter: (a, b) => a.remainingTime - b.remainingTime,
      defaultSortOrder: "ascend",
      responsive: ["md"],
      className: "align-middle",
      render: (text, record) => {
        const { percentRemaining, colorClass, labelText } = computeTimeProgress(
          record.createAt,
          record.expected_completion_date
        );
        // Progress pretty สไตล์เดียวกับ test11
        return (
          <div style={{ minWidth: 180 }}> {/* ✅ แก้ไข: ลดความกว้างลง */}
            <div className="progress pretty" title={labelText}>
              <div
                className={`progress-bar ${colorClass}`}
                role="progressbar"
                style={{
                  width: `${percentRemaining}%`,
                  transition: "width .5s ease",
                }}
                aria-valuenow={percentRemaining}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span className="text-muted" style={{ fontSize: 12 }}>
                ความคืบหน้า
              </span>
              <span className="progress-label" style={{ fontSize: 12 }}>
                ⏳ {labelText}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "วันที่แก้ไขสถานะล่าสุด",
      dataIndex: "latestUpdateAt",
      key: "latestUpdateAt",
      align: "center",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
      responsive: ["xl"], // ✅ แก้ไข: แสดงเฉพาะจอกว้างพิเศษ
      className: "align-middle",
    },
    {
      title: "ผู้แก้ไขสถานะล่าสุด",
      dataIndex: "latestUpdateBy",
      key: "latestUpdateBy",
      align: "center",
      responsive: ["xl"], // ✅ แก้ไข: แสดงเฉพาะจอกว้างพิเศษ
      className: "align-middle",
    },
    mobileOnlyColumn,
  ];

  return (
    <div className="container-fluid py-3" style={{ background: "#fafafa" }}>
      {/* ====== Global Styles (ยกจาก test11 มาใช้) ====== */}
      <style>{`
        .ui-card { border-radius: 16px; border: 1px solid #eaeaea; background: #fff; }
        .ui-card-shadow { box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
        .toolbar { position: sticky; top: 0; z-index: 9; background: linear-gradient(180deg,#ffffff,#ffffffef); backdrop-filter: blur(6px); }
        .rounded-12 { border-radius: 12px; }
        .rounded-20 { border-radius: 20px; }
        .pointer-cursor { cursor: pointer; }
        .row-red-text td { color: #b00020 !important; font-weight: 600; }
        .ant-table { border-radius: 14px !important; overflow: hidden; }
        .ant-table-thead > tr > th { font-size: 0.95rem !important; font-weight: 700 !important; background: #f3f6fa !important; }
        .ant-table-tbody > tr > td { font-size: 0.95rem !important; }

        .ant-input-affix-wrapper { border-radius: 999px !important; padding: 8px 14px !important; }
        .btn-icon { display:inline-flex; align-items:center; gap:.5rem; }
        .btn-pill { border-radius: 999px; padding: .6rem 1.1rem; }
        .btn-gradient { background: linear-gradient(135deg,#213F66,#5a83b7); color: #fff; border: none; }
        .btn-ghost { background:#f7f7f7; color:#616161; border:1px solid #e7e7e7; }
        .list-heading { font-weight: 800; letter-spacing: .2px; }

        /* --- ชิปสถานะ + dot สี --- */
        .ui-chip {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .35rem .75rem; border-radius: 999px;
          border: 1px solid #eaeaea; background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,.06);
          font-weight: 600;
        }
        .chip-dot { width: .55rem; height: .55rem; border-radius: 50%; display:inline-block; }
        .chip-dot.orange { background:#ea7317; }
        .chip-dot.amber { background:#ffba08; }
        .chip-dot.red { background:#ec3507; }
        .chip-dot.brown { background:#b36a5e; }
        .chip-dot.blue { background:#2364aa; }
        .chip-dot.purple { background:#5a189a; }
        .chip-dot.green { background:#386641; }
        .chip-dot.cancel { background:#d00000; }

        /* --- Progress Pretty --- */
        .progress.pretty {
          height: 22px; border-radius: 999px; background: #f1f3f5;
          box-shadow: inset 0 2px 6px rgba(0,0,0,.06);
        }
        .progress.pretty .progress-bar {
          border-radius: 999px;
          background-image: linear-gradient(90deg, rgba(255,255,255,.35) 0, rgba(255,255,255,0) 60%);
          background-blend-mode: overlay;
        }
        .progress-label { font-weight: 700; letter-spacing: .2px; }

        /* --- จุดแดงเตือนงานใกล้กำหนด --- */
        .red-dot {
          width:.6rem; height:.6rem; background:#d00000; border-radius:50%;
          box-shadow:0 0 0 3px rgba(208,0,0,.12);
        }
      `}</style>

      {/* ====== Toolbar/หัวกระดาน (ดีไซน์ test11) ====== */}
      <div className="toolbar ui-card ui-card-shadow p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-lg-4 order-2 order-lg-1">
            <h2 className="m-0 list-heading">แจ้งเตือนสถานะงานที่คงค้าง</h2>
            <small className="text-muted">งานที่ใกล้ครบกำหนด</small>
          </div>

          <div className="col-12 col-lg-4 order-1 order-lg-2 ">
            <Form.Item name="Input" className="m-0">
              <Input
                allowClear
                size="large"
                value={searchData}
                onChange={handleSearch}
                prefix={
                  <IoSearch style={{ width: 22, height: 22, color: "grey" }} />
                }
                placeholder="ค้นหางานที่ต้องการ"
              />
            </Form.Item>
          </div>

          <div className="col-12 col-lg-4 order-3">
            <div className="d-flex justify-content-lg-end gap-2 flex-wrap">
              {/* หน้านี้ไม่มีปุ่มแก้ไขสถานะ/สร้างงาน — คงฟังก์ชัน test10 เดิมที่เป็น read-only */}
            </div>
          </div>
        </div>
      </div>

      {/* ====== Data Table (ดีไซน์การ์ด test11) ====== */}
      <div className="ui-card ui-card-shadow p-3">
        <Table
          dataSource={countRemainingTimeWarning(filterData)}
          columns={columns}
          rowKey={(r) => r.jobRef}
          onRow={(record) => ({
            className: "pointer-cursor",
            onClick: () => handleClick(record),
          })}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
}


