// test13.js
import React, { useState } from "react";
import { Form, Input, InputNumber } from "antd";
import Button from "react-bootstrap/Button";
import { LiaUserEditSolid } from "react-icons/lia";
import { MdOutlineEmail } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { FaLine } from "react-icons/fa6";
import { FiPhoneCall } from "react-icons/fi";
import { MdOutlineDescription } from "react-icons/md";

export default function CreateCustomerForm() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [errorModal, setErrorModal] = useState(false); // ✅ เพิ่ม
  const [errorMessage, setErrorMessage] = useState(""); // ✅ เพิ่ม
  const navigate = useNavigate();

  const handleCreateJob = () => navigate("/create-job");
  const handleClose = () => setOpen(false);

  // ✅ เพิ่มการจัดการ success/error
  const onPost = async (data) => {
    try {
      await form.validateFields(); // เช็คว่ากรอกครบ
      const url = "http://localhost:3302/create-customers";
      await axios.post(url, data); // POST สำเร็จ

      form.resetFields();
      setOpen(true); // ✅ เปิด modal สำเร็จ
    } catch (error) {
      if (error.errorFields) {
        // กรอกไม่ครบ
        setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      } else {
        // server error หรือ database error
        setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
      setErrorModal(true); // ✅ เปิด modal แจ้ง error
    }
  };

  return (
    <div>
      {/* พื้นหลัง + เว้นระยะ: ใช้ Bootstrap */}
      <div className="container-fluid min-vh-100 py-4">
        {/* แถบหัวเรื่อง (คงฟีลเดิม: พื้นทึบ + ขาว) */}
        <div className="container mb-3">
          <div className="text-white rounded-3 shadow-sm p-3 p-md-4 header-gradient-card">
            <h2 className="m-0 fw-bold">เพิ่มข้อมูลลูกค้า</h2>
          </div>
        </div>

        {/* การ์ดครอบฟอร์ม */}
        <div className="container">
          <div className="card rounded-4 shadow-sm border">
            <div className="small bg-warning-subtle border rounded p-2 mb-3">
              กรุณากรอกข้อมูลตามจริงเพื่อความถูกต้องของงานบริการ
            </div>
            <div className="card-body p-3 p-md-4">
              <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                onFinish={onPost}
              >
                {/* กริดใหม่: ซ้าย/ขวา เท่ากัน (50/50) ด้วย Bootstrap */}
                <div className="row g-3 g-md-4">
                  {/* ซ้าย: ข้อมูลส่วนตัว */}
                  <div className="col-12 col-md-6">
                    <div className="panel-topbar">
                      <h6 className="fw-bold text-dark mb-3 border-start border-4 border-warning ps-2">
                        ข้อมูลส่วนตัว
                      </h6>
                      <Form.Item
                        name="customerRef"
                        label="รหัสลูกค้า"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Input prefix={<LiaUserEditSolid />} />
                      </Form.Item>

                      <Form.Item
                        name="customer_firstname"
                        label="ชื่อ"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Input prefix={<LiaUserEditSolid />} />
                      </Form.Item>

                      <Form.Item
                        name="customer_lastname"
                        label="นามสกุล"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Input prefix={<LiaUserEditSolid />} />
                      </Form.Item>

                      <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Input prefix={<LiaUserEditSolid />} />
                      </Form.Item>

                      <Form.Item
                        name="customer_old"
                        label="อายุ"
                        rules={[{ required: true }, { type: "number" }]}
                      >
                        <InputNumber min={1} max={100} className="w-100" />
                      </Form.Item>
                    </div>
                  </div>

                  {/* ขวา: การติดต่อ & ที่อยู่ */}
                  <div className="col-12 col-md-6">
                    <div className="panel-topbar right">
                      <h6 className="fw-bold text-dark mb-3 border-start border-4 border-warning ps-2">
                        การติดต่อ & ที่อยู่
                      </h6>

                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Input prefix={<MdOutlineEmail />} />
                      </Form.Item>

                      <Form.Item
                        name="line_id"
                        label="Line id"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Input prefix={<FaLine />} />
                      </Form.Item>

                      <Form.Item
                        name="phone"
                        label="เบอร์โทรศัพท์"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Input prefix={<FiPhoneCall />} />
                      </Form.Item>

                      <Form.Item
                        name="address"
                        label="ที่อยู่ลูกค้า"
                        rules={[{ required: true }, { type: "string" }]}
                      >
                        <Input.TextArea autoSize={{ minRows: 4, maxRows: 6 }} />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <Button
                    className="d-flex align-items-center fw-bold rounded-3 shadow-sm btn-submit-form"
                    variant="primary"
                    onClick={() => form.submit()}
                    htmlType="submit"
                  >
                    <FaRegSave className="me-2" />
                    บันทึกข้อมูลลูกค้า
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* ✅ Modal: สำเร็จ */}
        <Modal show={open} onHide={handleClose} centered>
          <Modal.Body className="text-center p-5">
            <IoMdCheckmarkCircle
              className="modal-icon"
              style={{ fontSize: 72, color: "#28a745" }}
            />
            <p className="mt-3 mb-3 fs-5 fw-semibold">
              เพิ่มรายชื่อลูกค้าเข้าในระบบสำเร็จ
            </p>
            <Button
              onClick={handleCreateJob}
              variant="success"
              className="fw-bold"
            >
              สร้างงาน
            </Button>
          </Modal.Body>
        </Modal>

        {/* ✅ Modal: ผิดพลาด */}
        <Modal show={errorModal} onHide={() => setErrorModal(false)} centered>
          <Modal.Body className="text-center p-5">
            <IoMdCheckmarkCircle
              className="modal-icon"
              style={{ fontSize: 72, color: "#dc3545" }}
            />
            <p className="mt-3 mb-0 fs-5 fw-semibold">{errorMessage}</p>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}



