import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Divider,
  ConfigProvider,
  Card,
  message,
} from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const ROLE_OPTIONS = [
  { label: "superService", value: "superService" },
  { label: "service", value: "service" },
  { label: "admin", value: "admin" },
  { label: "user", value: "user" },
];

export default function Register() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // ฟังก์ชัน submit
  const handleFinish = async (values) => {
    try {
      setSubmitting(true);
      const res = await axios.post(`http://localhost:5000/register`, values);
      message.success(res.data.message);
      form.resetFields();
      console.log(form.resetFields());
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || "Register failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { borderRadius: 8 } }}>
      <div
        className="min-h-screen w-screen flex items-center justify-center bg-[#f3f4f6] p-4"
        style={{ padding: "2rem" }}
      >
        <Card
          className="shadow-md w-full max-w-2xl"
          title={
            <div className="text-center mb-5 mt-5">
              <Title level={3} style={{ margin: 0 }}>
                Register
              </Title>
              <Text type="secondary">Create a new service account</Text>
            </div>
          }
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            requiredMark
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="serviceRef"
                label="รหัสพนักงาน"
                rules={[{ required: true, message: "กรุณากรอกรหัสพนักงาน" }]}
              >
                <Input placeholder="" allowClear />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input type="email" allowClear />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: "กรุณากรอก username" },
                ]}
              >
                <Input placeholder="" allowClear />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "กรุณากรอกรหัสผ่าน", min: 8 },
                ]}
              >
                <Input.Password allowClear />
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "กรุณาเลือก Role" }]}
              >
                <Select
                  options={ROLE_OPTIONS}
                  placeholder="เลือกบทบาท"
                  showSearch
                  optionFilterProp="label"
                  allowClear
                />
              </Form.Item>
            </div>

            {/* <Divider className="my-4" /> */}

            <div className="d-flex justify-content-center sm:justify-end mt-5 mb-5">
              <Button type="primary" htmlType="submit" loading={submitting}>
                ลงทะเบียน
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
}

// import React, { useState } from "react";

// export default function Register() {
//   const [id, setId] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState(""); // เพิ่ม email state
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [validationErrors, setValidationErrors] = useState([]); // เก็บ error validation หลายอัน

//   const validateEmail = (email) => {
//     // ตรวจสอบรูปแบบอีเมล
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const validatePassword = (password) => {
//     // เช็คความยาวและความซับซ้อน (ตัวพิมพ์ใหญ่, เล็ก, ตัวเลข, พิเศษ)
//     if (password.length < 8 || password.length > 14) return false;
//     const hasUpper = /[A-Z]/.test(password);
//     const hasLower = /[a-z]/.test(password);
//     const hasNumber = /\d/.test(password);
//     const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
//     return hasUpper && hasLower && hasNumber && hasSpecial;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setValidationErrors([]);

//     let errors = [];

//     // เช็คแต่ละช่องที่จำเป็น
//     if (!id.trim()) errors.push("กรุณากรอก ID");
//     if (!firstName.trim()) errors.push("กรุณากรอกชื่อ");
//     if (!lastName.trim()) errors.push("กรุณากรอกนามสกุล");
//     if (!username.trim()) errors.push("กรุณากรอกชื่อผู้ใช้");
//     if (!email.trim()) {
//       errors.push("กรุณากรอกอีเมล");
//     } else if (!validateEmail(email)) {
//       errors.push("กรุณากรอกอีเมลให้ถูกต้อง");
//     }
//     if (!role) errors.push("กรุณาเลือกบทบาท");
//     if (!password.trim()) {
//       errors.push("กรุณากรอกรหัสผ่าน");
//     } else if (!validatePassword(password)) {
//       errors.push(
//         "รหัสผ่านต้องมีความยาว 8-14 ตัวอักษร และมีพิมพ์ใหญ่, เล็ก, ตัวเลข และอักขระพิเศษ"
//       );
//     }

//     if (errors.length > 0) {
//       setValidationErrors(errors);
//       return;
//     }

//     // ส่งข้อมูลตามเดิม (ไม่แก้ logic)
//     try {
//       const response = await fetch("http://localhost:5000/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id, firstName, lastName, username, email, password, role }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.error || "Registration failed");
//         return;
//       }

//       setSuccess("Registration successful! You can now login.");
//       setId("");
//       setFirstName("");
//       setLastName("");
//       setUsername("");
//       setEmail("");
//       setPassword("");
//       setRole("");
//       setValidationErrors([]);
//     } catch (error) {
//       setError("Something went wrong. Please try again.");
//       console.error(error);
//     }
//   };

//   return (
//     <div
//       className="container-fluid d-flex justify-content-center align-items-center"
//       style={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #2980b9 0%, #6dd5fa 50%, #ffffff 100%)",
//       }}
//     >
//       <div
//         className="d-flex flex-grow-1 rounded-5 shadow-lg"
//         style={{ maxWidth: "600px", backgroundColor: "#fff" }}
//       >
//         <div className="p-5 flex-grow-1">
//           <h2 className="fw-bold mb-4 text-center" style={{ color: "#2c3e50" }}>
//             Create Your Account
//           </h2>

//           <form onSubmit={handleSubmit}>
//             <div className="mb-3">
//               <label htmlFor="id" className="form-label text-secondary">
//                 ID
//               </label>
//               <input
//                 type="text"
//                 id="id"
//                 className="form-control"
//                 value={id}
//                 onChange={(e) => setId(e.target.value)}
//                 required
//                 placeholder="Enter your ID"
//               />
//             </div>

//             <div className="row mb-3">
//               <div className="col">
//                 <label htmlFor="firstName" className="form-label text-secondary">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   id="firstName"
//                   className="form-control"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   required
//                   placeholder="First name"
//                 />
//               </div>
//               <div className="col">
//                 <label htmlFor="lastName" className="form-label text-secondary">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   id="lastName"
//                   className="form-control"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   required
//                   placeholder="Last name"
//                 />
//               </div>
//             </div>

//             {/* ช่อง Email ใหม่ */}
//             <div className="mb-3">
//               <label htmlFor="email" className="form-label text-secondary">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 className="form-control"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="Enter your email"
//               />
//             </div>

//             <div className="mb-3">
//               <label htmlFor="username" className="form-label text-secondary">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 id="username"
//                 className="form-control"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//                 placeholder="Choose a username"
//               />
//             </div>

//             <div className="mb-3">
//               <label htmlFor="role" className="form-label text-secondary">
//                 Role
//               </label>
//               <select
//                 id="role"
//                 className="form-select"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 required
//               >
//                 <option value="" disabled hidden>
//                   Select role
//                 </option>
//                 <option value="admin">Admin</option>
//                 <option value="superService">Super Service</option>
//                 <option value="service">Service</option>
//               </select>
//             </div>

//             <div className="mb-4 position-relative">
//               <label htmlFor="password" className="form-label text-secondary">
//                 Password
//               </label>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 className="form-control"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="Create a password"
//               />
//               <span
//                 onClick={() => setShowPassword(!showPassword)}
//                 style={{
//                   position: "absolute",
//                   right: "15px",
//                   top: "38px",
//                   cursor: "pointer",
//                   color: "#999",
//                   userSelect: "none",
//                 }}
//               >
//                 {showPassword ? "🙈" : "👁️"}
//               </span>
//             </div>

//             {/* แสดง Error Validation สีแดง บนปุ่ม Register */}
//             {validationErrors.length > 0 && (
//               <div
//                 style={{
//                   backgroundColor: "#ffdddd",
//                   color: "#d8000c",
//                   borderRadius: "6px",
//                   padding: "10px 15px",
//                   marginBottom: "12px",
//                   fontWeight: "600",
//                   fontSize: "0.95rem",
//                   lineHeight: "1.3",
//                   boxShadow: "0 0 8px rgba(216, 0, 12, 0.4)",
//                 }}
//               >
//                 {validationErrors.map((err, i) => (
//                   <div key={i}>• {err}</div>
//                 ))}
//               </div>
//             )}

//             {error && <div className="alert alert-danger">{error}</div>}
//             {success && <div className="alert alert-success">{success}</div>}

//             <button
//               type="submit"
//               className="btn w-100 fw-semibold"
//               style={{ backgroundColor: "#3498db", color: "#fff", padding: "12px" }}
//             >
//               Register
//             </button>
//           </form>
//         </div>

//         <div
//           className="d-none d-md-block flex-grow-1 rounded-end"
//           style={{
//             background: "linear-gradient(135deg, #6dd5fa 0%, #2980b9 100%)",
//           }}
//         ></div>
//       </div>
//     </div>
//   );
// }
