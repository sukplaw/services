import React from "react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // กลับไปยังหน้าก่อนหน้า
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>เข้าถึงไม่ได้</h1>
      <p style={{ fontSize: "1.2rem" }}>คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
      <button
        onClick={handleBack}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "1rem",
          cursor: "pointer",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#dc3545",
          color: "white",
        }}
      >
        ย้อนกลับ
      </button>
    </div>
  );
};

export default UnauthorizedPage;
