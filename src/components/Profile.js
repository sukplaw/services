import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const DEFAULT_USER = {
  firstName: "",
  lastName: "",
  serviceID: "",
  birthDate: "", // YYYY-MM-DD
  username: "",
  email: "",
  lineId: "",
  phone: "",
  role: "",
  age: "",
  serviceImage: "", // base64 dataURL
};

export default function Profile() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [imageFile, setImageFile] = useState(null);

  // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จาก API
  const getData = async () => {
    setLoading(true); // เริ่มโหลดข้อมูล

    try {
      // ดึง token จาก localStorage
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        setLoading(false);
        return;
      }

      // ส่งคำขอ GET ไปที่ backend พร้อม token ใน Authorization header
      const res = await axios.get("http://localhost:3302/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`, // ส่ง token ใน header
        },
      });

      // รับข้อมูลจาก API และอัปเดต state
      const userFromApi = res.data.user; // สมมุติว่า API ส่งข้อมูลผู้ใช้ใน `user`
      console.log(userFromApi); // log ข้อมูลที่ได้รับจาก API

      setUser((prev) => ({
        ...prev,
        firstName: userFromApi.service_firstname || prev.service_firstname,
        lastName: userFromApi.service_lastname || prev.service_lastname,
        email: userFromApi.email || prev.email,
        username: userFromApi.username || prev.username,
        serviceID: userFromApi.serviceRef || prev.serviceRef,
        lineId: userFromApi.line_id || prev.line_id,
        phone: userFromApi.phone || prev.phone,
        role: userFromApi.role || prev.role,
        birthDate: userFromApi.birth_date || prev.birth_date,
        age: userFromApi.service_old || prev.service_old,
        serviceImage: userFromApi.service_image || prev.service_image,
      }));
    } catch (error) {
      // ตรวจสอบกรณีที่เกิดข้อผิดพลาด
      if (error.response && error.response.status === 403) {
        console.error("Token is invalid or expired.");
        // แสดงข้อความเตือนหรือทำการ redirect ให้ผู้ใช้ล็อกอินใหม่
      } else {
        console.error("Failed to fetch user data from API:", error);
      }
    } finally {
      setLoading(false); // สิ้นสุดการโหลดข้อมูล
    }
  };

  useEffect(() => {
    // เรียกใช้ฟังก์ชัน getData เพื่อดึงข้อมูลล่าสุดจาก API
    getData();
  }, []);

  const age = useMemo(() => {
    if (!user.birthDate) return "";
    const b = dayjs(user.birthDate);
    if (!b.isValid()) return "";
    return dayjs().diff(b, "year");
  }, [user.birthDate]);

  const onChange = (key, val) => {
    setUser((u) => ({ ...u, [key]: val }));
  };

  // นำโค้ดนี้ไปแทนที่ onPickImage เดิม
  const onPickImage = async (file) => {
    if (!file) return;

    // 1. สร้าง FormData สำหรับส่งไฟล์
    const formData = new FormData();
    formData.append("imageFile", file); // "imageFile" ต้องตรงกับที่ multer กำหนด

    setLoading(true); // เริ่มสถานะโหลด (หมุนๆ)

    try {
      // 2. ส่งไฟล์ไปที่เซิร์ฟเวอร์ multer ทันที
      console.log("กำลังอัปโหลดรูปภาพไปที่ port 3302...");
      const uploadRes = await axios.post(
        "http://localhost:3302/api/images/upload",
        formData
      );

      // 3. เมื่อสำเร็จ, นำ URL ที่ได้มาอัปเดต state
      if (uploadRes.data.url) {
        const newImageUrl = uploadRes.data.url;
        console.log("อัปโหลดสำเร็จ, URL ใหม่:", newImageUrl);
        onChange("serviceImage", newImageUrl); // อัปเดต state และรูป preview
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:", error);
      alert("ไม่สามารถอัปโหลดรูปภาพได้");
    } finally {
      setLoading(false); // สิ้นสุดสถานะโหลด
    }
  };

  // const onSave = async () => {
  //   const token =
  //     localStorage.getItem("token") || sessionStorage.getItem("token");
  //   if (!token) {
  //     console.error("No token found in localStorage.");
  //     return;
  //   }

  //   // คำนวณอายุก่อนส่ง
  //   const birthDate = user.birthDate;
  //   const age = birthDate && dayjs(birthDate).isValid()
  //     ? dayjs().diff(dayjs(birthDate), "year")
  //     : null;


  //   const dataToSend = {
  //     ...user,
  //     age, // เพิ่มอายุที่คำนวณไว้ลงไป
  //   };

  //   try {
  //     const res = await axios.put("http://localhost:5000/profile", dataToSend, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (res.status === 200) {
  //       setSaved(true);
  //       setTimeout(() => setSaved(false), 2000);
  //     }
  //   } catch (error) {
  //     console.error("Error saving user data:", error);
  //   } finally {
  //     setIsEditing(false);
  //   }
  // };

  // แก้ไขฟังก์ชัน onSave ในไฟล์ Profile.js ของคุณ

  // นำโค้ดนี้ไปแทนที่ onSave เดิม
  const onSave = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    setLoading(true);

    // ข้อมูลที่จะส่งคือ user state ปัจจุบัน ซึ่งมี image URL ที่อัปเดตแล้ว
    const dataToSend = { ...user };

    try {
      console.log("กำลังบันทึกข้อมูลโปรไฟล์ไปที่ port 3302...");
      const res = await axios.put("http://localhost:3302/api/profile", dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        getData(); // เรียกข้อมูลใหม่เพื่อความแน่ใจ
      }
    } catch (error) {
      console.error("Error saving user profile data:", error);
    } finally {
      setIsEditing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="ms-2">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <style>{`
        :root{
          --g1:#312e81;
          --g2:#0e7490;
          --g3:#166534;
        }
        @keyframes bannerGradient{
          0%{ background-position: 0% 50%; }
          50%{ background-position: 100% 50%; }
          100%{ background-position: 0% 50%; }
        }
        .profile-banner{
          background: linear-gradient(120deg, var(--g1), var(--g2), var(--g3));
          background-size: 300% 300%;
          animation: bannerGradient 14s ease infinite;
          border-radius: 1rem;
          padding: 1.25rem;
          color: #fff;
          box-shadow: 0 10px 24px rgba(0,0,0,.12);
        }
        .profile-card{
          border: none;
          border-radius: 1rem;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
        }
        .image-wrap{
          width: 140px; height: 140px; border-radius: 999px;
          overflow: hidden; background: rgba(255,255,255,.2);
          display:flex; align-items:center; justify-content:center;
          border: 2px solid rgba(255,255,255,.35);
        }
        .image-wrap img{ width:100%; height:100%; object-fit: cover; }
        .image-fallback{
          font-size: 48px; font-weight: 700; color:#fff;
        }
        .btn-gradient{
          background: linear-gradient(120deg, var(--g2), var(--g3));
          color: #fff; border: none;
        }
        .btn-gradient:hover{ filter: brightness(1.05); }
        .label-sm{ font-size:.9rem; color:#6b7280; }
        .value-lg{ font-size: 1.05rem; font-weight: 600; color:#111827; }
        .pill-role{
          display:inline-block; padding:.35rem .65rem;
          border-radius:999px; background:rgba(255,255,255,.25); color:#fff; 
          border:1px solid rgba(255,255,255,.35);
        }
        .form-control, .form-select{
          border-radius:.75rem;
        }
      `}</style>
      <div className="profile-banner mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="image-wrap">
            {user.serviceImage ? (
              <img src={user.serviceImage} alt="image" />
            ) : (
              <div className="image-fallback">
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="m-0">
              {user.firstName || "-"} {user.lastName || "-"}
            </h2>
            <div className="mt-1">
              <span className="pill-role">{user.role || "ตำแหน่ง - "}</span>
            </div>
          </div>
          <div className="ms-auto d-flex gap-2">
            {!isEditing ? (
              <button
                className="btn btn-gradient"
                onClick={() => setIsEditing(true)}
              >
                แก้ไขข้อมูล
              </button>
            ) : (
              <>
                <button
                  className="btn btn-outline-light"
                  onClick={() => setIsEditing(false)}
                >
                  ยกเลิก
                </button>
                <button className="btn btn-gradient" onClick={onSave}>
                  บันทึก
                </button>
              </>
            )}
          </div>
        </div>
        {/* {saved && <div className="mt-2 small">✅ บันทึกข้อมูลเรียบร้อย</div>} */}
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card profile-card p-3">
            <h5 className="mb-3">รูปภาพผู้ใช้งาน</h5>
            <div className="d-flex flex-column align-items-center gap-3">
              <div className="image-wrap" style={{ width: 180, height: 180 }}>
                {user.serviceImage ? (
                  <img src={user.serviceImage} alt="image" />
                ) : (
                  <div className="image-fallback">
                    {(user.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="w-100">
                <label className="form-label">อัปโหลดรูปใหม่</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  disabled={!isEditing}
                  onChange={(e) => onPickImage(e.target.files?.[0])}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card profile-card p-3">
            <h5 className="mb-3">ข้อมูลผู้ใช้งาน</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">ชื่อ (First name)</label>
                <input
                  className="form-control"
                  value={user.firstName}
                  disabled={!isEditing}
                  onChange={(e) => onChange("firstName", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">นามสกุล (Last name)</label>
                <input
                  className="form-control"
                  value={user.lastName}
                  disabled={!isEditing}
                  onChange={(e) => onChange("lastName", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">รหัสพนักงาน</label>
                <input
                  className="form-control"
                  value={user.serviceID}
                  disabled={!isEditing}
                  onChange={(e) => onChange("serviceID", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">ตำแหน่ง</label>
                <input
                  className="form-control"
                  value={user.role}
                  disabled={!isEditing}
                  onChange={(e) => onChange("role", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">วันเกิด</label>
                <input
                  type="date"
                  className="form-control"
                  value={user.birthDate ? dayjs(user.birthDate).format("YYYY-MM-DD") : ""}
                  disabled={!isEditing}
                  onChange={(e) => onChange("birthDate", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">อายุ</label>
                <input className="form-control" value={age || ""} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  value={user.username}
                  disabled={!isEditing}
                  onChange={(e) => onChange("username", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={user.email}
                  disabled={!isEditing}
                  onChange={(e) => onChange("email", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Line ID</label>
                <input
                  className="form-control"
                  value={user.lineId}
                  disabled={!isEditing}
                  onChange={(e) => onChange("lineId", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">เบอร์โทร</label>
                <input
                  className="form-control"
                  value={user.phone}
                  disabled={!isEditing}
                  onChange={(e) => onChange("phone", e.target.value)}
                />
              </div>
            </div>
            {isEditing && (
              <div className="mt-3 d-flex justify-content-end gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  ยกเลิก
                </button>
                <button className="btn btn-gradient" onClick={onSave}>
                  บันทึก
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

