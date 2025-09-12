import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import axios from "axios";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const toRegister = () => {
    navigate("/register")
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usernameOrEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Remember Me: เลือกว่าจะเก็บ token ไว้ใน localStorage หรือ sessionStorage
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      console.log(data.token);
      storage.setItem("permission", data.user.role); // เก็บ permission (role) ด้วย
      storage.setItem("username", data.user.username); // ✅ เพิ่มบรรทัดนี้

      if (data.user.serviceRef) {
        storage.setItem("serviceRef", data.user.serviceRef);
      }
      console.log("serviceRef from login:", data.user.serviceRef);

      window.location.href = "/home"; // ไปหน้า Home หลัง login สำเร็จ
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    }
  };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   try {
  //     const response = await axios.post(`http://localhost:5000/login`, {
  //       usernameOrEmail: usernameOrEmail,
  //       password: password,
  //     });

  //     if (response.data.tokenKey) {
  //       localStorage.setItem("tokenKey", response.data.tokenKey);
  //       localStorage.setItem("username", response.data.user.username);
  //       localStorage.setItem("permission", response.data.user.permission);

  //       // Redirect based on permission
  //       if (response.data.user.permission === "full_admin") {
  //         navigate("/dashboard");
  //       } else if (response.data.user.permission === "editor") {
  //         navigate("/job");
  //       } else {
  //         // Default redirect for other permissions
  //         navigate("/home");
  //       }
  //     } else {
  //       setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error during authentication:",
  //       error.response?.data || error.message
  //     );
  //     setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  //   }
  // };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#F0F0F0" }}
    >
      <div
        className="d-flex flex-grow-1 rounded-4 shadow"
        style={{ maxWidth: "900px", height: "600px", backgroundColor: "#fff" }}
      >
        <div
          className="d-flex flex-column justify-content-center p-5"
          style={{ flex: 1 }}
        >
          <h1 className="fs-1 fw-bold text-center mb-4" style={{ color: "#123456" }}>
            Sign in
          </h1>
          <p className="text-center text-secondary mb-5">
            Login in to your account to continue
          </p>
          <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label" style={{ color: "#123456" }}>
                Email or Username
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                className="form-control"
                style={{
                  borderColor: "#123456",
                  padding: "10px 12px",
                  fontSize: "16px",
                  borderRadius: "6px",
                }}
                placeholder="Enter your email or username"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label" style={{ color: "#123456" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    borderColor: "#123456",
                    padding: "10px 40px 10px 12px",
                    fontSize: "16px",
                    borderRadius: "6px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#123456",
                    fontSize: "18px",
                    padding: 0,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="form-check-input"
              />
              <label htmlFor="rememberMe" className="form-check-label" style={{ color: "#123456" }}>
                Remember Me
              </label>
            </div>

            <div className="mb-3 d-flex justify-content-end">
              <button
                type="button"
                onClick={toRegister}
                className="btn btn-link"
                style={{ color: "#123456", textDecoration: "underline", padding: 0 }}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="text-danger mb-3" style={{ fontWeight: "500" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn w-100 py-3 fw-semibold"
              style={{
                backgroundColor: "#123456",
                borderColor: "#123456",
                borderRadius: "6px",
                fontSize: "18px",
                color: "#ffff"
              }}
            >
              Sign in
            </button>
          </form>
        </div>

        <div
          className="d-none d-md-block"
          style={{ flex: 1, backgroundColor: "#1a2a4b" }}
        >
          {/* You can put an image or graphic here */}
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useEffect } from "react";
// import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

// export default function Login() {
//   const [usernameOrEmail, setUsernameOrEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const navigate = useNavigate();
//   const toHome = () => {
//     navigate("/");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // ส่งข้อมูลการเข้าสู่ระบบไปยัง API
//       const response = await axios.post(`http://localhost:3303/api/login`, {
//         usernameOrEmail: usernameOrEmail,
//         password: password,
//       });
//       if (response.data.tokenKey) {
//         localStorage.setItem("tokenKey", response.data.tokenKey);
//         localStorage.setItem("username", response.data.user.username);
//         localStorage.setItem("memberId", response.data.user.id);

//         if (rememberMe) {
//           localStorage.setItem("rememberMe", "true");
//           localStorage.setItem("savedUsernameOrEmail", usernameOrEmail);
//           localStorage.setItem("savedPassword", password);
//         } else {
//           localStorage.removeItem("rememberMe");
//           localStorage.removeItem("savedUsernameOrEmail");
//           localStorage.removeItem("savedPassword");
//         }

//         const memida = response.data.user.id;

//         if (memida === 7) {
//           navigate("/qr-code");
//         } else {
//           navigate("/Home");
//         }
//       } else {
//         console.log("Login failed");
//         alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
//       }
//     } catch (error) {
//       console.error("Error during authentication:", error);
//       alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
//     }
//   };

//   const handleRememberMe = () => {
//     setRememberMe(!rememberMe);
//   };

//   useEffect(() => {
//     const remembered = localStorage.getItem("rememberMe") === "true";
//     if (remembered) {
//       setUsernameOrEmail(localStorage.getItem("savedUsernameOrEmail") || " ");
//       setPassword(localStorage.getItem("savePassword") || " ");
//       setRememberMe(true);
//     }
//   }, []);
//   // const handleForgotPassword = async () => {
//   //   if (!usernameOrEmail) {
//   //     alert("กรุณากรอก Username หรือ Email");
//   //     return;
//   //   }

//   //   try {
//   //     const response = await axios.post(
//   //       `http://localhost:3302/forget-password`,
//   //       {
//   //         usernameOrEmail: usernameOrEmail,
//   //       }
//   //     );

//   //     if (response.data.success) {
//   //       alert(
//   //         "ได้รับคำขอส่งรหัสผ่านแล้ว กรุณารอซักครู่ เจ้าหน้าที่จะส่งรหัสผ่านของท่านไปตามอีเมลล์ที่ลงทะเบียนไว้"
//   //       );
//   //     } else {
//   //       alert("ไม่พบผู้ใช้งานที่ตรงกับข้อมูลที่กรอก");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error during password reset:", error);
//   //     alert("ไม่พบผู้ใช้งานที่ตรงกับข้อมูลที่กรอก");
//   //   }
//   // };

//   return (
//     <div
//       className="container-fluid d-flex justify-content-center align-items-center"
//       style={{ minHeight: "100vh", backgroundColor: "#F0F0F0" }}
//     >
//       <div
//         className="d-flex flex-grow-1 rounded-4 overflow-hidden shadow"
//         style={{ maxWidth: "1010px", height: "650px" }}
//       >
//         {/* Left Panel (Sign-in Form) */}
//         <div
//           className="d-flex flex-column align-items-center text-center p-5 "
//           style={{
//             flex: "1",
//             backgroundColor: "#ffffff",
//             width: "473px",
//             height: "728px",
//           }}
//         >
//           {/* <div className="d-flex align-items-center justify-content-start mb-4 fs-5 fw-bold mt-3"> */}
//           {/* <UserIcon className="logo-icon me-2" style={{ width: '40px', height: '40px' }} /> */}
//           {/* <IoPeopleCircleSharp style={{ width: "50px", height: "50px" }} />
//             <div className="d-flex flex-column ms-2">
//               <span className="fs-5 fw-bold text-dark">Service</span>
//               <span className="fs-5 fw-bold text-dark">System</span>
//             </div>
//           </div> */}
//           <div className="w-100 m-5" style={{ maxWidth: "400px" }}>
//             <h1 className="fs-1 fw-bold text-dark mb-2 text-center">Sign in</h1>
//             <p className="text-secondary mb-5 text-center">
//               Login in to your account to continue
//             </p>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4 text-start">
//                 <label htmlFor="text" className="d-block text-secondary">
//                   Email or Username
//                 </label>
//                 <input
//                   type="text"
//                   id="email"
//                   name="email"
//                   placeholder=""
//                   value={usernameOrEmail}
//                   onChange={(e) => setUsernameOrEmail(e.target.value)}
//                   required
//                   className="form-control"
//                 />
//               </div>
//               <div className="mb-4 text-start">
//                 <label htmlFor="password" className="d-block text-secondary">
//                   Password
//                 </label>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="password"
//                   name="password"
//                   placeholder=""
//                   required
//                   className="form-control"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="password-toggle"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
//                 </button>
//               </div>
//               <div className="d-flex align-items-center mb-4">
//                 <input
//                   type="checkbox"
//                   id="remember-me"
//                   className="me-2"
//                   checked={rememberMe}
//                   onChange={handleRememberMe}
//                 />
//                 <label htmlFor="remember-me" className="text-secondary">
//                   Remember Me
//                 </label>
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 py-3 fw-medium"
//                 style={{ backgroundColor: "#123456", borderColor: "#123456" }}
//                 onClick={toHome}
//               >
//                 Sign in
//               </button>
//             </form>
//           </div>
//         </div>
//         {/* Right Panel (Graphic) */}
//         <div
//           className="d-none d-md-flex justify-content-center align-items-center p-4"
//           style={{ flex: "1", backgroundColor: "#1a2a4b" }}
//         >
//           {/* <ChartGraphic className="img-fluid" /> */}
//         </div>
//       </div>
//     </div>
//   );
// }
