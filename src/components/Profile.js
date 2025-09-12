import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";

const DEFAULT_USER = {
  firstName: "",
  lastName: "",
  employeeId: "",
  birthDate: "", // YYYY-MM-DD
  username: "",
  email: "",
  lineId: "",
  phone: "",
  position: "",
  avatar: "", // base64 dataURL
};

export default function Profile() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จาก API
  const getData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:5000/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // อัปเดต state ด้วยข้อมูลที่ได้จาก API
      const userFromApi = res.data;
      setUser((prev) => ({
        ...prev,
        firstName: userFromApi.firstName || userFromApi.name || prev.firstName,
        lastName: userFromApi.lastName || userFromApi.surname || prev.lastName,
        employeeId:
          userFromApi.employeeId || userFromApi.empId || prev.employeeId,
        birthDate: userFromApi.birthDate || userFromApi.dob || prev.birthDate,
        username: userFromApi.username || prev.username,
        email: userFromApi.email || prev.email,
        lineId: userFromApi.lineId || userFromApi.line || prev.lineId,
        phone:
          userFromApi.phone ||
          userFromApi.tel ||
          userFromApi.mobile ||
          prev.phone,
        position: userFromApi.position || userFromApi.role || prev.position,
        avatar: userFromApi.avatar || prev.avatar,
      }));
    } catch (error) {
      console.error("Failed to fetch user data from API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // โค้ดเดิมที่ดึงจาก localStorage
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser((prev) => ({
          ...prev,
          firstName: parsed.firstName || parsed.name || prev.firstName,
          lastName: parsed.lastName || parsed.surname || prev.lastName,
          employeeId: parsed.employeeId || parsed.empId || prev.employeeId,
          birthDate: parsed.birthDate || parsed.dob || prev.birthDate,
          username: parsed.username || prev.username,
          email: parsed.email || prev.email,
          lineId: parsed.lineId || parsed.line || prev.lineId,
          phone: parsed.phone || parsed.tel || parsed.mobile || prev.phone,
          position: parsed.position || parsed.role || prev.position,
          avatar: parsed.avatar || prev.avatar,
        }));
      } catch (e) {
        console.error("Failed to parse user data from localStorage:", e);
      }
    }

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

  const onPickAvatar = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange("avatar", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    const next = { ...user };
    localStorage.setItem("user", JSON.stringify(next));
    if (next.username) {
      localStorage.setItem("username", next.username);
    }
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        .avatar-wrap{
          width: 140px; height: 140px; border-radius: 999px;
          overflow: hidden; background: rgba(255,255,255,.2);
          display:flex; align-items:center; justify-content:center;
          border: 2px solid rgba(255,255,255,.35);
        }
        .avatar-wrap img{ width:100%; height:100%; object-fit: cover; }
        .avatar-fallback{
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
          <div className="avatar-wrap">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" />
            ) : (
              <div className="avatar-fallback">
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="m-0">
              {user.firstName || "-"} {user.lastName || "-"}
            </h2>
            <div className="mt-1">
              <span className="pill-role">{user.position || "ตำแหน่ง - "}</span>
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
                  onClick={() => {
                    setIsEditing(false);
                  }}
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
        {saved && <div className="mt-2 small">✅ บันทึกข้อมูลเรียบร้อย</div>}
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card profile-card p-3">
            <h5 className="mb-3">รูปภาพผู้ใช้งาน</h5>
            <div className="d-flex flex-column align-items-center gap-3">
              <div className="avatar-wrap" style={{ width: 180, height: 180 }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" />
                ) : (
                  <div className="avatar-fallback">
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
                  onChange={(e) => onPickAvatar(e.target.files?.[0])}
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
                  value={user.employeeId}
                  disabled={!isEditing}
                  onChange={(e) => onChange("employeeId", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">ตำแหน่ง</label>
                <input
                  className="form-control"
                  value={user.position}
                  disabled={!isEditing}
                  onChange={(e) => onChange("position", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">วันเกิด</label>
                <input
                  type="date"
                  className="form-control"
                  value={user.birthDate || ""}
                  disabled={!isEditing}
                  onChange={(e) => onChange("birthDate", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">อายุ </label>
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

// // src/pages/ProfilePage.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import dayjs from "dayjs";

// const DEFAULT_USER = {
//   firstName: "",
//   lastName: "",
//   employeeId: "",
//   birthDate: "", // YYYY-MM-DD
//   username: "",
//   email: "",
//   lineId: "",
//   phone: "",
//   position: "",
//   avatar: "", // base64 dataURL
// };

// export default function Profile() {
//   const [user, setUser] = useState(DEFAULT_USER);
//   const [isEditing, setIsEditing] = useState(false);
//   const [saved, setSaved] = useState(false);

//   useEffect(() => {
//     // ดึงจาก localStorage.user (และ mapping ค่าที่อาจมีชื่อคีย์ต่างกัน)
//     const raw = localStorage.getItem("user");
//     if (raw) {
//       try {
//         const parsed = JSON.parse(raw);
//         setUser((prev) => ({
//           ...prev,
//           firstName: parsed.firstName || parsed.name || prev.firstName,
//           lastName: parsed.lastName || parsed.surname || prev.lastName,
//           employeeId: parsed.employeeId || parsed.empId || prev.employeeId,
//           birthDate: parsed.birthDate || parsed.dob || prev.birthDate,
//           username:
//             parsed.username ||
//             localStorage.getItem("username") ||
//             prev.username,
//           email: parsed.email || prev.email,
//           lineId: parsed.lineId || parsed.line || prev.lineId,
//           phone: parsed.phone || parsed.tel || parsed.mobile || prev.phone,
//           position: parsed.position || parsed.role || prev.position,
//           avatar: parsed.avatar || prev.avatar,
//         }));
//       } catch (e) {
//         // ถ้า parse ไม่ได้ ก็ปล่อย DEFAULT
//       }
//     } else {
//       // เผื่อมี username แยกเก็บไว้
//       setUser((prev) => ({
//         ...prev,
//         username:
//           localStorage.getItem("username") ||
//           sessionStorage.getItem("username") ||
//           prev.username,
//       }));
//     }
//   }, []);

//   const age = useMemo(() => {
//     if (!user.birthDate) return "";
//     const b = dayjs(user.birthDate);
//     if (!b.isValid()) return "";
//     return dayjs().diff(b, "year");
//   }, [user.birthDate]);

//   const onChange = (key, val) => {
//     setUser((u) => ({ ...u, [key]: val }));
//   };

//   const onPickAvatar = (file) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       onChange("avatar", reader.result); // base64
//     };
//     reader.readAsDataURL(file);
//   };

//   const onSave = () => {
//     // sync กลับไปที่ localStorage.user + username แยก
//     const next = { ...user };
//     localStorage.setItem("user", JSON.stringify(next));
//     if (next.username) {
//       localStorage.setItem("username", next.username);
//     }
//     setIsEditing(false);
//     setSaved(true);
//     setTimeout(() => setSaved(false), 2000);
//   };

//   return (
//     <div className="container py-4">
//       <style>{`
//         :root{
//           --g1:#312e81; /* indigo-900 */
//           --g2:#0e7490; /* cyan-700  */
//           --g3:#166534; /* emerald-800 */
//         }
//         @keyframes bannerGradient{
//           0%{ background-position: 0% 50%; }
//           50%{ background-position: 100% 50%; }
//           100%{ background-position: 0% 50%; }
//         }
//         .profile-banner{
//           background: linear-gradient(120deg, var(--g1), var(--g2), var(--g3));
//           background-size: 300% 300%;
//           animation: bannerGradient 14s ease infinite;
//           border-radius: 1rem;
//           padding: 1.25rem;
//           color: #fff;
//           box-shadow: 0 10px 24px rgba(0,0,0,.12);
//         }
//         .profile-card{
//           border: none;
//           border-radius: 1rem;
//           box-shadow: 0 6px 18px rgba(0,0,0,.08);
//         }
//         .avatar-wrap{
//           width: 140px; height: 140px; border-radius: 999px;
//           overflow: hidden; background: rgba(255,255,255,.2);
//           display:flex; align-items:center; justify-content:center;
//           border: 2px solid rgba(255,255,255,.35);
//         }
//         .avatar-wrap img{ width:100%; height:100%; object-fit: cover; }
//         .avatar-fallback{
//           font-size: 48px; font-weight: 700; color:#fff;
//         }
//         .btn-gradient{
//           background: linear-gradient(120deg, var(--g2), var(--g3));
//           color: #fff; border: none;
//         }
//         .btn-gradient:hover{ filter: brightness(1.05); }
//         .label-sm{ font-size:.9rem; color:#6b7280; } /* gray-500 */
//         .value-lg{ font-size: 1.05rem; font-weight: 600; color:#111827; } /* gray-900 */
//         .pill-role{
//           display:inline-block; padding:.35rem .65rem;
//           border-radius:999px; background:rgba(255,255,255,.25); color:#fff;
//           border:1px solid rgba(255,255,255,.35);
//         }
//         .form-control, .form-select{
//           border-radius:.75rem;
//         }
//       `}</style>

//       {/* Banner */}
//       <div className="profile-banner mb-4">
//         <div className="d-flex align-items-center gap-3">
//           <div className="avatar-wrap">
//             {user.avatar ? (
//               <img src={user.avatar} alt="avatar" />
//             ) : (
//               <div className="avatar-fallback">
//                 {(user.username || "U").charAt(0).toUpperCase()}
//               </div>
//             )}
//           </div>
//           <div>
//             <h2 className="m-0">
//               {user.firstName || "-"} {user.lastName || "-"}
//             </h2>
//             <div className="mt-1">
//               <span className="pill-role">{user.position || "ตำแหน่ง - "}</span>
//             </div>
//           </div>
//           <div className="ms-auto d-flex gap-2">
//             {!isEditing ? (
//               <button
//                 className="btn btn-gradient"
//                 onClick={() => setIsEditing(true)}
//               >
//                 แก้ไขข้อมูล
//               </button>
//             ) : (
//               <>
//                 <button
//                   className="btn btn-outline-light"
//                   onClick={() => {
//                     setIsEditing(false); /* ยกเลิก */
//                   }}
//                 >
//                   ยกเลิก
//                 </button>
//                 <button className="btn btn-gradient" onClick={onSave}>
//                   บันทึก
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//         {saved && <div className="mt-2 small">✅ บันทึกข้อมูลเรียบร้อย</div>}
//       </div>

//       {/* Content */}
//       <div className="row g-4">
//         {/* ซ้าย: เปลี่ยนรูป */}
//         <div className="col-lg-4">
//           <div className="card profile-card p-3">
//             <h5 className="mb-3">รูปภาพผู้ใช้งาน</h5>
//             <div className="d-flex flex-column align-items-center gap-3">
//               <div className="avatar-wrap" style={{ width: 180, height: 180 }}>
//                 {user.avatar ? (
//                   <img src={user.avatar} alt="avatar" />
//                 ) : (
//                   <div className="avatar-fallback">
//                     {(user.username || "U").charAt(0).toUpperCase()}
//                   </div>
//                 )}
//               </div>
//               <div className="w-100">
//                 <label className="form-label">อัปโหลดรูปใหม่</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="form-control"
//                   disabled={!isEditing}
//                   onChange={(e) => onPickAvatar(e.target.files?.[0])}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ขวา: รายละเอียด */}
//         <div className="col-lg-8">
//           <div className="card profile-card p-3">
//             <h5 className="mb-3">ข้อมูลผู้ใช้งาน</h5>

//             <div className="row g-3">
//               <div className="col-md-6">
//                 <label className="form-label">ชื่อ (First name)</label>
//                 <input
//                   className="form-control"
//                   value={user.firstName}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("firstName", e.target.value)}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">นามสกุล (Last name)</label>
//                 <input
//                   className="form-control"
//                   value={user.lastName}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("lastName", e.target.value)}
//                 />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">รหัสพนักงาน</label>
//                 <input
//                   className="form-control"
//                   value={user.employeeId}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("employeeId", e.target.value)}
//                 />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">ตำแหน่ง</label>
//                 <input
//                   className="form-control"
//                   value={user.position}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("position", e.target.value)}
//                 />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">วันเกิด</label>
//                 <input
//                   type="date"
//                   className="form-control"
//                   value={user.birthDate || ""}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("birthDate", e.target.value)}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">อายุ </label>
//                 <input className="form-control" value={age || ""} disabled />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">Username</label>
//                 <input
//                   className="form-control"
//                   value={user.username}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("username", e.target.value)}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Email</label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   value={user.email}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("email", e.target.value)}
//                 />
//               </div>

//               <div className="col-md-6">
//                 <label className="form-label">Line ID</label>
//                 <input
//                   className="form-control"
//                   value={user.lineId}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("lineId", e.target.value)}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">เบอร์โทร</label>
//                 <input
//                   className="form-control"
//                   value={user.phone}
//                   disabled={!isEditing}
//                   onChange={(e) => onChange("phone", e.target.value)}
//                 />
//               </div>
//             </div>

//             {isEditing && (
//               <div className="mt-3 d-flex justify-content-end gap-2">
//                 <button
//                   className="btn btn-outline-secondary"
//                   onClick={() => setIsEditing(false)}
//                 >
//                   ยกเลิก
//                 </button>
//                 <button className="btn btn-gradient" onClick={onSave}>
//                   บันทึก
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
