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
    <>
      <style>{`
        :root{
          /* โทนสีเรียบ ไม่มีไล่สี */
          --primary:#2563eb;   /* blue-600 */
          --secondary:#0ea5e9; /* sky-500 */
          --success:#16a34a;   /* green-600 */
          --warning:#f59e0b;   /* amber-500 */
          --ink:#0f172a;       /* slate-900 */
          --muted:#64748b;     /* slate-500 */
          --bg:#f8fafc;        /* slate-50 */
          --card:#ffffff;
          --line:#e5e7eb;
          --soft:#eef2ff;      /* indigo-50 */
        }

        .page-container{
          background: var(--bg);
          min-height: 100vh;
          padding: 28px 20px 40px;
        }

        /* แถบหัวเรื่องเต็มความกว้าง แบบสีทึบ */
        .page-head{
          background: var(--primary);
          color: #fff;
          border-radius: 14px;
          padding: 18px 22px;
          max-width: 1100px;
          margin: 0 auto 18px;
          box-shadow: 0 6px 14px rgba(37,99,235,0.15);
        }
        .page-title{
          margin: 0;
          font-weight: 700;
          letter-spacing: .2px;
        }

        /* การ์ดครอบฟอร์ม + กริดใหม่ 2 คอลัมน์ไม่เท่ากัน */
        .form-wrapper{
          max-width: 1100px;
          margin: 0 auto;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(15,23,42,0.06);
          padding: 22px;
        }
        .form-grid{
          display: grid;
          grid-template-columns: 1.2fr 1fr;  /* ปรับสัดส่วนซ้ายกว้างกว่า */
          gap: 20px;
          align-items: start;
        }
        @media(max-width: 900px){
          .form-grid{ grid-template-columns: 1fr; }
        }

        /* การ์ดเซคชันซ้าย/ขวา พร้อมแถบสีบน */
        .panel{
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px;
          position: relative;
        }
        .panel:before{
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 6px;
          border-radius: 14px 14px 0 0;
          background: var(--secondary);
        }
        .panel--left:before{ background: var(--primary); }
        .panel--right:before{ background: var(--secondary); }

        .section-title{
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--ink);
          margin: 4px 0 14px;
          padding-left: 10px;
          border-left: 4px solid var(--warning);
        }

        /* สไตล์คอมโพเนนต์ของ antd ให้เข้าธีม */
        .ant-form-item-label > label{
          color: var(--muted);
          font-weight: 600 !important;
        }
        .ant-input-affix-wrapper, .ant-input, .ant-input-number{
          border-radius: 10px !important;
        }
        .ant-input-affix-wrapper:hover, .ant-input:hover, .ant-input-number:hover{
          border-color: var(--primary) !important;
        }
        .ant-input:focus, .ant-input-focused,
        .ant-input-affix-wrapper-focused,
        .ant-input-number-focused{
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important;
          border-color: var(--primary) !important;
        }

        /* แถบแอคชันล่าง ชิดขวา */
        .actions{
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        .btn-save{
          background: var(--primary) !important; /* สีทึบ */
          border: none !important;
          border-radius: 10px !important;
          color: #fff !important;
          font-weight: 700 !important;
          padding: 10px 18px !important;
          box-shadow: 0 6px 12px rgba(37,99,235,0.18);
        }
        .btn-save:hover{
          filter: brightness(0.95);
        }

        /* โมดัล */
        .modal-icon{
          color: var(--success);
          font-size: 64px;
        }
        .modal-confirm-btn{
          background: var(--success);
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          color: #fff;
          font-weight: 700;
        }
        .modal-confirm-btn:hover{
          filter: brightness(0.95);
        }

        /* รายละเอียดเล็กน้อย */
        .hint{
          font-size: 12px;
          color: var(--muted);
          background: var(--soft);
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px dashed #c7d2fe;
          margin-bottom: 8px;
        }
      `}</style>

      <div className="page-container">
        {/* แถบหัวเรื่องสีทึบ */}
        <div className="page-head">
          <h2 className="page-title">เพิ่มข้อมูลลูกค้า</h2>
        </div>

        <div className="form-wrapper">
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            onFinish={onPost}
          >
            {/* กริดจัดวางใหม่: ซ้าย (ข้อมูลส่วนตัว) / ขวา (การติดต่อ & ที่อยู่) */}
            <div className="form-grid">
              <div className="panel panel--left">
                <div className="section-title">ข้อมูลส่วนตัว</div>
                <div className="hint">
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

              <div className="panel panel--right">
                <div className="section-title">การติดต่อ & ที่อยู่</div>

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

            {/* ปุ่มบันทึกชิดขวา (logic เดิม) */}
            <div className="actions">
              <Button
                className="btn-save d-flex align-items-center"
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

        {/* Modal เดิม เปลี่ยนเป็นสีทึบ ไม่มีไล่สี */}
        <Modal show={open} onHide={handleClose}>
          <Modal.Body className="text-center">
            <IoMdCheckmarkCircle className="modal-icon" />
            <p className="mt-3 mb-3">การเพิ่มรายชื่อลูกค้าเข้าในระบบสำเร็จ</p>
            <Button onClick={handleCreateJob} className="modal-confirm-btn">
              สร้างงาน
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    </>
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
