import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Timeline,
} from "antd";
import axios from "axios";
import Accordion from "react-bootstrap/Accordion";
import { MdOutlineDescription } from "react-icons/md";
import { IoMdPeople } from "react-icons/io";
import { PiPackageFill } from "react-icons/pi";
import {
  CheckCircleTwoTone,
  ClockCircleOutlined,
  ExclamationCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import { IoImage } from "react-icons/io5";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import Carousel from "react-bootstrap/Carousel";
import { FaRegSave } from "react-icons/fa";
import "../";

const { Dragger } = Upload;
const { Option } = Select;

export default function ShowDetail() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const { jobRef } = useParams();

  // none | status | customer | product
  const [editMode, setEditMode] = useState("none");

  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDetailDropdownOpen, setIsDetailDropdownOpen] = useState(false);

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
        const token = localStorage.getItem("token");
        console.log(token);
        console.log(responseData);
        console.log(response.data.images);
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
      .then((res) => {
        message.success("ข้อมูลถูกลบเรียบร้อยแล้ว");
        console.log(res.jobRef);
      })
      .catch((error) => {
        message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        console.error("Error deleting job:", error);
      });
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

  // ลำดับสถานะมาตรฐาน (ห้ามข้าม)
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
  const DONE_ALIASES = new Set(["จัดส่งสำเร็จ", "จบงาน"]); // รองรับทั้ง "จบงาน" และ "จัดส่งสำเร็จ"

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

  // หา "สถานะล่าสุด" จาก updateAt (กรณี API ให้มาหลายแถว)
  const latestItem = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort(
      (a, b) => new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime()
    )[0];
  }, [data]);

  const latestStatus = latestItem?.jobStatus;
  const isCancelled = latestStatus === CANCEL_STATUS;
  const isDone = !!latestStatus && DONE_ALIASES.has(latestStatus);
  const isLocked = isCancelled || isDone; // ล็อกการแก้ไขเมื่อยกเลิกหรือจบงาน

  // ไทม์ไลน์: โชว์ตามลำดับ + ถ้ามียกเลิกให้ "แปะต่อท้าย" สเตตัสล่าสุด
  console.log("🔍 data:", data);

  const timelineItems = useMemo(() => {
    const items = statusOrder.map((status) => {
      const item = data.find((d) => d.jobStatus === status);
      if (item) {
        return {
          color: "blue",
          dot: (
            <CheckCircleTwoTone
              twoToneColor="#1677ff"
              style={{ fontSize: 18 }}
            />
          ),
          label: formatDate(item.updateAt),
          children: (
            <div>
              <p className="tl-title">{item.jobStatus}</p>
              <p className="tl-sub">โดย: {item.updateBy}</p>
            </div>
          ),
          style: { marginBottom: 24 },
        };
      }
      // ยังไม่ถึงขั้นนี้ → โชว์เป็นรอ
      return {
        color: "gray",
        dot: <ClockCircleOutlined style={{ fontSize: 18 }} />,
        label: status,
        children: <span className="tl-placeholder">รออัปเดตสถานะ</span>,
        style: { marginBottom: 24 },
      };
    });

    // ถ้ามี “ยกเลิกการเคลมสินค้า” ให้ต่อท้ายจากสถานะล่าสุด
    const cancelItem = data.find((d) => d.jobStatus === CANCEL_STATUS);
    if (cancelItem) {
      items.push({
        color: "red",
        dot: (
          <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 18 }} />
        ),
        label: formatDate(cancelItem.updateAt),
        children: (
          <div>
            <p className="tl-title" style={{ color: "#cf1322" }}>
              {CANCEL_STATUS}
            </p>
            <p className="tl-sub">
              โดย: {cancelItem.updateBy} {/* {cancelItem.customer_lastname} */}
            </p>
          </div>
        ),
        style: { marginBottom: 28 },
      });
    }

    // ถ้าไม่มีข้อมูลเลย ให้ขึ้น placeholder ทั้งเส้น
    const hasAny =
      data?.some((d) => statusOrder.includes(d.jobStatus)) || cancelItem;
    if (!hasAny) {
      return statusOrder.map((status) => ({
        color: "gray",
        dot: (
          <ExclamationCircleTwoTone
            twoToneColor="#d9d9d9"
            style={{ fontSize: 18 }}
          />
        ),
        label: status,
        children: <span className="tl-placeholder">ยังไม่มีข้อมูลสถานะ</span>,
        style: { marginBottom: 28 },
      }));
    }

    return items;
  }, [data]);

  // คำนวณวันคงเหลือ (ใช้ของเดิม) + เพิ่มข้อความพิเศษตามเงื่อนไข
  const countRemainingTime = (data) => {
    if (!data || data.length === 0) return [];
    const currentDate = new Date();
    return data.map((item) => {
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
    if (isCancelled) {
      return {
        text: "ยกเลิกการเคลมสินค้า",
        style: { color: "#cf1322", fontWeight: 600 },
      };
    }
    if (isDone) {
      return {
        text: "การเคลมสินค้าสำเร็จ",
        style: { color: "#389e0d", fontWeight: 600 },
      };
    }
    // ใช้ข้อความเดิม (วันคงเหลือ) หากยังไม่จบ/ไม่ยกเลิก
    if (warningJob.length > 0) {
      const r = warningJob[0];
      const msg =
        r.remainingTime > 0
          ? `ระยะเวลาที่คงเหลือ ${r.remainingTime} วัน`
          : r.remainingTime === 0
          ? "ไม่เหลือเวลา"
          : `เกินระยะเวลาที่กำหนด ${Math.abs(r.remainingTime)} วัน`;
      return { text: msg, style: {} };
    }
    return null;
  }, [isCancelled, isDone, warningJob]);

  // ----- เลือกสถานะได้เฉพาะ "ขั้นถัดไป" + "ยกเลิก" เท่านั้น -----
  const nextOptions = useMemo(() => {
    // ถ้าล็อก (ยกเลิก/จบงาน) → ไม่มีตัวเลือก
    if (isLocked) return [];

    // ถ้าไม่มีสถานะเลย → ขั้นแรกต้องเป็น "เริ่มงาน" หรือ "ยกเลิก"
    if (!latestStatus) {
      return ["เริ่มงาน", CANCEL_STATUS];
    }

    // ถ้ามีล่าสุดแล้ว และยังไม่ยกเลิก/ไม่จบ → อนุญาต "ขั้นถัดไป" + "ยกเลิก"
    const idx = statusOrder.indexOf(latestStatus);
    const next =
      idx >= 0 && idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;

    const set = new Set();
    if (next) set.add(next);
    set.add(CANCEL_STATUS);
    return Array.from(set);
  }, [latestStatus, isLocked]);

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
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
        console.log("URL ของรูปภาพ:", imageUrl);
      } else if (status === "error") {
        message.error(`${info.file.name} อัปโหลดไม่สำเร็จ.`);
      }
    },
  };

  // แหล่งตัวเลือกสถานะ (ใช้ตอน render dropdown จริง โดยจะ filter ด้วย nextOptions)
  const allMenuItems = [
    ...statusOrder.map((s) => ({ key: s, label: s })),
    { key: CANCEL_STATUS, label: CANCEL_STATUS },
  ];

  // ===== Handlers: Status =====
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
        console.log("Token being sent:", token);
        console.log(newStatus);
        console.log(jobRef);

        if (!nextOptions.includes(newStatus)) {
          message.error("ไม่สามารถข้ามลำดับสถานะได้");
          throw new Error("Invalid status transition");
        }

        return axios.put(
          `http://localhost:3302/update-status/${jobRef}`,
          { jobStatus: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

  return (
    <div className="d-flex flex-row">
      <div className="contain-job">
        {(warningJob.length > 0 || topBanner) && (
          <div className="d-flex align-items-center job-header mb-4 mt-5">
            <h1 className="me-5">{(data[0] && data[0].jobRef) || ""}</h1>
            {topBanner ? (
              <h2 className="me-3" style={topBanner.style}>
                {topBanner.text}
              </h2>
            ) : (
              <h2 className="me-3">{/* fallback is handled in topBanner */}</h2>
            )}
          </div>
        )}

        <Accordion defaultActiveKey={["0", "1"]} alwaysOpen>
          {/* ข้อมูลลูกค้า */}
          <Accordion.Item eventKey="0" className="accordion-item">
            <Accordion.Header className="accordion-header">
              <IoMdPeople className="me-4 accordion-icon" /> ข้อมูลลูกค้า
            </Accordion.Header>
            <Accordion.Body>
              {data && data.length > 0 && (
                <div className="product-details row">
                  <div className="col-6">
                    <p className="mt-4">
                      <strong>ชื่อ</strong>
                    </p>
                    <p>{data[0].customer_firstname}</p>
                    <p className="mt-4">
                      <strong>อายุ</strong>
                    </p>
                    <p>{data[0].customer_old}</p>
                    <p className="mt-4">
                      <strong>Username</strong>
                    </p>
                    <p>{data[0].username}</p>
                    <p className="mt-4">
                      <strong>Line ID</strong>
                    </p>
                    <p>{data[0].line_id}</p>
                    <p className="mt-4">
                      <strong>ที่อยู่</strong>
                    </p>
                    <p>{data[0].address}</p>
                  </div>
                  <div className="col-6">
                    <p className="mt-4">
                      <strong>นามสกุล</strong>
                    </p>
                    <p>{data[0].customer_lastname}</p>
                    <p className="mt-4">
                      <strong>Email</strong>
                    </p>
                    <p>{data[0].email}</p>
                    <p className="mt-4">
                      <strong>ช่องทางติดต่อ</strong>
                    </p>
                    <p>{data[0].customer_contact}</p>
                    <p className="mt-4">
                      <strong>เบอร์โทรศัพท์</strong>
                    </p>
                    <p>{data[0].phone}</p>
                  </div>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>

          {/* ข้อมูลสินค้า */}
          <Accordion.Item eventKey="1" className="accordion-item">
            <Accordion.Header className="accordion-header">
              <PiPackageFill className="me-4 accordion-icon" /> ข้อมูลสินค้า
            </Accordion.Header>
            <Accordion.Body>
              {data && data.length > 0 && (
                <div className="product-details row">
                  <div className="col-6">
                    <p className="mt-4">
                      <strong>Serial Number</strong>
                    </p>
                    <p>{data[0].serialNumber}</p>
                    <p className="mt-4">
                      <strong>Brand</strong>
                    </p>
                    <p>{data[0].brand}</p>
                    <p className="mt-4">
                      <strong>จำนวนสินค้าที่ซ่อม</strong>
                    </p>
                    <p>{data[0].unit}</p>
                    <p className="mt-4">
                      <strong>รายละเอียดสินค้า</strong>
                    </p>
                    <p>{data[0].description}</p>
                    <p className="mt-4">
                      <strong>วันที่เปิดซ่อม</strong>
                    </p>
                    <p>{data[0].createAt}</p>
                  </div>
                  <div className="col-6">
                    <p className="mt-4">
                      <strong>ชื่อสินค้า</strong>
                    </p>
                    <p>{data[0].product_name}</p>
                    <p className="mt-4">
                      <strong>SKU</strong>
                    </p>
                    <p>{data[0].sku}</p>
                    <p className="mt-4">
                      <strong>ประเภทสินค้า</strong>
                    </p>
                    <p>{data[0].category}</p>
                    <p className="mt-4">
                      <strong>หน่วย</strong>
                    </p>
                    <p>{data[0].pcs}</p>
                    <p className="mt-4">
                      <strong>รูปภาพสินค้า</strong>
                    </p>
                    <Button
                      className="d-flex align-items-center justify-content-between btn-show-image margin-top-100"
                      onClick={() => setOpen(!open)}
                      aria-controls="example-collapse-text"
                      aria-expanded={open}
                    >
                      <IoImage className="button-icon justify-content-start" />
                      <span className="button-text">ดูรูปภาพเพิ่มเติม</span>
                    </Button>
                    <div style={{ minHeight: "150px" }}>
                      <Collapse in={open} dimension="width">
                        <div id="example-collapse-text">
                          <Card body style={{ width: "400px" }}>
                            {data.images && data.images.length > 0 ? (
                              <Carousel>
                                {data.images.map((url, index) => (
                                  <Carousel.Item key={index}>
                                    <img
                                      src={url}
                                      alt={`รูปที่ ${index + 1}`}
                                      className="d-block w-100"
                                      style={{
                                        maxHeight: "400px",
                                        objectFit: "contain",
                                      }}
                                    />
                                  </Carousel.Item>
                                ))}
                              </Carousel>
                            ) : (
                              <p>ไม่มีรูปภาพแสดง</p>
                            )}
                          </Card>
                        </div>
                      </Collapse>
                    </div>
                    <img
                      src={data[0].image}
                      alt="Image from server"
                      className="image-show-detail"
                    />
                  </div>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        {/* ... ข้อมูลลูกค้า / ข้อมูลสินค้า / Remark + Upload ... */}

        <div className="d-flex flex-column mt-2">
          <div>
            <Form.Item
              name="Remark"
              label="หมายเหตุ ( หากมี )"
              rules={[{ required: true }, { type: "string" }]}
              className="d-flex mt-5"
            >
              <div className="ms-2">
                <Input.TextArea
                  prefix={<MdOutlineDescription />}
                  className="form-item-custom-size-note"
                />
              </div>
            </Form.Item>
          </div>
          {/* <div>
            <Form>
              <Form.Item
                name="image"
                label="รูปภาพสินค้า"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: "กรุณาอัปโหลดรูปภาพ" }]}
                className="form-item-custom-size-detail"
              >
                <div className="ms-5">
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-text">
                      คลิกหรือลากไฟล์มาวางที่นี่
                    </p>
                    <p className="ant-upload-hint">
                      รองรับการอัปโหลดไฟล์เดียวหรือหลายไฟล์
                    </p>
                  </Dragger>
                </div>
              </Form.Item>
            </Form>
          </div> */}
        </div>
        <div>
          <Button
            className="btn btn-primary btn-save d-flex align-items-center justify-content-between"
            onClick={() => {
              form.submit(); // ⬅️ ให้ onFinish จัดการเปิด modal เอง
            }}
          >
            <FaRegSave className="button-icon justify-content-start" />
            <span className="button-text">บันทึก</span>
          </Button>
        </div>
      </div>

      {/* Right column: Timeline + Actions */}
      <div className="contain-status d-flex flex-column align-items-center">
        <h1 className="text-center mb-3 mt-5">สถานะ</h1>
        <div className="timeline-wrapper">
          <Timeline mode="left" items={timelineItems} />
        </div>

        {/* ====== Action Area ====== */}
        <div className="d-flex justify-content-center gap-3 mt-3 mb-2">
          {/* ปิดแก้ไขทั้งหมดเมื่อถูกล็อก */}
          <div
            className={`dropdown ${isLocked ? "disabled" : ""}`}
            onMouseEnter={() => !isLocked && setIsEditDropdownOpen(true)}
            onMouseLeave={() => {
              setIsEditDropdownOpen(false);
              setIsDetailDropdownOpen(false);
              setIsStatusDropdownOpen(false);
            }}
          >
            <button
              className="btn btn-secondary dropdown-toggle btn-showData-Edit"
              type="button"
              aria-expanded={isEditDropdownOpen}
              disabled={isLocked}
              title={isLocked ? "สถานะถูกล็อก" : ""}
            >
              แก้ไขงาน
            </button>

            {isEditDropdownOpen && (
              <ul className="dropdown-menu show">
                {/* Edit Status */}
                <li
                  className="dropdown-hover-right"
                  onMouseEnter={() => setIsStatusDropdownOpen(true)}
                  onMouseLeave={() => setIsStatusDropdownOpen(false)}
                >
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditMode("status");
                    }}
                  >
                    แก้ไขสถานะงาน
                  </a>
                </li>

                {/* Edit Details (ยังเปิดได้ ถ้าต้องการให้ล็อกทั้งหมด ให้ย้ายไปอยู่ใต้ isLocked เงื่อนไข) */}
                <li
                  className="dropdown-hover-right"
                  onMouseEnter={() => setIsDetailDropdownOpen(true)}
                  onMouseLeave={() => setIsDetailDropdownOpen(false)}
                >
                  <a className="dropdown-item">แก้ไขรายละเอียดงาน</a>
                  {isDetailDropdownOpen && (
                    <ul
                      className="dropdown-menu show"
                      style={{ left: "100%", top: 0 }}
                    >
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditMode("customer");
                          }}
                        >
                          แก้ไขข้อมูลลูกค้า
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditMode("product");
                          }}
                        >
                          แก้ไขข้อมูลสินค้า
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </div>

          <Button
            danger
            className="btn-showData-delete"
            onClick={() => deleteData(jobRef)}
          >
            ลบข้อมูล
          </Button>
        </div>

        {/* ====== Status Editor ====== */}
        {editMode === "status" && !isLocked && (
          <div className="d-flex justify-content-center gap-2 mt-3">
            <div className="w-100">
              <Select
                placeholder="เลือกสถานะใหม่"
                style={{ width: "100%" }}
                onChange={handleStatusChange}
                // ให้เลือกได้เฉพาะขั้นถัดไป + ยกเลิก
                options={allMenuItems
                  .filter((m) => nextOptions.includes(m.key))
                  .map((m) => ({ label: m.label, value: m.key }))}
              />
            </div>
            <Button
              type="primary"
              onClick={handleConfirmStatus}
              disabled={Object.keys(changedStatus).length === 0}
            >
              ยืนยัน
            </Button>
            <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
          </div>
        )}

        {editMode === "customer" && (
          <div className="mt-4 p-3 border rounded-3">
            <h5 className="mb-3">แก้ไขข้อมูลลูกค้า</h5>
            <Form
              form={customerForm}
              layout="vertical"
              onFinish={handleSaveCustomer}
            >
              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="customer_firstname"
                    label="ชื่อ"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="customer_lastname"
                    label="นามสกุล"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="customer_old" label="อายุ">
                    <InputNumber min={1} max={100} />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item
                    name="phone"
                    label="เบอร์โทรศัพท์"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="email" label="Email">
                    <Input type="email" />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item name="username" label="Username">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item name="line_id" label="Line ID">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="customer_contact"
                    label="ช่องทางติดต่อ"
                    rules={[{ required: true }, { type: "string" }]}
                    className="form-item-custom-size mb-4"
                  >
                    <Select placeholder="กรุณาเลือกช่องทางติดต่อ">
                      <Select.Option value="phone">เบอร์โทรศัพท์</Select.Option>
                      <Select.Option value="line">Line</Select.Option>
                      <Select.Option value="address">
                        ที่อยู่ลูกค้า
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-12">
                  <Form.Item name="address" label="ที่อยู่">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button type="primary" htmlType="submit">
                  บันทึก
                </Button>
                <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
              </div>
            </Form>
          </div>
        )}

        {editMode === "product" && (
          <div className="mt-4 p-3 border rounded-3">
            <h5 className="mb-3">แก้ไขข้อมูลสินค้า</h5>
            <Form
              form={productForm}
              layout="vertical"
              onFinish={handleSaveProduct}
            >
              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="product_name"
                    label="ชื่อสินค้า"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item name="sku" label="SKU">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="brand" label="Brand">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="category" label="ประเภทสินค้า">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item name="pcs" label="หน่วย">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item name="serialNumber" label="Serial Number">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item name="unit" label="จำนวนสินค้าที่ซ่อม">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-12">
                  <Form.Item name="description" label="รายละเอียดสินค้า">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button type="primary" htmlType="submit">
                  บันทึก
                </Button>
                <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
              </div>
            </Form>
          </div>
        )}

        <div className="d-grid justify-content-center mt-4">
          <button className="btn-exportData">Export Data</button>
        </div>
      </div>
    </div>
  );
}

// import React, { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   Form,
//   Input,
//   InputNumber,
//   Select,
//   Button,
//   Upload,
//   message,
//   Timeline,
// } from "antd";
// import axios from "axios";
// import Accordion from "react-bootstrap/Accordion";
// import { MdOutlineDescription } from "react-icons/md";
// import { IoMdPeople } from "react-icons/io";
// import { PiPackageFill } from "react-icons/pi";
// import {
//   CheckCircleTwoTone,
//   ClockCircleOutlined,
//   ExclamationCircleTwoTone,
//   CloseCircleTwoTone,
// } from "@ant-design/icons";
// import { IoImage } from "react-icons/io5";
// import Card from "react-bootstrap/Card";
// import Collapse from "react-bootstrap/Collapse";
// import Carousel from "react-bootstrap/Carousel";
// import "../";

// const { Dragger } = Upload;
// const { Option } = Select;

// export default function ShowDetail() {
//   const [data, setData] = useState([]);
//   const [open, setOpen] = useState(false);
//   const { jobRef } = useParams();

//   // none | status | customer | product
//   const [editMode, setEditMode] = useState("none");

//   const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
//   const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
//   const [isDetailDropdownOpen, setIsDetailDropdownOpen] = useState(false);

//   const [changedStatus, setChangedStatus] = useState({});

//   const [customerForm] = Form.useForm();
//   const [productForm] = Form.useForm();

//   // const getData = () => {
//   //   const url = `http://localhost:3302/get-detail/${jobRef}`;
//   //   axios
//   //     .get(url)
//   //     .then((response) => {
//   //       const responseData = Array.isArray(response.data)
//   //         ? response.data
//   //         : [response.data];
//   //       setData(responseData);
//   //       const token = localStorage.getItem("token");
//   //       console.log(token);
//   //       console.log(responseData);
//   //       console.log(response.data.images);
//   //     })
//   //     .catch((error) => {
//   //       console.error("Error fetching data:", error);
//   //       setData([]);
//   //     });
//   // };

//   const getData = () => {
//     const url = `http://localhost:3302/get-detail/${jobRef}`;
//     axios
//       .get(url)
//       .then((response) => {
//         setData(response.data);
//         const token = localStorage.getItem("token");
//         console.log(token);
//         // console.log(response.data);
//         // console.log(response.data.images);
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
//       .then((res) => {
//         message.success("ข้อมูลถูกลบเรียบร้อยแล้ว");
//         console.log(res.jobRef);
//       })
//       .catch((error) => {
//         message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
//         console.error("Error deleting job:", error);
//       });
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

//   // ลำดับสถานะมาตรฐาน (ห้ามข้าม)
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
//   const DONE_ALIASES = new Set(["จัดส่งสำเร็จ", "จบงาน"]); // รองรับทั้ง "จบงาน" และ "จัดส่งสำเร็จ"

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

//   // หา "สถานะล่าสุด" จาก updateAt (กรณี API ให้มาหลายแถว)
//   const latestItem = useMemo(() => {
//     if (!data || data.length === 0) return null;
//     return [...data].sort(
//       (a, b) => new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime()
//     )[0];
//   }, [data]);

//   const latestStatus = latestItem?.jobStatus;
//   const isCancelled = latestStatus === CANCEL_STATUS;
//   const isDone = !!latestStatus && DONE_ALIASES.has(latestStatus);
//   const isLocked = isCancelled || isDone; // ล็อกการแก้ไขเมื่อยกเลิกหรือจบงาน

//   // ไทม์ไลน์: โชว์ตามลำดับ + ถ้ามียกเลิกให้ "แปะต่อท้าย" สเตตัสล่าสุด
//   console.log("🔍 data:", data);

//   const timelineItems = useMemo(() => {
//     const items = statusOrder.map((status) => {
//       const item = data.find((d) => d.jobStatus === status);
//       if (item) {
//         return {
//           color: "blue",
//           dot: (
//             <CheckCircleTwoTone
//               twoToneColor="#1677ff"
//               style={{ fontSize: 18 }}
//             />
//           ),
//           label: formatDate(item.updateAt),
//           children: (
//             <div>
//               <p className="tl-title">{item.jobStatus}</p>
//               <p className="tl-sub">โดย: {item.updateBy}</p>
//             </div>
//           ),
//           style: { marginBottom: 24 },
//         };
//       }
//       // ยังไม่ถึงขั้นนี้ → โชว์เป็นรอ
//       return {
//         color: "gray",
//         dot: <ClockCircleOutlined style={{ fontSize: 18 }} />,
//         label: status,
//         children: <span className="tl-placeholder">รออัปเดตสถานะ</span>,
//         style: { marginBottom: 24 },
//       };
//     });

//     // ถ้ามี “ยกเลิกการเคลมสินค้า” ให้ต่อท้ายจากสถานะล่าสุด
//     const cancelItem = data.find((d) => d.jobStatus === CANCEL_STATUS);
//     if (cancelItem) {
//       items.push({
//         color: "red",
//         dot: (
//           <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 18 }} />
//         ),
//         label: formatDate(cancelItem.updateAt),
//         children: (
//           <div>
//             <p className="tl-title" style={{ color: "#cf1322" }}>
//               {CANCEL_STATUS}
//             </p>
//             <p className="tl-sub">
//               โดย: {cancelItem.updateBy} {/* {cancelItem.customer_lastname} */}
//             </p>
//           </div>
//         ),
//         style: { marginBottom: 28 },
//       });
//     }

//     // ถ้าไม่มีข้อมูลเลย ให้ขึ้น placeholder ทั้งเส้น
//     const hasAny =
//       data?.some((d) => statusOrder.includes(d.jobStatus)) || cancelItem;
//     if (!hasAny) {
//       return statusOrder.map((status) => ({
//         color: "gray",
//         dot: (
//           <ExclamationCircleTwoTone
//             twoToneColor="#d9d9d9"
//             style={{ fontSize: 18 }}
//           />
//         ),
//         label: status,
//         children: <span className="tl-placeholder">ยังไม่มีข้อมูลสถานะ</span>,
//         style: { marginBottom: 28 },
//       }));
//     }

//     return items;
//   }, [data]);

//   // คำนวณวันคงเหลือ (ใช้ของเดิม) + เพิ่มข้อความพิเศษตามเงื่อนไข
//   const countRemainingTime = (data) => {
//     if (!data || data.length === 0) return [];
//     const currentDate = new Date();
//     return data.map((item) => {
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
//     if (isCancelled) {
//       return {
//         text: "ยกเลิกการเคลมสินค้า",
//         style: { color: "#cf1322", fontWeight: 600 },
//       };
//     }
//     if (isDone) {
//       return {
//         text: "การเคลมสินค้าสำเร็จ",
//         style: { color: "#389e0d", fontWeight: 600 },
//       };
//     }
//     // ใช้ข้อความเดิม (วันคงเหลือ) หากยังไม่จบ/ไม่ยกเลิก
//     if (warningJob.length > 0) {
//       const r = warningJob[0];
//       const msg =
//         r.remainingTime > 0
//           ? `ระยะเวลาที่คงเหลือ ${r.remainingTime} วัน`
//           : r.remainingTime === 0
//           ? "ไม่เหลือเวลา"
//           : `เกินระยะเวลาที่กำหนด ${Math.abs(r.remainingTime)} วัน`;
//       return { text: msg, style: {} };
//     }
//     return null;
//   }, [isCancelled, isDone, warningJob]);

//   // ----- เลือกสถานะได้เฉพาะ "ขั้นถัดไป" + "ยกเลิก" เท่านั้น -----
//   const nextOptions = useMemo(() => {
//     // ถ้าล็อก (ยกเลิก/จบงาน) → ไม่มีตัวเลือก
//     if (isLocked) return [];

//     // ถ้าไม่มีสถานะเลย → ขั้นแรกต้องเป็น "เริ่มงาน" หรือ "ยกเลิก"
//     if (!latestStatus) {
//       return ["เริ่มงาน", CANCEL_STATUS];
//     }

//     // ถ้ามีล่าสุดแล้ว และยังไม่ยกเลิก/ไม่จบ → อนุญาต "ขั้นถัดไป" + "ยกเลิก"
//     const idx = statusOrder.indexOf(latestStatus);
//     const next =
//       idx >= 0 && idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;

//     const set = new Set();
//     if (next) set.add(next);
//     set.add(CANCEL_STATUS);
//     return Array.from(set);
//   }, [latestStatus, isLocked]);

//   const normFile = (e) => {
//     if (Array.isArray(e)) return e;
//     return e?.fileList;
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
//         console.log("URL ของรูปภาพ:", imageUrl);
//       } else if (status === "error") {
//         message.error(`${info.file.name} อัปโหลดไม่สำเร็จ.`);
//       }
//     },
//   };

//   // แหล่งตัวเลือกสถานะ (ใช้ตอน render dropdown จริง โดยจะ filter ด้วย nextOptions)
//   const allMenuItems = [
//     ...statusOrder.map((s) => ({ key: s, label: s })),
//     { key: CANCEL_STATUS, label: CANCEL_STATUS },
//   ];

//   // ===== Handlers: Status =====
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
//         console.log("Token being sent:", token);
//         console.log(newStatus);
//         console.log(jobRef);

//         if (!nextOptions.includes(newStatus)) {
//           message.error("ไม่สามารถข้ามลำดับสถานะได้");
//           throw new Error("Invalid status transition");
//         }

//         return axios.put(
//           `http://localhost:3302/update-status/${jobRef}`,
//           { jobStatus: newStatus },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
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

//   return (
//     <div className="d-flex flex-row">
//       <div className="contain-job">
//         {(warningJob.length > 0 || topBanner) && (
//           <div className="d-flex align-items-center job-header mb-4 mt-5">
//             <h1 className="me-5">{(data[0] && data[0].jobRef) || ""}</h1>
//             {topBanner ? (
//               <h2 className="me-3" style={topBanner.style}>
//                 {topBanner.text}
//               </h2>
//             ) : (
//               <h2 className="me-3">{/* fallback is handled in topBanner */}</h2>
//             )}
//           </div>
//         )}

//         <Accordion defaultActiveKey={["0", "1"]} alwaysOpen>
//           {/* ข้อมูลลูกค้า */}
//           <Accordion.Item eventKey="0" className="accordion-item">
//             <Accordion.Header className="accordion-header">
//               <IoMdPeople className="me-4 accordion-icon" /> ข้อมูลลูกค้า
//             </Accordion.Header>
//             <Accordion.Body>
//               {data && data.length > 0 && (
//                 <div className="product-details row">
//                   <div className="col-6">
//                     <p className="mt-4">
//                       <strong>ชื่อ</strong>
//                     </p>
//                     <p>{data[0].customer_firstname}</p>
//                     <p className="mt-4">
//                       <strong>อายุ</strong>
//                     </p>
//                     <p>{data[0].customer_old}</p>
//                     <p className="mt-4">
//                       <strong>Username</strong>
//                     </p>
//                     <p>{data[0].username}</p>
//                     <p className="mt-4">
//                       <strong>Line ID</strong>
//                     </p>
//                     <p>{data[0].line_id}</p>
//                     <p className="mt-4">
//                       <strong>ที่อยู่</strong>
//                     </p>
//                     <p>{data[0].address}</p>
//                   </div>
//                   <div className="col-6">
//                     <p className="mt-4">
//                       <strong>นามสกุล</strong>
//                     </p>
//                     <p>{data[0].customer_lastname}</p>
//                     <p className="mt-4">
//                       <strong>Email</strong>
//                     </p>
//                     <p>{data[0].email}</p>
//                     <p className="mt-4">
//                       <strong>ช่องทางติดต่อ</strong>
//                     </p>
//                     <p>{data[0].customer_contact}</p>
//                     <p className="mt-4">
//                       <strong>เบอร์โทรศัพท์</strong>
//                     </p>
//                     <p>{data[0].phone}</p>
//                   </div>
//                 </div>
//               )}
//             </Accordion.Body>
//           </Accordion.Item>

//           {/* ข้อมูลสินค้า */}
//           <Accordion.Item eventKey="1" className="accordion-item">
//             <Accordion.Header className="accordion-header">
//               <PiPackageFill className="me-4 accordion-icon" /> ข้อมูลสินค้า
//             </Accordion.Header>
//             <Accordion.Body>
//               {data && data.length > 0 && (
//                 <div className="product-details row">
//                   <div className="col-6">
//                     <p className="mt-4">
//                       <strong>Serial Number</strong>
//                     </p>
//                     <p>{data[0].serialNumber}</p>
//                     <p className="mt-4">
//                       <strong>Brand</strong>
//                     </p>
//                     <p>{data[0].brand}</p>
//                     <p className="mt-4">
//                       <strong>จำนวนสินค้าที่ซ่อม</strong>
//                     </p>
//                     <p>{data[0].unit}</p>
//                     <p className="mt-4">
//                       <strong>รายละเอียดสินค้า</strong>
//                     </p>
//                     <p>{data[0].description}</p>
//                     <p className="mt-4">
//                       <strong>วันที่เปิดซ่อม</strong>
//                     </p>
//                     <p>{data[0].createAt}</p>
//                   </div>
//                   <div className="col-6">
//                     <p className="mt-4">
//                       <strong>ชื่อสินค้า</strong>
//                     </p>
//                     <p>{data[0].product_name}</p>
//                     <p className="mt-4">
//                       <strong>SKU</strong>
//                     </p>
//                     <p>{data[0].sku}</p>
//                     <p className="mt-4">
//                       <strong>ประเภทสินค้า</strong>
//                     </p>
//                     <p>{data[0].category}</p>
//                     <p className="mt-4">
//                       <strong>หน่วย</strong>
//                     </p>
//                     <p>{data[0].pcs}</p>
//                     <p className="mt-4">
//                       <strong>รูปภาพสินค้า</strong>
//                     </p>
//                     <Button
//                       className="d-flex align-items-center justify-content-between btn-show-image margin-top-100"
//                       onClick={() => setOpen(!open)}
//                       aria-controls="example-collapse-text"
//                       aria-expanded={open}
//                     >
//                       <IoImage className="button-icon justify-content-start" />
//                       <span className="button-text">ดูรูปภาพเพิ่มเติม</span>
//                     </Button>
//                     <div style={{ minHeight: "150px" }}>
//                       <Collapse in={open} dimension="width">
//                         <div id="example-collapse-text">
//                           <Card body style={{ width: "400px" }}>
//                             {data[0].images && data[0].images.length > 0 ? (
//                               <Carousel>
//                                 {data[0].images.map((url, index) => (
//                                   <Carousel.Item key={index}>
//                                     <img
//                                       src={url}
//                                       alt={`รูปที่ ${index + 1}`}
//                                     />
//                                   </Carousel.Item>
//                                 ))}
//                               </Carousel>
//                             ) : (
//                               <p>ไม่มีรูปภาพแสดง</p>
//                             )}
//                           </Card>
//                         </div>
//                       </Collapse>
//                     </div>
//                     <img
//                       src={data.images}
//                       alt="Image from server"
//                       className="image-show-detail"
//                     />
//                   </div>
//                 </div>
//               )}
//             </Accordion.Body>
//           </Accordion.Item>
//         </Accordion>
//         {/* ... ข้อมูลลูกค้า / ข้อมูลสินค้า / Remark + Upload ... */}

//         {/* <div className="d-flex flex-column mt-5">
//           <div>
//             <Form.Item
//               name="Remark"
//               label="หมายเหตุ ( หากมี )"
//               rules={[{ required: true }, { type: "string" }]}
//               className="d-flex mt-5"
//             >
//               <div className="ms-2">
//                 <Input.TextArea
//                   prefix={<MdOutlineDescription />}
//                   className="form-item-custom-size-note"
//                 />
//               </div>
//             </Form.Item>
//           </div>
//           <div>
//             <Form>
//               <Form.Item
//                 name="image"
//                 label="รูปภาพสินค้า"
//                 valuePropName="fileList"
//                 getValueFromEvent={normFile}
//                 rules={[{ required: true, message: "กรุณาอัปโหลดรูปภาพ" }]}
//                 className="form-item-custom-size-detail"
//               >
//                 <div className="ms-5">
//                   <Dragger {...uploadProps}>
//                     <p className="ant-upload-text">
//                       คลิกหรือลากไฟล์มาวางที่นี่
//                     </p>
//                     <p className="ant-upload-hint">
//                       รองรับการอัปโหลดไฟล์เดียวหรือหลายไฟล์
//                     </p>
//                   </Dragger>
//                 </div>
//               </Form.Item>
//             </Form>
//           </div>
//         </div> */}
//       </div>

//       {/* Right column: Timeline + Actions */}
//       <div className="contain-status d-flex flex-column align-items-center">
//         <h1 className="text-center mb-3 mt-5">สถานะ</h1>
//         <div className="timeline-wrapper">
//           <Timeline mode="left" items={timelineItems} />
//         </div>

//         {/* ====== Action Area ====== */}
//         <div className="d-flex justify-content-center gap-3 mt-3 mb-2">
//           {/* ปิดแก้ไขทั้งหมดเมื่อถูกล็อก */}
//           <div
//             className={`dropdown ${isLocked ? "disabled" : ""}`}
//             onMouseEnter={() => !isLocked && setIsEditDropdownOpen(true)}
//             onMouseLeave={() => {
//               setIsEditDropdownOpen(false);
//               setIsDetailDropdownOpen(false);
//               setIsStatusDropdownOpen(false);
//             }}
//           >
//             <button
//               className="btn btn-secondary dropdown-toggle btn-showData-Edit"
//               type="button"
//               aria-expanded={isEditDropdownOpen}
//               disabled={isLocked}
//               title={isLocked ? "สถานะถูกล็อก" : ""}
//             >
//               แก้ไขงาน
//             </button>

//             {isEditDropdownOpen && (
//               <ul className="dropdown-menu show">
//                 {/* Edit Status */}
//                 <li
//                   className="dropdown-hover-right"
//                   onMouseEnter={() => setIsStatusDropdownOpen(true)}
//                   onMouseLeave={() => setIsStatusDropdownOpen(false)}
//                 >
//                   <a
//                     className="dropdown-item"
//                     href="#"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       setEditMode("status");
//                     }}
//                   >
//                     แก้ไขสถานะงาน
//                   </a>
//                 </li>

//                 {/* Edit Details (ยังเปิดได้ ถ้าต้องการให้ล็อกทั้งหมด ให้ย้ายไปอยู่ใต้ isLocked เงื่อนไข) */}
//                 <li
//                   className="dropdown-hover-right"
//                   onMouseEnter={() => setIsDetailDropdownOpen(true)}
//                   onMouseLeave={() => setIsDetailDropdownOpen(false)}
//                 >
//                   <a className="dropdown-item">แก้ไขรายละเอียดงาน</a>
//                   {isDetailDropdownOpen && (
//                     <ul
//                       className="dropdown-menu show"
//                       style={{ left: "100%", top: 0 }}
//                     >
//                       <li>
//                         <a
//                           className="dropdown-item"
//                           href="#"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setEditMode("customer");
//                           }}
//                         >
//                           แก้ไขข้อมูลลูกค้า
//                         </a>
//                       </li>
//                       <li>
//                         <a
//                           className="dropdown-item"
//                           href="#"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setEditMode("product");
//                           }}
//                         >
//                           แก้ไขข้อมูลสินค้า
//                         </a>
//                       </li>
//                     </ul>
//                   )}
//                 </li>
//               </ul>
//             )}
//           </div>

//           <Button
//             danger
//             className="btn-showData-delete"
//             onClick={() => deleteData(jobRef)}
//           >
//             ลบข้อมูล
//           </Button>
//         </div>

//         {/* ====== Status Editor ====== */}
//         {editMode === "status" && !isLocked && (
//           <div className="d-flex justify-content-center gap-2 mt-3">
//             <div className="w-100">
//               <Select
//                 placeholder="เลือกสถานะใหม่"
//                 style={{ width: "100%" }}
//                 onChange={handleStatusChange}
//                 // ให้เลือกได้เฉพาะขั้นถัดไป + ยกเลิก
//                 options={allMenuItems
//                   .filter((m) => nextOptions.includes(m.key))
//                   .map((m) => ({ label: m.label, value: m.key }))}
//               />
//             </div>
//             <Button
//               type="primary"
//               onClick={handleConfirmStatus}
//               disabled={Object.keys(changedStatus).length === 0}
//             >
//               ยืนยัน
//             </Button>
//             <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
//           </div>
//         )}

//         {editMode === "customer" && (
//           <div className="mt-4 p-3 border rounded-3">
//             <h5 className="mb-3">แก้ไขข้อมูลลูกค้า</h5>
//             <Form
//               form={customerForm}
//               layout="vertical"
//               onFinish={handleSaveCustomer}
//             >
//               <div className="row">
//                 <div className="col-md-6">
//                   <Form.Item
//                     name="customer_firstname"
//                     label="ชื่อ"
//                     rules={[{ required: true }]}
//                   >
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Item
//                     name="customer_lastname"
//                     label="นามสกุล"
//                     rules={[{ required: true }]}
//                   >
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-4">
//                   <Form.Item name="customer_old" label="อายุ">
//                     <InputNumber min={1} max={100} />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-4">
//                   <Form.Item
//                     name="phone"
//                     label="เบอร์โทรศัพท์"
//                     rules={[{ required: true }]}
//                   >
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-4">
//                   <Form.Item name="email" label="Email">
//                     <Input type="email" />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Item name="username" label="Username">
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Item name="line_id" label="Line ID">
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Item
//                     name="customer_contact"
//                     label="ช่องทางติดต่อ"
//                     rules={[{ required: true }, { type: "string" }]}
//                     className="form-item-custom-size mb-4"
//                   >
//                     <Select placeholder="กรุณาเลือกช่องทางติดต่อ">
//                       <Select.Option value="phone">เบอร์โทรศัพท์</Select.Option>
//                       <Select.Option value="line">Line</Select.Option>
//                       <Select.Option value="address">
//                         ที่อยู่ลูกค้า
//                       </Select.Option>
//                     </Select>
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-12">
//                   <Form.Item name="address" label="ที่อยู่">
//                     <Input.TextArea rows={3} />
//                   </Form.Item>
//                 </div>
//               </div>
//               <div className="d-flex gap-2">
//                 <Button type="primary" htmlType="submit">
//                   บันทึก
//                 </Button>
//                 <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
//               </div>
//             </Form>
//           </div>
//         )}

//         {editMode === "product" && (
//           <div className="mt-4 p-3 border rounded-3">
//             <h5 className="mb-3">แก้ไขข้อมูลสินค้า</h5>
//             <Form
//               form={productForm}
//               layout="vertical"
//               onFinish={handleSaveProduct}
//             >
//               <div className="row">
//                 <div className="col-md-6">
//                   <Form.Item
//                     name="product_name"
//                     label="ชื่อสินค้า"
//                     rules={[{ required: true }]}
//                   >
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Item name="sku" label="SKU">
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-4">
//                   <Form.Item name="brand" label="Brand">
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-4">
//                   <Form.Item name="category" label="ประเภทสินค้า">
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-4">
//                   <Form.Item name="pcs" label="หน่วย">
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Item name="serialNumber" label="Serial Number">
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Item name="unit" label="จำนวนสินค้าที่ซ่อม">
//                     <Input />
//                   </Form.Item>
//                 </div>
//                 <div className="col-md-12">
//                   <Form.Item name="description" label="รายละเอียดสินค้า">
//                     <Input.TextArea rows={3} />
//                   </Form.Item>
//                 </div>
//               </div>
//               <div className="d-flex gap-2">
//                 <Button type="primary" htmlType="submit">
//                   บันทึก
//                 </Button>
//                 <Button onClick={handleCancelEditAll}>ยกเลิก</Button>
//               </div>
//             </Form>
//           </div>
//         )}

//         <div className="d-grid justify-content-center mt-4">
//           <button className="btn-exportData">Export Data</button>
//         </div>
//       </div>
//     </div>
//   );
// }
