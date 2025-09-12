import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function JobForm() {
  // กำหนด State สำหรับเก็บข้อมูล
  const [jobName, setJobName] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [products, setProducts] = useState([]); // ข้อมูลสินค้าที่จะดึงจาก Database

  // ตัวอย่างข้อมูลสินค้าจำลอง (ในความเป็นจริงจะเรียกจาก API)
  useEffect(() => {
    const mockProducts = [
      {
        product_id: 1,
        product_name: "สินค้า A",
        category: "อุปกรณ์อิเล็กทรอนิกส์",
      },
      {
        product_id: 2,
        product_name: "สินค้า B",
        category: "อุปกรณ์อิเล็กทรอนิกส์",
      },
      { product_id: 3, product_name: "สินค้า C", category: "เสื้อผ้า" },
      { product_id: 4, product_name: "สินค้า D", category: "เสื้อผ้า" },
    ];
    setProducts(mockProducts);
  }, []);

  // ฟังก์ชันเพิ่มสินค้าในรายการ
  const handleAddItem = (productId) => {
    const existingItem = selectedItems.find(
      (item) => item.productId === productId
    );
    if (existingItem) {
      // ถ้าสินค้ามีอยู่แล้ว ให้เพิ่มจำนวน
      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // ถ้าเป็นสินค้าใหม่ ให้เพิ่มเข้าไปในรายการ
      setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
    }
  };

  // ฟังก์ชันส่งข้อมูลฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/jobs`, {
        jobName,
        items: selectedItems,
      });
      console.log("สร้างงานแล้ว:", response.data);
      alert("สร้างงานสำเร็จ!");
      setJobName("");
      setSelectedItems([]);
    } catch (error) {
      console.error("สร้างงานไม่สำเร็จ:", error);
      alert("สร้างงานไม่สำเร็จ");
    }
  };

  return (
    <div>
      <h2>สร้างงานใหม่</h2>
      <form onSubmit={handleSubmit}>
        <label>
          ชื่องาน:
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            required
          />
        </label>

        <h3>เลือกสินค้า:</h3>
        <ul>
          {products.map((product) => (
            <li key={product.product_id}>
              {product.product_name} ({product.category})
              <button
                type="button"
                onClick={() => handleAddItem(product.product_id)}
              >
                เพิ่ม
              </button>
            </li>
          ))}
        </ul>

        <h3>รายการสินค้าในงาน:</h3>
        <ul>
          {selectedItems.map((item) => {
            const productInfo = products.find(
              (p) => p.product_id === item.productId
            );
            return (
              <li key={item.productId}>
                {productInfo.product_name} - จำนวน: {item.quantity}
              </li>
            );
          })}
        </ul>

        <button type="submit">ส่งข้อมูลงาน</button>
      </form>
    </div>
  );
}

export default JobForm;

// import React, { useState } from "react";
// function TestLogin({ onLoginSuccess }) {
//   const [usernameOrEmail, setUsernameOrEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false); // ✅ State for Remember Me checkbox
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!usernameOrEmail || !password) {
//       setMessage({
//         type: "error",
//         text: "กรุณากรอกชื่อผู้ใช้/อีเมลและรหัสผ่าน",
//       });
//       return;
//     }

//     setLoading(true);
//     setMessage({ type: "", text: "" });

//     try {
//       const response = await fetch("http://localhost:3001/api/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ usernameOrEmail, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage({
//           type: "success",
//           text: data.message || "เข้าสู่ระบบสำเร็จ!",
//         });
//         // ✅ ถ้า "Remember Me" ถูกเลือก ให้บันทึก username/email ลงใน localStorage
//         if (rememberMe) {
//           localStorage.setItem("rememberedUser", usernameOrEmail);
//         } else {
//           localStorage.removeItem("rememberedUser"); // Clear if it was previously set
//         }
//         onLoginSuccess?.(rememberMe); // Pass rememberMe status back to App
//       } else {
//         setMessage({
//           type: "error",
//           text: data.message || "ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง",
//         });
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setMessage({
//         type: "error",
//         text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="d-flex flex-grow-1 rounded-4 overflow-hidden shadow"
//       style={{ maxWidth: "1010px", height: "650px" }}
//     >
//       {/* Left Panel */}
//       <div
//         className="d-flex flex-column align-items-center text-center p-5 "
//         style={{
//           flex: "1",
//           backgroundColor: "#ffffff",
//           width: "473px",
//           height: "728px",
//         }}
//       >
//         <div className="d-flex align-items-center justify-content-start mb-4 fs-5 fw-bold mt-3">
//           <PeopleCircleIcon
//             style={{ width: "50px", height: "50px", color: "black" }}
//           />
//           <div className="d-flex flex-column ms-2">
//             <span className="fs-5 fw-bold text-dark">Service</span>
//             <span className="fs-5 fw-bold text-dark">System</span>
//           </div>
//         </div>

//         <div className="w-100 m-5" style={{ maxWidth: "400px" }}>
//           <h1 className="fs-1 fw-bold text-dark mb-2 text-center">Sign in</h1>
//           <p className="text-secondary mb-5 text-center">
//             Login in to your account to continue
//           </p>
//           <form onSubmit={handleLogin}>
//             <div className="mb-4 text-start">
//               <label
//                 htmlFor="usernameOrEmail"
//                 className="d-block text-secondary"
//               >
//                 Email or Username
//               </label>
//               <input
//                 type="text"
//                 id="usernameOrEmail"
//                 name="usernameOrEmail"
//                 required
//                 className="form-control"
//                 value={usernameOrEmail}
//                 onChange={(e) => setUsernameOrEmail(e.target.value)}
//               />
//             </div>
//             <div className="mb-4 text-start">
//               <label htmlFor="password" className="d-block text-secondary">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 required
//                 className="form-control"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             <div className="d-flex align-items-center mb-4">
//               <input
//                 type="checkbox"
//                 id="remember-me"
//                 className="me-2"
//                 checked={rememberMe} // ✅ Bind checkbox state
//                 onChange={(e) => setRememberMe(e.target.checked)} // ✅ Update checkbox state
//               />
//               <label htmlFor="remember-me" className="text-secondary">
//                 Remember Me
//               </label>
//             </div>
//             <button
//               type="submit"
//               className="btn btn-primary w-100 py-3 fw-medium"
//               style={{ backgroundColor: "#123456", borderColor: "#123456" }}
//               disabled={loading}
//             >
//               {loading ? "กำลังเข้าสู่ระบบ..." : "Sign in"}
//             </button>
//           </form>

//           {message.text && (
//             <div
//               className={`mt-4 p-3 rounded-3 text-small ${
//                 message.type === "error"
//                   ? "bg-danger-subtle text-danger"
//                   : "bg-success-subtle text-success"
//               }`}
//               role="alert"
//             >
//               {message.text}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Right Panel */}
//       <div
//         className="d-none d-md-flex justify-content-center align-items-center p-4"
//         style={{ flex: "1", backgroundColor: "#1a2a4b" }}
//       >
//         <div
//           style={{
//             color: "white",
//             textAlign: "center",
//             fontSize: "1.5rem",
//             fontWeight: "bold",
//           }}
//         >
//           Service System Graphic
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TestLogin;
