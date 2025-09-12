// src/bridge/NavProfileLinkBridge.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NavProfileLinkBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      // เงื่อนไข: คลิกที่ .dropdown-item ที่มีข้อความ "Profile"
      if (
        target &&
        target.classList?.contains("dropdown-item") &&
        target.textContent?.trim() === "Profile"
      ) {
        e.preventDefault();
        navigate("/profile");
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [navigate]);

  return null; // เป็นตัวเชื่อม ไม่มี UI
}
