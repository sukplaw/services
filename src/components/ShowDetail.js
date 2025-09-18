import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Space,
  Dropdown,
  Button,
  Form,
  Input,
  InputNumber,
  Descriptions,
  Timeline,
  Tag,
  Collapse,
  Select,
  Upload,
  message,
  Image,
} from "antd";
import {
  CheckCircleTwoTone,
  ClockCircleOutlined,
  CloseCircleTwoTone,
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  DownOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import {
  FaRegLightbulb,
  FaTools,
  FaCheck,
  FaFileAlt,
  FaTruck,
  FaTruckLoading,
  FaRegClock,
  FaDownload,
  FaTrashAlt,
  FaEdit,
  FaImages,
} from "react-icons/fa";
import { IoImage } from "react-icons/io5";
import { IoMdPeople } from "react-icons/io";
import { MdBorderColor } from "react-icons/md";
import { TbBasketCancel } from "react-icons/tb";
import Accordion from "react-bootstrap/Accordion";
import { PiPackageFill } from "react-icons/pi";
import dayjs from "dayjs";

const { Dragger } = Upload;
const { Option } = Select;
const { Panel } = Collapse;
dayjs.locale("th");
dayjs.extend(require("dayjs/plugin/buddhistEra"));

export default function ShowDetail() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false); // product images
  const [openClaim, setopenClaim] = useState(false); // claim images
  const { jobRef } = useParams();
  const [uploadedUrls, setUploadedUrls] = useState([]);
  // none | status | customer | product
  const [editMode, setEditMode] = useState("none");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [changedStatus, setChangedStatus] = useState({});

  const [customerForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [form] = Form.useForm();

  const getData = () => {
    const url = `http://localhost:3302/get-detail/${jobRef}`;
    axios
      .get(url)
      .then((response) => {
        const responseData = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setData(responseData);
        console.log("Fetched data:", responseData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData([]);
      });
  };

  const deleteData = (jobRef) => {
    const url = `http://localhost:3302/delete-job/${jobRef}`;
    axios
      .delete(url)
      .then(() => {
        message.success("ข้อมูลถูกลบเรียบร้อยแล้ว");
      })
      .catch((error) => {
        message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        console.error("Error deleting job:", error);
      });
  };

  const uploadProps = {
    name: "imageFile",
    multiple: false,
    action: "http://localhost:3303/upload",
    listType: "picture",
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} อัปโหลดสำเร็จ.`);
        const imageUrl = info.file.response.url;
        setUploadedUrls((prev) => [...prev, imageUrl]);
      } else if (status === "error") {
        message.error(`${info.file.name} อัปโหลดไม่สำเร็จ.`);
      }
    },
  };

  const onFinish = (values) => {
  if (isSubmitting) return;  // ป้องกันส่งซ้ำ
  setIsSubmitting(true);

  const jobRef = data[0]?.jobRef;
  if (!jobRef) {
    message.warning("ไม่พบ jobRef ที่จะอัปเดต");
    setIsSubmitting(false);
    return;
  }

  const jobData = {
    remark: values.Remark,
    images: uploadedUrls || [],
    jobStatus: latestStatus || "",
  };

  console.log("📤 ส่งไป backend:", {
    jobRef,
    body: jobData,
  });

  updateRemark(jobRef, jobData);
};

const updateRemark = async (jobRef, jobData) => {
  const url = `http://localhost:3302/update-remark/${jobRef}`;
  try {
    const res = await axios.put(url, jobData);
    message.success("เพิ่มหมายเหตุและรูปภาพเพิ่มเติมสำเร็จ!");
    console.log("Job updated successfully:", res.data);
    form.resetFields();
    getData();
  } catch (error) {
    message.error("เกิดข้อผิดพลาดในการบันทึกงาน!");
    console.error("Error updating job:", error);
  } finally {
    setIsSubmitting(false);  // เปิดให้กดส่งใหม่ได้หลังจากทำงานเสร็จ
  }
};

  useEffect(() => {
    getData();
  }, [jobRef]);

  useEffect(() => {
    if (data.length > 0) {
      const d = data[0] || {};
      customerForm.setFieldsValue({
        customer_firstname: d.customer_firstname,
        customer_lastname: d.customer_lastname,
        customer_old: d.customer_old,
        line_id: d.line_id,
        username: d.username,
        email: d.email,
        customer_contact: d.customer_contact,
        phone: d.phone,
        address: d.address,
      });
      productForm.setFieldsValue({
        product_name: d.product_name,
        sku: d.sku,
        brand: d.brand,
        category: d.category,
        pcs: d.pcs,
        description: d.description,
        serialNumber: d.serialNumber,
        unit: d.unit,
      });
    }
  }, [data, customerForm, productForm]);

  // ===== Status helpers =====
  const statusOrder = [
    "เริ่มงาน",
    "สั่งอะไหล่",
    "เริ่มการซ่อม",
    "ซ่อมสำเร็จ",
    "รอทดสอบ",
    "รอจัดส่ง",
    "จัดส่งสำเร็จ",
  ];
  const CANCEL_STATUS = "ยกเลิกการเคลมสินค้า";
  const DONE_ALIASES = new Set(["จัดส่งสำเร็จ", "จบงาน"]);

  // ===== Visual helpers for Timeline =====
  const getLevelColor = (idx, total) => {
    // Smooth hue ramp from teal (200) to pink (340)
    const startHue = 200;
    const endHue = 340;
    const t = total > 1 ? idx / (total - 1) : 0;
    const hue = Math.round(startHue + (endHue - startHue) * t);
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Soft color set for item backgrounds/borders/text
  const getSoftColors = (idx, total) => {
    const startHue = 200;
    const endHue = 340;
    const t = total > 1 ? idx / (total - 1) : 0;
    const hue = Math.round(startHue + (endHue - startHue) * t);
    return {
      bg: `hsla(${hue}, 85%, 92%, 0.9)`,
      border: `hsl(${hue}, 70%, 75%)`,
      text: `hsl(${hue}, 70%, 35%)`,
    };
  };

  // ✅ แก้ไข: รวมฟังก์ชันที่ซ้ำกัน
  const getStatusDot = (status, color) => {
    const iconStyle = { color };
    switch (status) {
      case "เริ่มงาน":
        return <FaRegLightbulb twoToneColor={color} style={{ fontSize: 22 }} />;
      case "สั่งอะไหล่":
        return <MdBorderColor style={{ ...iconStyle, fontSize: 22 }} />;
      case "เริ่มการซ่อม":
        return <MdBorderColor style={{ ...iconStyle, fontSize: 22 }} />;
      case "ซ่อมสำเร็จ":
        return <FaTools twoToneColor={color} style={{ fontSize: 22 }} />;
      case "รอทดสอบ":
        return <FaFileAlt style={{ ...iconStyle, fontSize: 22 }} />;
      case "รอจัดส่ง":
        return <FaTruck style={{ ...iconStyle, fontSize: 22 }} />;
      case "จัดส่งสำเร็จ":
        return <FaTruckLoading twoToneColor={color} style={{ fontSize: 22 }} />;
      default:
        return <TbBasketCancel twoToneColor={color} style={{ fontSize: 22 }} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `วันที่: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const latestItem = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort(
      (a, b) => new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime()
    )[0];
  }, [data]);

  const latestStatus = latestItem?.jobStatus;
  const isCancelled = latestStatus === CANCEL_STATUS;
  const isDone = !!latestStatus && DONE_ALIASES.has(latestStatus);
  const isLocked = isCancelled || isDone;

  const timelineItems = useMemo(() => {
    const total = statusOrder.length;

    const items = statusOrder.map((status, idx) => {
      const record = data.find((d) => d.jobStatus === status);
      const levelColor = getLevelColor(idx, total);
      const soft = getSoftColors(idx, total);

      if (record) {
        // Assuming you have a function to fetch remarks and images
        // const { remark, images } = fetchRemarkAndImages(record.jobRef, record.jobStatus);
        const hasDetails =
          record.remark || (record.images && record.images.length > 0); // Check if details exist

        const headerContent = (
          <div style={{ fontWeight: 600, color: soft.text }}>
            {record.jobStatus}
          </div>
        );

        const bodyContent = (
          <>
            <div style={{ color: "#666", marginBottom: 8 }}>
              โดย:{" "}
              {record.jobStatus === "เริ่มงาน"
                ? record.serviceRef
                : record.updateBy}
            </div>
            {record.remark && (
              <div style={{ marginBottom: 8 }}>
                <strong>หมายเหตุ:</strong> {record.remark}
              </div>
            )}
            {record.jobStatus !== "เริ่มงาน" &&
              record.images && record.images.length > 0 && (
              <div>
                <strong>รูปภาพ:</strong>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  {record.images.filter(img => img.status === record.jobStatus) // ⬅️ เพิ่มการกรองตรงนี้
                    .map((img, i) => (
                      <img
                        key={i}
                        src={img.imageUrl}
                        alt={`remark-${i}`}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        );

        // Render the Timeline Item
        return {
          color: levelColor,
          dot: getStatusDot(status, levelColor),
          label: formatDate(record.updateAt),
          children: (
            <div
              style={{
                background: soft.bg,
                border: `1px solid ${soft.border}`,
                borderRadius: 10,
                padding: hasDetails ? 0 : 12, // Remove padding if using collapse
              }}
            >
              {hasDetails ? (
                // Use Collapse for expandable content
                <Collapse ghost>
                  <Panel header={headerContent}>{bodyContent}</Panel>
                </Collapse>
              ) : (
                // Regular content if no extra details exist
                <div style={{ padding: 12 }}>
                  {headerContent}
                  <div style={{ color: "#666" }}>
                    โดย:{" "}
                    {record.jobStatus === "เริ่มงาน"
                      ? record.serviceRef
                      : record.updateBy}
                  </div>
                </div>
              )}
            </div>
          ),
          style: { marginBottom: 18 },
        };
      }

      // ... rest of the code for pending steps ...
      return {
        color: "#d9d9d9",
        dot: <ClockCircleOutlined style={{ fontSize: 22, color: "#bfbfbf" }} />,
        label: status,
        children: <span style={{ color: "#bfbfbf" }}>รออัปเดตสถานะ</span>,
        style: { marginBottom: 18 },
      };
    });

    // ... rest of the code for cancellation status ...

    return items;
  }, [data]);

  const countRemainingTime = (dataArr) => {
    if (!dataArr || dataArr.length === 0) return [];
    const currentDate = new Date();
    return dataArr.map((item) => {
      const completionDate = new Date(item.expected_completion_date);
      const remainingTimeInDays = Math.floor(
        (completionDate.getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );
      return { ...item, remainingTime: remainingTimeInDays };
    });
  };

  const warningJob = countRemainingTime(data);
  const topBanner = useMemo(() => {
    if (isCancelled) return { text: "ยกเลิกการเคลมสินค้า", color: "error" };
    if (isDone) return { text: "การเคลมสินค้าสำเร็จ", color: "success" };
    if (warningJob.length > 0) {
      const r = warningJob[0];
      const msg =
        r.remainingTime > 0
          ? `ระยะเวลาที่คงเหลือ ${r.remainingTime} วัน`
          : r.remainingTime === 0
            ? "ไม่เหลือเวลา"
            : `เกินระยะเวลาที่กำหนด ${Math.abs(r.remainingTime)} วัน`;
      return { text: msg, color: "processing" };
    }
    return null;
  }, [isCancelled, isDone, warningJob]);

  // ----- next status options (no skipping) -----
  const nextOptions = useMemo(() => {
    if (isLocked) return [];
    if (!latestStatus) return ["เริ่มงาน", CANCEL_STATUS];
    const idx = statusOrder.indexOf(latestStatus);
    const next =
      idx >= 0 && idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;
    const set = new Set();
    if (next) set.add(next);
    set.add(CANCEL_STATUS);
    return Array.from(set);
  }, [latestStatus, isLocked]);

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const allMenuItems = [
    ...statusOrder.map((s) => ({ key: s, label: s })),
    { key: CANCEL_STATUS, label: CANCEL_STATUS },
  ];

  // Handlers
  const handleStatusChange = (newStatus) => {
    if (data.length > 0) {
      const jobRef = data[0].jobRef;
      setChangedStatus({ [jobRef]: newStatus });
    }
  };

  const handleConfirmStatus = async () => {
    try {
      const updatePromises = Object.keys(changedStatus).map((jobRef) => {
        const newStatus = changedStatus[jobRef];
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!nextOptions.includes(newStatus)) {
          message.error("ไม่สามารถข้ามลำดับสถานะได้");
          throw new Error("Invalid status transition");
        }
        return axios.put(
          `http://localhost:3302/update-status/${jobRef}`,
          { jobStatus: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      await Promise.all(updatePromises);
      message.success("สถานะถูกอัปเดตเรียบร้อยแล้ว");
      await getData();
      setEditMode("none");
      setChangedStatus({});
    } catch (error) {
      if (error?.message !== "Invalid status transition") {
        message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      }
      console.error("Failed to update status:", error);
    }
  };

  const handleCancelEditAll = () => {
    setEditMode("none");
    setChangedStatus({});
    if (data.length > 0) {
      const d = data[0];
      customerForm.resetFields();
      productForm.resetFields();
      customerForm.setFieldsValue({
        customer_firstname: d.customer_firstname,
        customer_lastname: d.customer_lastname,
        customer_old: d.customer_old,
        line_id: d.line_id,
        username: d.username,
        email: d.email,
        customer_contact: d.customer_contact,
        phone: d.phone,
        address: d.address,
      });
      productForm.setFieldsValue({
        product_name: d.product_name,
        sku: d.sku,
        brand: d.brand,
        category: d.category,
        pcs: d.pcs,
        description: d.description,
        serialNumber: d.serialNumber,
        unit: d.unit,
      });
    }
  };

  const handleSaveCustomer = async (values) => {
    const d = data[0] || {};
    const customerRef = d.customerRef;
    try {
      if (!customerRef) {
        message.error("ไม่พบ customerRef ในข้อมูล");
        return;
      }
      await axios.put(
        `http://localhost:3302/update-customer/${customerRef}`,
        values
      );
      message.success("บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว");
      await getData();
      setEditMode("none");
    } catch (e) {
      console.error(e);
      message.error("บันทึกข้อมูลลูกค้าไม่สำเร็จ");
    }
  };

  const handleSaveProduct = async (values) => {
    const d = data[0] || {};
    const productRef = d.productRef;
    try {
      if (!productRef) {
        message.error("ไม่พบ productRef ในข้อมูล");
        return;
      }
      await axios.put(
        `http://localhost:3302/update-product/${productRef}`,
        values
      );
      message.success("บันทึกข้อมูลสินค้าเรียบร้อยแล้ว");
      await getData();
      setEditMode("none");
    } catch (e) {
      console.error(e);
      message.error("บันทึกข้อมูลสินค้าไม่สำเร็จ");
    }
  };

  // Dropdown menu for Edit actions
  const editMenu = {
    items: [
      {
        key: "status",
        label: "แก้ไขสถานะงาน",
        onClick: () => setEditMode("status"),
      },
      {
        key: "customer",
        label: "แก้ไขข้อมูลลูกค้า",
        onClick: () => setEditMode("customer"),
      },
      {
        key: "product",
        label: "แก้ไขข้อมูลสินค้า",
        onClick: () => setEditMode("product"),
      },
    ],
  };

  const [activeKey, setActiveKey] = useState(null); // 'product' | `claim-0` | null
  const productRef = useRef(null);
  const claimRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      const inProduct = productRef.current?.contains(e.target);
      const inClaim = claimRef.current?.contains(e.target);
      if (!inProduct && !inClaim) setActiveKey(null);
    };
    const onEsc = (e) => e.key === "Escape" && setActiveKey(null);

    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div className="card border-0 mb-3" style={{ borderRadius: 16 }}>
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-auto">
              <span
                className="badge text-bg-primary"
                style={{ fontSize: 16, padding: "8px 12px" }}
              >
                {data[0]?.jobRef || jobRef || "-"}
              </span>
            </div>
            <div className="col">
              {topBanner && (
                <span
                  className="badge"
                  style={{
                    fontSize: 14,
                    padding: "6px 12px",
                    color: "#fff",
                    background:
                      "linear-gradient(135deg, hsl(200,80%,55%), hsl(320,80%,60%))",
                  }}
                >
                  {topBanner.text}
                </span>
              )}
            </div>
            <div className="col-auto d-flex gap-2">
              <div className="dropdown">
                <button
                  className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${isLocked ? "disabled" : ""
                    }`}
                  data-bs-toggle="dropdown"
                  disabled={isLocked}
                >
                  <FaEdit /> แก้ไขงาน
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setEditMode("status")}
                    >
                      แก้ไขสถานะงาน
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setEditMode("customer")}
                    >
                      แก้ไขข้อมูลลูกค้า
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setEditMode("product")}
                    >
                      แก้ไขข้อมูลสินค้า
                    </button>
                  </li>
                </ul>
              </div>
              <button
                className="btn btn-danger d-flex align-items-center gap-2"
                onClick={() => deleteData(jobRef)}
              >
                <FaTrashAlt /> ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        {/* Left Column: Details & Forms */}
        <Col xs={24} lg={14}>
          {/* Customer & Product */}
          <Card
            bordered={false}
            bodyStyle={{
              background: "#FFFFFFFF",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div className="claim-view colorful">
              <Accordion
                defaultActiveKey={["0", "1"]}
                alwaysOpen
                className="acc-custom"
              >
                {/* === ลูกค้า === */}
                <Accordion.Item eventKey="0" className="acc-item acc-customer">
                  <Accordion.Header>
                    <IoMdPeople className="me-2 acc-icon" />
                    ข้อมูลลูกค้า
                  </Accordion.Header>
                  <Accordion.Body>
                    {data?.length > 0 && (
                      <div className="section-card">
                        {/* กลุ่ม: ข้อมูลทั่วไป */}
                        <div className="subsection">
                          <div className="subsection-title">ข้อมูลทั่วไป</div>
                          <div className="kv-grid">
                            <div className="kv">
                              <span className="label">ชื่อ</span>
                              <span className="value">
                                {data[0].customer_firstname}
                              </span>
                            </div>
                            <div className="kv">
                              <span className="label">นามสกุล</span>
                              <span className="value">
                                {data[0].customer_lastname}
                              </span>
                            </div>
                            <div className="kv">
                              <span className="label">อายุ</span>
                              <span className="value">
                                {data[0].customer_old}
                              </span>
                            </div>
                            <div className="kv">
                              <span className="label">Username</span>
                              <span className="value">{data[0].username}</span>
                            </div>
                          </div>
                        </div>

                        {/* กลุ่ม: ช่องทางติดต่อ */}
                        <div className="subsection">
                          <div className="subsection-title">ช่องทางติดต่อ</div>
                          <div className="kv-grid">
                            <div className="kv">
                              <span className="label">Line ID</span>
                              <span className="value">{data[0].line_id}</span>
                            </div>
                            <div className="kv">
                              <span className="label">Email</span>
                              <span className="value">{data[0].email}</span>
                            </div>
                            <div className="kv">
                              <span className="label">ช่องทางที่สะดวก</span>
                              <span className="value">
                                {data[0].customer_contact}
                              </span>
                            </div>
                            <div className="kv">
                              <span className="label">เบอร์โทรศัพท์</span>
                              <span className="value">{data[0].phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* กลุ่ม: ที่อยู่ */}
                        <div className="subsection">
                          <div className="subsection-title">ที่อยู่</div>
                          <div className="kv-grid">
                            <div className="kv kv-span-2">
                              <span className="label">
                                ที่อยู่จัดส่ง/ติดต่อ
                              </span>
                              <span className="value">{data[0].address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Accordion.Body>
                </Accordion.Item>

                {/* === สินค้า === */}
                <Accordion.Item eventKey="1" className="acc-item acc-product">
                  <Accordion.Header>
                    <PiPackageFill className="me-2 acc-icon" />
                    ข้อมูลสินค้า
                  </Accordion.Header>
                  <Accordion.Body>
                    {data?.length > 0 && (
                      <div className="section-card">
                        {/* รายละเอียดหลัก */}
                        <div className="subsection">
                          <div className="subsection-title">รายละเอียดหลัก</div>
                          <div className="kv-grid">
                            <div className="kv">
                              <span className="label">ชื่อสินค้า</span>
                              <span className="value strong">
                                {data[0].product_name}
                              </span>
                            </div>
                            <div className="kv">
                              <span className="label">ประเภทสินค้า</span>
                              <span className="value chip chip-blue">
                                {data[0].category}
                              </span>
                            </div>
                            <div className="kv">
                              <span className="label">Brand</span>
                              <span className="value chip chip-indigo">
                                {data[0].brand}
                              </span>
                            </div>
                            <div className="kv">
                              <span className="label">จำนวนสินค้าที่เคลม</span>
                              <span className="value">{data[0].unit}</span>
                            </div>
                            <div className="kv">
                              <span className="label">หน่วย</span>
                              <span className="value">{data[0].pcs}</span>
                            </div>
                          </div>
                        </div>

                        {/* รหัสและการระบุ */}
                        <div className="subsection">
                          <div className="subsection-title">รหัสและการระบุ</div>
                          <div className="kv-grid">
                            <div className="kv">
                              <span className="label">SKU</span>
                              <span className="value mono">{data[0].sku}</span>
                            </div>
                            <div className="kv">
                              <span className="label">Serial Number</span>
                              <span className="value mono">
                                {data[0].serialNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* สถานะการซ่อม */}
                        <div className="subsection">
                          <div className="subsection-title">สถานะการซ่อม</div>
                          <div className="kv-grid">
                            <div className="kv">
                              <span className="label">จำนวนสินค้าที่ซ่อม</span>
                              <span className="value">{data[0].unit}</span>
                            </div>
                            <div className="kv">
                              <span className="label">วันที่เปิดซ่อม</span>
                              <span className="value">
                                {data[0].createAt
                                  ? dayjs(data[0].createAt).format(
                                    "D MMMM BBBB HH:mm"
                                  )
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* รายละเอียดสินค้า */}
                        <div className="subsection">
                          <div className="subsection-title">
                            รายละเอียดสินค้า
                          </div>
                          <div className="kv-grid">
                            <div className="kv kv-span-2">
                              <span className="label">รายละเอียด</span>
                              <span className="value">
                                {data[0].description}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* รูปภาพ */}
                        <div className="media-grid">
                          <div className="media-card">
                            <div className="media-title">รูปภาพสินค้า</div>
                            {/* <Button
                              className="btn-show-image"
                              onClick={() => setOpen(!open)}
                              aria-controls="gallery-product"
                              aria-expanded={open}
                            >
                              <IoImage className="button-icon" />
                              <span>
                                {open ? "ซ่อนรูปภาพ" : "ดูรูปภาพเพิ่มเติม"}
                              </span>
                            </Button> */}
                            {/* <div className="media-collapse"> */}
                            <div className="media-collapse" ref={productRef}>
                              {/* <Collapse
                                activeKey={open ? ["claim"] : []}
                                ghost
                                bordered={false}
                              >
                                <Panel
                                  header={null}
                                  key="claim"
                                  showArrow={false}
                                > */}
                              <div id="gallery-product">
                                <div className="gallery-grid">
                                  {data[0].image ? (
                                    <img
                                      src={data[0].image}
                                      alt="Product"
                                      // className="gallery-img"
                                      className={`gallery-img ${activeKey === "product"
                                          ? "is-active"
                                          : ""
                                        }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveKey((k) =>
                                          k === "product" ? null : "product"
                                        );
                                      }}
                                    />
                                  ) : (
                                    <p className="empty-text">
                                      ไม่มีรูปภาพแสดง
                                    </p>
                                  )}
                                </div>
                              </div>
                              {/* </Panel>
                              </Collapse> */}
                            </div>
                          </div>

                          <div className="media-card">
                            <div className="media-title">
                              รูปภาพสินค้าที่เคลม
                            </div>
                            {/* <Button
                              className="btn-show-image"
                              onClick={() => setopenClaim(!openClaim)}
                              aria-controls="gallery-claim"
                              aria-expanded={openClaim}
                            >
                              <IoImage className="button-icon" />
                              <span>ดูรูปภาพเพิ่มเติม</span>
                            </Button> */}
                            {/* <div className="media-collapse"> */}
                            <div className="media-collapse" ref={claimRef}>
                              {/* <Collapse
                                activeKey={openClaim ? ["claim"] : []}
                                ghost
                                bordered={false}
                              >
                                <Panel
                                  header={null}
                                  key="claim"
                                  showArrow={false}
                                > */}
                              <div id="gallery-claim">
                                <div className="gallery-grid">
                                  {data[0].images?.filter(u => u.status === "เริ่มงาน").length ? (
                                    data[0].images.filter(u => u.status === "เริ่มงาน").map((u, i) => {
                                      // <-- 1. กรองให้เหลือเฉพาะรูปที่มี status 'เริ่มงาน'
                                      const key = `claim-${i}`;
                                      return (
                                        <img
                                          key={key}
                                          src={u.imageUrl}
                                          alt={`รูปภาพที่ ${i + 1}`}
                                          // className="gallery-img"
                                          // tabIndex={0}
                                          className={`gallery-img ${activeKey === key ? "is-active" : ""
                                            }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveKey((k) =>
                                              k === key ? null : key
                                            );
                                          }}
                                        />
                                      );
                                    })
                                  ) : (
                                    <p className="empty-text">
                                      ไม่มีรูปภาพแสดง
                                    </p>
                                  )}
                                </div>
                              </div>
                              {/* </Panel>
                              </Collapse> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </Card>

          {/* Remark + Upload */}
          <Card
            bordered={false}
            style={{ borderRadius: 16, marginBottom: 16, marginTop: 16 }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="Remark"
                label="หมายเหตุ (หากมี)"
                rules={[{ required: true, message: "กรุณากรอกหมายเหตุ" }]}
              >
                <Input.TextArea rows={4} placeholder="ระบุหมายเหตุ" />
              </Form.Item>

              <Form.Item
                name="image"
                label="รูปภาพสินค้า"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: "กรุณาอัปโหลดรูปภาพ" }]}
              >
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <PictureOutlined />
                  </p>
                  <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <p className="ant-upload-hint">
                    รองรับการอัปโหลดไฟล์เดียวหรือหลายไฟล์
                  </p>
                </Dragger>
              </Form.Item>

              <Space className="d-flex justify-content-center">
                <button
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={() => form.submit()}
                >
                  <SaveOutlined />
                  บันทึก
                </button>
                <button
                  className="btn btn-secondary d-flex align-items-center gap-2"
                  onClick={() => form.resetFields()}
                >
                  <DeleteOutlined />
                  ล้างข้อมูล
                </button>
              </Space>
            </Form>
          </Card>
        </Col>

        {/* Right Column: Timeline + Actions */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              marginBottom: 16,
              // background:
              //   "linear-gradient(180deg, hsla(200,70%,97%,0.7), hsla(320,70%,97%,0.7))",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 600 }}>สถานะ</div>
            <Timeline
              mode="left"
              items={timelineItems}
              style={{
                marginTop: 8,
                padding: "8px 10px",
                borderRadius: 12,
              }}
            />
            {/* Status Editor */}
            {editMode === "status" && !isLocked && (
              <Space
                direction="vertical"
                style={{ width: "100%", marginTop: 8 }}
              >
                <Select
                  placeholder="เลือกสถานะใหม่"
                  style={{ width: "100%" }}
                  onChange={handleStatusChange}
                  options={allMenuItems
                    .filter((m) => nextOptions.includes(m.key))
                    .map((m) => ({ label: m.label, value: m.key }))}
                />
                <Space>
                  <Button
                    type="primary"
                    onClick={handleConfirmStatus}
                    disabled={Object.keys(changedStatus).length === 0}
                  >
                    ยืนยัน
                  </Button>
                  <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
                </Space>
              </Space>
            )}
            {editMode === "customer" && (
              <Card
                size="small"
                bordered
                style={{ borderRadius: 12, marginTop: 12 }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  แก้ไขข้อมูลลูกค้า
                </div>
                <Form
                  form={customerForm}
                  layout="vertical"
                  onFinish={handleSaveCustomer}
                >
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="customer_firstname"
                        label="ชื่อ"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="customer_lastname"
                        label="นามสกุล"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="customer_old" label="อายุ">
                        <InputNumber
                          min={1}
                          max={100}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="phone"
                        label="เบอร์โทรศัพท์"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="email" label="Email">
                        <Input type="email" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="username" label="Username">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="line_id" label="Line ID">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="customer_contact"
                        label="ช่องทางติดต่อ"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Select placeholder="กรุณาเลือกช่องทางติดต่อ">
                          <Option value="phone">เบอร์โทรศัพท์</Option>
                          <Option value="line">Line</Option>
                          <Option value="address">ที่อยู่ลูกค้า</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="address" label="ที่อยู่">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      บันทึก
                    </Button>
                    <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
                  </Space>
                </Form>
              </Card>
            )}
            {editMode === "product" && (
              <Card
                size="small"
                bordered
                style={{ borderRadius: 12, marginTop: 12 }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  แก้ไขข้อมูลสินค้า
                </div>
                <Form
                  form={productForm}
                  layout="vertical"
                  onFinish={handleSaveProduct}
                >
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="product_name"
                        label="ชื่อสินค้า"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="sku" label="SKU">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="brand" label="Brand">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="category" label="ประเภทสินค้า">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="pcs" label="หน่วย">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="serialNumber" label="Serial Number">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="unit" label="จำนวนสินค้าที่ซ่อม">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="description" label="รายละเอียดสินค้า">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      บันทึก
                    </Button>
                    <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
                  </Space>
                </Form>
              </Card>
            )}
            <div className="d-flex justify-content-center">
              <button
                className="btn d-inline-flex align-items-center gap-2 text-white"
                style={{
                  border: "none",
                  background:
                    "linear-gradient(135deg, hsl(200,80%,55%), hsl(320,80%,60%))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontWeight: 600,
                }}
              >
                <FaDownload /> Export Data
              </button>

              {/* <button
                className="btn d-inline-flex align-items-center gap-2 text-white"
                style={{
                  border: "none",
                  background:
                    "linear-gradient(135deg, hsl(10, 80%, 60%), hsl(350, 80%, 50%))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontWeight: 600,
                }}
              >
                <FaTrashAlt /> ลบข้อมูล
              </button> */}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}



// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import {
//   Card,
//   Row,
//   Col,
//   Space,
//   Dropdown,
//   Button,
//   Form,
//   Input,
//   InputNumber,
//   Descriptions,
//   Timeline,
//   Tag,
//   Collapse,
//   Select,
//   Upload,
//   message,
//   Image,
// } from "antd";
// import {
//   CheckCircleTwoTone,
//   ClockCircleOutlined,
//   CloseCircleTwoTone,
//   SaveOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   PictureOutlined,
//   DownOutlined,
//   DownloadOutlined,
// } from "@ant-design/icons";

// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
//   FaTruckLoading,
//   FaRegClock,
//   FaDownload,
//   FaTrashAlt,
//   FaEdit,
//   FaImages,
// } from "react-icons/fa";
// import { IoImage } from "react-icons/io5";
// import { IoMdPeople } from "react-icons/io";
// import { MdBorderColor } from "react-icons/md";
// import { TbBasketCancel } from "react-icons/tb";
// import Accordion from "react-bootstrap/Accordion";
// import { PiPackageFill } from "react-icons/pi";
// import dayjs from "dayjs";

// const { Dragger } = Upload;
// const { Option } = Select;
// const { Panel } = Collapse;
// dayjs.locale("th");
// dayjs.extend(require("dayjs/plugin/buddhistEra"));

// export default function ShowDetail() {
//   const [data, setData] = useState([]);
//   const [open, setOpen] = useState(false); // product images
//   const [openClaim, setopenClaim] = useState(false); // claim images
//   const { jobRef } = useParams();
//   const [uploadedUrls, setUploadedUrls] = useState([]);
//   // none | status | customer | product
//   const [editMode, setEditMode] = useState("none");

//   const [changedStatus, setChangedStatus] = useState({});

//   const [customerForm] = Form.useForm();
//   const [productForm] = Form.useForm();
//   const [form] = Form.useForm();

//   const getData = () => {
//     const url = `http://localhost:3302/get-detail/${jobRef}`;
//     axios
//       .get(url)
//       .then((response) => {
//         const responseData = Array.isArray(response.data)
//           ? response.data
//           : [response.data];
//         setData(responseData);
//         console.log("Fetched data:", responseData);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setData([]);
//       });
//   };

//   const deleteData = (jobRef) => {
//     const url = `http://localhost:3302/delete-job/${jobRef}`;
//     axios
//       .delete(url)
//       .then(() => {
//         message.success("ข้อมูลถูกลบเรียบร้อยแล้ว");
//       })
//       .catch((error) => {
//         message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
//         console.error("Error deleting job:", error);
//       });
//   };

//   const uploadProps = {
//     name: "imageFile",
//     multiple: false,
//     action: "http://localhost:3303/upload",
//     listType: "picture",
//     onChange(info) {
//       const { status } = info.file;
//       if (status === "done") {
//         message.success(`${info.file.name} อัปโหลดสำเร็จ.`);
//         const imageUrl = info.file.response.url;
//         setUploadedUrls((prev) => [...prev, imageUrl]);
//       } else if (status === "error") {
//         message.error(`${info.file.name} อัปโหลดไม่สำเร็จ.`);
//       }
//     },
//   };

//   const onFinish = (values) => {
//     const jobRef = data[0]?.jobRef;
//     if (!jobRef) {
//       message.warning("ไม่พบ jobRef ที่จะอัปเดต");
//       return;
//     }
//     const jobData = {
//       remark: values.Remark,
//       images: uploadedUrls || [],
//       jobStatus: latestStatus || "",
//     };

//     console.log("📤 ส่งไป backend:", {
//       jobRef,
//       body: jobData,
//     });
//     updateRemark(jobRef, jobData);
//   };

//   // ✅ ส่ง remark + รูปภาพ + สถานะล่าสุด
//   const updateRemark = async (jobRef, jobData) => {
//     const url = `http://localhost:3302/update-remark/${jobRef}`;
//     try {
//       const res = await axios.put(url, jobData);
//       message.success("เพิ่มหมายเหตุและรูปภาพเพิ่มเติมสำเร็จ!");
//       console.log("Job updated successfully:", res.data);
//       form.resetFields();
//       getData();
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการบันทึกงาน!");
//       console.error("Error updating job:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, [jobRef]);

//   useEffect(() => {
//     if (data.length > 0) {
//       const d = data[0] || {};
//       customerForm.setFieldsValue({
//         customer_firstname: d.customer_firstname,
//         customer_lastname: d.customer_lastname,
//         customer_old: d.customer_old,
//         line_id: d.line_id,
//         username: d.username,
//         email: d.email,
//         customer_contact: d.customer_contact,
//         phone: d.phone,
//         address: d.address,
//       });
//       productForm.setFieldsValue({
//         product_name: d.product_name,
//         sku: d.sku,
//         brand: d.brand,
//         category: d.category,
//         pcs: d.pcs,
//         description: d.description,
//         serialNumber: d.serialNumber,
//         unit: d.unit,
//       });
//     }
//   }, [data, customerForm, productForm]);

//   // ===== Status helpers =====
//   const statusOrder = [
//     "เริ่มงาน",
//     "สั่งอะไหล่",
//     "เริ่มการซ่อม",
//     "ซ่อมสำเร็จ",
//     "รอทดสอบ",
//     "รอจัดส่ง",
//     "จัดส่งสำเร็จ",
//   ];
//   const CANCEL_STATUS = "ยกเลิกการเคลมสินค้า";
//   const DONE_ALIASES = new Set(["จัดส่งสำเร็จ", "จบงาน"]);

//   // ===== Visual helpers for Timeline =====
//   const getLevelColor = (idx, total) => {
//     // Smooth hue ramp from teal (200) to pink (340)
//     const startHue = 200;
//     const endHue = 340;
//     const t = total > 1 ? idx / (total - 1) : 0;
//     const hue = Math.round(startHue + (endHue - startHue) * t);
//     return `hsl(${hue}, 70%, 50%)`;
//   };

//   // Soft color set for item backgrounds/borders/text
//   const getSoftColors = (idx, total) => {
//     const startHue = 200;
//     const endHue = 340;
//     const t = total > 1 ? idx / (total - 1) : 0;
//     const hue = Math.round(startHue + (endHue - startHue) * t);
//     return {
//       bg: `hsla(${hue}, 85%, 92%, 0.9)`,
//       border: `hsl(${hue}, 70%, 75%)`,
//       text: `hsl(${hue}, 70%, 35%)`,
//     };
//   };

//   // ✅ แก้ไข: รวมฟังก์ชันที่ซ้ำกัน
//   const getStatusDot = (status, color) => {
//     const iconStyle = { color };
//     switch (status) {
//       case "เริ่มงาน":
//         return <FaRegLightbulb twoToneColor={color} style={{ fontSize: 22 }} />;
//       case "สั่งอะไหล่":
//         return <MdBorderColor style={{ ...iconStyle, fontSize: 22 }} />;
//       case "เริ่มการซ่อม":
//         return <MdBorderColor style={{ ...iconStyle, fontSize: 22 }} />;
//       case "ซ่อมสำเร็จ":
//         return <FaTools twoToneColor={color} style={{ fontSize: 22 }} />;
//       case "รอทดสอบ":
//         return <FaFileAlt style={{ ...iconStyle, fontSize: 22 }} />;
//       case "รอจัดส่ง":
//         return <FaTruck style={{ ...iconStyle, fontSize: 22 }} />;
//       case "จัดส่งสำเร็จ":
//         return <FaTruckLoading twoToneColor={color} style={{ fontSize: 22 }} />;
//       default:
//         return <TbBasketCancel twoToneColor={color} style={{ fontSize: 22 }} />;
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const seconds = String(date.getSeconds()).padStart(2, "0");
//     return `วันที่: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   };

//   const latestItem = useMemo(() => {
//     if (!data || data.length === 0) return null;
//     return [...data].sort(
//       (a, b) => new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime()
//     )[0];
//   }, [data]);

//   const latestStatus = latestItem?.jobStatus;
//   const isCancelled = latestStatus === CANCEL_STATUS;
//   const isDone = !!latestStatus && DONE_ALIASES.has(latestStatus);
//   const isLocked = isCancelled || isDone;

//   const timelineItems = useMemo(() => {
//     const total = statusOrder.length;

//     const items = statusOrder.map((status, idx) => {
//       const record = data.find((d) => d.jobStatus === status);
//       const levelColor = getLevelColor(idx, total);
//       const soft = getSoftColors(idx, total);

//       if (record) {
//         // Assuming you have a function to fetch remarks and images
//         // const { remark, images } = fetchRemarkAndImages(record.jobRef, record.jobStatus);
//         const hasDetails =
//           record.remark || (record.images && record.images.length > 0); // Check if details exist

//         const headerContent = (
//           <div style={{ fontWeight: 600, color: soft.text }}>
//             {record.jobStatus}
//           </div>
//         );

//         const bodyContent = (
//           <>
//             <div style={{ color: "#666", marginBottom: 8 }}>
//               โดย:{" "}
//               {record.jobStatus === "เริ่มงาน"
//                 ? record.serviceRef
//                 : record.updateBy}
//             </div>
//             {record.remark && (
//               <div style={{ marginBottom: 8 }}>
//                 <strong>หมายเหตุ:</strong> {record.remark}
//               </div>
//             )}
//             {record.images && record.images.length > 0 && (
//               <div>
//                 <strong>รูปภาพ:</strong>
//                 <div
//                   style={{
//                     display: "flex",
//                     flexWrap: "wrap",
//                     gap: 8,
//                     marginTop: 4,
//                   }}
//                 >
//                   {record.images.map((img, i) => (
//                     <img
//                       key={i}
//                       src={img.imageUrl}
//                       alt={`remark-${i}`}
//                       style={{
//                         width: "80px",
//                         height: "80px",
//                         objectFit: "cover",
//                         borderRadius: "4px",
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </>
//         );

//         // Render the Timeline Item
//         return {
//           color: levelColor,
//           dot: getStatusDot(status, levelColor),
//           label: formatDate(record.updateAt),
//           children: (
//             <div
//               style={{
//                 background: soft.bg,
//                 border: `1px solid ${soft.border}`,
//                 borderRadius: 10,
//                 padding: hasDetails ? 0 : 12, // Remove padding if using collapse
//               }}
//             >
//               {hasDetails ? (
//                 // Use Collapse for expandable content
//                 <Collapse ghost>
//                   <Panel header={headerContent}>{bodyContent}</Panel>
//                 </Collapse>
//               ) : (
//                 // Regular content if no extra details exist
//                 <div style={{ padding: 12 }}>
//                   {headerContent}
//                   <div style={{ color: "#666" }}>
//                     โดย:{" "}
//                     {record.jobStatus === "เริ่มงาน"
//                       ? record.serviceRef
//                       : record.updateBy}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ),
//           style: { marginBottom: 18 },
//         };
//       }

//       // ... rest of the code for pending steps ...
//       return {
//         color: "#d9d9d9",
//         dot: <ClockCircleOutlined style={{ fontSize: 22, color: "#bfbfbf" }} />,
//         label: status,
//         children: <span style={{ color: "#bfbfbf" }}>รออัปเดตสถานะ</span>,
//         style: { marginBottom: 18 },
//       };
//     });

//     // ... rest of the code for cancellation status ...

//     return items;
//   }, [data]);

//   const countRemainingTime = (dataArr) => {
//     if (!dataArr || dataArr.length === 0) return [];
//     const currentDate = new Date();
//     return dataArr.map((item) => {
//       const completionDate = new Date(item.expected_completion_date);
//       const remainingTimeInDays = Math.floor(
//         (completionDate.getTime() - currentDate.getTime()) /
//           (1000 * 60 * 60 * 24)
//       );
//       return { ...item, remainingTime: remainingTimeInDays };
//     });
//   };

//   const warningJob = countRemainingTime(data);
//   const topBanner = useMemo(() => {
//     if (isCancelled) return { text: "ยกเลิกการเคลมสินค้า", color: "error" };
//     if (isDone) return { text: "การเคลมสินค้าสำเร็จ", color: "success" };
//     if (warningJob.length > 0) {
//       const r = warningJob[0];
//       const msg =
//         r.remainingTime > 0
//           ? `ระยะเวลาที่คงเหลือ ${r.remainingTime} วัน`
//           : r.remainingTime === 0
//           ? "ไม่เหลือเวลา"
//           : `เกินระยะเวลาที่กำหนด ${Math.abs(r.remainingTime)} วัน`;
//       return { text: msg, color: "processing" };
//     }
//     return null;
//   }, [isCancelled, isDone, warningJob]);

//   // ----- next status options (no skipping) -----
//   const nextOptions = useMemo(() => {
//     if (isLocked) return [];
//     if (!latestStatus) return ["เริ่มงาน", CANCEL_STATUS];
//     const idx = statusOrder.indexOf(latestStatus);
//     const next =
//       idx >= 0 && idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;
//     const set = new Set();
//     if (next) set.add(next);
//     set.add(CANCEL_STATUS);
//     return Array.from(set);
//   }, [latestStatus, isLocked]);

//   const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

//   const allMenuItems = [
//     ...statusOrder.map((s) => ({ key: s, label: s })),
//     { key: CANCEL_STATUS, label: CANCEL_STATUS },
//   ];

//   // Handlers
//   const handleStatusChange = (newStatus) => {
//     if (data.length > 0) {
//       const jobRef = data[0].jobRef;
//       setChangedStatus({ [jobRef]: newStatus });
//     }
//   };

//   const handleConfirmStatus = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//         const newStatus = changedStatus[jobRef];
//         const token =
//           localStorage.getItem("token") || sessionStorage.getItem("token");
//         if (!nextOptions.includes(newStatus)) {
//           message.error("ไม่สามารถข้ามลำดับสถานะได้");
//           throw new Error("Invalid status transition");
//         }
//         return axios.put(
//           `http://localhost:3302/update-status/${jobRef}`,
//           { jobStatus: newStatus },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//       });

//       await Promise.all(updatePromises);
//       message.success("สถานะถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       setEditMode("none");
//       setChangedStatus({});
//     } catch (error) {
//       if (error?.message !== "Invalid status transition") {
//         message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       }
//       console.error("Failed to update status:", error);
//     }
//   };

//   const handleCancelEditAll = () => {
//     setEditMode("none");
//     setChangedStatus({});
//     if (data.length > 0) {
//       const d = data[0];
//       customerForm.resetFields();
//       productForm.resetFields();
//       customerForm.setFieldsValue({
//         customer_firstname: d.customer_firstname,
//         customer_lastname: d.customer_lastname,
//         customer_old: d.customer_old,
//         line_id: d.line_id,
//         username: d.username,
//         email: d.email,
//         customer_contact: d.customer_contact,
//         phone: d.phone,
//         address: d.address,
//       });
//       productForm.setFieldsValue({
//         product_name: d.product_name,
//         sku: d.sku,
//         brand: d.brand,
//         category: d.category,
//         pcs: d.pcs,
//         description: d.description,
//         serialNumber: d.serialNumber,
//         unit: d.unit,
//       });
//     }
//   };

//   const handleSaveCustomer = async (values) => {
//     const d = data[0] || {};
//     const customerRef = d.customerRef;
//     try {
//       if (!customerRef) {
//         message.error("ไม่พบ customerRef ในข้อมูล");
//         return;
//       }
//       await axios.put(
//         `http://localhost:3302/update-customer/${customerRef}`,
//         values
//       );
//       message.success("บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว");
//       await getData();
//       setEditMode("none");
//     } catch (e) {
//       console.error(e);
//       message.error("บันทึกข้อมูลลูกค้าไม่สำเร็จ");
//     }
//   };

//   const handleSaveProduct = async (values) => {
//     const d = data[0] || {};
//     const productRef = d.productRef;
//     try {
//       if (!productRef) {
//         message.error("ไม่พบ productRef ในข้อมูล");
//         return;
//       }
//       await axios.put(
//         `http://localhost:3302/update-product/${productRef}`,
//         values
//       );
//       message.success("บันทึกข้อมูลสินค้าเรียบร้อยแล้ว");
//       await getData();
//       setEditMode("none");
//     } catch (e) {
//       console.error(e);
//       message.error("บันทึกข้อมูลสินค้าไม่สำเร็จ");
//     }
//   };

//   // Dropdown menu for Edit actions
//   const editMenu = {
//     items: [
//       {
//         key: "status",
//         label: "แก้ไขสถานะงาน",
//         onClick: () => setEditMode("status"),
//       },
//       {
//         key: "customer",
//         label: "แก้ไขข้อมูลลูกค้า",
//         onClick: () => setEditMode("customer"),
//       },
//       {
//         key: "product",
//         label: "แก้ไขข้อมูลสินค้า",
//         onClick: () => setEditMode("product"),
//       },
//     ],
//   };

//   const [activeKey, setActiveKey] = useState(null); // 'product' | `claim-0` | null
//   const productRef = useRef(null);
//   const claimRef = useRef(null);

//   useEffect(() => {
//     const onDocClick = (e) => {
//       const inProduct = productRef.current?.contains(e.target);
//       const inClaim = claimRef.current?.contains(e.target);
//       if (!inProduct && !inClaim) setActiveKey(null);
//     };
//     const onEsc = (e) => e.key === "Escape" && setActiveKey(null);

//     document.addEventListener("mousedown", onDocClick);
//     window.addEventListener("keydown", onEsc);
//     return () => {
//       document.removeEventListener("mousedown", onDocClick);
//       window.removeEventListener("keydown", onEsc);
//     };
//   }, []);

//   return (
//     <div style={{ padding: 16 }}>

//       {/* Header */}

//       <div className="card border-0 mb-3" style={{ borderRadius: 16 }}>

//         <div className="card-body">

//           <div className="row g-3 align-items-center">

//             <div className="col-auto">

//               <span

//                 className="badge text-bg-primary"

//                 style={{ fontSize: 16, padding: "8px 12px" }}

//               >

//                 {data[0]?.jobRef || jobRef || "-"}

//               </span>

//             </div>

//             <div className="col">

//               {topBanner && (

//                 <span

//                   className="badge"

//                   style={{

//                     fontSize: 14,

//                     padding: "6px 12px",

//                     color: "#fff",

//                     background:

//                       "linear-gradient(135deg, hsl(200,80%,55%), hsl(320,80%,60%))",

//                   }}

//                 >

//                   {topBanner.text}

//                 </span>

//               )}

//             </div>

//             <div className="col-auto d-flex gap-2">

//               <div className="dropdown">

//                 <button

//                   className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${isLocked ? "disabled" : ""

//                     }`}

//                   data-bs-toggle="dropdown"

//                   disabled={isLocked}

//                 >

//                   <FaEdit /> แก้ไขงาน

//                 </button>

//                 <ul className="dropdown-menu">

//                   <li>

//                     <button

//                       className="dropdown-item"

//                       onClick={() => setEditMode("status")}

//                     >

//                       แก้ไขสถานะงาน

//                     </button>

//                   </li>

//                   <li>

//                     <button

//                       className="dropdown-item"

//                       onClick={() => setEditMode("customer")}

//                     >

//                       แก้ไขข้อมูลลูกค้า

//                     </button>

//                   </li>

//                   <li>

//                     <button

//                       className="dropdown-item"

//                       onClick={() => setEditMode("product")}

//                     >

//                       แก้ไขข้อมูลสินค้า

//                     </button>

//                   </li>

//                 </ul>

//               </div>

//               <button

//                 className="btn btn-danger d-flex align-items-center gap-2"

//                 onClick={() => deleteData(jobRef)}

//               >

//                 <FaTrashAlt /> ลบข้อมูล

//               </button>

//             </div>

//           </div>

//         </div>

//       </div>

//       <Row gutter={[16, 16]}>

//         {/* Left Column: Details & Forms */}

//         <Col xs={24} lg={14}>

//           {/* Customer & Product */}

//           <Card

//             bordered={false}

//             bodyStyle={{

//               background: "#FFFFFFFF",

//               borderRadius: 20,

//               padding: 20,

//             }}

//           >

//             <div className="claim-view colorful">

//               <Accordion

//                 defaultActiveKey={["0", "1"]}

//                 alwaysOpen

//                 className="acc-custom"

//               >

//                 {/* === ลูกค้า === */}

//                 <Accordion.Item eventKey="0" className="acc-item acc-customer">

//                   <Accordion.Header>

//                     <IoMdPeople className="me-2 acc-icon" />

//                     ข้อมูลลูกค้า

//                   </Accordion.Header>

//                   <Accordion.Body>

//                     {data?.length > 0 && (

//                       <div className="section-card">

//                         {/* กลุ่ม: ข้อมูลทั่วไป */}

//                         <div className="subsection">

//                           <div className="subsection-title">ข้อมูลทั่วไป</div>

//                           <div className="kv-grid">

//                             <div className="kv">

//                               <span className="label">ชื่อ</span>

//                               <span className="value">

//                                 {data[0].customer_firstname}

//                               </span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">นามสกุล</span>

//                               <span className="value">

//                                 {data[0].customer_lastname}

//                               </span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">อายุ</span>

//                               <span className="value">

//                                 {data[0].customer_old}

//                               </span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">Username</span>

//                               <span className="value">{data[0].username}</span>

//                             </div>

//                           </div>

//                         </div>



//                         {/* กลุ่ม: ช่องทางติดต่อ */}

//                         <div className="subsection">

//                           <div className="subsection-title">ช่องทางติดต่อ</div>

//                           <div className="kv-grid">

//                             <div className="kv">

//                               <span className="label">Line ID</span>

//                               <span className="value">{data[0].line_id}</span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">Email</span>

//                               <span className="value">{data[0].email}</span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">ช่องทางที่รับเรื่อง</span>

//                               <span className="value">

//                                 {data[0].customer_contact}

//                               </span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">เบอร์โทรศัพท์</span>

//                               <span className="value">{data[0].phone}</span>

//                             </div>

//                           </div>

//                         </div>



//                         {/* กลุ่ม: ที่อยู่ */}

//                         <div className="subsection">

//                           <div className="subsection-title">ที่อยู่</div>

//                           <div className="kv-grid">

//                             <div className="kv kv-span-2">

//                               <span className="label">

//                                 ที่อยู่จัดส่ง/ติดต่อ

//                               </span>

//                               <span className="value">{data[0].address}</span>

//                             </div>

//                           </div>

//                         </div>

//                       </div>

//                     )}

//                   </Accordion.Body>

//                 </Accordion.Item>



//                 {/* === สินค้า === */}

//                 <Accordion.Item eventKey="1" className="acc-item acc-product">

//                   <Accordion.Header>

//                     <PiPackageFill className="me-2 acc-icon" />

//                     ข้อมูลสินค้า

//                   </Accordion.Header>

//                   <Accordion.Body>

//                     {data?.length > 0 && (

//                       <div className="section-card">

//                         {/* รายละเอียดหลัก */}

//                         <div className="subsection">

//                           <div className="subsection-title">รายละเอียดหลัก</div>

//                           <div className="kv-grid">

//                             <div className="kv">

//                               <span className="label">ชื่อสินค้า</span>

//                               <span className="value strong">

//                                 {data[0].product_name}

//                               </span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">ประเภทสินค้า</span>

//                               <span className="value chip chip-blue">

//                                 {data[0].category}

//                               </span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">Brand</span>

//                               <span className="value chip chip-indigo">

//                                 {data[0].brand}

//                               </span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">จำนวนสินค้าที่เคลม</span>

//                               <span className="value">{data[0].unit}</span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">หน่วย</span>

//                               <span className="value">{data[0].pcs}</span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">วันที่เปิดซ่อม</span>

//                               <span className="value">

//                                 {data[0].createAt

//                                   ? dayjs(data[0].createAt).format(

//                                     "D MMMM BBBB HH:mm"

//                                   )

//                                   : "-"}

//                               </span>

//                             </div>

//                           </div>

//                         </div>

//                         <div className="subsection">

//                           <div className="subsection-title">

//                             รายละเอียดสินค้า

//                           </div>

//                           <div className="kv-grid">

//                             <div className="kv">

//                               <span className="label">SKU</span>

//                               <span className="value mono">{data[0].sku}</span>

//                             </div>

//                             <div className="kv">

//                               <span className="label">Serial Number</span>

//                               <span className="value mono">

//                                 {data[0].serialNumber}

//                               </span>

//                             </div>

//                             <div className="kv kv-span-2">

//                               <span className="label">รายละเอียด</span>

//                               <span className="value">

//                                 {data[0].description}

//                               </span>

//                             </div>

//                           </div>

//                         </div>



//                         {/* รูปภาพ */}

//                         <div className="media-grid">

//                           <div className="media-card">

//                             <div className="media-title">รูปภาพสินค้า</div>

//                             <div className="media-collapse" ref={productRef}>

//                               <div id="gallery-product">

//                                 <div className="gallery-grid">

//                                   {data[0].image ? (

//                                     <img

//                                       src={data[0].image}

//                                       alt="Product"

//                                       // className="gallery-img"

//                                       className={`gallery-img ${activeKey === "product"

//                                         ? "is-active"

//                                         : ""

//                                         }`}

//                                       onClick={(e) => {

//                                         e.stopPropagation();

//                                         setActiveKey((k) =>

//                                           k === "product" ? null : "product"

//                                         );

//                                       }}

//                                     />

//                                   ) : (

//                                     <p className="empty-text">

//                                       ไม่มีรูปภาพแสดง

//                                     </p>

//                                   )}

//                                 </div>

//                               </div>

//                               {/* </Panel>

//                               </Collapse> */}

//                             </div>

//                           </div>



//                           <div className="media-card">

//                             <div className="media-title">

//                               รูปภาพสินค้าที่เคลม

//                             </div>

//

//                             <div className="media-collapse" ref={claimRef}>

//

//                               <div id="gallery-claim">

//                                 <div className="gallery-grid">

//                                   {

//                                     // เราจะ filter ก่อน map โดยสามารถเขียนต่อกันได้เลย (Method Chaining)

//                                     data[0].images?.filter(u => u.status === "เริ่มงาน").length ? (

//                                       data[0].images

//                                         .filter(u => u.status === "เริ่มงาน") // <-- 1. กรองให้เหลือเฉพาะรูปที่มี status 'เริ่มงาน'

//                                         .map((u, i) => {                     // <-- 2. นำผลลัพธ์ที่กรองแล้วมาแสดงผล

//                                           // ในตอนนี้ u คือ object ที่มี status เป็น 'เริ่มงาน' เท่านั้น

//                                           const key = `claim-${i}`;

//                                           return (

//                                             <img

//                                               key={key}

//                                               src={u.imageUrl}

//                                               alt={`รูปภาพที่ ${i + 1}`}

//                                               className={`gallery-img ${activeKey === key ? "is-active" : ""}`}

//                                               onClick={(e) => {

//                                                 e.stopPropagation();

//                                                 setActiveKey((k) =>

//                                                   k === key ? null : key

//                                                 );

//                                               }}

//                                             />

//                                           );

//                                         })

//                                     ) : (

//                                       <p className="empty-text">

//                                         ไม่มีรูปภาพสถานะ "เริ่มงาน" ที่จะแสดง

//                                       </p>

//                                     )

//                                   }

//                                 </div>

//                               </div>

//                               {/* </Panel>

//                               </Collapse> */}

//                             </div>

//                           </div>

//                         </div>

//                       </div>

//                     )}

//                   </Accordion.Body>

//                 </Accordion.Item>

//               </Accordion>

//             </div>

//           </Card>



//           {/* Remark + Upload */}

//           <Card

//             bordered={false}

//             style={{ borderRadius: 16, marginBottom: 16, marginTop: 16 }}

//           >

//             <Form form={form} layout="vertical" onFinish={onFinish}>

//               <Form.Item

//                 name="Remark"

//                 label="หมายเหตุ (หากมี)"

//                 rules={[{ required: true, message: "กรุณากรอกหมายเหตุ" }]}

//               >

//                 <Input.TextArea rows={4} placeholder="ระบุหมายเหตุ" />

//               </Form.Item>



//               <Form.Item

//                 name="image"

//                 label="รูปภาพสินค้า"

//                 valuePropName="fileList"

//                 getValueFromEvent={normFile}

//                 rules={[{ required: true, message: "กรุณาอัปโหลดรูปภาพ" }]}

//               >

//                 <Dragger {...uploadProps}>

//                   <p className="ant-upload-drag-icon">

//                     <PictureOutlined />

//                   </p>

//                   <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>

//                   <p className="ant-upload-hint">

//                     รองรับการอัปโหลดไฟล์เดียวหรือหลายไฟล์

//                   </p>

//                 </Dragger>

//               </Form.Item>



//               <Space className="d-flex justify-content-center">

//                 <button

//                   className="btn btn-success d-flex align-items-center gap-2"

//                   onClick={() => form.submit()}

//                 >

//                   <SaveOutlined />

//                   บันทึก

//                 </button>

//                 <button

//                   className="btn btn-secondary d-flex align-items-center gap-2"

//                   onClick={() => form.resetFields()}

//                 >

//                   <DeleteOutlined />

//                   ล้างข้อมูล

//                 </button>

//               </Space>

//             </Form>

//           </Card>

//         </Col>



//         {/* Right Column: Timeline + Actions */}

//         <Col xs={24} lg={10}>

//           <Card

//             bordered={false}

//             style={{

//               borderRadius: 16,

//               marginBottom: 16,

//               // background:

//               //   "linear-gradient(180deg, hsla(200,70%,97%,0.7), hsla(320,70%,97%,0.7))",

//             }}

//           >

//             <div style={{ fontSize: 18, fontWeight: 600 }}>สถานะ</div>

//             <Timeline

//               mode="left"

//               items={timelineItems}

//               style={{

//                 marginTop: 8,

//                 padding: "8px 10px",

//                 borderRadius: 12,

//               }}

//             />

//             {/* Status Editor */}

//             {editMode === "status" && !isLocked && (

//               <Space

//                 direction="vertical"

//                 style={{ width: "100%", marginTop: 8 }}

//               >

//                 <Select

//                   placeholder="เลือกสถานะใหม่"

//                   style={{ width: "100%" }}

//                   onChange={handleStatusChange}

//                   options={allMenuItems

//                     .filter((m) => nextOptions.includes(m.key))

//                     .map((m) => ({ label: m.label, value: m.key }))}

//                 />

//                 <Space>

//                   <Button

//                     type="primary"

//                     onClick={handleConfirmStatus}

//                     disabled={Object.keys(changedStatus).length === 0}

//                   >

//                     ยืนยัน

//                   </Button>

//                   <Button onClick={handleCancelEditAll}>ยกเลิก</Button>

//                 </Space>

//               </Space>

//             )}

//             {editMode === "customer" && (

//               <Card

//                 size="small"

//                 bordered

//                 style={{ borderRadius: 12, marginTop: 12 }}

//               >

//                 <div style={{ fontWeight: 600, marginBottom: 8 }}>

//                   แก้ไขข้อมูลลูกค้า

//                 </div>

//                 <Form

//                   form={customerForm}

//                   layout="vertical"

//                   onFinish={handleSaveCustomer}

//                 >

//                   <Row gutter={12}>

//                     <Col span={12}>

//                       <Form.Item

//                         name="customer_firstname"

//                         label="ชื่อ"

//                         rules={[{ required: true }]}

//                       >

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={12}>

//                       <Form.Item

//                         name="customer_lastname"

//                         label="นามสกุล"

//                         rules={[{ required: true }]}

//                       >

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={8}>

//                       <Form.Item name="customer_old" label="อายุ">

//                         <InputNumber

//                           min={1}

//                           max={100}

//                           style={{ width: "100%" }}

//                         />

//                       </Form.Item>

//                     </Col>

//                     <Col span={8}>

//                       <Form.Item

//                         name="phone"

//                         label="เบอร์โทรศัพท์"

//                         rules={[{ required: true }]}

//                       >

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={8}>

//                       <Form.Item name="email" label="Email">

//                         <Input type="email" />

//                       </Form.Item>

//                     </Col>

//                     <Col span={12}>

//                       <Form.Item name="username" label="Username">

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={12}>

//                       <Form.Item name="line_id" label="Line ID">

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={12}>

//                       <Form.Item

//                         name="customer_contact"

//                         label="ช่องทางติดต่อ"

//                         rules={[{ required: true }, { type: "string" }]}

//                       >

//                         <Select placeholder="กรุณาเลือกช่องทางติดต่อ">

//                           <Option value="phone">เบอร์โทรศัพท์</Option>

//                           <Option value="line">Line</Option>

//                           <Option value="address">ที่อยู่ลูกค้า</Option>

//                         </Select>

//                       </Form.Item>

//                     </Col>

//                     <Col span={24}>

//                       <Form.Item name="address" label="ที่อยู่">

//                         <Input.TextArea rows={3} />

//                       </Form.Item>

//                     </Col>

//                   </Row>

//                   <Space>

//                     <Button type="primary" htmlType="submit">

//                       บันทึก

//                     </Button>

//                     <Button onClick={handleCancelEditAll}>ยกเลิก</Button>

//                   </Space>

//                 </Form>

//               </Card>

//             )}

//             {editMode === "product" && (

//               <Card

//                 size="small"

//                 bordered

//                 style={{ borderRadius: 12, marginTop: 12 }}

//               >

//                 <div style={{ fontWeight: 600, marginBottom: 8 }}>

//                   แก้ไขข้อมูลสินค้า

//                 </div>

//                 <Form

//                   form={productForm}

//                   layout="vertical"

//                   onFinish={handleSaveProduct}

//                 >

//                   <Row gutter={12}>

//                     <Col span={12}>

//                       <Form.Item

//                         name="product_name"

//                         label="ชื่อสินค้า"

//                         rules={[{ required: true }]}

//                       >

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={12}>

//                       <Form.Item name="sku" label="SKU">

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={8}>

//                       <Form.Item name="brand" label="Brand">

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={8}>

//                       <Form.Item name="category" label="ประเภทสินค้า">

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={8}>

//                       <Form.Item name="pcs" label="หน่วย">

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={12}>

//                       <Form.Item name="serialNumber" label="Serial Number">

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={12}>

//                       <Form.Item name="unit" label="จำนวนสินค้าที่ซ่อม">

//                         <Input />

//                       </Form.Item>

//                     </Col>

//                     <Col span={24}>

//                       <Form.Item name="description" label="รายละเอียดสินค้า">

//                         <Input.TextArea rows={3} />

//                       </Form.Item>

//                     </Col>

//                   </Row>

//                   <Space>

//                     <Button type="primary" htmlType="submit">

//                       บันทึก

//                     </Button>

//                     <Button onClick={handleCancelEditAll}>ยกเลิก</Button>

//                   </Space>

//                 </Form>

//               </Card>

//             )}

//           </Card>

//         </Col>

//       </Row>

//     </div>

//   );

// }