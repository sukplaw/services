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
  const userRole = localStorage.getItem("permission") || sessionStorage.getItem("permission");

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
                <Dropdown menu={menuProps} trigger={["click"]}>
                  <Button className="btn-ghost btn-pill btn-icon">
                    <BiFilterAlt />
                    {selectedStatus || "เลือกสถานะ"}
                  </Button>
                </Dropdown>
              </Space>
              {userRole !== "admin" && (
                <>
                  <Button
                    className="btn-gradient btn-pill btn-icon"
                    onClick={handletoCreateJob}
                  >
                    <FaPlus /> สร้างงานซ่อม
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
                </>
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


