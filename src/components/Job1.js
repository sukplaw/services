import React from "react";
import {
  Table,
  Tag,
  Form,
  Input,
  Space,
  Dropdown,
  Select,
  message,
} from "antd";
import Button from "react-bootstrap/Button";
import { IoSearch } from "react-icons/io5";
import { BiFilterAlt } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { MdEditDocument } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { IoMdCheckmarkCircle } from "react-icons/io";

const { Option } = Select;

export default function Job() {
  const [data, setData] = useState([]);
  const [searchData, setSearchData] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [changedStatus, setChangedStatus] = useState({});
  const [open, setOpen] = useState(false);

  const rowClassName = (record) => {
    if (
      record.jobStatus === "จัดส่งสำเร็จ" ||
      record.jobStatus === "ยกเลิกการเคลมสินค้า"
    ) {
      return "";
    }
    return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";
  };

  const getData = async () => {
    try {
      const url = "http://localhost:3302/get-job";
      const response = await axios.get(url);
      const formattedData = response.data.map((item) => ({
        ...item,
        key: item.jobRef,
      }));
      setData(formattedData);
      console.log(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleEditStatus = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setChangedStatus({});
    }
  };

  const handleStatusChange = (newStatus, jobRef) => {
    setChangedStatus((prev) => ({
      ...prev,
      [jobRef]: newStatus,
    }));
  };

  const stepFlow = [
    "เริ่มงาน",
    "สั่งอะไหล่",
    "เริ่มการซ่อม",
    "ซ่อมสำเร็จ",
    "รอทดสอบ",
    "รอจัดส่ง",
    "จัดส่งสำเร็จ",
    "ยกเลิกการเคลมสินค้า",
  ];

  const allowedTransitions = {
    เริ่มงาน: ["สั่งอะไหล่", "เริ่มการซ่อม", "ยกเลิกการเคลมสินค้า"],
    สั่งอะไหล่: ["เริ่มการซ่อม", "ยกเลิกการเคลมสินค้า"],
    เริ่มการซ่อม: ["ซ่อมสำเร็จ", "ยกเลิกการเคลมสินค้า"],
    ซ่อมสำเร็จ: ["รอทดสอบ", "ยกเลิกการเคลมสินค้า"],
    รอทดสอบ: ["รอจัดส่ง", "ยกเลิกการเคลมสินค้า"],
    รอจัดส่ง: ["จัดส่งสำเร็จ", "ยกเลิกการเคลมสินค้า"],
    จัดส่งสำเร็จ: [],
    ยกเลิกการเคลมสินค้า: [],
  };

  const handleConfirm = async () => {
    try {
      const updatePromises = Object.keys(changedStatus).map((jobRef) => {
        const newStatus = changedStatus[jobRef];
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const currentUser = localStorage.getItem("username") || "unknown";

        const currentRow = data.find((d) => d.jobRef === jobRef);
        const currentStatus = currentRow?.jobStatus || "เริ่มงาน";
        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
          message.error(
            `ไม่สามารถเปลี่ยนสถานะจาก "${currentStatus}" ไปเป็น "${newStatus}" ได้`
          );
          throw new Error("Invalid status transition");
        }

        return axios.put(
          `http://localhost:3302/update-status/${jobRef}`,
          {
            jobStatus: newStatus,
            latestUpdateBy: currentUser,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      });

      await Promise.all(updatePromises);
      message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
      await getData();
      setIsEditing(false);
      setChangedStatus({});
    } catch (error) {
      if (error?.message !== "Invalid status transition") {
        message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      }
      console.error("Failed to update status:", error);
    }
  };

  const daysBetween = (a, b) => {
    const ms = b.getTime() - a.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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

    let colorClass = "bg-success";
    if (remainingDays <= 5 && remainingDays >= 3) {
      colorClass = "bg-warning";
    }
    if (remainingDays <= 2 && remainingDays > 0) {
      colorClass = "bg-danger";
    }
    if (remainingDays <= 0) {
      colorClass = "bg-danger";
    }

    const labelText =
      remainingDays < 0
        ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
        : remainingDays === 0
        ? "ครบเวลาดำเนินการ"
        : `${remainingDays} วัน`;

    return { percentRemaining, remainingDays, colorClass, labelText };
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
          {record.remainingTime <= 2 && (
            <span className="red-dot" title="งานใกล้กำหนด"></span>
          )}
          <span>{i + 1}</span>
        </div>
      ),
    },
    {
      title: "เลขงาน",
      dataIndex: "jobRef",
      key: "jobRef",
      align: "center",
      sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
    },
    {
      title: "สินค้า",
      dataIndex: "product_name",
      key: "product_name",
      align: "center",
      render: (t) => <a>{t}</a>,
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
    },
    {
      title: "Serial Number",
      dataIndex: "serialNumber",
      key: "serialNumber",
      align: "center",
    },
    { title: "SKU", dataIndex: "sku", key: "sku", align: "center" },
    {
      title: "ชื่อลูกค้า",
      dataIndex: "username",
      key: "username",
      align: "center",
    },
    {
      title: "ชื่อผู้เปิดงาน",
      dataIndex: "serviceRef",
      key: "serviceRef",
      align: "center",
    },

    // --- สถานะ (UI แบบชิป + Select ตอนแก้ไข) ---
    {
      title: "สถานะ",
      key: "jobStatus",
      dataIndex: "jobStatus",
      align: "center",
      width: 150,
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

        if (isEditing) {
          return (
            <Select
              value={changedStatus[record.jobRef] || undefined}
              placeholder="เลือกสถานะถัดไป"
              style={{ width: 180 }}
              onClick={(e) => e.stopPropagation()}
              onChange={(value) => handleStatusChange(value, record.jobRef)}
              disabled={(allowedTransitions[currentStatus] || []).length === 0}
            >
              {(allowedTransitions[currentStatus] || []).map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          );
        }

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
      sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },

    // --- ระยะเวลาที่ดำเนินการคงเหลือ (Progress สวยขึ้น) ---
    {
      title: "ระยะเวลาที่ดำเนินการคงเหลือ",
      dataIndex: "remainingTime",
      key: "remainingTime",
      align: "center",
      sorter: (a, b) => a.remainingTime - b.remainingTime,
      render: (text, record) => {
        const { percentRemaining, colorClass, labelText } = computeTimeProgress(
          record.createAt,
          record.expected_completion_date
        );
        return (
          <div style={{ minWidth: 240 }}>
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
      render: (d) => new Date(d).toLocaleDateString("th-TH"),
    },
    {
      title: "ผู้แก้ไขสถานะล่าสุด",
      dataIndex: "latestUpdateBy",
      key: "latestUpdateBy",
      align: "center",
      width: 100,
    },
  ];

  const hasChanges = Object.keys(changedStatus).length > 0;
  const navigate = useNavigate();
  const handletoCreateJob = () => navigate("/create-job");

  const menuItems = stepFlow.map((s) => ({ key: s, label: s }));
  menuItems.unshift({ key: "all", label: "ทั้งหมด" });

  const handleMenuClick = (e) => {
    if (e.key === "all") setSelectedStatus(null);
    else setSelectedStatus(e.key);
  };
  const menuProps = { items: menuItems, onClick: handleMenuClick };

  const filterData = data.filter((item) => {
    const searchableFields = [
      "jobRef",
      "product_name",
      "serialNumber",
      "sku",
      "username",
      "createdBy",
      "jobStatus",
      "createAt",
      "remainingTime",
      "latestUpdateAt",
      "latestUpdateBy",
    ];
    const matchesSearch = searchableFields.some(
      (f) =>
        typeof item[f] === "string" &&
        item[f].toLowerCase().includes(searchData.toLowerCase())
    );
    const matchesStatus = selectedStatus
      ? item.jobStatus === selectedStatus
      : true;
    return matchesSearch && matchesStatus;
  });

  const countRemainingTime = (filterData) => {
    return filterData.map((item) => {
      const expectedDate = new Date(item.expected_completion_date);
      let baseDate;
      if (
        item.jobStatus === "จัดส่งสำเร็จ" ||
        item.jobStatus === "ยกเลิกการเคลมสินค้า"
      )
        baseDate = new Date(item.latestUpdateAt);
      else baseDate = new Date();
      const remainingTimeInMilliseconds =
        expectedDate.getTime() - baseDate.getTime();
      const remainingTimeInDays = Math.floor(
        remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
      );
      return { ...item, remainingTime: remainingTimeInDays };
    });
  };

  const handleRowClick = (record) => navigate(`/show-job/${record.jobRef}`);
  const handleClose = () => setOpen(false);

  return (
    <div className="container-fluid py-3" style={{ background: "#fafafa" }}>
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

      {/* Toolbar */}
      <div className="toolbar ui-card ui-card-shadow p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-lg-4 order-2 order-lg-1">
            <h2 className="m-0 list-heading">งานทั้งหมด</h2>
            <small className="text-muted">
              รายการงานทั้งหมดในระบบเคลม/ซ่อม
            </small>
            <div className="d-flex align-items-center gap-2 mt-2">
              <span className="badge text-bg-success">ปกติ</span>
              <span className="badge text-bg-warning">ใกล้ครบกำหนด</span>
              <span className="badge text-bg-danger">เร่งด่วน</span>
              <span
                className="badge"
                style={{ background: "#800000", color: "#fff" }}
              >
                เลยกำหนด
              </span>
            </div>
          </div>

          <div className="col-12 col-lg-4 order-1 order-lg-2">
            <Form.Item name="Input" className="m-0">
              <Input
                allowClear
                size="large"
                onChange={(e) => setSearchData(e.target.value)}
                prefix={
                  <IoSearch style={{ width: 22, height: 22, color: "grey" }} />
                }
                placeholder="ค้นหางานที่ต้องการ"
              />
            </Form.Item>
          </div>
          <div className="col-12 col-lg-4 order-3">
            <div className="d-flex justify-content-lg-end gap-2 flex-wrap">
              <Space>
                <Dropdown
                  menu={{
                    items: stepFlow
                      .map((s) => ({ key: s, label: s }))
                      .concat([{ key: "all", label: "ทั้งหมด" }]),
                  }}
                  trigger={["click"]}
                >
                  <Button className="btn-ghost btn-pill btn-icon">
                    <BiFilterAlt />
                    เลือกสถานะ
                  </Button>
                </Dropdown>
              </Space>

              <Button
                className="btn-gradient btn-pill btn-icon"
                onClick={handletoCreateJob}
              >
                <FaPlus /> สร้างงาน
              </Button>

              <Button
                className="btn-pill btn-icon"
                variant={isEditing ? "outline-danger" : "outline-secondary"}
                onClick={handleEditStatus}
              >
                <MdEditDocument /> {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
              </Button>

              {isEditing && hasChanges && (
                <Button
                  className="btn-pill btn-icon"
                  variant="success"
                  onClick={() => {
                    handleConfirm();
                    setOpen(true);
                  }}
                >
                  <MdEditDocument /> ยืนยันการแก้ไขสถานะ
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="ui-card ui-card-shadow p-3">
        <Table
          dataSource={countRemainingTime(
            data.filter((item) => {
              const searchableFields = [
                "jobRef",
                "product_name",
                "serialNumber",
                "sku",
                "username",
                "createdBy",
                "jobStatus",
                "createAt",
                "remainingTime",
                "latestUpdateAt",
                "latestUpdateBy",
              ];
              const matchesSearch = searchableFields.some(
                (f) =>
                  typeof item[f] === "string" &&
                  item[f].toLowerCase().includes(searchData.toLowerCase())
              );
              const matchesStatus = selectedStatus
                ? item.jobStatus === selectedStatus
                : true;
              return matchesSearch && matchesStatus;
            })
          )}
          columns={columns}
          onRow={(record) => ({ onClick: () => handleRowClick(record) })}
          rowClassName={rowClassName}
          scroll={{ x: true }}
        />
      </div>

      {/* Success Modal */}
      <Modal show={open} onHide={() => setOpen(false)} centered>
        <Modal.Body className="text-center p-5">
          <IoMdCheckmarkCircle
            className="modal-icon"
            style={{ fontSize: 72, color: "#28a745" }}
          />
          <p className="mt-3 mb-0 fs-5 fw-semibold">การแก้ไขสถานะสำเร็จ</p>
        </Modal.Body>
      </Modal>
    </div>
  );
}

///////////////////////////แบบตกแต่งแล้วแต่บัค
// import React from "react";
// import {
//   Table,
//   Tag,
//   Form,
//   Input,
//   Space,
//   Dropdown,
//   Select,
//   message,
// } from "antd";
// import Button from "react-bootstrap/Button";
// import { IoSearch } from "react-icons/io5";
// import { BiFilterAlt } from "react-icons/bi";
// import { FaPlus } from "react-icons/fa";
// import { MdEditDocument } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useState, useEffect } from "react";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";

// const { Option } = Select;

// export default function Job() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});
//   const [open, setOpen] = useState(false);

//   const rowClassName = (record) => {
//     if (
//       record.jobStatus === "จัดส่งสำเร็จ" ||
//       record.jobStatus === "ยกเลิกการเคลมสินค้า"
//     ) {
//       return "";
//     }
//     return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";
//   };

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-job";
//       const response = await axios.get(url);
//       const formattedData = response.data.map((item) => ({
//         ...item,
//         key: item.jobRef,
//       }));
//       setData(formattedData);
//       console.log(formattedData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   const handleEditStatus = () => {
//     setIsEditing(!isEditing);
//     if (isEditing) {
//       setChangedStatus({});
//     }
//   };

//   const handleStatusChange = (newStatus, jobRef) => {
//     setChangedStatus((prev) => ({
//       ...prev,
//       [jobRef]: newStatus,
//     }));
//   };

//   const stepFlow = [
//     "เริ่มงาน",
//     "สั่งอะไหล่",
//     "เริ่มการซ่อม",
//     "ซ่อมสำเร็จ",
//     "รอทดสอบ",
//     "รอจัดส่ง",
//     "จัดส่งสำเร็จ",
//     "ยกเลิกการเคลมสินค้า",
//   ];

//   const allowedTransitions = {
//     เริ่มงาน: ["สั่งอะไหล่", "เริ่มการซ่อม", "ยกเลิกการเคลมสินค้า"],
//     สั่งอะไหล่: ["เริ่มการซ่อม", "ยกเลิกการเคลมสินค้า"],
//     เริ่มการซ่อม: ["ซ่อมสำเร็จ", "ยกเลิกการเคลมสินค้า"],
//     ซ่อมสำเร็จ: ["รอทดสอบ", "ยกเลิกการเคลมสินค้า"],
//     รอทดสอบ: ["รอจัดส่ง", "ยกเลิกการเคลมสินค้า"],
//     รอจัดส่ง: ["จัดส่งสำเร็จ", "ยกเลิกการเคลมสินค้า"],
//     จัดส่งสำเร็จ: [],
//     ยกเลิกการเคลมสินค้า: [],
//   };

//   const handleConfirm = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//         const newStatus = changedStatus[jobRef];
//         const token =
//           localStorage.getItem("token") || sessionStorage.getItem("token");
//         const currentUser = localStorage.getItem("username") || "unknown";

//         const currentRow = data.find((d) => d.jobRef === jobRef);
//         const currentStatus = currentRow?.jobStatus || "เริ่มงาน";
//         const allowed = allowedTransitions[currentStatus] || [];
//         if (!allowed.includes(newStatus)) {
//           message.error(
//             `ไม่สามารถเปลี่ยนสถานะจาก "${currentStatus}" ไปเป็น "${newStatus}" ได้`
//           );
//           throw new Error("Invalid status transition");
//         }

//         return axios.put(
//           `http://localhost:3302/update-status/${jobRef}`,
//           {
//             jobStatus: newStatus,
//             latestUpdateBy: currentUser,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//       });

//       await Promise.all(updatePromises);
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       setIsEditing(false);
//       setChangedStatus({});
//     } catch (error) {
//       if (error?.message !== "Invalid status transition") {
//         message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       }
//       console.error("Failed to update status:", error);
//     }
//   };

//   const daysBetween = (a, b) => {
//     const ms = b.getTime() - a.getTime();
//     return Math.floor(ms / (1000 * 60 * 60 * 24));
//   };

//   const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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

//     let colorClass = "bg-success";
//     if (remainingDays <= 5 && remainingDays >= 3) {
//       colorClass = "bg-warning";
//     }
//     if (remainingDays <= 2 && remainingDays > 0) {
//       colorClass = "bg-danger";
//     }
//     if (remainingDays <= 0) {
//       colorClass = "bg-danger";
//     }

//     const labelText =
//       remainingDays < 0
//         ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
//         : remainingDays === 0
//         ? "ครบเวลาดำเนินการ"
//         : `${remainingDays} วัน`;

//     return { percentRemaining, remainingDays, colorClass, labelText };
//   };

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       align: "center",
//       render: (t, record, i) => (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 8,
//           }}
//         >
//           {record.remainingTime <= 2 && (
//             <span className="red-dot" title="งานใกล้กำหนด"></span>
//           )}
//           <span>{i + 1}</span>
//         </div>
//       ),
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       align: "center",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       align: "center",
//       render: (t) => <a>{t}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       align: "center",
//     },
//     { title: "SKU", dataIndex: "sku", key: "sku", align: "center" },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//       align: "center",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "serviceRef",
//       key: "serviceRef",
//       align: "center",
//     },

//     // --- สถานะ (UI แบบชิป + Select ตอนแก้ไข) ---
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       align: "center",
//       width: 150,
//       render: (status, record) => {
//         const currentStatus = changedStatus[record.jobRef] || status;

//         let dotClass = "orange";
//         if (currentStatus === "สั่งอะไหล่") dotClass = "amber";
//         else if (currentStatus === "เริ่มการซ่อม") dotClass = "red";
//         else if (currentStatus === "ซ่อมสำเร็จ") dotClass = "brown";
//         else if (currentStatus === "รอทดสอบ") dotClass = "blue";
//         else if (currentStatus === "รอจัดส่ง") dotClass = "purple";
//         else if (currentStatus === "จัดส่งสำเร็จ") dotClass = "green";
//         else if (currentStatus === "ยกเลิกการเคลมสินค้า") dotClass = "cancel";

//         if (isEditing) {
//           return (
//             <Select
//               value={changedStatus[record.jobRef] || undefined}
//               placeholder="เลือกสถานะถัดไป"
//               style={{ width: 180 }}
//               onClick={(e) => e.stopPropagation()}
//               onChange={(value) => handleStatusChange(value, record.jobRef)}
//               disabled={(allowedTransitions[currentStatus] || []).length === 0}
//             >
//               {(allowedTransitions[currentStatus] || []).map((opt) => (
//                 <Option key={opt} value={opt}>
//                   {opt}
//                 </Option>
//               ))}
//             </Select>
//           );
//         }

//         return (
//           <span className="ui-chip">
//             <span className={`chip-dot ${dotClass}`} />
//             {currentStatus}
//           </span>
//         );
//       },
//     },

//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       align: "center",
//       sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },

//     // --- ระยะเวลาที่ดำเนินการคงเหลือ (Progress สวยขึ้น) ---
//     {
//       title: "ระยะเวลาที่ดำเนินการคงเหลือ",
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//       align: "center",
//       sorter: (a, b) => a.remainingTime - b.remainingTime,
//       render: (text, record) => {
//         const { percentRemaining, colorClass, labelText } = computeTimeProgress(
//           record.createAt,
//           record.expected_completion_date
//         );
//         return (
//           <div style={{ minWidth: 240 }}>
//             <div className="progress pretty" title={labelText}>
//               <div
//                 className={`progress-bar ${colorClass}`}
//                 role="progressbar"
//                 style={{
//                   width: `${percentRemaining}%`,
//                   transition: "width .5s ease",
//                 }}
//                 aria-valuenow={percentRemaining}
//                 aria-valuemin="0"
//                 aria-valuemax="100"
//               />
//             </div>
//             <div className="d-flex justify-content-between mt-1">
//               <span className="text-muted" style={{ fontSize: 12 }}>
//                 ความคืบหน้า
//               </span>
//               <span className="progress-label" style={{ fontSize: 12 }}>
//                 ⏳ {labelText}
//               </span>
//             </div>
//           </div>
//         );
//       },
//     },

//     {
//       title: "วันที่แก้ไขสถานะล่าสุด",
//       dataIndex: "latestUpdateAt",
//       key: "latestUpdateAt",
//       align: "center",
//       render: (d) => new Date(d).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "latestUpdateBy",
//       key: "latestUpdateBy",
//       align: "center",
//       width: 100,
//     },
//   ];

//   const hasChanges = Object.keys(changedStatus).length > 0;
//   const navigate = useNavigate();
//   const handletoCreateJob = () => navigate("/create-job");

//   const menuItems = stepFlow.map((s) => ({ key: s, label: s }));
//   menuItems.unshift({ key: "all", label: "ทั้งหมด" });

//   const handleMenuClick = (e) => {
//     if (e.key === "all") setSelectedStatus(null);
//     else setSelectedStatus(e.key);
//   };
//   const menuProps = { items: menuItems, onClick: handleMenuClick };

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
//       "latestUpdateAt",
//       "latestUpdateBy",
//     ];
//     const matchesSearch = searchableFields.some(
//       (f) =>
//         typeof item[f] === "string" &&
//         item[f].toLowerCase().includes(searchData.toLowerCase())
//     );
//     const matchesStatus = selectedStatus
//       ? item.jobStatus === selectedStatus
//       : true;
//     return matchesSearch && matchesStatus;
//   });

//   const countRemainingTime = (filterData) => {
//     return filterData.map((item) => {
//       const expectedDate = new Date(item.expected_completion_date);
//       let baseDate;
//       if (
//         item.jobStatus === "จัดส่งสำเร็จ" ||
//         item.jobStatus === "ยกเลิกการเคลมสินค้า"
//       )
//         baseDate = new Date(item.latestUpdateAt);
//       else baseDate = new Date();
//       const remainingTimeInMilliseconds =
//         expectedDate.getTime() - baseDate.getTime();
//       const remainingTimeInDays = Math.floor(
//         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//       );
//       return { ...item, remainingTime: remainingTimeInDays };
//     });
//   };

//   const handleRowClick = (record) => navigate(`/show-job/${record.jobRef}`);
//   const handleClose = () => setOpen(false);

//   return (
//     <div className="container-fluid py-3" style={{ background: "#fafafa" }}>
//       <style>{`
//         .ui-card { border-radius: 16px; border: 1px solid #eaeaea; background: #fff; }
//         .ui-card-shadow { box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
//         .toolbar { position: sticky; top: 0; z-index: 9; background: linear-gradient(180deg,#ffffff,#ffffffef); backdrop-filter: blur(6px); }
//         .rounded-12 { border-radius: 12px; }
//         .rounded-20 { border-radius: 20px; }
//         .pointer-cursor { cursor: pointer; }
//         .row-red-text td { color: #b00020 !important; font-weight: 600; }
//         .ant-table { border-radius: 14px !important; overflow: hidden; }
//         .ant-table-thead > tr > th { font-size: 0.95rem !important; font-weight: 700 !important; background: #f3f6fa !important; }
//         .ant-table-tbody > tr > td { font-size: 0.95rem !important; }
//         .ant-input-affix-wrapper { border-radius: 999px !important; padding: 8px 14px !important; }
//         .btn-icon { display:inline-flex; align-items:center; gap:.5rem; }
//         .btn-pill { border-radius: 999px; padding: .6rem 1.1rem; }
//         .btn-gradient { background: linear-gradient(135deg,#213F66,#5a83b7); color: #fff; border: none; }
//         .btn-ghost { background:#f7f7f7; color:#616161; border:1px solid #e7e7e7; }
//         .list-heading { font-weight: 800; letter-spacing: .2px; }

//         /* --- ชิปสถานะ + dot สี --- */
//         .ui-chip {
//           display: inline-flex; align-items: center; gap: .5rem;
//           padding: .35rem .75rem; border-radius: 999px;
//           border: 1px solid #eaeaea; background: #fff;
//           box-shadow: 0 4px 12px rgba(0,0,0,.06);
//           font-weight: 600;
//         }
//         .chip-dot { width: .55rem; height: .55rem; border-radius: 50%; display:inline-block; }
//         .chip-dot.orange { background:#ea7317; }
//         .chip-dot.amber { background:#ffba08; }
//         .chip-dot.red { background:#ec3507; }
//         .chip-dot.brown { background:#b36a5e; }
//         .chip-dot.blue { background:#2364aa; }
//         .chip-dot.purple { background:#5a189a; }
//         .chip-dot.green { background:#386641; }
//         .chip-dot.cancel { background:#d00000; }

//         /* --- Progress Pretty --- */
//         .progress.pretty {
//           height: 22px; border-radius: 999px; background: #f1f3f5;
//           box-shadow: inset 0 2px 6px rgba(0,0,0,.06);
//         }
//         .progress.pretty .progress-bar {
//           border-radius: 999px;
//           background-image: linear-gradient(90deg, rgba(255,255,255,.35) 0, rgba(255,255,255,0) 60%);
//           background-blend-mode: overlay;
//         }
//         .progress-label { font-weight: 700; letter-spacing: .2px; }

//         /* --- จุดแดงเตือนงานใกล้กำหนด --- */
//         .red-dot {
//           width:.6rem; height:.6rem; background:#d00000; border-radius:50%;
//           box-shadow:0 0 0 3px rgba(208,0,0,.12);
//         }
//       `}</style>

//       {/* Toolbar */}
//       <div className="toolbar ui-card ui-card-shadow p-3 mb-3">
//         <div className="row g-2 align-items-center">
//           <div className="col-12 col-lg-4 order-2 order-lg-1">
//             <h2 className="m-0 list-heading">งานทั้งหมด</h2>
//             <small className="text-muted">
//               รายการงานทั้งหมดในระบบเคลม/ซ่อม
//             </small>
//           </div>
//           <div className="col-12 col-lg-4 order-1 order-lg-2">
//             <Form.Item name="Input" className="m-0">
//               <Input
//                 allowClear
//                 size="large"
//                 onChange={(e) => setSearchData(e.target.value)}
//                 prefix={<IoSearch style={{ width: 22, height: 22 }} />}
//                 placeholder="ค้นหางานที่ต้องการ"
//               />
//             </Form.Item>
//           </div>
//           <div className="col-12 col-lg-4 order-3">
//             <div className="d-flex justify-content-lg-end gap-2 flex-wrap">
//               <Space>
//                 <Dropdown
//                   menu={{
//                     items: stepFlow
//                       .map((s) => ({ key: s, label: s }))
//                       .concat([{ key: "all", label: "ทั้งหมด" }]),
//                   }}
//                   trigger={["click"]}
//                 >
//                   <Button className="btn-ghost btn-pill btn-icon">
//                     <BiFilterAlt />
//                     เลือกสถานะ
//                   </Button>
//                 </Dropdown>
//               </Space>

//               <Button
//                 className="btn-gradient btn-pill btn-icon"
//                 onClick={handletoCreateJob}
//               >
//                 <FaPlus /> สร้างงาน
//               </Button>

//               <Button
//                 className="btn-pill btn-icon"
//                 variant={isEditing ? "outline-danger" : "outline-secondary"}
//                 onClick={handleEditStatus}
//               >
//                 <MdEditDocument /> {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
//               </Button>

//               {isEditing && hasChanges && (
//                 <Button
//                   className="btn-pill btn-icon"
//                   variant="success"
//                   onClick={() => {
//                     handleConfirm();
//                     setOpen(true);
//                   }}
//                 >
//                   <MdEditDocument /> ยืนยันการแก้ไขสถานะ
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Data Table */}
//       <div className="ui-card ui-card-shadow p-3">
//         <Table
//           dataSource={countRemainingTime(
//             data.filter((item) => {
//               const searchableFields = [
//                 "jobRef",
//                 "product_name",
//                 "serialNumber",
//                 "sku",
//                 "username",
//                 "createdBy",
//                 "jobStatus",
//                 "createAt",
//                 "remainingTime",
//                 "latestUpdateAt",
//                 "latestUpdateBy",
//               ];
//               const matchesSearch = searchableFields.some(
//                 (f) =>
//                   typeof item[f] === "string" &&
//                   item[f].toLowerCase().includes(searchData.toLowerCase())
//               );
//               const matchesStatus = selectedStatus
//                 ? item.jobStatus === selectedStatus
//                 : true;
//               return matchesSearch && matchesStatus;
//             })
//           )}
//           columns={columns}
//           onRow={(record) => ({ onClick: () => handleRowClick(record) })}
//           rowClassName={rowClassName}
//           scroll={{ x: true }}
//         />
//       </div>

//       {/* Success Modal */}
//       <Modal show={open} onHide={() => setOpen(false)} centered>
//         <Modal.Body className="text-center p-5">
//           <IoMdCheckmarkCircle
//             className="modal-icon"
//             style={{ fontSize: 72, color: "#28a745" }}
//           />
//           <p className="mt-3 mb-0 fs-5 fw-semibold">การแก้ไขสถานะสำเร็จ</p>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// }

////////////////////แบบเก่าที่ทำยังไม่ได้ตกแต่ง
// import React, { useMemo } from "react";
// import {
//   Table,
//   Tag,
//   Form,
//   Input,
//   Space,
//   Dropdown,
//   Select,
//   message,
// } from "antd";
// import Button from "react-bootstrap/Button";
// import { IoSearch } from "react-icons/io5";
// import { BiFilterAlt } from "react-icons/bi";
// import { FaPlus } from "react-icons/fa";
// import { MdEditDocument } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useState } from "react";
// import { useEffect } from "react";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";
// // import mockJobData from "./mockjob"

// const { Option } = Select;

// export default function Job() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});
//   const [open, setOpen] = useState(false);
//   //   const rowClassName = (record) => {
//   //   return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";;
//   // };

//   const rowClassName = (record) => {
//     if (
//       record.jobStatus === "จัดส่งสำเร็จ" ||
//       record.jobStatus === "ยกเลิกการเคลมสินค้า"
//     ) {
//       return ""; // ไม่ขึ้นสีแดงเลย
//     }
//     return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";
//   };
//   // const [statusCounts, setStatusCounts] = useState([]);

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-job";
//       const response = await axios.get(url);
//       console.log("Job data response:", response.data);
//       const formattedData = response.data.map((item) => ({
//         ...item,
//         key: item.jobRef,
//       }));

//       setData(formattedData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   //   const getData = async () => {
//   //   try {
//   //     // const url = "http://localhost:3302/get-job";
//   //     // const response = await axios.get(url);

//   //     const formattedData = mockJobData.map((item) => ({
//   //       ...item,
//   //       key: item.jobRef,
//   //     }));

//   //     setData(formattedData);
//   //   } catch (error) {
//   //     console.error("Error fetching data:", error);
//   //   }
//   // };

//   useEffect(() => {
//     getData();
//   }, []);

//   const handleEditStatus = () => {
//     setIsEditing(!isEditing);
//     if (isEditing) {
//       setChangedStatus({});
//     }
//   };

//   const handleStatusChange = (newStatus, jobRef) => {
//     setChangedStatus((prev) => ({
//       ...prev,
//       [jobRef]: newStatus,
//     }));
//   };

//   // const handleConfirm = async () => {
//   //   try {
//   //     const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//   //       const newStatus = changedStatus[jobRef];
//   //       return axios.put(`http://localhost:3302/update-status/${jobRef}`, {
//   //         jobStatus: newStatus,
//   //       });
//   //     });

//   //     await Promise.all(updatePromises);
//   //     message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//   //     await getData();
//   //     setIsEditing(false);
//   //     setChangedStatus({});
//   //   } catch (error) {
//   //     message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//   //     console.error("Failed to update status:", error);
//   //   }
//   // };

//   const nextOptions = [
//     "เริ่มงาน",
//     "สั่งอะไหล่",
//     "เริ่มการซ่อม",
//     "ซ่อมสำเร็จ",
//     "รอทดสอบ",
//     "รอจัดส่ง",
//     "จัดส่งสำเร็จ",
//     "ยกเลิกการเคลมสินค้า",
//   ];

//   const handleConfirm = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//         const newStatus = changedStatus[jobRef];
//         const token =
//           localStorage.getItem("token") || sessionStorage.getItem("token");

//         // 👇 ดึงชื่อผู้ใช้ (จาก localStorage หรือ default เป็น 'unknown')
//         const currentUser = localStorage.getItem("username") || "unknown";

//         if (!nextOptions.includes(newStatus)) {
//           message.error("ไม่สามารถข้ามลำดับสถานะได้");
//           throw new Error("Invalid status transition");
//         }

//         return axios.put(
//           `http://localhost:3302/update-status/${jobRef}`,
//           {
//             jobStatus: newStatus,
//             latestUpdateBy: currentUser, // ✅ เพิ่ม latestUpdateBy
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`, // ✅ เพิ่ม token
//             },
//           }
//         );
//       });

//       await Promise.all(updatePromises);
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       setIsEditing(false);
//       setChangedStatus({});
//     } catch (error) {
//       if (error?.message !== "Invalid status transition") {
//         message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       }
//       console.error("Failed to update status:", error);
//     }
//   };

//   const daysBetween = (a, b) => {
//     const ms = b.getTime() - a.getTime();
//     return Math.floor(ms / (1000 * 60 * 60 * 24));
//   };

//   const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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
//       colorClass = "bg-danger"; // หมดเวลา/เลยกำหนด
//     }

//     const labelText =
//       remainingDays < 0
//         ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
//         : remainingDays === 0
//         ? "ครบเวลาดำเนินการ"
//         : `${remainingDays} วัน`;

//     return { percentRemaining, remainingDays, colorClass, labelText };
//   };

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       align: "center",
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       align: "center",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       align: "center",
//       render: (text) => <a>{text}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       align: "center",
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//       align: "center",
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//       align: "center",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "serviceRef",
//       key: "serviceRef",
//       align: "serviceRef",
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       align: "center",
//       render: (status, record) => {
//         const currentStatus = changedStatus[record.jobRef] || status;
//         let color = "#ea7317";
//         if (currentStatus === "สั่งอะไหล่") {
//           color = "#ffba08";
//         } else if (currentStatus === "เริ่มการซ่อม") {
//           color = "#ec3507ff";
//         } else if (currentStatus === "ซ่อมสำเร็จ") {
//           color = "#b36a5e";
//         } else if (currentStatus === "รอทดสอบ") {
//           color = "#2364aa";
//         } else if (currentStatus === "รอจัดส่ง") {
//           color = "#5a189a";
//         } else if (currentStatus === "จัดส่งสำเร็จ") {
//           color = "#386641";
//         } else if (currentStatus === "ยกเลิกการเคลมสินค้า") {
//           color = "#d00000";
//         }

//         const statusOrder = [
//           "เริ่มงาน",
//           "สั่งอะไหล่",
//           "เริ่มการซ่อม",
//           "ซ่อมสำเร็จ",
//           "รอทดสอบ",
//           "รอจัดส่ง",
//           "จัดส่งสำเร็จ",
//         ];

//         const cancelStatus = "ยกเลิกการเคลมสินค้า";
//         const doneAkiases = new Set(["จัดส่งสำเร็จ", "จบงาน"]);

//         return isEditing ? (
//           <Select
//             defaultValue={currentStatus}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//             onChange={(value) => handleStatusChange(value, record.jobRef)}
//           >
//             <Option value="เริ่มงาน">เริ่มงาน</Option>
//             <Option value="สั่งอะไหล่">สั่งอะไหล่</Option>
//             <Option value="เริ่มการซ่อม">เริ่มการซ่อม</Option>
//             <Option value="ซ่อมสำเร็จ">ซ่อมสำเร็จ</Option>
//             <Option value="รอทดสอบ">รอทดสอบ</Option>
//             <Option value="รอจัดส่ง">รอจัดส่ง</Option>
//             <Option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</Option>
//             <Option value="ยกเลิกการเคลมสินค้า">ยกเลิกการเคลมสินค้า</Option>
//           </Select>
//         ) : (
//           <Tag color={color}>{status}</Tag>
//         );
//       },
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       align: "center",
//       sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
//       defaultSortOrder: "ascend",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
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
//       dataIndex: "latestUpdateAt",
//       key: "latestUpdateAt",
//       align: "center",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "latestUpdateBy",
//       key: "latestUpdateBy",
//       align: "center",
//     },
//   ];

//   const hasChanges = Object.keys(changedStatus).length > 0;

//   const navigate = useNavigate();
//   const handletoCreateJob = () => {
//     navigate("/create-job");
//   };

//   const menuItems = [
//     {
//       key: "all",
//       label: "ทั้งหมด",
//     },
//     {
//       key: "เริ่มงาน",
//       label: "เริ่มงาน",
//     },
//     {
//       key: "สั่งอะไหล่",
//       label: "สั่งอะไหล่",
//     },
//     {
//       key: "เริ่มการซ่อม",
//       label: "เริ่มการซ่อม",
//     },
//     {
//       key: "ซ่อมสำเร็จ",
//       label: "ซ่อมสำเร็จ",
//     },
//     {
//       key: "รอทดสอบ",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "รอจัดส่ง",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "จัดส่งสำเร็จ",
//       label: "จัดส่งสำเร็จ",
//     },
//     {
//       key: "ยกเลิกการเคลมสินค้า",
//       label: "ยกเลิกการเคลมสินค้า",
//     },
//   ];

//   // const handleMenuClick = (e) => {
//   //   console.log("Clicked item:", e.key);
//   //   setSelectedStatus(e.key);
//   // };
//   const handleMenuClick = (e) => {
//     if (e.key === "all") {
//       setSelectedStatus(null); // แสดงทุกสถานะ
//     } else {
//       setSelectedStatus(e.key);
//     }
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
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
//       "latestUpdateAt",
//       "latestUpdateBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });

//     const matchesStatus = selectedStatus
//       ? item.jobStatus === selectedStatus
//       : true;

//     return matchesSearch && matchesStatus;
//   });

//   // const countRemainingTime = (filterData) => {
//   //   return filterData.map((item) => {
//   //     const latestUpdateAt = new Date(item.expected_completion_date);
//   //     const createAt = new Date();
//   //     const remainingTimeInMilliseconds =
//   //       latestUpdateAt.getTime() - createAt.getTime();
//   //     const remainingTimeInDays = Math.floor(
//   //       remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//   //     );

//   //     return {
//   //       ...item,
//   //       remainingTime: remainingTimeInDays,
//   //     };
//   //   });
//   // };

//   const countRemainingTime = (filterData) => {
//     return filterData.map((item) => {
//       const expectedDate = new Date(item.expected_completion_date);
//       let baseDate;

//       if (
//         item.jobStatus === "จัดส่งสำเร็จ" ||
//         item.jobStatus === "ยกเลิกการเคลมสินค้า"
//       ) {
//         baseDate = new Date(item.latestUpdateAt); // วันที่แก้ไขสถานะล่าสุด
//       } else {
//         baseDate = new Date(); // วันที่ปัจจุบัน
//       }

//       const remainingTimeInMilliseconds =
//         expectedDate.getTime() - baseDate.getTime();
//       const remainingTimeInDays = Math.floor(
//         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//       );

//       return {
//         ...item,
//         remainingTime: remainingTimeInDays,
//       };
//     });
//   };

//   const handleRowClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div className="contain-main">
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
//       <div className="text-dark mb-3 mt-4 ">
//         <div className="d-flex justify-content-end">
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
//             <Input
//               onChange={(e) => setSearchData(e.target.value)}
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
//         <div
//           className="d-flex align-items-center justify-content-between mb-5 mt-3 ms-5"
//           style={{
//             overflowX: "auto",
//             maxWidth: "100%",
//             padding: "0 10px",
//             boxSizing: "border-box",
//           }}
//         >
//           <h2>งานทั้งหมด</h2>
//           <div className="d-flex justify-content-end gap-5">
//             <Space className="button">
//               <Dropdown menu={menuProps} trigger={["click"]}>
//                 <Button
//                   type="primary"
//                   style={{ backgroundColor: "#F7F7F7", color: "#616161" }}
//                   className="button"
//                 >
//                   <BiFilterAlt type="primary" className="button-icon" />
//                   เลือกสถานะ
//                 </Button>
//               </Dropdown>
//             </Space>

//             <Button
//               className="button"
//               style={{ backgroundColor: "#213F66", color: "#FFFFFF" }}
//               onClick={handletoCreateJob}
//             >
//               <FaPlus className="button-icon" />
//               สร้างงาน
//             </Button>

//             <Button
//               className="btn-edit-status align-items-center"
//               onClick={handleEditStatus}
//             >
//               <MdEditDocument className="button-icon justify-content-start" />
//               <span className="d-flex justify-content-center">
//                 {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
//               </span>
//             </Button>
//             {isEditing && hasChanges && (
//               <Button
//                 className="btn-comfirm-status align-items-center me-5"
//                 onClick={() => {
//                   handleConfirm();
//                   setOpen(true);
//                 }}
//               >
//                 <MdEditDocument className="button-icon justify-content-start" />
//                 <span className="d-flex justify-content-center">
//                   ยืนยันการแก้ไขสถานะ
//                 </span>
//               </Button>
//             )}
//             <Modal show={open} onHide={handleClose}>
//               <Modal.Body
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   flexDirection: "column",
//                 }}
//               >
//                 <IoMdCheckmarkCircle className="modal-icon" />
//                 <p className="d-flex mt-3 mb-3 fs-4 fw-semi-bold">
//                   การแก้ไขสถานะสำเร็จ
//                 </p>
//                 {/* <Button
//                   // onClick={handleCreateJob}
//                   className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
//                 >
//                   <span className="d-flex justify-content-end">สร้างงาน</span>
//                 </Button> */}
//               </Modal.Body>
//             </Modal>
//           </div>
//         </div>
//       </div>
//       <div>
//         <Table
//           dataSource={countRemainingTime(filterData)}
//           columns={columns}
//           onRow={(record) => {
//             return {
//               onClick: () => {
//                 handleRowClick(record);
//               },
//             };
//           }}
//           rowClassName={rowClassName}
//         />
//         {/* <h2>Remaining Time: {countRemainingTime}</h2> */}
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import {
//   Table,
//   Tag,
//   Form,
//   Input,
//   Space,
//   Dropdown,
//   Select,
//   message,
// } from "antd";
// import Button from "react-bootstrap/Button";
// import { IoSearch } from "react-icons/io5";
// import { BiFilterAlt } from "react-icons/bi";
// import { FaPlus } from "react-icons/fa";
// import { MdEditDocument } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useState } from "react";
// import { useEffect } from "react";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";
// // import mockJobData from "./mockjob"

// const { Option } = Select;

// export default function Job() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});
//   const [open, setOpen] = useState(false);
//   //   const rowClassName = (record) => {
//   //   return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";;
//   // };

//   const rowClassName = (record) => {
//     if (
//       record.jobStatus === "จัดส่งสำเร็จ" ||
//       record.jobStatus === "ยกเลิกการเคลมสินค้า"
//     ) {
//       return ""; // ไม่ขึ้นสีแดงเลย
//     }
//     return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";
//   };
//   // const [statusCounts, setStatusCounts] = useState([]);

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-job";
//       const response = await axios.get(url);

//       const formattedData = response.data.map((item) => ({
//         ...item,
//         key: item.jobRef,
//       }));

//       setData(formattedData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   //   const getData = async () => {
//   //   try {
//   //     // const url = "http://localhost:3302/get-job";
//   //     // const response = await axios.get(url);

//   //     const formattedData = mockJobData.map((item) => ({
//   //       ...item,
//   //       key: item.jobRef,
//   //     }));

//   //     setData(formattedData);
//   //   } catch (error) {
//   //     console.error("Error fetching data:", error);
//   //   }
//   // };

//   useEffect(() => {
//     getData();
//   }, []);

//   const handleEditStatus = () => {
//     setIsEditing(!isEditing);
//     if (isEditing) {
//       setChangedStatus({});
//     }
//   };

//   const handleStatusChange = (newStatus, jobRef) => {
//     setChangedStatus((prev) => ({
//       ...prev,
//       [jobRef]: newStatus,
//     }));
//   };

//   const handleConfirm = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//         const newStatus = changedStatus[jobRef];
//         return axios.put(`http://localhost:3302/update-status/${jobRef}`, {
//           jobStatus: newStatus,
//         });
//       });

//       await Promise.all(updatePromises);
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       setIsEditing(false);
//       setChangedStatus({});
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       console.error("Failed to update status:", error);
//     }
//   };

//   const daysBetween = (a, b) => {
//     const ms = b.getTime() - a.getTime();
//     return Math.floor(ms / (1000 * 60 * 60 * 24));
//   };

//   const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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
//       colorClass = "bg-danger"; // หมดเวลา/เลยกำหนด
//     }

//     const labelText =
//       remainingDays < 0
//         ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
//         : remainingDays === 0
//           ? "ครบเวลาดำเนินการ"
//           : `${remainingDays} วัน`;

//     return { percentRemaining, remainingDays, colorClass, labelText };
//   };

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       align: "center",
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       align: "center",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       align: "center",
//       render: (text) => <a>{text}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       align: "center",
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//       align: "center",
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//       align: "center",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "serviceRef",
//       key: "serviceRef",
//       align: "serviceRef",
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       align: "center",
//       render: (status, record) => {
//         const currentStatus = changedStatus[record.jobRef] || status;
//         let color = "#ea7317";
//         if (currentStatus === "สั่งอะไหล่") {
//           color = "#ffba08";
//         } else if (currentStatus === "ซ่อมสำเร็จ") {
//           color = "#b36a5e";
//         } else if (currentStatus === "รอทดสอบ") {
//           color = "#2364aa";
//         } else if (currentStatus === "รอจัดส่ง") {
//           color = "#5a189a";
//         } else if (currentStatus === "จัดส่งสำเร็จ") {
//           color = "#386641";
//         } else if (currentStatus === "ยกเลิกการเคลมสินค้า") {
//           color = "#d00000";
//         }

//         const statusOrder = [
//           "เริ่มงาน",
//           "สั่งอะไหล่",
//           "ซ่อมสำเร็จ",
//           "รอทดสอบ",
//           "รอจัดส่ง",
//           "จัดส่งสำเร็จ",
//         ];

//         const cancelStatus = "ยกเลิกการเคลมสินค้า"
//         const doneAkiases = new Set(["จัดส่งสำเร็จ", "จบงาน"])

//         return isEditing ? (
//           <Select
//             defaultValue={currentStatus}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//             onChange={(value) => handleStatusChange(value, record.jobRef)}
//           >
//             <Option value="เริ่มงาน">เริ่มงาน</Option>
//             <Option value="สั่งอะไหล่">สั่งอะไหล่</Option>
//             <Option value="ซ่อมสำเร็จ">ซ่อมสำเร็จ</Option>
//             <Option value="รอทดสอบ">รอทดสอบ</Option>
//             <Option value="รอจัดส่ง">รอจัดส่ง</Option>
//             <Option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</Option>
//             <Option value="ยกเลิกการเคลมสินค้า">ยกเลิกการเคลมสินค้า</Option>
//           </Select>
//         ) : (
//           <Tag color={color}>{status}</Tag>
//         );
//       },
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       align: "center",
//       sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
//       defaultSortOrder: "ascend",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
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
//       dataIndex: "latestUpdateAt",
//       key: "latestUpdateAt",
//       align: "center",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "latestUpdateBy",
//       key: "latestUpdateBy",
//       align: "center",
//     },
//   ];

//   const hasChanges = Object.keys(changedStatus).length > 0;

//   const navigate = useNavigate();
//   const handletoCreateJob = () => {
//     navigate("/create-job");
//   };

//   const menuItems = [
//     {
//       key: "all",
//       label: "ทั้งหมด",
//     },
//     {
//       key: "เริ่มงาน",
//       label: "เริ่มงาน",
//     },
//     {
//       key: "สั่งอะไหล่",
//       label: "สั่งอะไหล่",
//     },
//     {
//       key: "ซ่อมสำเร็จ",
//       label: "ซ่อมสำเร็จ",
//     },
//     {
//       key: "รอทดสอบ",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "รอจัดส่ง",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "จัดส่งสำเร็จ",
//       label: "จัดส่งสำเร็จ",
//     },
//     {
//       key: "ยกเลิกการเคลมสินค้า",
//       label: "ยกเลิกการเคลมสินค้า",
//     },
//   ];

//   // const handleMenuClick = (e) => {
//   //   console.log("Clicked item:", e.key);
//   //   setSelectedStatus(e.key);
//   // };
//   const handleMenuClick = (e) => {
//     if (e.key === "all") {
//       setSelectedStatus(null); // แสดงทุกสถานะ
//     } else {
//       setSelectedStatus(e.key);
//     }
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
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
//       "latestUpdateAt",
//       "latestUpdateBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });

//     const matchesStatus = selectedStatus
//       ? item.jobStatus === selectedStatus
//       : true;

//     return matchesSearch && matchesStatus;
//   });

//   // const countRemainingTime = (filterData) => {
//   //   return filterData.map((item) => {
//   //     const latestUpdateAt = new Date(item.expected_completion_date);
//   //     const createAt = new Date();
//   //     const remainingTimeInMilliseconds =
//   //       latestUpdateAt.getTime() - createAt.getTime();
//   //     const remainingTimeInDays = Math.floor(
//   //       remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//   //     );

//   //     return {
//   //       ...item,
//   //       remainingTime: remainingTimeInDays,
//   //     };
//   //   });
//   // };

//   const countRemainingTime = (filterData) => {
//     return filterData.map((item) => {
//       const expectedDate = new Date(item.expected_completion_date);
//       let baseDate;

//       if (
//         item.jobStatus === "จัดส่งสำเร็จ" ||
//         item.jobStatus === "ยกเลิกการเคลมสินค้า"
//       ) {
//         baseDate = new Date(item.latestUpdateAt); // วันที่แก้ไขสถานะล่าสุด
//       } else {
//         baseDate = new Date(); // วันที่ปัจจุบัน
//       }

//       const remainingTimeInMilliseconds =
//         expectedDate.getTime() - baseDate.getTime();
//       const remainingTimeInDays = Math.floor(
//         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//       );

//       return {
//         ...item,
//         remainingTime: remainingTimeInDays,
//       };
//     });
//   };

//   const handleRowClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div className="contain-main">
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
//       <div className="text-dark mb-3 mt-4 ">
//         <div className="d-flex justify-content-end">
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
//             <Input
//               onChange={(e) => setSearchData(e.target.value)}
//               prefix={<IoSearch style={{ width: "30px", height: "30px" }} />}
//               placeholder="ค้นหางานที่ต้องการ"
//               style={{
//                 width: "399px",
//                 height: "49px",
//                 backgroundColor: "#FFFFFF",
//                 borderColor: "#AAAAAAFF",
//                 color: "#CCCCCC",
//                 borderRadius: "20px",
//                 fontSize: "1rem"
//               }}
//             />
//           </Form.Item>
//         </div>
//         <div className="d-flex align-items-center justify-content-between mb-5 mt-3 ms-5"
//           style={{
//             overflowX: "auto",
//             maxWidth: "100%",
//             padding: "0 10px",
//             boxSizing: "border-box",
//           }}>
//           <h2>งานทั้งหมด</h2>
//           <div className="d-flex justify-content-end gap-5">
//             <Space className="button">
//               <Dropdown menu={menuProps} trigger={["click"]}>
//                 <Button
//                   type="primary"
//                   style={{ backgroundColor: "#F7F7F7", color: "#616161" }}
//                   className="button"
//                 >
//                   <BiFilterAlt type="primary" className="button-icon" />
//                   เลือกสถานะ
//                 </Button>
//               </Dropdown>
//             </Space>

//             <Button
//               className="button"
//               style={{ backgroundColor: "#213F66", color: "#FFFFFF" }}
//               onClick={handletoCreateJob}
//             >
//               <FaPlus className="button-icon" />
//               สร้างงาน
//             </Button>

//             <Button
//               className="btn-edit-status align-items-center"
//               onClick={handleEditStatus}
//             >
//               <MdEditDocument className="button-icon justify-content-start" />
//               <span className="d-flex justify-content-center">
//                 {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
//               </span>
//             </Button>
//             {isEditing && hasChanges && (
//               <Button
//                 className="btn-comfirm-status align-items-center me-5"
//                 onClick={() => {
//                   handleConfirm();
//                   setOpen(true);
//                 }}
//               >
//                 <MdEditDocument className="button-icon justify-content-start" />
//                 <span className="d-flex justify-content-center">
//                   ยืนยันการแก้ไขสถานะ
//                 </span>
//               </Button>
//             )}
//             <Modal show={open} onHide={handleClose}>
//               <Modal.Body
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   flexDirection: "column",
//                 }}
//               >
//                 <IoMdCheckmarkCircle className="modal-icon" />
//                 <p className="d-flex mt-3 mb-3 fs-4 fw-semi-bold">
//                   การแก้ไขสถานะสำเร็จ
//                 </p>
//                 {/* <Button
//                   // onClick={handleCreateJob}
//                   className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
//                 >
//                   <span className="d-flex justify-content-end">สร้างงาน</span>
//                 </Button> */}
//               </Modal.Body>
//             </Modal>
//           </div>
//         </div>
//       </div>
//       <div>
//         <Table
//           dataSource={countRemainingTime(filterData)}
//           columns={columns}
//           onRow={(record) => {
//             return {
//               onClick: () => {
//                 handleRowClick(record);
//               },
//             };
//           }}
//           rowClassName={rowClassName}
//         />
//         {/* <h2>Remaining Time: {countRemainingTime}</h2> */}
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import {
//   Table,
//   Tag,
//   Form,
//   Input,
//   Space,
//   Dropdown,
//   Select,
//   message,
// } from "antd";
// import Button from "react-bootstrap/Button";
// import { IoSearch } from "react-icons/io5";
// import { BiFilterAlt } from "react-icons/bi";
// import { FaPlus } from "react-icons/fa";
// import { MdEditDocument } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useState } from "react";
// import { useEffect } from "react";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";
// // import mockJobData from "./mockjob"

// const { Option } = Select;

// export default function Job() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});
//   const [open, setOpen] = useState(false);
//   //   const rowClassName = (record) => {
//   //   return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";;
//   // };

//   const rowClassName = (record) => {
//     if (
//       record.jobStatus === "จัดส่งสำเร็จ" ||
//       record.jobStatus === "ยกเลิกการเคลมสินค้า"
//     ) {
//       return ""; // ไม่ขึ้นสีแดงเลย
//     }
//     return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";
//   };
//   // const [statusCounts, setStatusCounts] = useState([]);

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-job";
//       const response = await axios.get(url);

//       const formattedData = response.data.map((item) => ({
//         ...item,
//         key: item.jobRef,
//       }));

//       setData(formattedData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   //   const getData = async () => {
//   //   try {
//   //     // const url = "http://localhost:3302/get-job";
//   //     // const response = await axios.get(url);

//   //     const formattedData = mockJobData.map((item) => ({
//   //       ...item,
//   //       key: item.jobRef,
//   //     }));

//   //     setData(formattedData);
//   //   } catch (error) {
//   //     console.error("Error fetching data:", error);
//   //   }
//   // };

//   useEffect(() => {
//     getData();
//   }, []);

//   const handleEditStatus = () => {
//     setIsEditing(!isEditing);
//     if (isEditing) {
//       setChangedStatus({});
//     }
//   };

//   const handleStatusChange = (newStatus, jobRef) => {
//     setChangedStatus((prev) => ({
//       ...prev,
//       [jobRef]: newStatus,
//     }));
//   };

//   const handleConfirm = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//         const newStatus = changedStatus[jobRef];
//         return axios.put(`http://localhost:3302/update-status/${jobRef}`, {
//           jobStatus: newStatus,
//         });
//       });

//       await Promise.all(updatePromises);
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       setIsEditing(false);
//       setChangedStatus({});
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       console.error("Failed to update status:", error);
//     }
//   };

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       render: (text) => <a>{text}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "createdBy",
//       key: "createdBy",
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       render: (status, record) => {
//         const currentStatus = changedStatus[record.jobRef] || status;
//         let color = "#ea7317";
//         if (currentStatus === "สั่งอะไหล่") {
//           color = "#ffba08";
//         } else if (currentStatus === "ซ่อมสำเร็จ") {
//           color = "#b36a5e";
//         } else if (currentStatus === "รอทดสอบ") {
//           color = "#2364aa";
//         } else if (currentStatus === "รอจัดส่ง") {
//           color = "#5a189a";
//         } else if (currentStatus === "จัดส่งสำเร็จ") {
//           color = "#386641";
//         } else if (currentStatus === "ยกเลิกการเคลมสินค้า") {
//           color = "#d00000";
//         }

//         return isEditing ? (
//           <Select
//             defaultValue={currentStatus}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//             onChange={(value) => handleStatusChange(value, record.jobRef)}
//           >
//             <Option value="เริ่มงาน">เริ่มงาน</Option>
//             <Option value="สั่งอะไหล่">สั่งอะไหล่</Option>
//             <Option value="ซ่อมสำเร็จ">ซ่อมสำเร็จ</Option>
//             <Option value="รอทดสอบ">รอทดสอบ</Option>
//             <Option value="รอจัดส่ง">รอจัดส่ง</Option>
//             <Option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</Option>
//             <Option value="ยกเลิกการเคลมสินค้า">ยกเลิกการเคลมสินค้า</Option>
//           </Select>
//         ) : (
//           <Tag color={color}>{status}</Tag>
//         );
//       },
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
//       defaultSortOrder: "ascend",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ระยะเวลาที่ดำเนินการคงเหลือ",
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//     },
//     {
//       title: "วันที่แก้ไขสถานะล่าสุด",
//       dataIndex: "latestUpdateAt",
//       key: "latestUpdateAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "updatedBy",
//       key: "updatedBy",
//     },
//   ];

//   const hasChanges = Object.keys(changedStatus).length > 0;

//   const navigate = useNavigate();
//   const handletoCreateJob = () => {
//     navigate("/create-job");
//   };

//   const menuItems = [
//     {
//       key: "all",
//       label: "ทั้งหมด",
//     },
//     {
//       key: "เริ่มงาน",
//       label: "เริ่มงาน",
//     },
//     {
//       key: "สั่งอะไหล่",
//       label: "สั่งอะไหล่",
//     },
//     {
//       key: "ซ่อมสำเร็จ",
//       label: "ซ่อมสำเร็จ",
//     },
//     {
//       key: "รอทดสอบ",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "รอจัดส่ง",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "จัดส่งสำเร็จ",
//       label: "จัดส่งสำเร็จ",
//     },
//     {
//       key: "ยกเลิกการเคลมสินค้า",
//       label: "ยกเลิกการเคลมสินค้า",
//     },
//   ];

//   // const handleMenuClick = (e) => {
//   //   console.log("Clicked item:", e.key);
//   //   setSelectedStatus(e.key);
//   // };
//   const handleMenuClick = (e) => {
//     if (e.key === "all") {
//       setSelectedStatus(null); // แสดงทุกสถานะ
//     } else {
//       setSelectedStatus(e.key);
//     }
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
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
//       "latestUpdateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });

//     const matchesStatus = selectedStatus
//       ? item.jobStatus === selectedStatus
//       : true;

//     return matchesSearch && matchesStatus;
//   });

//   // const countRemainingTime = (filterData) => {
//   //   return filterData.map((item) => {
//   //     const latestUpdateAt = new Date(item.expected_completion_date);
//   //     const createAt = new Date();
//   //     const remainingTimeInMilliseconds =
//   //       latestUpdateAt.getTime() - createAt.getTime();
//   //     const remainingTimeInDays = Math.floor(
//   //       remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//   //     );

//   //     return {
//   //       ...item,
//   //       remainingTime: remainingTimeInDays,
//   //     };
//   //   });
//   // };

//   const countRemainingTime = (filterData) => {
//     return filterData.map((item) => {
//       const expectedDate = new Date(item.expected_completion_date);
//       let baseDate;

//       if (
//         item.jobStatus === "จัดส่งสำเร็จ" ||
//         item.jobStatus === "ยกเลิกการเคลมสินค้า"
//       ) {
//         baseDate = new Date(item.latestUpdateAt); // วันที่แก้ไขสถานะล่าสุด
//       } else {
//         baseDate = new Date(); // วันที่ปัจจุบัน
//       }

//       const remainingTimeInMilliseconds =
//         expectedDate.getTime() - baseDate.getTime();
//       const remainingTimeInDays = Math.floor(
//         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//       );

//       return {
//         ...item,
//         remainingTime: remainingTimeInDays,
//       };
//     });
//   };

//   const handleRowClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div className="contain-main">
//       <div className="text-dark mb-3 mt-4 ">
//         <div className="d-flex justify-content-end">
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
//             <Input
//               onChange={(e) => setSearchData(e.target.value)}
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
//         <div className="d-flex align-items-center justify-content-between mb-5 mt-3 ms-5">
//           <h2>งานทั้งหมด</h2>
//           <div className="d-flex justify-content-end gap-5">
//             <Space className="button">
//               <Dropdown menu={menuProps} trigger={["click"]}>
//                 <Button
//                   type="primary"
//                   style={{ backgroundColor: "#F7F7F7", color: "#616161" }}
//                   className="button"
//                 >
//                   <BiFilterAlt type="primary" className="button-icon" />
//                   เลือกสถานะ
//                 </Button>
//               </Dropdown>
//             </Space>

//             <Button
//               className="button"
//               style={{ backgroundColor: "#213F66", color: "#FFFFFF" }}
//               onClick={handletoCreateJob}
//             >
//               <FaPlus className="button-icon" />
//               สร้างงาน
//             </Button>

//             <Button
//               className="btn-edit-status align-items-center"
//               onClick={handleEditStatus}
//             >
//               <MdEditDocument className="button-icon justify-content-start" />
//               <span className="d-flex justify-content-center">
//                 {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
//               </span>
//             </Button>
//             {isEditing && hasChanges && (
//               <Button
//                 className="btn-comfirm-status align-items-center me-5"
//                 onClick={() => {
//                   handleConfirm();
//                   setOpen(true);
//                 }}
//               >
//                 <MdEditDocument className="button-icon justify-content-start" />
//                 <span className="d-flex justify-content-center">
//                   ยืนยันการแก้ไขสถานะ
//                 </span>
//               </Button>
//             )}
//             <Modal show={open} onHide={handleClose}>
//               <Modal.Body
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   flexDirection: "column",
//                 }}
//               >
//                 <IoMdCheckmarkCircle className="modal-icon" />
//                 <p className="d-flex mt-3 mb-3 fs-4 fw-semi-bold">
//                   การแก้ไขสถานะสำเร็จ
//                 </p>
//                 {/* <Button
//                   // onClick={handleCreateJob}
//                   className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
//                 >
//                   <span className="d-flex justify-content-end">สร้างงาน</span>
//                 </Button> */}
//               </Modal.Body>
//             </Modal>
//           </div>
//         </div>
//       </div>
//       <div>
//         <Table
//           dataSource={countRemainingTime(filterData)}
//           columns={columns}
//           onRow={(record) => {
//             return {
//               onClick: () => {
//                 handleRowClick(record);
//               },
//             };
//           }}
//           rowClassName={rowClassName}
//         />
//         {/* <h2>Remaining Time: {countRemainingTime}</h2> */}
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import {
//   Table,
//   Tag,
//   Form,
//   Input,
//   Space,
//   Dropdown,
//   Select,
//   message,
// } from "antd";
// import Button from "react-bootstrap/Button";
// import { IoSearch } from "react-icons/io5";
// import { BiFilterAlt } from "react-icons/bi";
// import { FaPlus } from "react-icons/fa";
// import { MdEditDocument } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useState } from "react";
// import { useEffect } from "react";
// import Backlogs from "./Backlogs";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";

// const { Option } = Select;

// export default function Home() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});
//   const [open, setOpen] = useState(false);
//   // const [statusCounts, setStatusCounts] = useState([]);

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-job";
//       const response = await axios.get(url);

//       const formattedData = response.data.map((item) => ({
//         ...item,
//         key: item.jobRef,
//       }));

//       setData(formattedData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   const handleEditStatus = () => {
//     setIsEditing(!isEditing);
//     if (isEditing) {
//       setChangedStatus({});
//     }
//   };

//   const handleStatusChange = (newStatus, jobRef) => {
//     setChangedStatus((prev) => ({
//       ...prev,
//       [jobRef]: newStatus,
//     }));
//   };

//   const handleConfirm = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//         const newStatus = changedStatus[jobRef];
//         return axios.put(`http://localhost:3302/update-status/${jobRef}`, {
//           jobStatus: newStatus,
//         });
//       });

//       await Promise.all(updatePromises);
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       setIsEditing(false);
//       setChangedStatus({});
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       console.error("Failed to update status:", error);
//     }
//   };

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       render: (text) => <a>{text}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "createdBy",
//       key: "createdBy",
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       render: (status, record) => {
//         const currentStatus = changedStatus[record.jobRef] || status;
//         let color = "#ea7317";
//         if (currentStatus === "สั่งอะไหล่") {
//           color = "#ffba08";
//         } else if (currentStatus === "ซ่อมสำเร็จ") {
//           color = "#b36a5e";
//         } else if (currentStatus === "รอทดสอบ") {
//           color = "#2364aa";
//         } else if (currentStatus === "รอจัดส่ง") {
//           color = "#5a189a";
//         } else if (currentStatus === "จัดส่งสำเร็จ") {
//           color = "#386641";
//         } else if (currentStatus === "ยกเลิกการเคลมสินค้า") {
//           color = "#d00000";
//         }

//         return isEditing ? (
//           <Select
//             defaultValue={currentStatus}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//             onChange={(value) => handleStatusChange(value, record.jobRef)}
//           >
//             <Option value="เริ่มงาน">เริ่มงาน</Option>
//             <Option value="สั่งอะไหล่">สั่งอะไหล่</Option>
//             <Option value="ซ่อมสำเร็จ">ซ่อมสำเร็จ</Option>
//             <Option value="รอทดสอบ">รอทดสอบ</Option>
//             <Option value="รอจัดส่ง">รอจัดส่ง</Option>
//             <Option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</Option>
//             <Option value="ยกเลิกการเคลมสินค้า">ยกเลิกการเคลมสินค้า</Option>
//           </Select>
//         ) : (
//           <Tag color={color}>{status}</Tag>
//         );
//       },
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ระยะเวลาที่ดำเนินการคงเหลือ",
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//     },
//     {
//       title: "วันที่แก้ไขสถานะล่าสุด",
//       dataIndex: "latestUpdateAt",
//       key: "latestUpdateAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "updatedBy",
//       key: "updatedBy",
//     },
//   ];

//   const hasChanges = Object.keys(changedStatus).length > 0;

//   const navigate = useNavigate();
//   const handletoCreateJob = () => {
//     navigate("/create-job");
//   };

//   const menuItems = [
//     {
//       key: "เริ่มงาน",
//       label: "เริ่มงาน",
//     },
//     {
//       key: "สั่งอะไหล่",
//       label: "สั่งอะไหล่",
//     },
//     {
//       key: "ซ่อมสำเร็จ",
//       label: "ซ่อมสำเร็จ",
//     },
//     {
//       key: "รอทดสอบ",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "รอจัดส่ง",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "จัดส่งสำเร็จ",
//       label: "จัดส่งสำเร็จ",
//     },
//     {
//       key: "ยกเลิกการเคลมสินค้า",
//       label: "ยกเลิกการเคลมสินค้า",
//     },
//   ];

//   const handleMenuClick = (e) => {
//     console.log("Clicked item:", e.key);
//     setSelectedStatus(e.key);
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product",
//       "serialNumber",
//       "sku",
//       "customerName",
//       "createdBy",
//       "jobStatus",
//       "createAt",
//       "remainingTime",
//       "latestUpdateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });

//     const matchesStatus = selectedStatus
//       ? item.jobStatus === selectedStatus
//       : true;

//     return matchesSearch && matchesStatus;
//   });

//   const countRemainingTime = (filterData) => {
//     return filterData.map((item) => {
//       const latestUpdateAt = new Date(item.expected_completion_date);
//       const createAt = new Date();
//       const remainingTimeInMilliseconds =
//         latestUpdateAt.getTime() - createAt.getTime();
//       const remainingTimeInDays = Math.floor(
//         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//       );

//       return {
//         ...item,
//         remainingTime: remainingTimeInDays,
//       };
//     });
//   };

//   const handleRowClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div className="contain-main">
//       <div>
//         <Backlogs />
//       </div>
//       <div className="text-dark mb-3 mt-4 ">
//         <div className="d-flex justify-content-end">
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
//             <Input
//               onChange={(e) => setSearchData(e.target.value)}
//               prefix={<IoSearch style={{ width: "30px", height: "30px" }} />}
//               placeholder="ค้นหางานที่ต้องการ"
//               style={{
//                 width: "399px",
//                 height: "49px",
//                 backgroundColor: "#F7F7F7",
//                 color: "#CCCCCC",
//                 borderRadius: "4px",
//               }}
//             />
//           </Form.Item>
//         </div>
//         <div className="d-flex align-items-center justify-content-between mb-5 mt-3">
//           <h2>Job</h2>
//           <div className="d-flex justify-content-end gap-5">
//             <Space className="button">
//               <Dropdown menu={menuProps} trigger={["click"]}>
//                 <Button
//                   type="primary"
//                   style={{ backgroundColor: "#F7F7F7", color: "#616161" }}
//                   className="button"
//                 >
//                   <BiFilterAlt type="primary" className="button-icon" />
//                   เลือกสถานะ
//                 </Button>
//               </Dropdown>
//             </Space>

//             <Button
//               className="button"
//               style={{ backgroundColor: "#213F66", color: "#FFFFFF" }}
//               onClick={handletoCreateJob}
//             >
//               <FaPlus className="button-icon" />
//               สร้างงาน
//             </Button>

//             <Button
//               className="btn-edit-status align-items-center"
//               onClick={handleEditStatus}
//             >
//               <MdEditDocument className="button-icon justify-content-start" />
//               <span className="d-flex justify-content-center">
//                 {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
//               </span>
//             </Button>
//             {isEditing && hasChanges && (
//               <Button
//                 className="btn-comfirm-status align-items-center me-5"
//                 onClick={() => {
//                   handleConfirm();
//                   setOpen(true);
//                 }}
//               >
//                 <MdEditDocument className="button-icon justify-content-start" />
//                 <span className="d-flex justify-content-center">
//                   ยืนยันการแก้ไขสถานะ
//                 </span>
//               </Button>
//             )}
//             <Modal show={open} onHide={handleClose}>
//               <Modal.Body
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   flexDirection: "column",
//                 }}
//               >
//                 <IoMdCheckmarkCircle className="modal-icon" />
//                 <p className="d-flex mt-3 mb-3 fs-4 fw-semi-bold">
//                   การแก้ไขสถานะสำเร็จ
//                 </p>
//                 {/* <Button
//                   // onClick={handleCreateJob}
//                   className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
//                 >
//                   <span className="d-flex justify-content-end">สร้างงาน</span>
//                 </Button> */}
//               </Modal.Body>
//             </Modal>
//           </div>
//         </div>
//       </div>
//       <div>
//         <Table
//           dataSource={countRemainingTime(filterData)}
//           columns={columns}
//           scroll={{ x: 1300 }}
//           onRow={(record) => {
//             return {
//               onClick: () => {
//                 handleRowClick(record);
//               },
//             };
//           }}
//         />
//         {/* <h2>Remaining Time: {countRemainingTime}</h2> */}
//       </div>
//     </div>
//   );
// }
