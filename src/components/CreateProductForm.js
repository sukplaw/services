import React, { useState, useEffect } from "react";
import { Form, Input, Select, message, Upload } from "antd";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineWorkOutline, MdOutlineDescription } from "react-icons/md";
import { FaRegSave, FaRegPlusSquare } from "react-icons/fa";
import { IoMdCheckmarkCircle } from "react-icons/io";

const { Dragger } = Upload;

export default function CreateProductForm() {
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm(); // Separate form instance for the category modal
  const [categories, setCategories] = useState([]);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  // New states for category add result modal
  const [categoryResultModalVisible, setCategoryResultModalVisible] = useState(false);
  const [categoryResultMessage, setCategoryResultMessage] = useState("");
  const [isCategorySuccess, setIsCategorySuccess] = useState(false);

  const navigate = useNavigate();

  // Fetches categories from the server
  const getCategories = () => {
    const url = "http://localhost:3302/get-category";

    axios
      .get(url)
      .then((res) => {
        setCategories(res.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        message.error("ไม่สามารถโหลดข้อมูลประเภทสินค้าได้");
      });
  };

  useEffect(() => {
    getCategories();
  }, []);

  // Handles creating a new category
  const onPostCategory = (values) => {
    const url = "http://localhost:3302/create-category";
    axios
      .post(url, values)
      .then(() => {
        setIsCategorySuccess(true);
        setCategoryResultMessage("เพิ่มประเภทสินค้าสำเร็จ");
        setCategoryResultModalVisible(true);
        categoryForm.resetFields();
        setOpenCategoryModal(false);
        getCategories(); // Refresh the category list
      })
      .catch((error) => {
        console.error("Error creating category:", error);
        setIsCategorySuccess(false);
        setCategoryResultMessage("เพิ่มประเภทสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        setCategoryResultModalVisible(true);
      });
  };

  // Handles the main product form submission
  const onFinish = (values) => {
    const fileList = values.image;

    if (fileList && fileList.length > 0 && fileList[0].status === "done") {
      const imageUrl = fileList[0].response.url;
      const productData = { ...values, image: imageUrl };

      fetch("http://localhost:3302/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then(() => {
          message.success("บันทึกข้อมูลสินค้าสำเร็จ!");
          form.resetFields();
          setOpenSuccess(true); // Show success modal
        })
        .catch((err) => {
          message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า");
          console.error("Error saving product:", err);
        });
    } else {
      message.error("กรุณาอัปโหลดรูปภาพให้เรียบร้อยก่อนบันทึก");
    }
  };

  // Props for the Ant Design Upload component
  const uploadProps = {
    name: "imageFile",
    multiple: false,
    action: "http://localhost:3303/upload",
    listType: "picture",
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} อัปโหลดสำเร็จ`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} อัปโหลดไม่สำเร็จ`);
      }
    },
  };

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);
  const handleNavigate = (path) => navigate(path);

  return (
    <div>
      <div className="container-fluid min-vh-100 py-4">
        {/* Header */}
        <div className="container mb-3">
          <div className="text-white rounded-3 shadow-sm p-3 p-md-4 header-gradient-card">
            <h2 className="m-0 fw-bold">เพิ่มข้อมูลสินค้า</h2>
          </div>
        </div>

        {/* Form Card */}
        <div className="container">
          <div className="card rounded-4 shadow-sm border">
            <div className="small bg-warning-subtle border rounded p-2 mb-3">
              * กรุณากรอกข้อมูลตามจริงเพื่อความถูกต้องของงานบริการ
            </div>
            <div className="card-body p-3 p-md-4">
              <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish}>
                <div className="row g-3 g-md-4">
                  {/* Left Column: Product Details */}
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-dark mb-3 border-start border-4 border-warning ps-2 mb-5">
                      ข้อมูลสินค้า
                    </h6>
                    <Form.Item name="productRef" label="รหัสสินค้า" rules={[{ required: true }]}>
                      <Input prefix={<MdOutlineWorkOutline />} />
                    </Form.Item>
                    <Form.Item name="product_name" label="ชื่อสินค้า" rules={[{ required: true }]}>
                      <Input prefix={<MdOutlineWorkOutline />} />
                    </Form.Item>
                    <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                      <Input prefix={<MdOutlineWorkOutline />} />
                    </Form.Item>
                    <Form.Item name="pcs" label="หน่วย" rules={[{ required: true }]}>
                      <Select placeholder="กรุณาเลือกหน่วยของสินค้า">
                        {categories
                          .filter((item) => item.pcs)
                          .map((c) => (
                            <Select.Option key={c.id} value={c.pcs}>
                              {c.pcs}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="description"
                      label="รายละเอียดสินค้า"
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea
                        prefix={<MdOutlineDescription />}
                        autoSize={{ minRows: 4, maxRows: 6 }}
                      />
                    </Form.Item>
                  </div>

                  {/* Right Column: Category, Brand & Image */}
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-dark mb-5 border-start border-4 border-warning ps-2">
                      ประเภทและรูปภาพ
                    </h6>
                    <Form.Item name="brand" label="แบรนด์" rules={[{ required: true }]}>
                      <Select placeholder="กรุณาเลือกแบรนด์ของสินค้า">
                        {categories
                          .filter((item) => item.brand)
                          .map((c) => (
                            <Select.Option key={c.type_id} value={c.brand}>
                              {c.brand}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name="category" label="ประเภทสินค้า" rules={[{ required: true }]}>
                      <Select placeholder="กรุณาเลือกประเภทของสินค้า">
                        {categories
                          .filter((item) => item.category)
                          .map((c) => (
                            <Select.Option key={c.id} value={c.category}>
                              {c.category}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="รูปภาพสินค้า"
                      name="image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      rules={[{ required: true, message: "กรุณาอัปโหลดรูปภาพ" }]}
                    >
                      <Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon">
                          <MdOutlineWorkOutline />
                        </p>
                        <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่เพื่ออัปโหลด</p>
                      </Dragger>
                    </Form.Item>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    className="d-flex align-items-center fw-bold rounded-3 shadow-sm"
                    variant="secondary"
                    onClick={() => setOpenCategoryModal(true)}
                  >
                    <FaRegPlusSquare className="me-2" />
                    เพิ่มประเภท
                  </Button>
                  <Button
                    className="btn btn-primary btn-save d-flex align-items-center justify-content-between"
                    onClick={() => {
                      form.submit(); // ให้ onFinish จัดการเปิด modal เอง
                    }}
                  >
                    <FaRegSave className="button-icon justify-content-start" />
                    <span className="button-text">บันทึกข้อมูลสินค้า</span>
                  </Button>

                  {/* Modal success */}
                  <Modal
                    show={openSuccess}
                    onHide={() => {
                      setOpenSuccess(false);
                    }}
                  >
                    <Modal.Body
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <IoMdCheckmarkCircle
                        className="modal-icon"
                        style={{ fontSize: 64, color: "green" }}
                      />
                      <p className="d-flex mt-3 mb-3">การเพิ่มสินค้าเข้าในระบบสำเร็จ</p>
                      <Button
                        onClick={() => setOpenSuccess(false)}
                        className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
                      >
                        <span className="d-flex justify-content-end">สร้างงาน</span>
                      </Button>
                    </Modal.Body>
                  </Modal>

                  {/* Modal error */}
                  <Modal
                    show={openError}
                    onHide={() => {
                      setOpenError(false);
                    }}
                  >
                    <Modal.Body
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <IoMdCheckmarkCircle
                        className="modal-icon"
                        style={{ fontSize: 64, color: "red" }}
                      />
                      <p className="d-flex mt-3 mb-3">
                        การเพิ่มสินค้าเข้าในระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
                      </p>
                      <Button
                        onClick={() => setOpenError(false)}
                        className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
                        variant="warning"
                      >
                        <span className="d-flex justify-content-end">ลองอีกครั้ง</span>
                      </Button>
                    </Modal.Body>
                  </Modal>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal show={openCategoryModal} onHide={() => setOpenCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มประเภทสินค้าใหม่</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            form={categoryForm}
            onFinish={onPostCategory}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="category"
              label="ชื่อประเภทสินค้า"
              rules={[{ required: true, message: "กรุณากรอกชื่อประเภท" }]}
            >
              <Input placeholder="กรอกชื่อประเภทสินค้า" />
            </Form.Item>
            <div className="d-flex justify-content-end">
              <Button variant="primary" type="submit">
                บันทึก
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Category add result Modal */}
      <Modal
        show={categoryResultModalVisible}
        onHide={() => setCategoryResultModalVisible(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{isCategorySuccess ? "สำเร็จ" : "ผิดพลาด"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{categoryResultMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={isCategorySuccess ? "success" : "warning"}
            onClick={() => setCategoryResultModalVisible(false)}
          >
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}




