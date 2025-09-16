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
  const navigate = useNavigate();

  const handleCreateJob = () => navigate("/create-job");
  const handleClose = () => setOpen(false);

  const onPost = (data) => {
    const url = "http://localhost:3302/create-customers";
    axios
      .post(url, data)
      .then(() => form.resetFields())
      .catch((error) => console.error("Error creating customer:", error));
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
                      <div className="small bg-warning-subtle border rounded p-2 mb-3">
                        กรุณากรอกข้อมูลตามจริงเพื่อความถูกต้องของงานบริการ
                      </div>

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

                {/* ปุ่มบันทึก: ชิดขวา, คงสไตล์ปุ่มแนวเดิม */}
                <div className="d-flex justify-content-end mt-3">
                  <Button
                    className="d-flex align-items-center fw-bold rounded-3 shadow-sm btn-submit-form"
                    variant="primary"
                    onClick={() => {
                      setOpen(true);
                      form.submit();
                    }}
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

        {/* Modal: คง logic/หน้าตาเดิม */}
        <Modal show={open} onHide={handleClose}>
          <Modal.Body className="text-center">
            <IoMdCheckmarkCircle
              className="text-success"
              style={{ fontSize: 64 }}
            />
            <p className="mt-3 mb-3">การเพิ่มรายชื่อลูกค้าเข้าในระบบสำเร็จ</p>
            <Button
              onClick={handleCreateJob}
              variant="success"
              className="fw-bold"
            >
              สร้างงาน
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

// test13.js
// import React, { useState } from "react";
// import { Form, Input, InputNumber } from "antd";
// import Button from "react-bootstrap/Button";
// import { LiaUserEditSolid } from "react-icons/lia";
// import { MdOutlineEmail } from "react-icons/md";
// import { FaRegSave } from "react-icons/fa";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";
// import { FaLine } from "react-icons/fa6";
// import { FiPhoneCall } from "react-icons/fi";
// import { MdOutlineDescription } from "react-icons/md";

// export default function CreateCustomerForm() {
//   const [form] = Form.useForm();
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();

//   const handleCreateJob = () => navigate("/create-job");
//   const handleClose = () => setOpen(false);

//   const onPost = (data) => {
//     const url = "http://localhost:3302/create-customers";
//     axios
//       .post(url, data)
//       .then(() => form.resetFields())
//       .catch((error) => console.error("Error creating customer:", error));
//   };

//   return (
//     <>
//       {/* Gradient เฉพาะ "การ์ดหัวข้อ" (ไม่ใช้สีน้ำเงิน) + ปรับโทน focus ของ antd ให้ไม่เป็นฟ้า */}
//       <style>{`
//         .header-gradient-card{
//           background: linear-gradient(90deg,#0D92CF9C,#C7FEE7FFc7,#8AB8FDFF); /* เขียวอ่อน -> เหลืองอ่อน */
//           border: 1px solid #e5e7eb;
//         }

//       `}</style>

//       <div className="container-fluid bg-light min-vh-100 py-4">
//         {/* การ์ดหัวข้อ: ไล่สี (ไม่ใช่สีน้ำเงิน) + ตัวหนังสือสีปกติ */}
//         <div className="container mb-3">
//           <div className="header-gradient-card rounded-3 shadow-sm p-3 p-md-4">
//             <h2 className="fw-bold m-0 text-white justify-content-center d-flex">
//               เพิ่มข้อมูลลูกค้า
//             </h2>
//           </div>
//         </div>

//         {/* การ์ดครอบฟอร์ม */}
//         <div className="container">
//           <div className="card rounded-4 shadow-sm border">
//             <div className="card-body p-3 p-md-4">
//               <Form
//                 form={form}
//                 layout="vertical"
//                 autoComplete="off"
//                 onFinish={onPost}
//               >
//                 {/* แบ่ง grid ซ้าย-ขวาเท่ากัน */}
//                 <div className="row g-3 g-md-4">
//                   {/* ซ้าย: ข้อมูลส่วนตัว */}
//                   <div className="col-md-6">
//                     <div className="card border-0">
//                       <div className="card-body p-0">
//                         <h6 className="fw-bold text-dark mb-3 border-start border-4 border-warning ps-2">
//                           ข้อมูลส่วนตัว
//                         </h6>
//                         <div className="small text-muted bg-light border rounded p-2 mb-3">
//                           กรอกข้อมูลตามจริงเพื่อความถูกต้องของงานบริการ
//                         </div>

//                         <Form.Item
//                           name="customerRef"
//                           label="รหัสลูกค้า"
//                           rules={[{ required: true }, { type: "string" }]}
//                         >
//                           <Input prefix={<LiaUserEditSolid />} />
//                         </Form.Item>

//                         <Form.Item
//                           name="customer_firstname"
//                           label="ชื่อ"
//                           rules={[{ required: true }, { type: "string" }]}
//                         >
//                           <Input prefix={<LiaUserEditSolid />} />
//                         </Form.Item>

//                         <Form.Item
//                           name="customer_lastname"
//                           label="นามสกุล"
//                           rules={[{ required: true }, { type: "string" }]}
//                         >
//                           <Input prefix={<LiaUserEditSolid />} />
//                         </Form.Item>

//                         <Form.Item
//                           name="username"
//                           label="Username"
//                           rules={[{ required: true }, { type: "string" }]}
//                         >
//                           <Input prefix={<LiaUserEditSolid />} />
//                         </Form.Item>

//                         <Form.Item
//                           name="customer_old"
//                           label="อายุ"
//                           rules={[{ required: true }, { type: "number" }]}
//                         >
//                           <InputNumber min={1} max={100} className="w-100" />
//                         </Form.Item>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ขวา: การติดต่อ & ที่อยู่ */}
//                   <div className="col-md-6">
//                     <div className="card border-0">
//                       <div className="card-body p-0">
//                         <h6 className="fw-bold text-dark mb-3 border-start border-4 border-warning ps-2">
//                           การติดต่อ & ที่อยู่
//                         </h6>

//                         <Form.Item
//                           name="email"
//                           label="Email"
//                           rules={[{ required: true }, { type: "string" }]}
//                         >
//                           <Input prefix={<MdOutlineEmail />} />
//                         </Form.Item>

//                         <Form.Item
//                           name="line_id"
//                           label="Line id"
//                           rules={[{ required: true }, { type: "string" }]}
//                         >
//                           <Input prefix={<FaLine />} />
//                         </Form.Item>

//                         <Form.Item
//                           name="phone"
//                           label="เบอร์โทรศัพท์"
//                           rules={[{ required: true }, { type: "string" }]}
//                         >
//                           <Input prefix={<FiPhoneCall />} />
//                         </Form.Item>

//                         <Form.Item
//                           name="address"
//                           label="ที่อยู่ลูกค้า"
//                           rules={[{ required: true }, { type: "string" }]}
//                         >
//                           <Input.TextArea
//                             autoSize={{ minRows: 4, maxRows: 6 }}
//                           />
//                         </Form.Item>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ปุ่มบันทึก ชิดขวา */}
//                 <div className="d-flex justify-content-end mt-3">
//                   <Button
//                     className="d-flex align-items-center fw-bold"
//                     variant="success"
//                     onClick={() => {
//                       setOpen(true);
//                       form.submit();
//                     }}
//                     htmlType="submit"
//                   >
//                     <FaRegSave className="me-2" />
//                     บันทึกข้อมูลลูกค้า
//                   </Button>
//                 </div>
//               </Form>
//             </div>
//           </div>
//         </div>

//         {/* Modal เดิม */}
//         <Modal show={open} onHide={handleClose}>
//           <Modal.Body className="text-center">
//             <IoMdCheckmarkCircle
//               className="text-success"
//               style={{ fontSize: 64 }}
//             />
//             <p className="mt-3 mb-3">การเพิ่มรายชื่อลูกค้าเข้าในระบบสำเร็จ</p>
//             <Button
//               onClick={handleCreateJob}
//               variant="success"
//               className="fw-bold"
//             >
//               สร้างงาน
//             </Button>
//           </Modal.Body>
//         </Modal>
//       </div>
//     </>
//   );
// }
