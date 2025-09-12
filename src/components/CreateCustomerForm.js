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
          --g1:#312e81; /* indigo */
          --g2:#0e7490; /* cyan */
          --g3:#166534; /* emerald */
        }

        .page-container{
          background: #ffffff;
          min-height: 100vh;
          padding: 32px 24px;
        }
        .form-wrapper{
          max-width: 900px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          padding: 32px;
        }
        .page-title{
          text-align: center;
          font-weight: 600;
          color: var(--g1);
          margin-bottom: 24px;
        }
        .section-title{
          font-size: 1rem;
          font-weight: 600;
          color: var(--g2);
          margin-bottom: 12px;
        }
        .form-grid{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media(max-width:768px){
          .form-grid{ grid-template-columns:1fr; }
        }
        .btn-save{
          background: linear-gradient(90deg,var(--g1),var(--g2),var(--g3));
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          padding: 10px 20px;
          margin-top: 24px;
        }
        .modal-icon{
          color: #16a34a;
          font-size: 64px;
        }
      `}</style>

      <div className="page-container">
        <h2 className="page-title">เพิ่มข้อมูลลูกค้า</h2>
        <div className="form-wrapper">
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            onFinish={onPost}
          >
            <div className="form-grid">
              <div>
                <div className="section-title">ข้อมูลส่วนตัว</div>
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

              <div>
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

            <div className="d-flex justify-content-center">
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

        <Modal show={open} onHide={handleClose}>
          <Modal.Body className="text-center">
            <IoMdCheckmarkCircle className="modal-icon" />
            <p className="mt-3 mb-3">การเพิ่มรายชื่อลูกค้าเข้าในระบบสำเร็จ</p>
            <Button
              onClick={handleCreateJob}
              style={{
                background:
                  "linear-gradient(90deg,var(--g1),var(--g2),var(--g3))",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                color: "white",
                fontWeight: "600",
              }}
            >
              สร้างงาน
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

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
// // import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

// export default function CreateCustomerForm() {
//   // const [data, setData] = useState([]);
//   const [form] = Form.useForm();
//   const [open, setOpen] = useState(false);
//   const [customerData, setCustomerData] = useState("");

//   const navigate = useNavigate();
//   const handleCreateJob = () => {
//     navigate("/create-job");
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   // const handleOpen = () => {
//   //   setOpen(true);
//   // };

//   const onPost = (data) => {
//     console.log(data);
//     const url = "http://localhost:3302/create-customers";
//     axios
//       .post(url, data)
//       .then((response) => {
//         // setData(response.data);
//         console.log("Customer created successfully:", response.data);
//         form.resetFields();
//       })

//       .catch((error) => {
//         console.error("Error creating customer:", error);
//       });
//   };

//   return (
//     <div className="contain-main">
//       <h2 className="text-dark mb-4 mt-5 text-center">เพิ่มข้อมูลลูกค้า</h2>
//       <div className="d-flex flex-column mt-5">
//         <Form
//           form={form}
//           layout="vertical"
//           autoComplete="off"
//           onFinish={onPost}
//           className="content-sub-form-body"
//         >
//           <Form.Item
//             name="customerRef"
//             label="รหัสลูกค้า"
//             rules={[{ required: true }, { type: "string" }]}
//             className="form-item-custom-size"
//           >
//             <Input prefix={<LiaUserEditSolid />} />
//           </Form.Item>

//           <Form.Item
//             name="customer_firstname"
//             label="ชื่อ"
//             rules={[{ required: true }, { type: "string" }]}
//             className="form-item-custom-size"
//           >
//             <Input prefix={<LiaUserEditSolid />} />
//           </Form.Item>

//           <Form.Item
//             name="customer_lastname"
//             label="นามสกุล"
//             rules={[{ required: true }, { type: "string" }]}
//             className="form-item-custom-size"
//           >
//             <Input prefix={<LiaUserEditSolid />} value={customerData} />
//           </Form.Item>

//           <Form.Item
//             name="username"
//             label="Username"
//             rules={[{ required: true }, { type: "string" }]}
//             className="form-item-custom-size"
//           >
//             <Input prefix={<LiaUserEditSolid />} />
//           </Form.Item>

//           <Form.Item
//             name="customer_old"
//             label="อายุ"
//             rules={[{ required: true }, { type: "number" }]}
//             className="form-item-custom-size"
//           >
//             <InputNumber
//               prefix={<LiaUserEditSolid />}
//               min={1}
//               max={100}
//               className="form-item-custom-size"
//             />
//           </Form.Item>

//           <Form.Item
//             name="email"
//             label="Email"
//             rules={[{ required: true }, { type: "string" }]}
//             className="form-item-custom-size"
//           >
//             <Input prefix={<MdOutlineEmail />} />
//           </Form.Item>

//           {/* <Form.Item
//             name="serial_number"
//             label="Serial Number"
//             rules={[{ required: true }, { type: "string" }]}
//             className="form-item-custom-size"
//           >
//             <Input prefix={<MdOutlineEmail />} />
//           </Form.Item> */}

//           <Form.Item
//             name="line_id"
//             label="Line id"
//             rules={[{ required: true }, { type: "string" }]}
//             className="form-item-custom-size"
//           >
//             <Input prefix={<FaLine />} />
//           </Form.Item>

//           <Form.Item
//             name="phone"
//             label="เบอร์โทรศัพท์"
//             rules={[{ required: true }, { type: "string" }]}
//             className="form-item-custom-size"
//           >
//             <Input prefix={<FiPhoneCall />} />
//           </Form.Item>

//           <Form.Item
//             name="address"
//             label="ที่อยู่ลูกค้า"
//             rules={[{ required: true }, { type: "string" }]}
//           >
//             <Input.TextArea
//               prefix={<MdOutlineDescription />}
//               className="form-item-custom-size-address"
//             />
//           </Form.Item>
//         </Form>

//         <div className="d-flex justify-content-center mt-5 mb-5">
//           <Button
//             className="d-flex align-items-center justify-content-between btn-save margin-top-100"
//             onClick={() => {
//               setOpen(true);
//               form.submit();
//             }}
//             htmlType="submit"
//           >
//             <FaRegSave className="button-icon justify-content-start" />
//             <span className="button-text">บันทึกข้อมูลลูกค้า</span>
//           </Button>
//           <Modal show={open} onHide={handleClose}>
//             <Modal.Body
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 flexDirection: "column",
//               }}
//             >
//               <IoMdCheckmarkCircle className="modal-icon" />
//               <p className="d-flex mt-3 mb-3">
//                 การเพิ่มรายชื่อลูกค้าเข้าในระบบสำเร็จ
//               </p>
//               <Button
//                 onClick={handleCreateJob}
//                 className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
//               >
//                 <span className="d-flex justify-content-end">สร้างงาน</span>
//               </Button>
//             </Modal.Body>
//           </Modal>
//         </div>
//       </div>
//     </div>
//   );
// }
