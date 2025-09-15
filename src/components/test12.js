import React, { useEffect, useMemo, useState } from "react";
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
} from "react-icons/fa";
import { MdBorderColor } from "react-icons/md";
import { TbBasketCancel } from "react-icons/tb";

const { Dragger } = Upload;
const { Option } = Select;
const { Panel } = Collapse;

export default function ShowDetail() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false); // product images
  const [openClaim, setopenClaim] = useState(false); // claim images
  const { jobRef } = useParams();
  const [uploadedUrls, setUploadedUrls] = useState([]);
  // none | status | customer | product
  const [editMode, setEditMode] = useState("none");

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

  // ✅ ส่ง remark + รูปภาพ + สถานะล่าสุด
  const updateRemark = async (jobRef, jobData) => {
    const url = `http://localhost:3302/update-remark/${jobRef}`;
    try {
      await axios.put(url, jobData);
      message.success("เพิ่มหมายเหตุและรูปภาพเพิ่มเติมสำเร็จ!");
      form.resetFields();
      getData();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกงาน!");
      console.error("Error updating job:", error);
    }
  };

  const onFinish = (values) => {
    const jobRefVal = data[0]?.jobRef;
    if (!jobRefVal) {
      message.warning("ไม่พบ jobRef ที่จะอัปเดต");
      return;
    }
    const jobData = {
      remark: values.Remark,
      images: uploadedUrls || [],
      jobStatus: latestStatus || "",
    };
    updateRemark(jobRefVal, jobData);
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
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 600, color: soft.text }}>
                {record.jobStatus}
              </div>
              <div style={{ color: "#666" }}>
                โดย:{" "}
                {record.jobStatus === "เริ่มงาน"
                  ? record.serviceRef
                  : record.updateBy}
              </div>
            </div>
          ),
          style: { marginBottom: 18 },
        };
      }

      // Pending step (no update yet)
      return {
        color: "#d9d9d9",
        dot: <ClockCircleOutlined style={{ fontSize: 22, color: "#bfbfbf" }} />,
        label: status,
        children: <span style={{ color: "#bfbfbf" }}>รออัปเดตสถานะ</span>,
        style: { marginBottom: 18 },
      };
    });

    // Handle cancellation status as a separate terminal item if exists
    const cancelItem = data.find((d) => d.jobStatus === CANCEL_STATUS);
    if (cancelItem) {
      items.push({
        color: "#ff4d4f",
        dot: (
          <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 22 }} />
        ),
        label: formatDate(cancelItem.updateAt),
        children: (
          <div>
            <div style={{ fontWeight: 600, color: "#cf1322" }}>
              {CANCEL_STATUS}
            </div>
            <div style={{ color: "#888" }}>โดย: {cancelItem.updateBy}</div>
          </div>
        ),
        style: { marginBottom: 22 },
      });
    }

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
      const jobRefVal = data[0].jobRef;
      setChangedStatus({ [jobRefVal]: newStatus });
    }
  };

  const handleConfirmStatus = async () => {
    try {
      const updatePromises = Object.keys(changedStatus).map((jobRefVal) => {
        const newStatus = changedStatus[jobRefVal];
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!nextOptions.includes(newStatus)) {
          message.error("ไม่สามารถข้ามลำดับสถานะได้");
          throw new Error("Invalid status transition");
        }
        return axios.put(
          `http://localhost:3302/update-status/${jobRefVal}`,
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

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
      >
        <Row align="middle" gutter={[16, 16]}>
          <Col flex="none">
            <Tag color="geekblue" style={{ fontSize: 16, padding: "6px 12px" }}>
              {data[0]?.jobRef || jobRef || "-"}
            </Tag>
          </Col>
          <Col flex="auto">
            {topBanner && (
              <Tag
                style={{
                  fontSize: 14,
                  padding: "4px 10px",
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, hsl(200,80%,55%), hsl(320,80%,60%))",
                  border: 0,
                }}
              >
                {topBanner.text}
              </Tag>
            )}
          </Col>
          <Col flex="none">
            <Space>
              <Dropdown menu={editMenu} trigger={["click"]} disabled={isLocked}>
                <Button icon={<EditOutlined />} disabled={isLocked}>
                  แก้ไขงาน <DownOutlined />
                </Button>
              </Dropdown>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteData(jobRef)}
              >
                ลบข้อมูล
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Left Column: Details & Forms */}
        <Col xs={24} lg={14}>
          {/* Customer & Product */}
          <Card
            bordered={false}
            style={{
              borderRadius: 18,
              marginBottom: 16,
              padding: 2,
              background:
                "linear-gradient(135deg, hsla(200,70%,90%,1), hsla(320,70%,92%,1))",
            }}
            bodyStyle={{ background: "#fff", borderRadius: 16, padding: 16 }}
          >
            <Collapse
              bordered={false}
              defaultActiveKey={["customer", "product"]}
            >
              <Panel header="ข้อมูลลูกค้า" key="customer">
                {data && data.length > 0 && (
                  <Descriptions column={2} colon={false} size="small">
                    <Descriptions.Item label={<b>ชื่อ</b>}>
                      {data[0].customer_firstname}
                    </Descriptions.Item>
                    <Descriptions.Item label={<b>นามสกุล</b>}>
                      {data[0].customer_lastname}
                    </Descriptions.Item>
                    <Descriptions.Item label={<b>อายุ</b>}>
                      {data[0].customer_old}
                    </Descriptions.Item>
                    <Descriptions.Item label={<b>Username</b>}>
                      {data[0].username}
                    </Descriptions.Item>
                    <Descriptions.Item label={<b>Line ID</b>}>
                      {data[0].line_id}
                    </Descriptions.Item>
                    <Descriptions.Item label={<b>Email</b>}>
                      {data[0].email}
                    </Descriptions.Item>
                    <Descriptions.Item label={<b>ช่องทางติดต่อ</b>}>
                      {data[0].customer_contact}
                    </Descriptions.Item>
                    <Descriptions.Item label={<b>เบอร์โทรศัพท์</b>}>
                      {data[0].phone}
                    </Descriptions.Item>
                    <Descriptions.Item label={<b>ที่อยู่</b>} span={2}>
                      {data[0].address}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Panel>

              <Panel header="ข้อมูลสินค้า" key="product">
                {data && data.length > 0 && (
                  <>
                    <Descriptions column={2} colon={false} size="small">
                      <Descriptions.Item label={<b>Serial Number</b>}>
                        {data[0].serialNumber}
                      </Descriptions.Item>
                      <Descriptions.Item label={<b>ชื่อสินค้า</b>}>
                        {data[0].product_name}
                      </Descriptions.Item>
                      <Descriptions.Item label={<b>Brand</b>}>
                        {data[0].brand}
                      </Descriptions.Item>
                      <Descriptions.Item label={<b>SKU</b>}>
                        {data[0].sku}
                      </Descriptions.Item>
                      <Descriptions.Item label={<b>ประเภทสินค้า</b>}>
                        {data[0].category}
                      </Descriptions.Item>
                      <Descriptions.Item label={<b>หน่วย</b>}>
                        {data[0].pcs}
                      </Descriptions.Item>
                      <Descriptions.Item label={<b>จำนวนสินค้าที่ซ่อม</b>}>
                        {data[0].unit}
                      </Descriptions.Item>
                      <Descriptions.Item label={<b>วันที่เปิดซ่อม</b>}>
                        {data[0].createAt}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<b>รายละเอียดสินค้า</b>}
                        span={2}
                      >
                        {data[0].description}
                      </Descriptions.Item>
                    </Descriptions>

                    {/* Product Images */}
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%", marginTop: 8 }}
                    >
                      <Button
                        icon={<PictureOutlined />}
                        onClick={() => setOpen((v) => !v)}
                        type="default"
                        size="small"
                      >
                        ดูรูปภาพสินค้า
                      </Button>
                      {open && (
                        <Card
                          size="small"
                          bordered
                          style={{ borderRadius: 12 }}
                        >
                          {data[0].image ? (
                            <Image.PreviewGroup>
                              <Image
                                src={data[0].image}
                                alt="Product"
                                style={{ maxWidth: 360, borderRadius: 8 }}
                              />
                            </Image.PreviewGroup>
                          ) : (
                            <div style={{ color: "#999" }}>ไม่มีรูปภาพแสดง</div>
                          )}
                        </Card>
                      )}

                      {/* Claim Images */}
                      <Button
                        icon={<PictureOutlined />}
                        onClick={() => setopenClaim((v) => !v)}
                        type="default"
                        size="small"
                      >
                        ดูรูปภาพสินค้าที่เคลม
                      </Button>
                      {openClaim && (
                        <Card
                          size="small"
                          bordered
                          style={{ borderRadius: 12 }}
                        >
                          {data[0].images && data[0].images.length > 0 ? (
                            <Image.PreviewGroup>
                              <Row gutter={[8, 8]}>
                                {data[0].images.map((url, idx) => (
                                  <Col key={`img-${idx}`} span={12}>
                                    <Image
                                      src={url}
                                      alt={`Claim ${idx + 1}`}
                                      style={{
                                        width: "100%",
                                        height: 180,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                      }}
                                    />
                                  </Col>
                                ))}
                              </Row>
                            </Image.PreviewGroup>
                          ) : (
                            <div style={{ color: "#999" }}>ไม่มีรูปภาพแสดง</div>
                          )}
                        </Card>
                      )}
                    </Space>
                  </>
                )}
              </Panel>
            </Collapse>
          </Card>

          {/* Remark + Upload */}
          <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="Remark"
                label="หมายเหตุ (หากมี)"
                rules={[{ required: true, message: "กรุณากรอกหมายเหตุ" }]}
              >
                <Input.TextArea rows={4} placeholder="พิมพ์หมายเหตุที่นี่..." />
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

              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => form.submit()}
                >
                  บันทึก
                </Button>
                <Button onClick={() => form.resetFields()}>ล้างข้อมูล</Button>
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
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              สถานะ
            </div>
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

            <div style={{ marginTop: 12, textAlign: "center", gap: 4 }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
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
                Export Data
              </Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
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
                ลบข้อมูล
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
