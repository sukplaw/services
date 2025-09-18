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
    const url = "http://localhost:3302/get-job";
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

// import React, { useState, useEffect } from "react";
// import { Table, Input, Form } from "antd";
// import axios from "axios";
// import { IoSearch } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";

// export default function Backlogs() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const navigate = useNavigate();
//   const [changedStatus, setChangedStatus] = useState({});

//   const getData = () => {
//     const url = "http://localhost:3302/get-job";
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

//   useEffect(() => {
//     getData();
//   }, []);

//   // ---------- Helpers สำหรับ progress (เดิม) ----------
//   const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

//   const daysBetween = (a, b) => {
//     const ms = b.getTime() - a.getTime();
//     return Math.floor(ms / (1000 * 60 * 60 * 24));
//   };

//   // คืนค่า: { percentRemaining(0-100), remainingDays, colorClass, labelText }
//   const computeTimeProgress = (createAtISO, expectedISO) => {
//     const now = new Date();
//     const start = new Date(createAtISO);
//     const end = new Date(expectedISO);

//     const totalMs = Math.max(1, end.getTime() - start.getTime());
//     const remainingDays = daysBetween(now, end);

//     let percentRemaining = ((end.getTime() - now.getTime()) / totalMs) * 100;

//     if (remainingDays <= 0) {
//       percentRemaining = 100;
//     } else {
//       percentRemaining = clamp(Math.round(percentRemaining), 0, 100);
//     }

//     // โทนสี Bootstrap + maroon (เลยกำหนด)
//     let colorClass = "bg-success";
//     if (remainingDays <= 5 && remainingDays >= 3) colorClass = "bg-warning";
//     if (remainingDays <= 2 && remainingDays > 0) colorClass = "bg-danger";
//     if (remainingDays <= 0) colorClass = "bg-maroon";

//     const labelText =
//       remainingDays < 0
//         ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
//         : remainingDays === 0
//         ? "ครบเวลาดำเนินการ"
//         : `${remainingDays} วัน`;

//     return { percentRemaining, remainingDays, colorClass, labelText };
//   };
//   // ----------------------------------------------------
//   const mobileOnlyColumn = {
//     title: "รายละเอียด",
//     key: "mobileDetails",
//     align: "left",
//     responsive: ["xs"], // โชว์เฉพาะจอเล็ก
//     render: (_, record) => (
//       <div style={{ lineHeight: 1.35 }}>
//         <div className="fw-semibold">
//           <span
//             className="badge rounded-pill text-bg-primary"
//             style={{ fontSize: ".85rem" }}
//           >
//             {record.jobRef}
//           </span>{" "}
//           • {record.product_name}
//         </div>
//         <div className="text-muted" style={{ fontSize: ".9rem" }}>
//           {record.username} • {record.jobStatus}
//         </div>
//       </div>
//     ),
//   };

//   const columns = [
//     {
//       title: <span className="fw-semibold text-secondary">ลำดับ</span>,
//       dataIndex: "job",
//       key: "job",
//       align: "center",
//       render: (text, record, index) => index + 1,
//       responsive: ["sm"],
//       className: "align-middle",
//     },
//     {
//       title: <span className="fw-semibold text-secondary">เลขงาน</span>,
//       dataIndex: "jobRef",
//       key: "jobRef",
//       align: "center",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//       responsive: ["xs", "sm", "md"],
//       className: "align-middle",
//       render: (t) => (
//         <span
//           className="badge rounded-pill text-bg-primary"
//           style={{ fontSize: ".85rem" }}
//         >
//           {t}
//         </span>
//       ),
//     },
//     {
//       title: <span className="fw-semibold text-secondary">สินค้า</span>,
//       dataIndex: "product_name",
//       key: "product_name",
//       align: "center",
//       className: "align-middle",
//       render: (text) => <span className="text-dark">{text}</span>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">Serial Number</span>,
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       align: "center",
//       className: "align-middle text-muted",
//       responsive: ["lg"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">SKU</span>,
//       dataIndex: "sku",
//       key: "sku",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">ชื่อลูกค้า</span>,
//       dataIndex: "username",
//       key: "username",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">ชื่อผู้เปิดงาน</span>,
//       dataIndex: "serviceRef",
//       key: "serviceRef",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">สถานะ</span>,
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//       render: (status, record) => {
//         // โทน badge แบบมินิมอล
//         const currentStatus = changedStatus[record.jobRef] || status;

//         let dotClass = "orange";
//         if (currentStatus === "สั่งอะไหล่") dotClass = "amber";
//         else if (currentStatus === "เริ่มการซ่อม") dotClass = "red";
//         else if (currentStatus === "ซ่อมสำเร็จ") dotClass = "brown";
//         else if (currentStatus === "รอทดสอบ") dotClass = "blue";
//         else if (currentStatus === "รอจัดส่ง") dotClass = "purple";
//         else if (currentStatus === "จัดส่งสำเร็จ") dotClass = "green";
//         else if (currentStatus === "ยกเลิกการเคลมสินค้า") dotClass = "cancel";

//         return (
//           <span className="ui-chip">
//             <span className={`chip-dot ${dotClass}`} />
//             {currentStatus}
//           </span>
//         );
//       },
//     },
//     {
//       title: <span className="fw-semibold text-secondary">วันที่เปิดงาน</span>,
//       dataIndex: "createAt",
//       key: "createAt",
//       align: "center",
//       className: "align-middle",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">
//           ระยะเวลาที่ดำเนินการคงเหลือ
//         </span>
//       ),
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//       align: "center",
//       className: "align-middle",
//       sorter: (a, b) => a.remainingTime - b.remainingTime,
//       defaultSortOrder: "ascend",
//       responsive: ["md"],
//       render: (text, record) => {
//         const { percentRemaining, colorClass, labelText } = computeTimeProgress(
//           record.createAt,
//           record.expected_completion_date
//         );

//         return (
//           <div>
//             <div
//               className="progress"
//               style={{ height: "0.9rem", borderRadius: "0.75rem" }}
//             >
//               <div
//                 className={`progress-bar ${colorClass}`}
//                 role="progressbar"
//                 style={{
//                   width: `${percentRemaining}%`,
//                   transition: "width .6s ease",
//                 }}
//                 aria-valuenow={percentRemaining}
//                 aria-valuemin="0"
//                 aria-valuemax="100"
//               />
//             </div>
//             <small className="text-muted d-block mt-1">{labelText}</small>
//           </div>
//         );
//       },
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">
//           วันที่แก้ไขสถานะล่าสุด
//         </span>
//       ),
//       dataIndex: "updateAt",
//       key: "updateAt",
//       align: "center",
//       className: "align-middle",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">ผู้แก้ไขสถานะล่าสุด</span>
//       ),
//       dataIndex: "updateBy",
//       key: "updateBy",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     mobileOnlyColumn,
//   ];

//   // *** คง logic เดิมไว้ ***
//   const countRemainingTimeWarning = (data) => {
//     return data
//       .filter((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return remainingTimeInDays <= 2;
//       })
//       .map((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return {
//           ...item,
//           remainingTime: remainingTimeInDays,
//         };
//       });
//   };

//   const handleClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleSearch = (e) => {
//     setSearchData(e.target.value);
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product_name",
//       "serialNumber",
//       "sku",
//       "username",
//       "createdBy",
//       "jobStatus",
//       "createAt",
//       "remainingTime",
//       "updateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });
//     return matchesSearch;
//   });

//   const visibleRows = countRemainingTimeWarning(filterData); // ใช้ชุดข้อมูลเดิมเป๊ะสำหรับแสดง/สรุป
//   const tableHeaderCSS = `
//     .bg-maroon { background-color: #800000 !important; }
//     .ant-table { border-radius: 1rem; overflow: hidden; }
//     .ant-table-thead > tr > th {
//       background: #f8f9fa !important;
//       color: #6c757d !important;
//       font-weight: 600 !important;
//       font-size: 0.95rem !important;
//     }
//     .ant-table-tbody > tr > td { font-size: 0.95rem !important; }
//     .ant-table-tbody > tr:hover > td { background: #fcfcfd !important; }
//   `;

//   return (
//     <div className="container-fluid py-4">
//       {/* สไตล์เสริม (ไม่มีใน Bootstrap) */}
//       <style>{`
//         .ui-card { border-radius: 16px; border: 1px solid #eaeaea; background: #fff; }
//         .ui-card-shadow { box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
//         .ui-chip {
//           display: inline-flex; align-items: center; gap: .5rem;
//           padding: .35rem .75rem; border-radius: 999px;
//           border: 1px solid #eaeaea; background: #fff;
//           box-shadow: 0 4px 12px rgba(0,0,0,.06);
//           font-weight: 600;
//         }
//         chip-dot { width: .55rem; height: .55rem; border-radius: 50%; display:inline-block; }
//         .chip-dot.orange { background:#ea7317; }
//         .chip-dot.amber { background:#ffba08; }
//         .chip-dot.red { background:#ec3507; }
//         .chip-dot.brown { background:#b36a5e; }
//         .chip-dot.blue { background:#2364aa; }
//         .chip-dot.purple { background:#5a189a; }
//         .chip-dot.green { background:#386641; }
//         .chip-dot.cancel { background:#d00000; }

//         .bg-maroon { background-color: #800000 !important; }
//         .ant-table { border-radius: 1rem; overflow: hidden; }
//         .ant-table-thead > tr > th {
//           background: #f8f9fa !important;
//           color: #6c757d !important;
//           font-weight: 600 !important;
//           font-size: 0.95rem !important;
//         }
//         .ant-table-tbody > tr > td {
//           font-size: 0.95rem !important;
//           padding-top: .9rem !important;
//           padding-bottom: .9rem !important;
//         }
//         .ant-table-tbody > tr:hover > td {
//           background: #fcfcfd !important;
//         }
//         .clickable-row { cursor: pointer; }
//       `}</style>

//       {/* Header Card */}
//       <div
//         className="card shadow-sm border-0 mb-3"
//         style={{ borderRadius: "1rem" }}
//       >
//         <div className="card-body p-3 p-sm-4">
//           <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
//             <div>
//               <h1 className="h4 mb-1 text-dark">แจ้งเตือนสถานะงานที่คงค้าง</h1>
//               {/* <div className="d-flex align-items-center gap-2">
//                 <span className="badge text-bg-success">ปกติ</span>
//                 <span className="badge text-bg-warning">ใกล้ครบกำหนด</span>
//                 <span className="badge text-bg-danger">เร่งด่วน</span>
//                 <span
//                   className="badge"
//                   style={{ background: "#800000", color: "#fff" }}
//                 >
//                   เลยกำหนด
//                 </span>
//               </div> */}
//             </div>

//             {/* Search */}
//             <div
//               className="ms-lg-auto"
//               style={{ minWidth: 280, maxWidth: 420 }}
//             >
//               <Form.Item name="Input" className="mb-0">
//                 <Input
//                   value={searchData}
//                   onChange={handleSearch}
//                   size="large"
//                   prefix={
//                     <IoSearch
//                       style={{
//                         width: 22,
//                         height: 22,
//                         marginRight: 6,
//                         color: "grey",
//                       }}
//                     />
//                   }
//                   placeholder="ค้นหางานที่ต้องการ"
//                   style={{
//                     height: 44,
//                     borderRadius: 24,
//                     backgroundColor: "#fff",
//                     borderColor: "#d0d5dd",
//                   }}
//                 />
//               </Form.Item>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Data Card */}
//       <div className="ui-card ui-card-shadow p-3">
//         <Table
//           dataSource={countRemainingTimeWarning(filterData)}
//           columns={columns}
//           rowKey={(r) => r.jobRef}
//           onRow={(record) => {
//             return {
//               className: "clickable-row",
//               onClick: () => handleClick(record),
//             };
//           }}
//           pagination={{ pageSize: 10, showSizeChanger: false }}
//           style={{ width: "100%", textAlign: "center" }}
//           sticky
//           // scroll={{ x: "max-content", y: 480 }}
//         />
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { Table, Input, Form } from "antd";
// import axios from "axios";
// import { IoSearch } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";

// export default function Backlogs() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const navigate = useNavigate();

//   const getData = () => {
//     const url = "http://localhost:3302/get-job";
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

//   useEffect(() => {
//     getData();
//   }, []);

//   // ---------- Helpers สำหรับ progress (เดิม) ----------
//   const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

//   const daysBetween = (a, b) => {
//     const ms = b.getTime() - a.getTime();
//     return Math.floor(ms / (1000 * 60 * 60 * 24));
//   };

//   // คืนค่า: { percentRemaining(0-100), remainingDays, colorClass, labelText }
//   const computeTimeProgress = (createAtISO, expectedISO) => {
//     const now = new Date();
//     const start = new Date(createAtISO);
//     const end = new Date(expectedISO);

//     const totalMs = Math.max(1, end.getTime() - start.getTime());
//     const remainingDays = daysBetween(now, end);

//     let percentRemaining = ((end.getTime() - now.getTime()) / totalMs) * 100;

//     if (remainingDays <= 0) {
//       percentRemaining = 100;
//     } else {
//       percentRemaining = clamp(Math.round(percentRemaining), 0, 100);
//     }

//     // โทนสี Bootstrap + maroon (เลยกำหนด)
//     let colorClass = "bg-success";
//     if (remainingDays <= 5 && remainingDays >= 3) colorClass = "bg-warning";
//     if (remainingDays <= 2 && remainingDays > 0) colorClass = "bg-danger";
//     if (remainingDays <= 0) colorClass = "bg-maroon";

//     const labelText =
//       remainingDays < 0
//         ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
//         : remainingDays === 0
//         ? "ครบเวลาดำเนินการ"
//         : `${remainingDays} วัน`;

//     return { percentRemaining, remainingDays, colorClass, labelText };
//   };
//   // ----------------------------------------------------
//   const mobileOnlyColumn = {
//     title: "รายละเอียด",
//     key: "mobileDetails",
//     align: "left",
//     responsive: ["xs"], // โชว์เฉพาะจอเล็ก
//     render: (_, record) => (
//       <div style={{ lineHeight: 1.35 }}>
//         <div className="fw-semibold">
//           <span
//             className="badge rounded-pill text-bg-primary"
//             style={{ fontSize: ".85rem" }}
//           >
//             {record.jobRef}
//           </span>{" "}
//           • {record.product_name}
//         </div>
//         <div className="text-muted" style={{ fontSize: ".9rem" }}>
//           {record.username} • {record.jobStatus}
//         </div>
//       </div>
//     ),
//   };

//   const columns = [
//     {
//       title: <span className="fw-semibold text-secondary">ลำดับ</span>,
//       dataIndex: "job",
//       key: "job",
//       align: "center",
//       render: (text, record, index) => index + 1,
//       responsive: ["sm"],
//       className: "align-middle",
//     },
//     {
//       title: <span className="fw-semibold text-secondary">เลขงาน</span>,
//       dataIndex: "jobRef",
//       key: "jobRef",
//       align: "center",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//       responsive: ["xs", "sm", "md"],
//       className: "align-middle",
//       render: (t) => (
//         <span
//           className="badge rounded-pill text-bg-primary"
//           style={{ fontSize: ".85rem" }}
//         >
//           {t}
//         </span>
//       ),
//     },
//     {
//       title: <span className="fw-semibold text-secondary">สินค้า</span>,
//       dataIndex: "product_name",
//       key: "product_name",
//       align: "center",
//       className: "align-middle",
//       render: (text) => <span className="text-dark">{text}</span>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">Serial Number</span>,
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       align: "center",
//       className: "align-middle text-muted",
//       responsive: ["lg"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">SKU</span>,
//       dataIndex: "sku",
//       key: "sku",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">ชื่อลูกค้า</span>,
//       dataIndex: "username",
//       key: "username",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">ชื่อผู้เปิดงาน</span>,
//       dataIndex: "serviceRef",
//       key: "serviceRef",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">สถานะ</span>,
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//       render: (status) => {
//         // โทน badge แบบมินิมอล
//         const tone =
//           status?.includes("ส่ง") || status?.includes("สำเร็จ")
//             ? "success"
//             : status?.includes("รอ")
//             ? "warning"
//             : "danger";
//         return (
//           <span className={`badge text-bg-${tone}`} style={{ fontWeight: 600 }}>
//             {status}
//           </span>
//         );
//       },
//     },
//     {
//       title: <span className="fw-semibold text-secondary">วันที่เปิดงาน</span>,
//       dataIndex: "createAt",
//       key: "createAt",
//       align: "center",
//       className: "align-middle",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">
//           ระยะเวลาที่ดำเนินการคงเหลือ
//         </span>
//       ),
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//       align: "center",
//       className: "align-middle",
//       sorter: (a, b) => a.remainingTime - b.remainingTime,
//       defaultSortOrder: "ascend",
//       responsive: ["md"],
//       render: (text, record) => {
//         const { percentRemaining, colorClass, labelText } = computeTimeProgress(
//           record.createAt,
//           record.expected_completion_date
//         );

//         return (
//           <div>
//             <div
//               className="progress"
//               style={{ height: "0.9rem", borderRadius: "0.75rem" }}
//             >
//               <div
//                 className={`progress-bar ${colorClass}`}
//                 role="progressbar"
//                 style={{
//                   width: `${percentRemaining}%`,
//                   transition: "width .6s ease",
//                 }}
//                 aria-valuenow={percentRemaining}
//                 aria-valuemin="0"
//                 aria-valuemax="100"
//               />
//             </div>
//             <small className="text-muted d-block mt-1">{labelText}</small>
//           </div>
//         );
//       },
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">
//           วันที่แก้ไขสถานะล่าสุด
//         </span>
//       ),
//       dataIndex: "updateAt",
//       key: "updateAt",
//       align: "center",
//       className: "align-middle",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">ผู้แก้ไขสถานะล่าสุด</span>
//       ),
//       dataIndex: "updateBy",
//       key: "updateBy",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     mobileOnlyColumn,
//   ];

//   // *** คง logic เดิมไว้ ***
//   const countRemainingTimeWarning = (data) => {
//     return data
//       .filter((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return remainingTimeInDays <= 2;
//       })
//       .map((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return {
//           ...item,
//           remainingTime: remainingTimeInDays,
//         };
//       });
//   };

//   const handleClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleSearch = (e) => {
//     setSearchData(e.target.value);
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product_name",
//       "serialNumber",
//       "sku",
//       "username",
//       "createdBy",
//       "jobStatus",
//       "createAt",
//       "remainingTime",
//       "updateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });
//     return matchesSearch;
//   });

//   const visibleRows = countRemainingTimeWarning(filterData); // ใช้ชุดข้อมูลเดิมเป๊ะสำหรับแสดง/สรุป
//   const tableHeaderCSS = `
//     .bg-maroon { background-color: #800000 !important; }
//     .ant-table { border-radius: 1rem; overflow: hidden; }
//     .ant-table-thead > tr > th {
//       background: #f8f9fa !important;
//       color: #6c757d !important;
//       font-weight: 600 !important;
//       font-size: 0.95rem !important;
//     }
//     .ant-table-tbody > tr > td { font-size: 0.95rem !important; }
//     .ant-table-tbody > tr:hover > td { background: #fcfcfd !important; }
//   `;

//   return (
//     <div className="container-fluid py-4">
//       {/* สไตล์เสริม (ไม่มีใน Bootstrap) */}
//       <style>{`
//         .bg-maroon { background-color: #800000 !important; }
//         .ant-table { border-radius: 1rem; overflow: hidden; }
//         .ant-table-thead > tr > th {
//           background: #f8f9fa !important;
//           color: #6c757d !important;
//           font-weight: 600 !important;
//           font-size: 0.95rem !important;
//         }
//         .ant-table-tbody > tr > td {
//           font-size: 0.95rem !important;
//           padding-top: .9rem !important;
//           padding-bottom: .9rem !important;
//         }
//         .ant-table-tbody > tr:hover > td {
//           background: #fcfcfd !important;
//         }
//         .clickable-row { cursor: pointer; }
//       `}</style>

//       {/* Header Card */}
//       <div
//         className="card shadow-sm border-0 mb-3"
//         style={{ borderRadius: "1rem" }}
//       >
//         <div className="card-body p-3 p-sm-4">
//           <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
//             <div>
//               <h1 className="h4 mb-1 text-dark">แจ้งเตือนสถานะงานที่คงค้าง</h1>
//               {/* <div className="d-flex align-items-center gap-2">
//                 <span className="badge text-bg-success">ปกติ</span>
//                 <span className="badge text-bg-warning">ใกล้ครบกำหนด</span>
//                 <span className="badge text-bg-danger">เร่งด่วน</span>
//                 <span
//                   className="badge"
//                   style={{ background: "#800000", color: "#fff" }}
//                 >
//                   เลยกำหนด
//                 </span>
//               </div> */}
//             </div>

//             {/* Search */}
//             <div
//               className="ms-lg-auto"
//               style={{ minWidth: 280, maxWidth: 420 }}
//             >
//               <Form.Item name="Input" className="mb-0">
//                 <Input
//                   value={searchData}
//                   onChange={handleSearch}
//                   size="large"
//                   prefix={
//                     <IoSearch
//                       style={{
//                         width: 22,
//                         height: 22,
//                         marginRight: 6,
//                         color: "grey",
//                       }}
//                     />
//                   }
//                   placeholder="ค้นหางานที่ต้องการ"
//                   style={{
//                     height: 44,
//                     borderRadius: 24,
//                     backgroundColor: "#fff",
//                     borderColor: "#d0d5dd",
//                   }}
//                 />
//               </Form.Item>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Data Card */}
//       <div className="card shadow-sm border-0" style={{ borderRadius: "1rem" }}>
//         <div className="card-body p-2 p-sm-3">
//           <div className="table-responsive">
//             <Table
//               dataSource={countRemainingTimeWarning(filterData)}
//               columns={columns}
//               rowKey={(r) => r.jobRef}
//               onRow={(record) => {
//                 return {
//                   className: "clickable-row",
//                   onClick: () => handleClick(record),
//                 };
//               }}
//               pagination={{ pageSize: 10, showSizeChanger: false }}
//               style={{ width: "100%", textAlign: "center" }}
//               sticky
//               // scroll={{ x: "max-content", y: 480 }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { Table, Input, Form } from "antd";
// import axios from "axios";
// import { IoSearch } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";

// export default function Backlogs() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const navigate = useNavigate();

//   const getData = () => {
//     const url = "http://localhost:3302/get-job";
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

//   useEffect(() => {
//     getData();
//   }, []);

//   // ---------- Helpers สำหรับ progress (เดิม) ----------
//   const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

//   const daysBetween = (a, b) => {
//     const ms = b.getTime() - a.getTime();
//     return Math.floor(ms / (1000 * 60 * 60 * 24));
//   };

//   // คืนค่า: { percentRemaining(0-100), remainingDays, colorClass, labelText }
//   const computeTimeProgress = (createAtISO, expectedISO) => {
//     const now = new Date();
//     const start = new Date(createAtISO);
//     const end = new Date(expectedISO);

//     const totalMs = Math.max(1, end.getTime() - start.getTime());
//     const remainingDays = daysBetween(now, end);

//     let percentRemaining = ((end.getTime() - now.getTime()) / totalMs) * 100;

//     if (remainingDays <= 0) {
//       percentRemaining = 100;
//     } else {
//       percentRemaining = clamp(Math.round(percentRemaining), 0, 100);
//     }

//     // โทนสี Bootstrap + maroon (เลยกำหนด)
//     let colorClass = "bg-success";
//     if (remainingDays <= 5 && remainingDays >= 3) colorClass = "bg-warning";
//     if (remainingDays <= 2 && remainingDays > 0) colorClass = "bg-danger";
//     if (remainingDays <= 0) colorClass = "bg-maroon";

//     const labelText =
//       remainingDays < 0
//         ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
//         : remainingDays === 0
//         ? "ครบเวลาดำเนินการ"
//         : `${remainingDays} วัน`;

//     return { percentRemaining, remainingDays, colorClass, labelText };
//   };
//   // ----------------------------------------------------

//   const columns = [
//     {
//       title: <span className="fw-semibold text-secondary">ลำดับ</span>,
//       dataIndex: "job",
//       key: "job",
//       align: "center",
//       render: (text, record, index) => index + 1,
//       responsive: ["sm"],
//       className: "align-middle",
//     },
//     {
//       title: <span className="fw-semibold text-secondary">เลขงาน</span>,
//       dataIndex: "jobRef",
//       key: "jobRef",
//       align: "center",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//       responsive: ["xs", "sm", "md"],
//       className: "align-middle",
//       render: (t) => (
//         <span
//           className="badge rounded-pill text-bg-primary"
//           style={{ fontSize: ".85rem" }}
//         >
//           {t}
//         </span>
//       ),
//     },
//     {
//       title: <span className="fw-semibold text-secondary">สินค้า</span>,
//       dataIndex: "product_name",
//       key: "product_name",
//       align: "center",
//       className: "align-middle",
//       render: (text) => <span className="text-dark">{text}</span>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">Serial Number</span>,
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       align: "center",
//       className: "align-middle text-muted",
//       responsive: ["lg"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">SKU</span>,
//       dataIndex: "sku",
//       key: "sku",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">ชื่อลูกค้า</span>,
//       dataIndex: "username",
//       key: "username",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">ชื่อผู้เปิดงาน</span>,
//       dataIndex: "serviceRef",
//       key: "serviceRef",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//     {
//       title: <span className="fw-semibold text-secondary">สถานะ</span>,
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//       render: (status) => {
//         // โทน badge แบบมินิมอล
//         const tone =
//           status?.includes("ส่ง") || status?.includes("สำเร็จ")
//             ? "success"
//             : status?.includes("รอ")
//             ? "warning"
//             : "danger";
//         return (
//           <span className={`badge text-bg-${tone}`} style={{ fontWeight: 600 }}>
//             {status}
//           </span>
//         );
//       },
//     },
//     {
//       title: <span className="fw-semibold text-secondary">วันที่เปิดงาน</span>,
//       dataIndex: "createAt",
//       key: "createAt",
//       align: "center",
//       className: "align-middle",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">
//           ระยะเวลาที่ดำเนินการคงเหลือ
//         </span>
//       ),
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//       align: "center",
//       className: "align-middle",
//       sorter: (a, b) => a.remainingTime - b.remainingTime,
//       defaultSortOrder: "ascend",
//       responsive: ["md"],
//       render: (text, record) => {
//         const { percentRemaining, colorClass, labelText } = computeTimeProgress(
//           record.createAt,
//           record.expected_completion_date
//         );

//         return (
//           <div>
//             <div
//               className="progress"
//               style={{ height: "0.9rem", borderRadius: "0.75rem" }}
//             >
//               <div
//                 className={`progress-bar ${colorClass}`}
//                 role="progressbar"
//                 style={{
//                   width: `${percentRemaining}%`,
//                   transition: "width .6s ease",
//                 }}
//                 aria-valuenow={percentRemaining}
//                 aria-valuemin="0"
//                 aria-valuemax="100"
//               />
//             </div>
//             <small className="text-muted d-block mt-1">{labelText}</small>
//           </div>
//         );
//       },
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">
//           วันที่แก้ไขสถานะล่าสุด
//         </span>
//       ),
//       dataIndex: "updateAt",
//       key: "updateAt",
//       align: "center",
//       className: "align-middle",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: (
//         <span className="fw-semibold text-secondary">ผู้แก้ไขสถานะล่าสุด</span>
//       ),
//       dataIndex: "updateBy",
//       key: "updateBy",
//       align: "center",
//       className: "align-middle",
//       responsive: ["md"],
//     },
//   ];

//   // *** คง logic เดิมไว้ ***
//   const countRemainingTimeWarning = (data) => {
//     return data
//       .filter((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return remainingTimeInDays <= 2;
//       })
//       .map((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return {
//           ...item,
//           remainingTime: remainingTimeInDays,
//         };
//       });
//   };

//   const handleClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleSearch = (e) => {
//     setSearchData(e.target.value);
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product_name",
//       "serialNumber",
//       "sku",
//       "username",
//       "createdBy",
//       "jobStatus",
//       "createAt",
//       "remainingTime",
//       "updateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });
//     return matchesSearch;
//   });

//   return (
//     <div className="container-fluid py-4">
//       {/* สไตล์เสริม (ไม่มีใน Bootstrap) */}
//       <style>{`
//         .bg-maroon { background-color: #800000 !important; }
//         .ant-table { border-radius: 1rem; overflow: hidden; }
//         .ant-table-thead > tr > th {
//           background: #f8f9fa !important;
//           color: #6c757d !important;
//           font-weight: 600 !important;
//           font-size: 0.95rem !important;
//         }
//         .ant-table-tbody > tr > td {
//           font-size: 0.95rem !important;
//           padding-top: .9rem !important;
//           padding-bottom: .9rem !important;
//         }
//         .ant-table-tbody > tr:hover > td {
//           background: #fcfcfd !important;
//         }
//         .clickable-row { cursor: pointer; }
//       `}</style>

//       {/* Header Card */}
//       <div
//         className="card shadow-sm border-0 mb-3"
//         style={{ borderRadius: "1rem" }}
//       >
//         <div className="card-body p-3 p-sm-4">
//           <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
//             <div>
//               <h1 className="h4 mb-1 text-dark">แจ้งเตือนสถานะงานที่คงค้าง</h1>
//               {/* <div className="d-flex align-items-center gap-2">
//                 <span className="badge text-bg-success">ปกติ</span>
//                 <span className="badge text-bg-warning">ใกล้ครบกำหนด</span>
//                 <span className="badge text-bg-danger">เร่งด่วน</span>
//                 <span
//                   className="badge"
//                   style={{ background: "#800000", color: "#fff" }}
//                 >
//                   เลยกำหนด
//                 </span>
//               </div> */}
//             </div>

//             {/* Search */}
//             <div
//               className="ms-lg-auto"
//               style={{ minWidth: 280, maxWidth: 420 }}
//             >
//               <Form.Item name="Input" className="mb-0">
//                 <Input
//                   value={searchData}
//                   onChange={handleSearch}
//                   size="large"
//                   prefix={
//                     <IoSearch
//                       style={{
//                         width: 22,
//                         height: 22,
//                         marginRight: 6,
//                         color: "grey",
//                       }}
//                     />
//                   }
//                   placeholder="ค้นหางานที่ต้องการ"
//                   style={{
//                     height: 44,
//                     borderRadius: 24,
//                     backgroundColor: "#fff",
//                     borderColor: "#d0d5dd",
//                   }}
//                 />
//               </Form.Item>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Data Card */}
//       <div className="card shadow-sm border-0" style={{ borderRadius: "1rem" }}>
//         <div className="card-body p-2 p-sm-3">
//           <div className="table-responsive">
//             <Table
//               dataSource={countRemainingTimeWarning(filterData)}
//               columns={columns}
//               rowKey={(r) => r.jobRef}
//               onRow={(record) => {
//                 return {
//                   className: "clickable-row",
//                   onClick: () => handleClick(record),
//                 };
//               }}
//               pagination={{ pageSize: 10, showSizeChanger: false }}
//               style={{ width: "100%", textAlign: "center" }}
//               sticky
//               // scroll={{ x: "max-content", y: 480 }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import { Table, Tag, Input, Form } from "antd";
// import axios from "axios";
// import { useState, useEffect } from "react";
// import { IoSearch } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";

// // const { Option } = Select;

// export default function Backlogs() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const navigate = useNavigate();

//   const getData = () => {
//     const url = "http://localhost:3302/get-job";
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

//   useEffect(() => {
//     getData();
//   }, []);

//   // ---------- Helpers สำหรับ progress ----------
//   const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

//   const daysBetween = (a, b) => {
//     const ms = b.getTime() - a.getTime();
//     return Math.floor(ms / (1000 * 60 * 60 * 24));
//   };

//   // คืนค่า: { percentRemaining(0-100), remainingDays, colorClass, labelText }
//   const computeTimeProgress = (createAtISO, expectedISO) => {
//     const now = new Date();
//     const start = new Date(createAtISO); // วันที่เปิดงาน
//     const end = new Date(expectedISO); // กำหนดเสร็จ

//     // กัน edge case
//     const totalMs = Math.max(1, end.getTime() - start.getTime());
//     const remainingDays = daysBetween(now, end); // เหลืออีกกี่วัน (ติดลบ = เลยกำหนด)

//     // เปอร์เซ็นต์ “เวลาที่เหลือ” แบบนับถอยหลัง
//     let percentRemaining = ((end.getTime() - now.getTime()) / totalMs) * 100;

//     // กรณีหมดเวลา/เลยกำหนด = เต็มหลอด 100%
//     if (remainingDays <= 0) {
//       percentRemaining = 100;
//     } else {
//       percentRemaining = clamp(Math.round(percentRemaining), 0, 100);
//     }

//     // สีแถบตามช่วงวัน
//     let colorClass = "bg-success"; // เหลือเยอะ
//     if (remainingDays <= 5 && remainingDays >= 3) {
//       colorClass = "bg-warning"; // ใกล้ครบกำหนด
//     }
//     if (remainingDays <= 2 && remainingDays > 0) {
//       colorClass = "bg-danger"; // เร่งด่วนมาก
//     }
//     if (remainingDays <= 0) {
//       colorClass = "bg-maroon"; // หมดเวลา/เลยกำหนด
//     }

//     const labelText =
//       remainingDays < 0
//         ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
//         : remainingDays === 0
//         ? "ครบเวลาดำเนินการ"
//         : `${remainingDays} วัน`;

//     return { percentRemaining, remainingDays, colorClass, labelText };
//   };
//   // ------------------------------------------------

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       align: "center",
//       render: (text, record, index) => index + 1,
//       responsive: ["sm"],
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       align: "center",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//       responsive: ["xs", "sm", "md"],
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       align: "center",
//       render: (text) => <a>{text}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//       responsive: ["md"],
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       align: "center",
//       responsive: ["lg"],
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//       align: "center",
//       responsive: ["md"],
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//       align: "center",
//       responsive: ["md"],
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "serviceRef",
//       key: "serviceRef",
//       align: "center",
//       responsive: ["md"],
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       align: "center",
//       render: (status) => {
//         let color = "red";
//         return <Tag color={color}>{status}</Tag>;
//       },
//       responsive: ["md"],
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       align: "center",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: "ระยะเวลาที่ดำเนินการคงเหลือ",
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//       align: "center",
//       sorter: (a, b) => a.remainingTime - b.remainingTime,
//       defaultSortOrder: "ascend",
//       responsive: ["md"],
//       render: (text, record) => {
//         const { percentRemaining, colorClass, labelText } = computeTimeProgress(
//           record.createAt,
//           record.expected_completion_date
//         );

//         return (
//           <div>
//             <div
//               className="progress"
//               style={{ height: "20px", borderRadius: "10px" }}
//             >
//               <div
//                 className={`progress-bar ${colorClass}`}
//                 role="progressbar"
//                 style={{
//                   width: `${percentRemaining}%`,
//                   transition: "width 0.6s ease",
//                 }}
//                 aria-valuenow={percentRemaining}
//                 aria-valuemin="0"
//                 aria-valuemax="100"
//               >
//                 {labelText}
//               </div>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       title: "วันที่แก้ไขสถานะล่าสุด",
//       dataIndex: "updateAt",
//       key: "updateAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "updateBy",
//       key: "updateBy",
//       responsive: ["md"],
//       align: "center",
//     },
//   ];

//   // *** คง logic เดิมไว้ตามที่ขอ ***
//   const countRemainingTimeWarning = (data) => {
//     return data
//       .filter((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return remainingTimeInDays <= 2;
//       })
//       .map((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return {
//           ...item,
//           remainingTime: remainingTimeInDays,
//         };
//       });
//   };

//   const handleClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleSearch = (e) => {
//     setSearchData(e.target.value);
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product_name",
//       "serialNumber",
//       "sku",
//       "username",
//       "createdBy",
//       "jobStatus",
//       "createAt",
//       "remainingTime",
//       "updateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });
//     return matchesSearch;
//   });

//   return (
//     <div className="contain-main">
//       {/* สีแดงเลือดหมูสำหรับหมดเวลา/เลยกำหนด */}
//       <style>{`
//         .bg-maroon {
//           background-color: #800000 !important;
//         }
//         .ant-table-thead > tr > th {
//           font-size: 1.1rem !important; /* ขนาดฟอนต์สำหรับหัวข้อตาราง */
//         }
//         .ant-table-tbody > tr > td {
//           font-size: 1rem !important; /* ขนาดฟอนต์สำหรับข้อมูลในตาราง */
//         }
//         .clickable-row {
//             cursor: pointer;
//         }
//       `}</style>

//       <div
//         style={{
//           overflowX: "auto",
//           maxWidth: "100%",
//           padding: "0 10px",
//           boxSizing: "border-box",
//         }}
//       >
//         <h1
//           className="text-danger mb-4 mt-5 text-center "
//           style={{ fontSize: "2rem" }}
//         >
//           แจ้งเตือนสถานะงานที่คงค้าง
//         </h1>
//         <div className="d-flex justify-content-end">
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
//             <Input
//               value={searchData}
//               onChange={handleSearch}
//               prefix={<IoSearch style={{ width: "30px", height: "30px" }} />}
//               placeholder="ค้นหางานที่ต้องการ"
//               style={{
//                 width: "399px",
//                 height: "49px",
//                 backgroundColor: "#FFFFFF",
//                 borderColor: "#AAAAAAFF",
//                 color: "#CCCCCC",
//                 borderRadius: "20px",
//                 fontSize: "1rem",
//               }}
//             />
//           </Form.Item>
//         </div>
//         <Table
//           dataSource={countRemainingTimeWarning(filterData)}
//           columns={columns}
//           rowKey={(r) => r.jobRef}
//           onRow={(record) => {
//             return {
//               onClick: () => {
//                 handleClick(record);
//               },
//             };
//           }}
//           style={{
//             width: "100%",
//             textAlign: "center",
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import { Table, Tag, Input, Form } from "antd";
// import axios from "axios";
// import { useState, useEffect } from "react";
// import { IoSearch } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";

// // const { Option } = Select;

// export default function Backlogs() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const navigate = useNavigate();

//   const getData = () => {
//     const url = "http://localhost:3302/get-job";
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

//   useEffect(() => {
//     getData();
//   }, []);

//   // ---------- Helpers สำหรับสถานะเวลา ----------
//   const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

//   const daysBetween = (a, b) => {
//     const ms = b.getTime() - a.getTime();
//     return Math.floor(ms / (1000 * 60 * 60 * 24));
//   };

//   // คืนค่า: { percentRemaining(0-100), remainingDays, colorClass, labelText }
//   const computeTimeProgress = (createAtISO, expectedISO) => {
//     const now = new Date();
//     const start = new Date(createAtISO); // วันที่เปิดงาน
//     const end = new Date(expectedISO); // กำหนดเสร็จ

//     const totalDays = Math.max(1, daysBetween(start, end)); // กันหาร 0
//     const remainingDays = daysBetween(now, end); // เหลืออีกกี่วัน (ติดลบ = เลยกำหนด)
//     const elapsedDays = daysBetween(start, now);

//     // เปอร์เซ็นต์ “เวลาที่เหลือ” แบบนับถอยหลัง
//     const rawPercent =
//       ((end.getTime() - now.getTime()) / (end.getTime() - start.getTime())) *
//       100;
//     const percentRemaining = clamp(Math.round(rawPercent), 0, 100);

//     // กำหนดสี
//     let colorClass = "bg-success"; // เขียว
//     if (remainingDays <= 5 && remainingDays >= 3) {
//       colorClass = "bg-warning"; // เหลือง
//     }
//     if (remainingDays <= 2 && remainingDays >= 0) {
//       colorClass = "bg-danger"; // แดง
//     }
//     if (remainingDays <= 0) {
//       colorClass = "bg-maroon"; // แดงเลือดหมู (กำหนดใน CSS)
//     }

//     const labelText =
//       remainingDays < 0
//         ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
//         : `${remainingDays} วัน`;

//     return {
//       percentRemaining,
//       remainingDays,
//       colorClass,
//       labelText,
//       totalDays,
//       elapsedDays,
//     };
//   };
//   // ---------------------------------------------

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       render: (text, record, index) => index + 1,
//       responsive: ["sm"],
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//       responsive: ["xs", "sm", "md"],
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       render: (text) => <a>{text}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//       responsive: ["md"],
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       responsive: ["lg"],
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//       responsive: ["md"],
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//       responsive: ["md"],
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "createdBy",
//       key: "createdBy",
//       responsive: ["md"],
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       render: (status) => {
//         let color = "red";
//         return <Tag color={color}>{status}</Tag>;
//       },
//       responsive: ["md"],
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: "ระยะเวลาที่ดำเนินการคงเหลือ",
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//       sorter: (a, b) => a.remainingTime - b.remainingTime,
//       defaultSortOrder: "ascend",
//       responsive: ["md"],
//       render: (text, record) => {
//         // ใช้ createAt เป็นวันเริ่ม และ expected_completion_date เป็นเส้นตาย
//         const { percentRemaining, colorClass, labelText } = computeTimeProgress(
//           record.createAt,
//           record.expected_completion_date
//         );

//         return (
//           <div>
//             <div
//               className="progress"
//               style={{ height: "20px", borderRadius: "10px" }}
//             >
//               <div
//                 className={`progress-bar ${colorClass}`}
//                 role="progressbar"
//                 style={{
//                   width: `${percentRemaining}%`,
//                   transition: "width 0.6s ease",
//                 }}
//                 aria-valuenow={percentRemaining}
//                 aria-valuemin="0"
//                 aria-valuemax="100"
//               >
//                 {percentRemaining}%
//               </div>
//             </div>
//             <div style={{ fontSize: "12px", marginTop: "6px" }}>
//               {labelText}
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       title: "วันที่แก้ไขสถานะล่าสุด",
//       dataIndex: "updateAt",
//       key: "updateAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "updatedBy",
//       key: "updatedBy",
//       responsive: ["md"],
//     },
//   ];

//   const countRemainingTimeWarning = (data) => {
//     return data
//       .filter((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return remainingTimeInDays <= 2;
//       })
//       .map((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return {
//           ...item,
//           remainingTime: remainingTimeInDays,
//         };
//       });
//   };

//   const handleClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleSearch = (e) => {
//     setSearchData(e.target.value);
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product_name",
//       "serialNumber",
//       "sku",
//       "username",
//       "createdBy",
//       "jobStatus",
//       "createAt",
//       "remainingTime",
//       "updateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });
//     return matchesSearch;
//   });

//   return (
//     <div className="contain-main">
//       {/* CSS เสริมสำหรับสีแดงเลือดหมู */}
//       <style>{`
//         .bg-maroon {
//           background-color: #800000 !important;
//         }
//       `}</style>

//       <div
//         style={{
//           overflowX: "auto",
//           maxWidth: "100%",
//           padding: "0 10px",
//           boxSizing: "border-box",
//         }}
//       >
//         <h1 className="text-danger mb-4 mt-5 text-center ">
//           แจ้งเตือนสถานะงานที่คงค้าง
//         </h1>
//         <div className="d-flex justify-content-end">
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
//             <Input
//               value={searchData}
//               onChange={handleSearch}
//               prefix={<IoSearch style={{ width: "30px", height: "30px" }} />}
//               placeholder="ค้นหางานที่ต้องการ"
//               style={{
//                 width: "399px",
//                 height: "49px",
//                 backgroundColor: "#FFFFFF",
//                 borderColor: "#AAAAAAFF",
//                 color: "#CCCCCC",
//                 borderRadius: "20px",
//               }}
//             />
//           </Form.Item>
//         </div>
//         <Table
//           dataSource={countRemainingTimeWarning(filterData)}
//           columns={columns}
//           rowKey={(r) => r.jobRef}
//           onRow={(record) => {
//             return {
//               onClick: () => {
//                 handleClick(record);
//               },
//             };
//           }}
//           style={{
//             width: "100%",
//             textAlign: "center",
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import { Table, Tag, Input, Form } from "antd";
// import axios from "axios";
// import { useState } from "react";
// import { useEffect } from "react";
// import { IoSearch } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";

// // const { Option } = Select;

// export default function Backlogs() {
//   const [data, setData] = useState([]);
//   // const [filterdData, setFilterdData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const navigate = useNavigate();

//   const getData = () => {
//     const url = "http://localhost:3302/get-job";
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

//   useEffect(() => {
//     getData();
//   }, []);

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       render: (text, record, index) => index + 1,
//       responsive: ["sm"],
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//       responsive: ["xs", "sm", "md"],
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       render: (text) => <a>{text}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//       responsive: ["md"],
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       responsive: ["lg"],
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//       responsive: ["md"],
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//       responsive: ["md"],
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "createdBy",
//       key: "createdBy",
//       responsive: ["md"],
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       render: (status) => {
//         let color = "red";
//         // if (status === "กำลังดำเนินการ") {
//         //   color = "orange";
//         // } else if (status === "รอจัดส่ง") {
//         //   color = "geekblue";
//         // } else if (status === "จัดส่งแล้ว") {
//         //   color = "green";
//         // }
//         return <Tag color={color}>{status}</Tag>;
//       },
//       responsive: ["md"],
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: "ระยะเวลาที่ดำเนินการคงเหลือ",
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//       sorter: (a, b) => a.remainingTime - b.remainingTime,
//       defaultSortOrder: "ascend",
//       responsive: ["md"],
//     },
//     {
//       title: "วันที่แก้ไขสถานะล่าสุด",
//       dataIndex: "updateAt",
//       key: "updateAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//       responsive: ["md"],
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "updatedBy",
//       key: "updatedBy",
//       responsive: ["md"],
//     },
//   ];

//   const countRemainingTimeWarning = (data) => {
//     return data
//       .filter((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         return remainingTimeInDays <= 2;
//       })
//       .map((item) => {
//         const updateAt = new Date(item.expected_completion_date);
//         const createAt = new Date();
//         const remainingTimeInMilliseconds =
//           updateAt.getTime() - createAt.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );

//         return {
//           ...item,
//           // remainingTime: Math.max(0,remainingTimeInDays),
//           remainingTime: remainingTimeInDays,
//         };
//       });
//   };

//   // useEffect(() => {
//   //   const results = data.filter((item) => {
//   //     // Use optional chaining (?) to safely access properties
//   //     const name = item.name?.toLowerCase() || "";
//   //     const category = item.category?.toLowerCase() || "";

//   //     const search = searchData.toLowerCase();

//   //     return name.includes(search) || category.includes(search);
//   //   });
//   //   setFilterdData(results);
//   // }, [searchData, data]);

//   const handleClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleSearch = (e) => {
//     setSearchData(e.target.value);
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product_name",
//       "serialNumber",
//       "sku",
//       "username",
//       "createdBy",
//       "jobStatus",
//       "createAt",
//       "remainingTime",
//       "updateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });
//     return matchesSearch;
//   });

//   return (
//     <div className="contain-main">
//       <div
//         style={{
//           overflowX: "auto",
//           maxWidth: "100%",
//           padding: "0 10px",
//           boxSizing: "border-box",
//         }}
//       >
//         <h1 className="text-danger mb-4 mt-5 text-center ">
//           แจ้งเตือนสถานะงานที่คงค้าง
//         </h1>
//         <div className="d-flex justify-content-end">
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
//             <Input
//               // onChange={(e) => setSearchData(e.target.value)}
//               value={searchData}
//               onChange={handleSearch}
//               prefix={<IoSearch style={{ width: "30px", height: "30px" }} />}
//               placeholder="ค้นหางานที่ต้องการ"
//               style={{
//                 width: "399px",
//                 height: "49px",
//                 backgroundColor: "#FFFFFF",
//                 borderColor: "#AAAAAAFF",
//                 color: "#CCCCCC",
//                 borderRadius: "20px",
//               }}
//             />
//           </Form.Item>
//         </div>
//         <Table
//           dataSource={countRemainingTimeWarning(filterData)}
//           columns={columns}
//           onRow={(record) => {
//             return {
//               onClick: () => {
//                 handleClick(record);
//               },
//             };
//           }}
//           style={{
//             width: "100%",
//             textAlign: "center",
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// // import React from "react";
// // import { Table, Tag, Input, Form } from "antd";
// // import axios from "axios";
// // import { useState } from "react";
// // import { useEffect } from "react";
// // import { IoSearch } from "react-icons/io5";
// // import { useNavigate } from "react-router-dom";

// // // const { Option } = Select;

// // export default function Backlogs() {
// //   const [data, setData] = useState([]);
// //   // const [filterdData, setFilterdData] = useState([]);
// //   const [searchData, setSearchData] = useState("");
// //   const navigate = useNavigate();

// //   const getData = () => {
// //     const url = "http://localhost:3302/get-job";
// //     axios
// //       .get(url)
// //       .then((response) => {
// //         setData(response.data);
// //         console.log(response.data);
// //       })
// //       .catch((error) => {
// //         console.error("Error fetching data:", error);
// //       });
// //   };

// //   useEffect(() => {
// //     getData();
// //   }, []);

// //   const columns = [
// //     {
// //       title: "ลำดับ",
// //       dataIndex: "job",
// //       key: "job",
// //       render: (text, record, index) => index + 1,
// //     },
// //     {
// //       title: "เลขงาน",
// //       dataIndex: "jobRef",
// //       key: "jobRef",
// //       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
// //     },
// //     {
// //       title: "สินค้า",
// //       dataIndex: "product_name",
// //       key: "product_name",
// //       render: (text) => <a>{text}</a>,
// //       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
// //     },
// //     {
// //       title: "Serial Number",
// //       dataIndex: "serialNumber",
// //       key: "serialNumber",
// //     },
// //     {
// //       title: "SKU",
// //       dataIndex: "sku",
// //       key: "sku",
// //     },
// //     {
// //       title: "ชื่อลูกค้า",
// //       dataIndex: "username",
// //       key: "username",
// //     },
// //     {
// //       title: "ชื่อผู้เปิดงาน",
// //       dataIndex: "createdBy",
// //       key: "createdBy",
// //     },
// //     {
// //       title: "สถานะ",
// //       key: "jobStatus",
// //       dataIndex: "jobStatus",
// //       render: (status) => {
// //         let color = "red";
// //         // if (status === "กำลังดำเนินการ") {
// //         //   color = "orange";
// //         // } else if (status === "รอจัดส่ง") {
// //         //   color = "geekblue";
// //         // } else if (status === "จัดส่งแล้ว") {
// //         //   color = "green";
// //         // }
// //         return <Tag color={color}>{status}</Tag>;
// //       },
// //     },
// //     {
// //       title: "วันที่เปิดงาน",
// //       dataIndex: "createAt",
// //       key: "createAt",
// //       render: (date) => new Date(date).toLocaleDateString("th-TH"),
// //     },
// //     {
// //       title: "ระยะเวลาที่ดำเนินการคงเหลือ",
// //       dataIndex: "remainingTime",
// //       key: "remainingTime",
// //       sorter: (a, b) => a.remainingTime - b.remainingTime,
// //       defaultSortOrder: "ascend",
// //     },
// //     {
// //       title: "วันที่แก้ไขสถานะล่าสุด",
// //       dataIndex: "updateAt",
// //       key: "updateAt",
// //       render: (date) => new Date(date).toLocaleDateString("th-TH"),
// //     },
// //     {
// //       title: "ผู้แก้ไขสถานะล่าสุด",
// //       dataIndex: "updatedBy",
// //       key: "updatedBy",
// //     },
// //   ];

// //   const countRemainingTimeWarning = (data) => {
// //     return data
// //       .filter((item) => {
// //         const updateAt = new Date(item.expected_completion_date);
// //         const createAt = new Date();
// //         const remainingTimeInMilliseconds =
// //           updateAt.getTime() - createAt.getTime();
// //         const remainingTimeInDays = Math.floor(
// //           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
// //         );
// //         return remainingTimeInDays <= 2;
// //       })
// //       .map((item) => {
// //         const updateAt = new Date(item.expected_completion_date);
// //         const createAt = new Date();
// //         const remainingTimeInMilliseconds =
// //           updateAt.getTime() - createAt.getTime();
// //         const remainingTimeInDays = Math.floor(
// //           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
// //         );

// //         return {
// //           ...item,
// //           // remainingTime: Math.max(0,remainingTimeInDays),
// //           remainingTime: remainingTimeInDays,
// //         };
// //       });
// //   };

// //   // useEffect(() => {
// //   //   const results = data.filter((item) => {
// //   //     // Use optional chaining (?) to safely access properties
// //   //     const name = item.name?.toLowerCase() || "";
// //   //     const category = item.category?.toLowerCase() || "";

// //   //     const search = searchData.toLowerCase();

// //   //     return name.includes(search) || category.includes(search);
// //   //   });
// //   //   setFilterdData(results);
// //   // }, [searchData, data]);

// //   const handleClick = (record) => {
// //     navigate(`/show-job/${record.jobRef}`);
// //   };

// //   const handleSearch = (e) => {
// //     setSearchData(e.target.value);
// //   };

// //   const filterData = data.filter((item) => {
// //     const searchableFields = [
// //       "jobRef",
// //       "product",
// //       "serialNumber",
// //       "sku",
// //       "customerName",
// //       "createdBy",
// //       "jobStatus",
// //       "createAt",
// //       "remainingTime",
// //       "updateAt",
// //       "updatedBy",
// //     ];
// //     const matchesSearch = searchableFields.some((field) => {
// //       const fieldValue = item[field];
// //       return (
// //         typeof fieldValue === "string" &&
// //         fieldValue.toLowerCase().includes(searchData.toLowerCase())
// //       );
// //     });
// //     return matchesSearch;
// //   });

// //   return (
// //     <div className="contain-main">
// //       <div>
// //         <h1 className="text-danger mb-4 mt-5 text-center ">
// //           แจ้งเตือนสถานะงานที่คงค้าง
// //         </h1>
// //         <div className="d-flex justify-content-end">
// //           <Form.Item
// //             name="Input"
// //             rules={[{ required: true, message: "Please input!" }]}
// //           >
// //             <Input
// //               // onChange={(e) => setSearchData(e.target.value)}
// //               value={searchData}
// //               onChange={handleSearch}
// //               prefix={<IoSearch style={{ width: "30px", height: "30px" }} />}
// //               placeholder="ค้นหางานที่ต้องการ"
// //               style={{
// //                 width: "399px",
// //                 height: "49px",
// //                 backgroundColor: "#FFFFFF",
// //                 borderColor: "#AAAAAAFF",
// //                 color: "#CCCCCC",
// //                 borderRadius: "20px",
// //               }}
// //             />
// //           </Form.Item>
// //         </div>
// //         <Table
// //           dataSource={countRemainingTimeWarning(filterData)}
// //           columns={columns}
// //           scroll={{ x: 1300 }}
// //           onRow={(record) => {
// //             return {
// //               onClick: () => {
// //                 handleClick(record);
// //               },
// //             };
// //           }}
// //           style={{
// //             textAlign: "center",
// //           }}
// //         />
// //       </div>
// //     </div>
// //   );
// // }
