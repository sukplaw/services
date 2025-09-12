import React from "react";
import { Table, Tag, Input, Form } from "antd";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Backlogs() {
  const [data, setData] = useState([]);
  const [searchData, setSearchData] = useState("");
  const navigate = useNavigate();

  const getData = () => {
    const url = "http://localhost:3302/get-job";
    axios
      .get(url)
      .then((response) => {
        setData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  // ---------- Helpers สำหรับ progress ----------
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const daysBetween = (a, b) => {
    const ms = b.getTime() - a.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };

  // คืนค่า: { percentRemaining(0-100), remainingDays, colorClass, labelText }
  const computeTimeProgress = (createAtISO, expectedISO) => {
    const now = new Date();
    const start = new Date(createAtISO); // วันที่เปิดงาน
    const end = new Date(expectedISO); // กำหนดเสร็จ

    // กัน edge case
    const totalMs = Math.max(1, end.getTime() - start.getTime());
    const remainingDays = daysBetween(now, end); // เหลืออีกกี่วัน (ติดลบ = เลยกำหนด)

    // เปอร์เซ็นต์ “เวลาที่เหลือ” แบบนับถอยหลัง
    let percentRemaining = ((end.getTime() - now.getTime()) / totalMs) * 100;

    // กรณีหมดเวลา/เลยกำหนด = เต็มหลอด 100%
    if (remainingDays <= 0) {
      percentRemaining = 100;
    } else {
      percentRemaining = clamp(Math.round(percentRemaining), 0, 100);
    }

    // สีแถบตามช่วงวัน
    let colorClass = "bg-success"; // เหลือเยอะ
    if (remainingDays <= 5 && remainingDays >= 3) {
      colorClass = "bg-warning"; // ใกล้ครบกำหนด
    }
    if (remainingDays <= 2 && remainingDays > 0) {
      colorClass = "bg-danger"; // เร่งด่วนมาก
    }
    if (remainingDays <= 0) {
      colorClass = "bg-maroon"; // หมดเวลา/เลยกำหนด
    }

    const labelText =
      remainingDays < 0
        ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
        : remainingDays === 0
        ? "ครบเวลาดำเนินการ"
        : `${remainingDays} วัน`;

    return { percentRemaining, remainingDays, colorClass, labelText };
  };
  // ------------------------------------------------

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "job",
      key: "job",
      align: "center",
      render: (text, record, index) => index + 1,
      responsive: ["sm"],
    },
    {
      title: "เลขงาน",
      dataIndex: "jobRef",
      key: "jobRef",
      align: "center",
      sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
      responsive: ["xs", "sm", "md"],
    },
    {
      title: "สินค้า",
      dataIndex: "product_name",
      key: "product_name",
      align: "center",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      responsive: ["md"],
    },
    {
      title: "Serial Number",
      dataIndex: "serialNumber",
      key: "serialNumber",
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      align: "center",
      responsive: ["md"],
    },
    {
      title: "ชื่อลูกค้า",
      dataIndex: "username",
      key: "username",
      align: "center",
      responsive: ["md"],
    },
    {
      title: "ชื่อผู้เปิดงาน",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
      responsive: ["md"],
    },
    {
      title: "สถานะ",
      key: "jobStatus",
      dataIndex: "jobStatus",
      align: "center",
      render: (status) => {
        let color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
      responsive: ["md"],
    },
    {
      title: "วันที่เปิดงาน",
      dataIndex: "createAt",
      key: "createAt",
      align: "center",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
      responsive: ["md"],
    },
    {
      title: "ระยะเวลาที่ดำเนินการคงเหลือ",
      dataIndex: "remainingTime",
      key: "remainingTime",
      align: "center",
      sorter: (a, b) => a.remainingTime - b.remainingTime,
      defaultSortOrder: "ascend",
      responsive: ["md"],
      render: (text, record) => {
        const { percentRemaining, colorClass, labelText } = computeTimeProgress(
          record.createAt,
          record.expected_completion_date
        );

        return (
          <div>
            <div
              className="progress"
              style={{ height: "20px", borderRadius: "10px" }}
            >
              {/* ปรับขนาดตัวอักษรของข้อความในแถบ Progress Bar */}
              <div
                className={`progress-bar ${colorClass}`}
                role="progressbar"
                style={{
                  width: `${percentRemaining}%`,
                  transition: "width 0.6s ease",
                  fontSize: '0.8rem'
                }}
                aria-valuenow={percentRemaining}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {labelText}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "วันที่แก้ไขสถานะล่าสุด",
      dataIndex: "updateAt",
      key: "updateAt",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
      responsive: ["md"],
    },
    {
      title: "ผู้แก้ไขสถานะล่าสุด",
      dataIndex: "updatedBy",
      key: "updatedBy",
      responsive: ["md"],
      align: "center",
    },
  ];

  // * คง logic เดิมไว้ตามที่ขอ *
  const countRemainingTimeWarning = (data) => {
    return data
      .filter((item) => {
        const updateAt = new Date(item.expected_completion_date);
        const createAt = new Date();
        const remainingTimeInMilliseconds =
          updateAt.getTime() - createAt.getTime();
        const remainingTimeInDays = Math.floor(
          remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
        );
        return remainingTimeInDays <= 2;
      })
      .map((item) => {
        const updateAt = new Date(item.expected_completion_date);
        const createAt = new Date();
        const remainingTimeInMilliseconds =
          updateAt.getTime() - createAt.getTime();
        const remainingTimeInDays = Math.floor(
          remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
        );
        return {
          ...item,
          remainingTime: remainingTimeInDays,
        };
      });
  };

  const handleClick = (record) => {
    navigate(`/show-job/${record.jobRef}`);
  };

  const handleSearch = (e) => {
    setSearchData(e.target.value);
  };

  const filterData = data.filter((item) => {
    const searchableFields = [
      "jobRef",
      "product_name",
      "serialNumber",
      "sku",
      "username",
      "createdBy",
      "jobStatus",
      "createAt",
      "remainingTime",
      "updateAt",
      "updatedBy",
    ];
    const matchesSearch = searchableFields.some((field) => {
      const fieldValue = item[field];
      return (
        typeof fieldValue === "string" &&
        fieldValue.toLowerCase().includes(searchData.toLowerCase())
      );
    });
    return matchesSearch;
  });

  return (
    <div className="contain-main">
      {/* เพิ่ม CSS เพื่อปรับขนาดตัวอักษรของตารางและทำให้เคอร์เซอร์เป็นไอคอนมือ */}
      <style>{`
        .bg-maroon {
          background-color: #800000 !important;
        }
        .ant-table-thead > tr > th {
          font-size: 1.1rem !important; /* ขนาดฟอนต์สำหรับหัวข้อตาราง */
        }
        .ant-table-tbody > tr > td {
          font-size: 1rem !important; /* ขนาดฟอนต์สำหรับข้อมูลในตาราง */
        }
        .clickable-row {
            cursor: pointer;
        }
      `}</style>

      <div
        style={{
          overflowX: "auto",
          maxWidth: "100%",
          padding: "0 10px",
          boxSizing: "border-box",
        }}
      >
        {/* ปรับขนาดตัวอักษรของหัวข้อ */}
        <h1 className="text-danger mb-4 mt-5 text-center" style={{ fontSize: '2rem' }}>
          แจ้งเตือนสถานะงานที่คงค้าง
        </h1>
        <div className="d-flex justify-content-end">
          <Form.Item
            name="Input"
            rules={[{ required: true, message: "Please input!" }]}
          >
            {/* ปรับขนาดตัวอักษรในแถบ Input และแทนที่ icon */}
            <Input
              value={searchData}
              onChange={handleSearch}
              prefix={<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>}
              placeholder="ค้นหางานที่ต้องการ"
              style={{
                width: "399px",
                height: "49px",
                backgroundColor: "#FFFFFF",
                borderColor: "#AAAAAAFF",
                color: "#CCCCCC",
                borderRadius: "20px",
                fontSize: "1rem",
              }}
            />
          </Form.Item>
        </div>
        {/* เพิ่ม className เพื่อให้ CSS ที่กำหนดไว้มีผล */}
        <Table
          dataSource={countRemainingTimeWarning(filterData)}
          columns={columns}
          rowKey={(r) => r.jobRef}
          onRow={(record) => {
            return {
              onClick: () => {
                handleClick(record);
              },
              className: 'clickable-row',
            };
          }}
          className="custom-table"
          style={{
            width: "100%",
            textAlign: "center",
          }}
        />
      </div>
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   Form,
//   Input,
//   Button,
//   Upload,
//   message,
//   Timeline,
//   Dropdown,
//   Menu,
//   Select,
// } from "antd";
// import axios from "axios";
// import Accordion from "react-bootstrap/Accordion";
// import {
//   MdOutlineDescription,
//   MdOutlineWorkOutline,
//   MdEdit,
//   MdArrowRight,
// } from "react-icons/md";
// // import { FaUpload, FaCheck, FaTimes } from "react-icons/fa6";
// import { IoMdPeople } from "react-icons/io";
// import { PiPackageFill } from "react-icons/pi";

// const { Dragger } = Upload;
// const { Option } = Select;

// export default function ShowDetail() {
//   const [data, setData] = useState([]);
//   const { jobRef } = useParams();
//   const [changedStatus, setChangedStatus] = useState({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [isEditingDetails, setIsEditingDetails] = useState(false);
//   const [isEditingStatus, setIsEditingStatus] = useState(false);
//   const [changedDetails, setChangedDetails] = useState({});

//   const getData = () => {
//     const url = `http://localhost:3302/get-detail/${jobRef}`;
//     axios
//       .get(url)
//       .then((response) => {
//         const responseData = Array.isArray(response.data)
//           ? response.data
//           : [response.data];
//         setData(responseData);
//         console.log(responseData);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setData([]);
//       });
//   };

//   const deleteData = (jobRef) => {
//     const url = `http://localhost:3302/delete-job/${jobRef}`;
//     axios
//       .delete(url)
//       .then((res) => {
//         message.success("ข้อมูลถูกลบเรียบร้อยแล้ว");
//         console.log(res.jobRef);
//       })
//       .catch((error) => {
//         message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
//         console.error("Error deleting job:", error);
//       });
//   };

//   useEffect(() => {
//     getData();
//   }, [jobRef]);

//   // Rest of your functions (formatDate, countRemainingTime, etc.) remain here.
//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const seconds = String(date.getSeconds()).padStart(2, "0");
//     return `วันที่: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   };

//   const timelineItems = (
//     data.length > 0
//       ? [
//           "เริ่มงาน",
//           "สั่งอะไหล่",
//           "ซ่อมเสร็จ",
//           "รอทดสอบ",
//           "รอจัดส่ง",
//           "จัดส่งแล้ว",
//         ]
//       : []
//   ).map((status) => {
//     const item = data.find((d) => d.jobStatus === status);

//     return {
//       label: item ? formatDate(item.updateAt) : status,
//       children: item ? (
//         <div>
//           <p className="font-semibold text-lg text-blue-600">
//             {item.jobStatus}
//           </p>
//           <p className="text-muted">
//             โดย: {item.customer_firstname} {item.customer_lastname}
//           </p>
//         </div>
//       ) : null,
//     };
//   });

//   const countRemainingTime = (data) => {
//     if (!data || data.length === 0) {
//       return [];
//     }
//     const currentDate = new Date();
//     return data.map((item) => {
//       const completionDate = new Date(item.expected_completion_date);
//       const remainingTimeInDays = Math.floor(
//         (completionDate.getTime() - currentDate.getTime()) /
//           (1000 * 60 * 60 * 24)
//       );
//       return {
//         ...item,
//         remainingTime: remainingTimeInDays,
//       };
//     });
//   };

//   const warningJob = countRemainingTime(data);

//   // New state and handlers for detail and status editing
//   const handleEditDetails = () => {
//     setIsEditing(true);
//     setIsEditingDetails(true);
//     setChangedDetails(data.length > 0 ? { ...data[0] } : {});
//   };

//   const handleEditStatus = () => {
//     setIsEditing(true);
//     setIsEditingStatus(true);
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     setIsEditingDetails(false);
//     setIsEditingStatus(false);
//     setChangedDetails({});
//     setChangedStatus({});
//   };

//   const handleDetailChange = (e, field) => {
//     const { value } = e.target;
//     setChangedDetails((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleConfirmDetails = async () => {
//     try {
//       if (Object.keys(changedDetails).length > 0 && data.length > 0) {
//         await axios.put(
//           `http://localhost:3302/update-details/${jobRef}`,
//           changedDetails
//         );
//         message.success("ข้อมูลรายละเอียดถูกอัปเดตเรียบร้อยแล้ว");
//         await getData(); // Fetch the new data
//         handleCancelEdit();
//       }
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตรายละเอียด");
//       console.error("Failed to update details:", error);
//     }
//   };

//   const handleStatusChange = (newStatus) => {
//     if (data.length > 0) {
//       const currentJobRef = data[0].jobRef;
//       setChangedStatus({
//         [currentJobRef]: newStatus,
//       });
//     }
//   };

//   const handleConfirmStatus = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((currentJobRef) => {
//         const newStatus = changedStatus[currentJobRef];
//         return axios.put(
//           `http://localhost:3302/update-status/${currentJobRef}`,
//           {
//             jobStatus: newStatus,
//           }
//         );
//       });
//       await Promise.all(updatePromises);
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       handleCancelEdit();
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       console.error("Failed to update status:", error);
//     }
//   };

//   // Ant Design Dropdown Menu Items
//   const dropdownMenuItems = (
//     <Menu>
//       <Menu.Item key="1">
//         <a onClick={handleEditDetails}>แก้ไขข้อมูลลูกค้า</a>
//       </Menu.Item>
//       <Menu.Item key="2">
//         <a onClick={handleEditDetails}>แก้ไขข้อมูลสินค้า</a>
//       </Menu.Item>
//     </Menu>
//   );

//   const statusMenuItems = (
//     <Menu onClick={(e) => handleStatusChange(e.key)}>
//       <Menu.Item key="สั่งอะไหล่">สั่งอะไหล่</Menu.Item>
//       <Menu.Item key="ซ่อมสำเร็จ">ซ่อมสำเร็จ</Menu.Item>
//       <Menu.Item key="รอทดสอบ">รอทดสอบ</Menu.Item>
//       <Menu.Item key="รอจัดส่ง">รอจัดส่ง</Menu.Item>
//       <Menu.Item key="จัดส่งสำเร็จ">จัดส่งสำเร็จ</Menu.Item>
//       <Menu.Item key="ยกเลิกการเคลมสินค้า">ยกเลิกการเคลมสินค้า</Menu.Item>
//     </Menu>
//   );

//   const editMenu = (
//     <Menu>
//       <Menu.Item key="details" onClick={handleEditDetails}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           แก้ไขรายละเอียดงาน <MdArrowRight style={{ marginLeft: "auto" }} />
//         </div>
//       </Menu.Item>
//       <Menu.Item key="status">
//         <Dropdown overlay={statusMenuItems} trigger={["hover"]}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             แก้ไขสถานะงาน <MdArrowRight style={{ marginLeft: "auto" }} />
//           </div>
//         </Dropdown>
//       </Menu.Item>
//     </Menu>
//   );

//   // Conditionally render the input fields
//   const renderInput = (field, label, type = "text") => {
//     if (!data.length) return null;
//     if (isEditingDetails) {
//       return (
//         <>
//           <p className="mt-4">
//             <strong>{label}</strong>
//           </p>
//           <Input
//             value={changedDetails[field] || data[0][field]}
//             onChange={(e) => handleDetailChange(e, field)}
//           />
//         </>
//       );
//     } else {
//       return (
//         <>
//           <p className="mt-4">
//             <strong>{label}</strong>
//           </p>
//           <p>{data[0][field]}</p>
//         </>
//       );
//     }
//   };

//   return (
//     <div className="d-flex flex-row">
//       <div className="contain-job">
//         {warningJob.length > 0 && (
//           <div className="d-flex align-items-center job-header mb-4 mt-5">
//             <h1 className="me-5">{warningJob[0].jobRef}</h1>
//             <h2
//               className="me-3"
//               style={warningJob[0].remainingTime < 0 ? { color: "red" } : {}}
//             >
//               {warningJob[0].remainingTime > 0
//                 ? `ระยะเวลาที่คงเหลือ ${warningJob[0].remainingTime} วัน`
//                 : warningJob[0].remainingTime === 0
//                 ? "ไม่เหลือเวลา"
//                 : `เกินระยะเวลาที่กำหนด ${Math.abs(
//                     warningJob[0].remainingTime
//                   )} วัน`}
//             </h2>
//           </div>
//         )}
//         <Accordion defaultActiveKey="0">
//           <Accordion.Item eventKey="0" className="accordion-item">
//             <Accordion.Header className="accordion-header">
//               <IoMdPeople className="me-4 accordion-icon" />
//               ข้อมูลลูกค้า
//             </Accordion.Header>
//             <Accordion.Body>
//               {data.length > 0 && (
//                 <div className="product-details row">
//                   <div className="col-6">
//                     {renderInput("customer_firstname", "ชื่อ")}
//                     {renderInput("customer_old", "อายุ")}
//                     {renderInput("username", "Username")}
//                     {renderInput("line_id", "Line ID")}
//                     {renderInput("address", "ที่อยู่")}
//                   </div>
//                   <div className="col-6">
//                     {renderInput("customer_lastname", "นามสกุล")}
//                     {renderInput("email", "Email")}
//                     {renderInput("customer_contact", "ช่องทางติดต่อ")}
//                     {renderInput("phone", "เบอร์โทรศัพท์")}
//                   </div>
//                 </div>
//               )}
//             </Accordion.Body>
//           </Accordion.Item>
//           <Accordion.Item eventKey="1" className="accordion-item">
//             <Accordion.Header className="accordion-header">
//               <PiPackageFill className="me-4 accordion-icon" />
//               ข้อมูลสินค้า
//             </Accordion.Header>
//             <Accordion.Body>
//               {data.length > 0 && (
//                 <div className="product-details row">
//                   <div className="col-6">
//                     {renderInput("serialNumber", "Serial Number")}
//                     {renderInput("brand", "Brand")}
//                     {renderInput("unit", "จำนวนสินค้าที่ซ่อม")}
//                     {renderInput("description", "รายละเอียดสินค้า")}
//                     {renderInput("createAt", "วันที่เปิดซ่อม")}
//                   </div>
//                   <div className="col-6">
//                     {renderInput("product_name", "ชื่อสินค้า")}
//                     {renderInput("sku", "SKU")}
//                     {renderInput("category", "ประเภทสินค้า")}
//                     {renderInput("pcs", "หน่วย")}
//                     <p className="mt-4">
//                       <strong>รูปภาพสินค้า</strong>
//                     </p>
//                     <img
//                       src={data[0].image}
//                       alt="Image from server"
//                       className="image-show-detail"
//                     />
//                   </div>
//                 </div>
//               )}
//             </Accordion.Body>
//           </Accordion.Item>
//         </Accordion>
//         {isEditingDetails && (
//           <div className="d-flex justify-content-center gap-3 mt-4">
//             <Button
//               type="primary"
//               // icon={<FaCheck />}
//               onClick={handleConfirmDetails}
//             >
//               ยืนยัน
//             </Button>
//             <Button
//               type="default"
//               // icon={<FaTimes />}
//               onClick={handleCancelEdit}
//             >
//               ยกเลิก
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Timeline and Status */}
//       <div className="contain-status">
//         <h1 className="text-center mb-5 mt-5">สถานะ</h1>
//         <div>
//           <Timeline mode={"left"} items={timelineItems} />
//         </div>

//         <div className="d-flex justify-content-center gap-3 mt-2 mb-2">
//           {isEditingStatus ? (
//             <>
//               <div className="w-100">
//                 <Select
//                   placeholder="เลือกสถานะใหม่"
//                   style={{ width: "100%" }}
//                   onChange={handleStatusChange}
//                 >
//                   {[
//                     "สั่งอะไหล่",
//                     "ซ่อมสำเร็จ",
//                     "รอทดสอบ",
//                     "รอจัดส่ง",
//                     "จัดส่งสำเร็จ",
//                     "ยกเลิกการเคลมสินค้า",
//                   ].map((status) => (
//                     <Option key={status} value={status}>
//                       {status}
//                     </Option>
//                   ))}
//                 </Select>
//               </div>
//               <Button
//                 type="primary"
//                 // icon={<FaCheck />}
//                 onClick={handleConfirmStatus}
//                 disabled={Object.keys(changedStatus).length === 0}
//               >
//                 ยืนยัน
//               </Button>
//               <Button
//                 type="default"
//                 // icon={<FaTimes />}
//                 onClick={handleCancelEdit}
//               >
//                 ยกเลิก
//               </Button>
//             </>
//           ) : (
//             <>
//               <Dropdown overlay={editMenu} trigger={["hover"]}>
//                 <Button className="btn-showData-Edit" icon={<MdEdit />}>
//                   แก้ไขงาน
//                 </Button>
//               </Dropdown>
//               <Button
//                 type="danger"
//                 className="btn-showData-delete"
//                 onClick={() => deleteData(jobRef)}
//               >
//                 ลบข้อมูล
//               </Button>
//             </>
//           )}
//         </div>
//         <div className="d-grid justify-content-center">
//           <button className="btn-exportData">Export Data</button>
//         </div>
//       </div>
//     </div>
//   );
// }
//   const [warningCount, setWarningCount] = useState(5);
//   return warningCount;
// };

// // Component สำหรับ Layout ที่มีการป้องกัน
// const ProtectedLayout = () => {
//   const warningCount = useMockWarningCount();

//   return (
//     <div
//       className="d-flex"
//       style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}
//     >
//       <Sidebar />
//       <div
//         className="flex-grow-1 d-flex flex-column"
//         style={{ paddingLeft: "250px" }}
//       >
//         <WarningContext.Provider value={warningCount}>
//           <Navbar />
//           {/* Outlet จะแสดง Component ที่ถูกเรียกใน Route ย่อย */}
//           <Outlet />
//         </WarningContext.Provider>
//       </div>
//     </div>
//   );
// };

// export default function App() {
//   return (
//     <LoadingProvider>
//       <Routes>
//         {/* Public Route: ทุกคนเข้าถึงได้ */}
//         <Route path="/" element={<Login />} />
//         <Route path="/unauthorized" element={<UnauthorizedPage />} />

//         {/* Protected Routes: ต้องล็อกอินก่อนถึงจะเข้าได้ */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <ProtectedLayout />
//             </ProtectedRoute>
//           }
//         >
//           {/*
//             Route ย่อยเหล่านี้จะถูกแสดงผลใน <Outlet />
//             การป้องกันสิทธิ์เพิ่มเติมจะถูกใช้กับบาง Route โดยตรง
//           */}
//           <Route path="job" element={<Job />} />
//           <Route path="dashboard" element={<Dashboard />} />

//           {/* Route นี้ต้องมีสิทธิ์ "full_admin" เท่านั้นถึงจะเข้าได้ */}
//           <Route
//             path="create-product"
//             element={
//               <ProtectedRoute requiredPermission="full_admin">
//                 <CreateProductForm />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="create-job" element={<CreateJobForm />} />
//           <Route path="create-customer" element={<CreateCustomerForm />} />
//           <Route path="show-job/:jobRef" element={<ShowDetail />} />
//           <Route
//             path="jobs-by-status/:jobStatus"
//             element={<JobStatusTable />}
//           />

//           {/* แก้ไขให้มีการป้องกันสิทธิ์ด้วย ProtectedRoute */}
//           <Route
//             path="show-customer"
//             element={
//               <ProtectedRoute requiredPermission="editor">
//                 <Edit />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="show-home" element={<HomeTest />} />
//           <Route path="home" element={<Backlogs />} />
//           <Route path="test" element={<Customer />} />
//         </Route>
//       </Routes>
//     </LoadingProvider>
//   );
// }

// import ProtectedRoute from "./ProtectedRoute";
// // ... import อื่นๆ

// function App() {
//   // ... state, context
//   return (
//     <LoadingProvider>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         {/* ทุก Route ที่ต้องการการล็อกอินต้องถูกครอบด้วย ProtectedRoute */}
//         <Route
//           path="*"
//           element={
//             <ProtectedRoute>
//               <div
//                 className="d-flex"
//                 style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}
//               >
//                 <Sidebar />
//                 <div
//                   className="flex-grow-1 d-flex flex-column"
//                   style={{ paddingLeft: "250px" }}
//                 >
//                   <WarningContext.Provider value={warningCount}>
//                     <Navbar />
//                     <Routes>
//                       <Route path="/Job" element={<Job />} />
//                       <Route path="/dashboard" element={<Dashboard />} />
//                       {/* Route ที่ต้องการสิทธิ์ admin1 เท่านั้น */}
//                       <Route
//                         path="/create-product"
//                         element={
//                           <ProtectedRoute requiredPermission="full_admin">
//                             <CreateProductForm />
//                           </ProtectedRoute>
//                         }
//                       />
//                       <Route path="/create-job" element={<CreateJobForm />} />
//                       <Route
//                         path="/create-customer"
//                         element={<CreateCustomerForm />}
//                       />
//                       {/* ... Routes อื่นๆ */}
//                     </Routes>
//                   </WarningContext.Provider>
//                 </div>
//               </div>
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </LoadingProvider>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { Table, Button, Popconfirm, message, Space } from "antd";
// import axios from "axios";

// export default function JobTable() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Function to fetch data from the backend
//   const getData = async () => {
//     setLoading(true);
//     try {
//       const url = "http://localhost:3302/get-all-jobs"; // Example endpoint
//       const response = await axios.get(url);
//       setData(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       message.error("Failed to load data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   // Function to handle the delete operation
//   const handleDelete = (jobRef) => {
//     const url = `http://localhost:3302/delete-job/${jobRef}`;

//     axios
//       .delete(url)
//       .then((response) => {
//         message.success(response.data.message); // Show success message
//         getData(); // Refresh the table data after deletion
//       })
//       .catch((error) => {
//         console.error("Error deleting job:", error);
//         message.error("Failed to delete the job.");
//       });
//   };

//   // Define table columns
//   const columns = [
//     // ... other columns (e.g., jobRef, product_name, etc.)
//     {
//       title: "Action",
//       key: "action",
//       render: (text, record) => (
//         <Space size="middle">
//           <Popconfirm
//             title="Are you sure to delete this job?"
//             onConfirm={() => handleDelete(record.jobRef)}
//             okText="Yes"
//             cancelText="No"
//           >
//             <Button danger>Delete</Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <Table
//       columns={columns}
//       dataSource={data}
//       loading={loading}
//       rowKey="jobRef"
//     />
//   );
// }
// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import axios from "axios";
// import dayjs from "dayjs";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// dayjs.extend(isSameOrBefore);

// // นำเข้า Context ที่สร้างไว้
// import { WarningContext } from "./WarningContext";

// // นำเข้าคอมโพเนนต์หน้าต่างๆ
// import Dashboard from "./Dashboard";
// import Navbar from "./Navbar";
// // สมมติว่ามีหน้าอื่นๆ เช่น Home, JobPage
// import Home from "./Home";
// import JobPage from "./JobPage";

// function App() {
//   const [data, setData] = useState([]);
//   const [warningCount, setWarningCount] = useState(0);

//   const fetchData = async () => {
//     try {
//       const response = await axios.get("http://localhost:3302/get-dashboard");
//       setData(response.data);
//       // คำนวณจำนวนการแจ้งเตือนเมื่อได้ข้อมูลมา
//       countWarnings(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const countWarnings = (data) => {
//     if (!data || data.length === 0) {
//       setWarningCount(0);
//       return;
//     }

//     // กรองและนับเฉพาะรายการที่เหลือเวลาน้อยกว่าหรือเท่ากับ 2 วัน
//     const count = data.filter((item) => {
//       const expectedDate = dayjs(item.expected_completion_date);
//       const today = dayjs();
//       const remainingDays = expectedDate.diff(today, "day");
//       return remainingDays <= 2 && remainingDays >= 0;
//     }).length;

//     setWarningCount(count);
//   };

//   useEffect(() => {
//     fetchData();
//     // ดึงข้อมูลใหม่ทุก 1 นาที (60000 มิลลิวินาที)
//     const interval = setInterval(fetchData, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <Router>
//       {/* Provider จะส่งค่า warningCount ไปยังทุกคอมโพเนนต์ที่อยู่ภายใน */}
//       <WarningContext.Provider value={warningCount}>
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/job" element={<JobPage />} />
//         </Routes>
//       </WarningContext.Provider>
//     </Router>
//   );
// }

// export default App;

// const filterAndCount = () => {
//   // 1. ส่วนสำหรับคำนวณข้อมูลรายวัน: totalUnits, topCategory, topCustomer
//   //    โดยจะนับเฉพาะรายการที่ถูกสร้างขึ้น (createAt) ในวันที่เลือกเท่านั้น
//   const dailyFiltered = data.filter((item) => {
//     const itemDate = dayjs(item.createAt);
//     return itemDate.isSame(selectedDate, dateType);
//   });

//   const dailyJobsMap = new Map();
//   dailyFiltered.forEach((item) => {
//     const existingJob = dailyJobsMap.get(item.jobRef);
//     // เลือกรายการที่มีการอัปเดตล่าสุด ณ วันที่สร้างงานนั้นๆ
//     if (
//       !existingJob ||
//       dayjs(item.updateAt).isAfter(dayjs(existingJob.updateAt))
//     ) {
//       dailyJobsMap.set(item.jobRef, item);
//     }
//   });

//   const categoryCount = {};
//   const customerCount = {};
//   let totalUnits = 0;

//   dailyJobsMap.forEach((item) => {
//     totalUnits += item.unit || 0;
//     const cat = item.category;
//     categoryCount[cat] = (categoryCount[cat] || 0) + 1;
//     const cus = item.username;
//     customerCount[cus] = (customerCount[cus] || 0) + 1;
//   });

//   setTotalCount(totalUnits);
//   let topCat = { name: "-", count: 0 };
//   for (const [cat, count] of Object.entries(categoryCount)) {
//     if (count > topCat.count) {
//       topCat = { name: cat, count };
//     }
//   }
//   setTopCategory(topCat);

//   let topcus = { name: "-", count: 0 };
//   for (const [cus, count] of Object.entries(customerCount)) {
//     if (count > topcus.count) {
//       topcus = { name: cus, count };
//     }
//   }
//   setTopCustomer(topcus);

//   // ---
//   // 2. ส่วนสำหรับคำนวณสถานะงาน: statusCounts
//   //    โค้ดส่วนนี้ยังคงเดิมตามที่คุณต้องการ **ห้ามแก้ไขเด็ดขาด**
//   const jobsAsOfSelectedDate = new Map();

//   data.forEach((item) => {
//     const itemUpdateDate = dayjs(item.updateAt);
//     if (itemUpdateDate.isSameOrBefore(selectedDate, "day")) {
//       const existingJob = jobsAsOfSelectedDate.get(item.jobRef);
//       if (!existingJob || itemUpdateDate.isAfter(dayjs(existingJob.updateAt))) {
//         jobsAsOfSelectedDate.set(item.jobRef, item);
//       }
//     }
//   });

//   const statusCountMap = {};
//   jobsAsOfSelectedDate.forEach((item) => {
//     const status = item.jobStatus;
//     statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//   });

//   const updatedStatusCounts = statusIcons.map((item) => {
//     const count = statusCountMap[item.name] || 0;
//     return { ...item, count };
//   });
//   setStatusCounts(updatedStatusCounts);
// };

// const filterAndCount = () => {
//   // 1. สร้าง "ภาพรวม" ของข้อมูล ณ วันที่และเวลาที่เลือก
//   //    โดยใช้ Map เพื่อหาข้อมูลล่าสุดของแต่ละ jobRef ที่มีการอัปเดต ณ หรือก่อนหน้าวันที่เลือก
//   const jobsAsOfSelectedDate = new Map();

//   data.forEach((item) => {
//     const itemUpdateDate = dayjs(item.updateAt);

//     // ตรวจสอบว่ารายการนี้มีการอัปเดต ณ หรือก่อนหน้าวันที่เลือกหรือไม่
//     if (itemUpdateDate.isSameOrBefore(selectedDate, "day")) {
//       const existingJob = jobsAsOfSelectedDate.get(item.jobRef);

//       // ถ้ายังไม่มีรายการสำหรับ jobRef นี้ หรือรายการปัจจุบันใหม่กว่า
//       if (
//         !existingJob ||
//         itemUpdateDate.isAfter(dayjs(existingJob.updateAt))
//       ) {
//         jobsAsOfSelectedDate.set(item.jobRef, item);
//       }
//     }
//   });

//   // 2. เตรียมตัวแปรสำหรับนับค่าต่าง ๆ จาก "ภาพรวม" ของข้อมูล
//   const categoryCount = {};
//   const customerCount = {};
//   const statusCountMap = {};
//   let totalUnits = 0;

//   // 3. วนลูปเพื่อทำการนับค่าทั้งหมด
//   jobsAsOfSelectedDate.forEach((item) => {
//     totalUnits += item.unit || 0;

//     const cat = item.category;
//     categoryCount[cat] = (categoryCount[cat] || 0) + 1;

//     const cus = item.username;
//     customerCount[cus] = (customerCount[cus] || 0) + 1;

//     const status = item.jobStatus;
//     statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//   });

//   // 4. อัปเดต State ด้วยค่าที่คำนวณได้
//   setTotalCount(totalUnits);

//   let topCat = { name: "-", count: 0 };
//   for (const [cat, count] of Object.entries(categoryCount)) {
//     if (count > topCat.count) {
//       topCat = { name: cat, count };
//     }
//   }
//   setTopCategory(topCat);

//   let topcus = { name: "-", count: 0 };
//   for (const [cus, count] of Object.entries(customerCount)) {
//     if (count > topcus.count) {
//       topcus = { name: cus, count };
//     }
//   }
//   setTopCustomer(topcus);

//   const updatedStatusCounts = statusIcons.map((item) => {
//     const count = statusCountMap[item.name] || 0;
//     return { ...item, count };
//   });
//   setStatusCounts(updatedStatusCounts);
// };
// const filterAndCount = () => {
//   // 1. ส่วนนี้ใช้สำหรับคำนวณข้อมูลรายวัน: กรองตามวันที่สร้าง (createAt)
//   const dailyFiltered = data.filter((item) => {
//     const itemDate = dayjs(item.createAt);
//     return itemDate.isSame(selectedDate, dateType);
//   });

//   const dailyJobsMap = new Map();
//   dailyFiltered.forEach((item) => {
//     const existingJob = dailyJobsMap.get(item.jobRef);
//     if (
//       !existingJob ||
//       dayjs(item.updateAt).isAfter(dayjs(existingJob.updateAt))
//     ) {
//       dailyJobsMap.set(item.jobRef, item);
//     }
//   });

//   const categoryCount = {};
//   const customerCount = {};
//   let totalUnits = 0;

//   dailyJobsMap.forEach((item) => {
//     totalUnits += item.unit || 0;
//     const cat = item.category;
//     categoryCount[cat] = (categoryCount[cat] || 0) + 1;
//     const cus = item.username;
//     customerCount[cus] = (customerCount[cus] || 0) + 1;
//   });

//   setTotalCount(totalUnits);
//   let topCat = { name: "-", count: 0 };
//   for (const [cat, count] of Object.entries(categoryCount)) {
//     if (count > topCat.count) {
//       topCat = { name: cat, count };
//     }
//   }
//   setTopCategory(topCat);

//   let topcus = { name: "-", count: 0 };
//   for (const [cus, count] of Object.entries(customerCount)) {
//     if (count > topcus.count) {
//       topcus = { name: cus, count };
//     }
//   }
//   setTopCustomer(topcus);

//   // ---

//   // 2. ส่วนนี้ใช้สำหรับคำนวณสถานะงาน: หาข้อมูลล่าสุดของแต่ละ jobRef จากข้อมูลทั้งหมด (data)
//   //    โดยไม่สนใจวันที่สร้าง (createAt) หรือตัวกรอง selectedDate
//   const latestJobsMap = new Map();
//   data.forEach((item) => {
//     const existingJob = latestJobsMap.get(item.jobRef);
//     if (
//       !existingJob ||
//       dayjs(item.updateAt).isAfter(dayjs(existingJob.updateAt))
//     ) {
//       latestJobsMap.set(item.jobRef, item);
//     }
//   });

//   const statusCountMap = {};
//   latestJobsMap.forEach((item) => {
//     const status = item.jobStatus;
//     statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//   });

//   const updatedStatusCounts = statusIcons.map((item) => {
//     const count = statusCountMap[item.name] || 0;
//     return { ...item, count };
//   });
//   setStatusCounts(updatedStatusCounts);
// };

// const countedJobRefs = new Set();
// const totalUnits = dailyFiltered.reduce((sum, item) => {
//   // Check if the jobRef has been counted before
//   if (!countedJobRefs.has(item.jobRef)) {
//     // If it's a new jobRef, add it to the Set
//     countedJobRefs.add(item.jobRef);
//     // Add its unit value to the total sum
//     return sum + (item.unit || 0);
//   }
//   // If the jobRef is a duplicate, return the current sum without adding
//   return sum;
// }, 0);

// setTotalCount(totalUnits);

// // const filterAndCount = () => {
//     const dailyFiltered = data.filter((item) => {
//         const itemDate = dayjs(item.createAt);
//         return itemDate.isSame(selectedDate, dateType);
//     });

//     // ส่วนที่แก้ไข: คำนวณผลรวมของ 'unit'
//     const totalUnits = dailyFiltered.reduce((sum, item) => {
//         return sum + (item.unit || 0); // เพิ่มค่า 'unit' ของแต่ละรายการ, ใช้ 0 ถ้าไม่มีค่า
//     }, 0);

//     setTotalCount(totalUnits); // ตั้งค่า totalCount ด้วยผลรวมของ 'unit'

//     // ส่วนที่เหลือของโค้ดไม่ต้องแก้ไข
//     const countedJobRefs = new Set();
//     const categoryCount = {};
//     const customerCount = {};

//     dailyFiltered.forEach((item) => {
//         if (!countedJobRefs.has(item.jobRef)) {
//             const cat = item.category;
//             categoryCount[cat] = (categoryCount[cat] || 0) + 1;

//             const cus = item.username;
//             customerCount[cus] = (customerCount[cus] || 0) + 1;

//             countedJobRefs.add(item.jobRef);
//         }
//     });

//     let topCat = { name: "-", count: 0 };
//     for (const [cat, count] of Object.entries(categoryCount)) {
//         if (count > topCat.count) {
//             topCat = { name: cat, count };
//         }
//     }
//     setTopCategory(topCat);

//     let topcus = { name: "-", count: 0 };
//     for (const [cus, count] of Object.entries(customerCount)) {
//         if (count > topcus.count) {
//             topcus = { name: cus, count };
//         }
//     }
//     setTopCustomer(topcus);

//     const statusCountMap = {};
//     data.forEach((item) => {
//         const status = item.jobStatus;
//         statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//     });

//     const updatedStatusCounts = statusIcons.map((item) => {
//         const count = statusCountMap[item.name] || 0;
//         return { ...item, count };
//     });
//     setStatusCounts(updatedStatusCounts);
// };

// import React, { useState, useEffect } from "react";
// import { Table, Space, Tag } from "antd";
// // In this environment, we cannot import CSS files directly.
// // You will need to include the Ant Design CSS via a CDN link in your main HTML file.
// import { FaSort } from "react-icons/fa"; // Assuming you have react-icons installed for a sort icon

// // This component demonstrates a sortable table for a list of jobs.
// // It includes a "วันที่เปิดงาน" (Open Date) column that can be sorted.
// const JobTable = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date()); // Example state for selected date
//   const [dateType, setDateType] = useState("day"); // Example state for date type
//   const [totalCount, setTotalCount] = useState(0); // Example state for total count
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 }); // Example state for top category
//   const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 }); // Example state for top customer
//   const [statusCounts, setStatusCounts] = useState([]); // Example state for status counts

//   // Function to filter data and calculate remaining time, ensuring the value is not negative.
//   const countRemainingTimeWarning = (items) => {
//     return items
//       .filter((item) => {
//         const expectedDate = new Date(item.expected_completion_date);
//         const currentDate = new Date();
//         const remainingTimeInMilliseconds =
//           expectedDate.getTime() - currentDate.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );
//         // The filter now works with remainingTimeInDays, which can be a negative number,
//         // but the final value passed to the table will be non-negative.
//         return remainingTimeInDays <= 2;
//       })
//       .map((item) => {
//         const expectedDate = new Date(item.expected_completion_date);
//         const currentDate = new Date();
//         const remainingTimeInMilliseconds =
//           expectedDate.getTime() - currentDate.getTime();
//         const remainingTimeInDays = Math.floor(
//           remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//         );

//         // Use Math.max() to ensure the remainingTime is never a negative value.
//         return {
//           ...item,
//           remainingTime: Math.max(0, remainingTimeInDays),
//         };
//       });
//   };

//   // --- Start of Mock Data and Fetching ---
//   // A mock function to simulate fetching data from an API.
//   // In a real application, you would replace this with an actual API call using axios.
//   const fetchData = () => {
//     setLoading(true);
//     // Simulated API response with an array of job data
//     const mockData = [
//       {
//         key: "1",
//         jobRef: "JOB-001",
//         createAt: "2023-11-20T10:00:00Z",
//         jobStatus: "รอจัดส่ง",
//         customer_firstname: "สมชาย",
//         customer_lastname: "รักดี",
//         expected_completion_date: "2023-11-29T10:00:00Z",
//         product_name: "Product A",
//         brand: "Brand X",
//         description: "A brief description of product A.",
//         category: "Category 1", // Added category
//         username: "User 1", // Added username
//       },
//       {
//         key: "2",
//         jobRef: "JOB-002",
//         createAt: "2023-11-25T14:30:00Z",
//         jobStatus: "ซ่อมเสร็จ",
//         customer_firstname: "สมหญิง",
//         customer_lastname: "ใจดี",
//         expected_completion_date: "2023-11-30T14:30:00Z",
//         product_name: "Product B",
//         brand: "Brand Y",
//         description: "A brief description of product B.",
//         category: "Category 2", // Added category
//         username: "User 2", // Added username
//       },
//       {
//         key: "3",
//         jobRef: "JOB-003",
//         createAt: "2023-11-15T09:00:00Z",
//         jobStatus: "สั่งอะไหล่",
//         customer_firstname: "มานะ",
//         customer_lastname: "เก่งมาก",
//         expected_completion_date: "2023-11-28T09:00:00Z", // Today's date, should be 0 or close to it
//         product_name: "Product C",
//         brand: "Brand Z",
//         description: "A brief description of product C.",
//         category: "Category 1", // Added category
//         username: "User 1", // Added username
//       },
//       {
//         key: "4",
//         jobRef: "JOB-004",
//         createAt: "2023-11-28T16:00:00Z",
//         jobStatus: "เริ่มงาน",
//         customer_firstname: "ปรีชา",
//         customer_lastname: "ดีพร้อม",
//         expected_completion_date: "2023-11-26T16:00:00Z", // Past date, remainingTime should be 0
//         product_name: "Product D",
//         brand: "Brand X",
//         description: "A brief description of product D.",
//         category: "Category 3", // Added category
//         username: "User 3", // Added username
//       },
//     ];

//     // Simulate a network delay
//     setTimeout(() => {
//       // Filter the data using the new function before setting state
//       const filteredData = countRemainingTimeWarning(mockData);
//       setData(filteredData);
//       setLoading(false);
//     }, 1000);
//   };

//   const statusIcons = [
//     { name: "เริ่มงาน", count: 0 },
//     { name: "รอจัดส่ง", count: 0 },
//     { name: "ซ่อมเสร็จ", count: 0 },
//     { name: "สั่งอะไหล่", count: 0 },
//     { name: "ส่งแล้ว", count: 0 },
//   ];

//   // Modified filterAndCount function to ensure each jobRef is counted only once for category and customer.
//   const filterAndCount = () => {
//     // Assuming you have a dayjs and a way to get selectedDate and dateType from your component
//     // const dayjs = require('dayjs'); // Or import dayjs
//     // const selectedDate = dayjs(); // Example selected date
//     // const dateType = 'day'; // Example date type

//     const dailyFiltered = data.filter((item) => {
//       // Logic for filtering by date, assuming dayjs is available
//       // const itemDate = dayjs(item.createAt);
//       // return itemDate.isSame(selectedDate, dateType);
//       return true; // Placeholder for demonstration
//     });

//     setTotalCount(dailyFiltered.length);

//     // Count and find top category/customer without counting duplicate jobRef
//     const categoryCount = {};
//     const customerCount = {};
//     const countedJobs = new Set(); // Use a Set to track jobRefs that have been counted.

//     dailyFiltered.forEach((item) => {
//       // Check if jobRef has already been counted. If so, skip it.
//       if (countedJobs.has(item.jobRef)) {
//         return;
//       }

//       const cat = item.category;
//       categoryCount[cat] = (categoryCount[cat] || 0) + 1;

//       const cus = item.username;
//       customerCount[cus] = (customerCount[cus] || 0) + 1;

//       // Add the jobRef to the Set so it won't be counted again.
//       countedJobs.add(item.jobRef);
//     });

//     let topCat = { name: "-", count: 0 };
//     for (const [cat, count] of Object.entries(categoryCount)) {
//       if (count > topCat.count) {
//         topCat = { name: cat, count };
//       }
//     }
//     setTopCategory(topCat);

//     let topcus = { name: "-", count: 0 };
//     for (const [cus, count] of Object.entries(customerCount)) {
//       if (count > topcus.count) {
//         topcus = { name: cus, count };
//       }
//     }
//     setTopCustomer(topcus);

//     const statusCountMap = {};
//     data.forEach((item) => {
//       const status = item.jobStatus;
//       statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//     });

//     // Update state for statusCounts
//     const updatedStatusCounts = statusIcons.map((item) => {
//       const count = statusCountMap[item.name] || 0;
//       return { ...item, count };
//     });
//     setStatusCounts(updatedStatusCounts);
//   };

//   useEffect(() => {
//     fetchData();
//     filterAndCount(); // Run the filter and count function after data is fetched
//   }, []);
//   // --- End of Mock Data and Fetching ---

//   // Define the columns for the Ant Design Table.
//   const columns = [
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//     },
//     {
//       title: "สถานะ",
//       dataIndex: "jobStatus",
//       key: "jobStatus",
//       render: (status) => <Tag color="blue">{status}</Tag>,
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "customer_firstname",
//       key: "customerName",
//       render: (text, record) =>
//         `${record.customer_firstname} ${record.customer_lastname}`,
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       // The sorter function compares two dates.
//       // a and b are the records being compared.
//       // We convert the date strings to Date objects for accurate comparison.
//       sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
//       // This sets the default sort order to ascending (oldest date first)
//       defaultSortOrder: "ascend",
//       // The render function formats the date for display.
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ชื่อสินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//     },
//     {
//       title: "ยี่ห้อ",
//       dataIndex: "brand",
//       key: "brand",
//     },
//     {
//       title: "รายละเอียด",
//       dataIndex: "description",
//       key: "description",
//     },
//     {
//       title: "เวลาที่เหลือ (วัน)",
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//       sorter: (a, b) => a.remainingTime - b.remainingTime,
//       render: (remainingTime) => (
//         <Tag color={remainingTime <= 2 ? "red" : "green"}>
//           {remainingTime} วัน
//         </Tag>
//       ),
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (text, record) => (
//         <Space size="middle">
//           <a onClick={() => handleRowClick(record)}>ดูรายละเอียด</a>
//         </Space>
//       ),
//     },
//   ];

//   // A placeholder function for handling row clicks.
//   const handleRowClick = (record) => {
//     console.log("Row clicked:", record);
//     // You would typically navigate to a detail page here, e.g.,
//     // history.push(`/job-detail/${record.jobRef}`);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>รายการงานซ่อม</h1>
//       <p>
//         คลิกที่คอลัมน์ "วันที่เปิดงาน" หรือ "เวลาที่เหลือ (วัน)" เพื่อเรียงลำดับ
//       </p>
//       <Table
//         dataSource={data}
//         columns={columns}
//         loading={loading}
//         scroll={{ x: 1300 }}
//         // The onRow prop is defined here to handle row clicks.
//         onRow={(record) => {
//           return {
//             onClick: () => {
//               handleRowClick(record);
//             },
//           };
//         }}
//       />
//     </div>
//   );
// };

// export default JobTable;

// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   Tag,
//   Form,
//   Input,
//   Space,
//   Dropdown,
//   Select,
//   message,
// } from "antd";
// import Button from "react-bootstrap/Button";
// import { IoSearch } from "react-icons/io5";
// import { BiFilterAlt } from "react-icons/bi";
// import { FaPlus } from "react-icons/fa";
// import { MdEditDocument } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Backlogs from "./Backlogs";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";

// const { Option } = Select;

// export default function Edit() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});
//   const [open, setOpen] = useState(false);

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-job";
//       const response = await axios.get(url);

//       const formattedData = response.data.map((item) => ({
//         ...item,
//         key: item.jobRef,
//       }));

//       setData(formattedData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   const handleEditStatus = () => {
//     setIsEditing(!isEditing);
//     if (isEditing) {
//       setChangedStatus({});
//     }
//   };

//   const handleStatusChange = (newStatus, jobRef, record) => {
//     setChangedStatus((prev) => ({
//       ...prev,
//       [jobRef]: {
//         ...record,
//         jobStatus: newStatus,
//       },
//     }));
//   };

//   const handleConfirm = async () => {
//     try {
//       const promises = Object.keys(changedStatus).map(async (jobRef) => {
//         const updatedData = changedStatus[jobRef];

//         // อัปเดต status ในตาราง job
//         await axios.put(`http://localhost:3302/update-status/${jobRef}`, {
//           jobStatus: updatedData.jobStatus,
//         });

//         // ส่งข้อมูลทั้งหมดของ job นั้นไปที่ job_log
//         await axios.post("http://localhost:3302/create-job-log", updatedData);
//         console.log("Job log created successfully for:", jobRef);
//       });

//       await Promise.all(promises);
//       message.success("สถานะทั้งหมดถูกอัปเดตและบันทึกลงใน log เรียบร้อยแล้ว");
//       await getData();
//       setIsEditing(false);
//       setChangedStatus({});
//       setOpen(true);
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       console.error("Failed to update status or create log:", error);
//     }
//   };

//   const columns = [
//     {
//       title: "ลำดับ",
//       dataIndex: "job",
//       key: "job",
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//       sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       render: (text) => <a>{text}</a>,
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//     },
//     {
//       title: "Serial Number",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//     },
//     {
//       title: "ชื่อลูกค้า",
//       dataIndex: "username",
//       key: "username",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "createdBy",
//       key: "createdBy",
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       render: (status, record) => {
//         // ดึงค่าสถานะที่เปลี่ยนไปจาก changedStatus หรือใช้สถานะเดิมจาก record
//         const currentStatus =
//           changedStatus[record.jobRef]?.jobStatus || status;
//         let color = "#ea7317";
//         if (currentStatus === "สั่งอะไหล่") {
//           color = "#ffba08";
//         } else if (currentStatus === "ซ่อมสำเร็จ") {
//           color = "#b36a5e";
//         } else if (currentStatus === "รอทดสอบ") {
//           color = "#2364aa";
//         } else if (currentStatus === "รอจัดส่ง") {
//           color = "#5a189a";
//         } else if (currentStatus === "จัดส่งสำเร็จ") {
//           color = "#386641";
//         } else if (currentStatus === "ยกเลิกการเคลมสินค้า") {
//           color = "#d00000";
//         }

//         return isEditing ? (
//           <Select
//             defaultValue={currentStatus}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//             onChange={(value) =>
//               handleStatusChange(value, record.jobRef, record)
//             }
//           >
//             <Option value="เริ่มงาน">เริ่มงาน</Option>
//             <Option value="สั่งอะไหล่">สั่งอะไหล่</Option>
//             <Option value="ซ่อมสำเร็จ">ซ่อมสำเร็จ</Option>
//             <Option value="รอทดสอบ">รอทดสอบ</Option>
//             <Option value="รอจัดส่ง">รอจัดส่ง</Option>
//             <Option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</Option>
//             <Option value="ยกเลิกการเคลมสินค้า">ยกเลิกการเคลมสินค้า</Option>
//           </Select>
//         ) : (
//           <Tag color={color}>{status}</Tag>
//         );
//       },
//     },
//     {
//       title: "วันที่เปิดงาน",
//       dataIndex: "createAt",
//       key: "createAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ระยะเวลาที่ดำเนินการคงเหลือ",
//       dataIndex: "remainingTime",
//       key: "remainingTime",
//     },
//     {
//       title: "วันที่แก้ไขสถานะล่าสุด",
//       dataIndex: "updateAt",
//       key: "updateAt",
//       render: (date) => new Date(date).toLocaleDateString("th-TH"),
//     },
//     {
//       title: "ผู้แก้ไขสถานะล่าสุด",
//       dataIndex: "updatedBy",
//       key: "updatedBy",
//     },
//   ];

//   const hasChanges = Object.keys(changedStatus).length > 0;

//   const navigate = useNavigate();
//   const handletoCreateJob = () => {
//     navigate("/create-job");
//   };

//   const menuItems = [
//     { key: "เริ่มงาน", label: "เริ่มงาน" },
//     { key: "สั่งอะไหล่", label: "สั่งอะไหล่" },
//     { key: "ซ่อมสำเร็จ", label: "ซ่อมสำเร็จ" },
//     { key: "รอทดสอบ", label: "รอทดสอบ" },
//     { key: "รอจัดส่ง", label: "รอจัดส่ง" },
//     { key: "จัดส่งสำเร็จ", label: "จัดส่งสำเร็จ" },
//     { key: "ยกเลิกการเคลมสินค้า", label: "ยกเลิกการเคลมสินค้า" },
//   ];

//   const handleMenuClick = (e) => {
//     setSelectedStatus(e.key);
//   };

//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product_name",
//       "serialNumber",
//       "sku",
//       "username",
//       "createdBy",
//       "jobStatus",
//       "createAt",
//       "remainingTime",
//       "updateAt",
//       "updatedBy",
//     ];
//     const matchesSearch = searchableFields.some((field) => {
//       const fieldValue = item[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchData.toLowerCase())
//       );
//     });

//     const matchesStatus = selectedStatus
//       ? item.jobStatus === selectedStatus
//       : true;

//     return matchesSearch && matchesStatus;
//   });

//   const countRemainingTime = (filterData) => {
//     return filterData.map((item) => {
//       const expectedDate = new Date(item.expected_completion_date);
//       const today = new Date();
//       const remainingTimeInMilliseconds =
//         expectedDate.getTime() - today.getTime();
//       const remainingTimeInDays = Math.floor(
//         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//       );

//       return {
//         ...item,
//         remainingTime: remainingTimeInDays,
//       };
//     });
//   };

//   const handleRowClick = (record) => {
//     navigate(`/show-job/${record.jobRef}`);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div className="contain-main">
//       <div>
//         <Backlogs />
//       </div>
//       <div className="text-dark mb-3 mt-4 ">
//         <div className="d-flex justify-content-end">
//           <Form.Item name="Input">
//             <Input
//               onChange={(e) => setSearchData(e.target.value)}
//               prefix={<IoSearch style={{ width: "30px", height: "30px" }} />}
//               placeholder="ค้นหางานที่ต้องการ"
//               style={{
//                 width: "399px",
//                 height: "49px",
//                 backgroundColor: "#F7F7F7",
//                 color: "#CCCCCC",
//                 borderRadius: "4px",
//               }}
//             />
//           </Form.Item>
//         </div>
//         <div className="d-flex align-items-center justify-content-between mb-5 mt-3">
//           <h2>Job</h2>
//           <div className="d-flex justify-content-end gap-5">
//             <Space className="button">
//               <Dropdown menu={menuProps} trigger={["click"]}>
//                 <Button
//                   type="primary"
//                   style={{ backgroundColor: "#F7F7F7", color: "#616161" }}
//                   className="button"
//                 >
//                   <BiFilterAlt type="primary" className="button-icon" />
//                   เลือกสถานะ
//                 </Button>
//               </Dropdown>
//             </Space>

//             <Button
//               className="button"
//               style={{ backgroundColor: "#213F66", color: "#FFFFFF" }}
//               onClick={handletoCreateJob}
//             >
//               <FaPlus className="button-icon" />
//               สร้างงาน
//             </Button>

//             <Button
//               className="btn-edit-status align-items-center"
//               onClick={handleEditStatus}
//             >
//               <MdEditDocument className="button-icon justify-content-start" />
//               <span className="d-flex justify-content-center">
//                 {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
//               </span>
//             </Button>
//             {isEditing && hasChanges && (
//               <Button
//                 className="btn-comfirm-status align-items-center me-5"
//                 onClick={handleConfirm}
//               >
//                 <MdEditDocument className="button-icon justify-content-start" />
//                 <span className="d-flex justify-content-center">
//                   ยืนยันการแก้ไขสถานะ
//                 </span>
//               </Button>
//             )}
//             <Modal show={open} onHide={handleClose}>
//               <Modal.Body
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   flexDirection: "column",
//                 }}
//               >
//                 <IoMdCheckmarkCircle className="modal-icon" />
//                 <p className="d-flex mt-3 mb-3 fs-4 fw-semi-bold">
//                   การแก้ไขสถานะสำเร็จ
//                 </p>
//               </Modal.Body>
//             </Modal>
//           </div>
//         </div>
//       </div>
//       <div>
//         <Table
//           dataSource={countRemainingTime(filterData)}
//           columns={columns}
//           scroll={{ x: 1300 }}
//           onRow={(record) => {
//             return {
//               onClick: () => {
//                 handleRowClick(record);
//               },
//             };
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// import React, { useEffect } from "react";
// import {
//   Form,
//   Input,
//   Select,
//   DatePicker,
//   Table,
//   InputNumber,
//   message,
// } from "antd";
// import Button from "react-bootstrap/Button";
// import { MdOutlineWorkOutline } from "react-icons/md";
// import { MdOutlineDescription } from "react-icons/md";
// import { FaRegSave } from "react-icons/fa";
// import { LiaUserEditSolid } from "react-icons/lia";
// import { MdOutlineEmail } from "react-icons/md";
// import { GrDatabase } from "react-icons/gr";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import dayjs from "dayjs";
// import buddhistEra from "dayjs/plugin/buddhistEra";
// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";
// import axios from "axios";
// import { IoSearch } from "react-icons/io5";
// import { FaUserPlus } from "react-icons/fa";
// import { MdProductionQuantityLimits } from "react-icons/md";
// import { FiHome } from "react-icons/fi";

// dayjs.extend(buddhistEra);
// dayjs.locale("th");
// export default function CreateJobForm() {
//   const [formProduct] = Form.useForm();
//   const [formCustomer] = Form.useForm();

//   const [dataProduct, setDataProduct] = useState([]);
//   const [dataCustomer, setDataCustomer] = useState([]);

//   const [openProductModal, setOpenProductModal] = useState(false);
//   const [openModalCustomer, setOpenModalCustomer] = useState(false);

//   const [searchCustomer, setSearchCustomer] = useState("");
//   const [searchProduct, setSearchProduct] = useState("");

//   const [selectedDataProduct, setSelectedDataProduct] = useState(null);
//   const [selectedDataCustomer, setSelectedDataCustomer] = useState(null);
//   const [isFormProductDisabled, setIsFormProductDisabled] = useState(true);
//   const [isFormCustomerDisabled, setIsFormCustomerDisabled] = useState(true);

//   const [openModalJob, setOpenModalJob] = useState(false);

//   const [isGenerated, setIsGenerated] = useState(false);

//   const navigate = useNavigate();

//   // ----- Data Fetching and Initialization -----
//   useEffect(() => {
//     // Initial data fetch on component mount
//     getDataProduct();
//     getDataCustomer();
//   }, []);

//   useEffect(() => {
//     // Logic to fill the product form and generate Job ID
//     if (selectedDataProduct) {
//       // If a product is selected, fill the form
//       formProduct.setFieldsValue({
//         product_name: selectedDataProduct.product_name,
//         productRef: selectedDataProduct.productRef,
//         sku: selectedDataProduct.sku,
//         brand: selectedDataProduct.brand,
//         pcs: selectedDataProduct.pcs,
//         category: selectedDataProduct.category,
//         description: selectedDataProduct.description,
//       });
//       setIsFormProductDisabled(true);
//     } else {
//       // If no product is selected, reset form and enable editing
//       setIsFormProductDisabled(false);
//       formProduct.resetFields();
//     }

//     // Generate Job ID only once when the component mounts and no product is selected
//     if (!selectedDataProduct && !isGenerated) {
//       generateJobId();
//     }
//   }, [selectedDataProduct, formProduct, isGenerated]);

//   useEffect(() => {
//     // Logic to fill the customer form
//     if (selectedDataCustomer) {
//       formCustomer.setFieldsValue({
//         customerRef: selectedDataCustomer.customerRef,
//         customer_firstname: selectedDataCustomer.customer_firstname,
//         customer_lastname: selectedDataCustomer.customer_lastname,
//         customer_old: selectedDataCustomer.customer_old,
//         username: selectedDataCustomer.username,
//         email: selectedDataCustomer.email,
//         line_id: selectedDataCustomer.line_id,
//         phone: selectedDataCustomer.phone,
//       });
//       setIsFormCustomerDisabled(true);
//     } else {
//       setIsFormCustomerDisabled(false);
//       formCustomer.resetFields();
//     }
//   }, [selectedDataCustomer, formCustomer]);

//   const generateJobId = () => {
//     // Logic to generate the job ID
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");
//     const datePrefix = `${year}${month}${day}`;

//     const lastGeneratedData = JSON.parse(
//       localStorage.getItem("lastGeneratedJob")
//     );
//     let sequenceNumber = 1;
//     if (lastGeneratedData && lastGeneratedData.date === datePrefix) {
//       sequenceNumber = lastGeneratedData.sequence + 1;
//     }
//     const formattedSequence = String(sequenceNumber).padStart(3, "0");
//     const newJobId = `JOB${datePrefix}${formattedSequence}`;

//     const newLastGeneratedData = {
//       date: datePrefix,
//       sequence: sequenceNumber,
//     };
//     localStorage.setItem(
//       "lastGeneratedJob",
//       JSON.stringify(newLastGeneratedData)
//     );

//     formProduct.setFieldsValue({
//       jobRef: newJobId,
//       jobStatus: "เริ่มงาน", // Set a clear initial status
//       createDate: dayjs(), // Set initial date
//     });
//     setIsGenerated(true);
//   };

//   const getDataProduct = () => {
//     axios
//       .get("http://localhost:3302/get-product")
//       .then((res) => setDataProduct(res.data))
//       .catch((error) => console.error("Error fetching product data:", error));
//   };

//   const getDataCustomer = () => {
//     axios
//       .get("http://localhost:3302/get-customer")
//       .then((res) => setDataCustomer(res.data))
//       .catch((error) => console.error("Error fetching customer data:", error));
//   };

//   const createJob = (data) => {
//     axios
//       .post("http://localhost:3302/create-job", data)
//       .then((res) => {
//         message.success("บันทึกงานใหม่สำเร็จ!");
//         console.log("Job created successfully:", res.data);
//         formProduct.resetFields();
//         formCustomer.resetFields();
//         setIsGenerated(false); // Reset to generate new Job ID
//       })
//       .catch((error) => {
//         message.error("เกิดข้อผิดพลาดในการบันทึกงาน!");
//         console.error("Error creating job:", error);
//       });
//   };

//   // ----- Form and Modal Handlers -----
//   const showProductModal = () => setOpenProductModal(true);
//   const handleCloseProductModal = () => setOpenProductModal(false);
//   const handleCloseCustomerModal = () => setOpenModalCustomer(false);

//   const handleRowProduct = (record) => {
//     setSelectedDataProduct(record);
//     setOpenProductModal(false);
//   };

//   const handleRowCustomer = (record) => {
//     setSelectedDataCustomer(record);
//     setOpenModalCustomer(false);
//   };

//   const disableDatePass = (current) =>
//     current && current < dayjs().startOf("day");

//   const handleDateChange = (date) => {
//     if (date) {
//       const today = dayjs();
//       const duration = date.diff(today, "day");
//       formProduct.setFieldsValue({
//         repair_duration: duration + 1,
//       });
//     } else {
//       formProduct.setFieldsValue({
//         repair_duration: null,
//       });
//     }
//   };

//   const handleCombinedSubmit = async () => {
//     try {
//       const productValues = await formProduct.validateFields();
//       const customerValues = await formCustomer.validateFields();

//       const combinedData = {
//         ...productValues,
//         ...customerValues,
//       };

//       if (combinedData.expected_completion_date) {
//         combinedData.expected_completion_date = dayjs(
//           combinedData.expected_completion_date
//         ).format("YYYY-MM-DD HH:mm:ss");
//       }

//       combinedData.items = [
//         {
//           jobRef: combinedData.jobRef, // ให้ job_active.jobRef รับจาก frontend
//           productRef: combinedData.productRef,
//           serialNumber: combinedData.serialNumber,
//           pcs: combinedData.pcs,
//           unit: combinedData.unit,
//         },
//       ];

//       console.log("ข้อมูลที่ถูกรวมและแปลงแล้วก่อนส่ง API:", combinedData);
//       createJob(combinedData);
//     } catch (errorInfo) {
//       console.error("Validation Failed:", errorInfo);
//       message.warning("กรุณาตรวจสอบข้อมูลที่ยังไม่ครบถ้วน");
//     }
//   };

//   // ----- Table Columns and Filters -----
//   const columns = [
//     {
//       title: "ชื่อสินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//     },
//     {
//       title: "แบรนด์",
//       dataIndex: "brand",
//       key: "brand",
//       sorter: (a, b) => a.brand.localeCompare(b.brand),
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//       sorter: (a, b) => a.sku.localeCompare(b.sku),
//     },
//   ];

//   const columnsCustomer = [
//     {
//       title: "รหัสลูกค้า",
//       dataIndex: "customerRef",
//       key: "customerRef",
//       sorter: (a, b) => a.customerRef.localeCompare(b.customerRef),
//     },
//     {
//       title: "ชื่อ",
//       dataIndex: "customer_firstname",
//       key: "customer_firstname",
//       sorter: (a, b) =>
//         a.customer_firstname.localeCompare(b.customer_firstname),
//     },
//     {
//       title: "นามสกุล",
//       dataIndex: "customer_lastname",
//       key: "customer_lastname",
//       sorter: (a, b) => a.customer_lastname.localeCompare(b.customer_lastname),
//     },
//     {
//       title: "Username",
//       dataIndex: "username",
//       key: "username",
//       sorter: (a, b) => a.username.localeCompare(b.username),
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       key: "email",
//       sorter: (a, b) => a.email.localeCompare(b.email),
//     },
//     {
//       title: "Line id",
//       dataIndex: "line_id",
//       key: "line_id",
//       sorter: (a, b) => a.line_id.localeCompare(b.line_id),
//     },
//     {
//       title: "เบอร์โทรศัพท์",
//       dataIndex: "phone",
//       key: "phone",
//       sorter: (a, b) => a.phone.localeCompare(b.phone),
//     },
//   ];

//   const filterDataByProduct = dataProduct.filter(
//     (item) =>
//       item.product_name.toLowerCase().includes(searchProduct.toLowerCase()) ||
//       item.brand.toLowerCase().includes(searchProduct.toLowerCase()) ||
//       item.sku.toLowerCase().includes(searchProduct.toLowerCase())
//   );

//   const filterDataByCustomer = dataCustomer.filter((customer) => {
//     const fields = [
//       "customerRef",
//       "customer_firstname",
//       "customer_lastname",
//       "username",
//       "email",
//       "line_id",
//       "phone",
//     ];
//     return fields.some((field) => {
//       const fieldValue = customer[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchCustomer.toLowerCase())
//       );
//     });
//   });

//   const handleCreateJob = () => {
//     navigate("/create-job");
//   };

//   const toCreateProduct = () => {
//     navigate("/create-product");
//   };

//   const toCreateCustomer = () => {
//     navigate("/create-customer");
//   };

//   const handleCloseJob = () => {
//     setOpenModalJob(false);
//   };

//   function showStatus() {
//     let status = "เริ่มงาน";
//     console.log("สถานะภายในฟังก์ชัน:", status);
//     return status;
//   }
//   showStatus();

//   return (
//     <div className="contain-main">
//       <h2 className="text-dark mb-4 mt-5 text-center">Create Job</h2>
//       <div>
//         <div className="d-flex align-items-center justify-content-flex-start gap-3 mt-4 mb-4">
//           <h4>ข้อมูลสินค้า</h4>
//           <Button
//             className="d-flex align-items-center justify-content-between btn-data margin-top-100"
//             onClick={showProductModal}
//           >
//             <GrDatabase className="button-icon justify-content-start" />
//             <span className="d-flex justify-content-center">
//               ข้อมูลสินค้าในคลัง
//             </span>
//           </Button>

//           <Button
//             className="d-flex align-items-center justify-content-between btn-table margin-top-100"
//             onClick={toCreateProduct}
//           >
//             <MdProductionQuantityLimits className="button-icon justify-content-start" />
//             <span className="d-flex justify-content-end">
//               เพิ่มข้อมูลสินค้า
//             </span>
//           </Button>
//           <div>
//             <Modal show={openProductModal} onHide={handleCloseProductModal}>
//               <Modal.Body
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   flexDirection: "column",
//                 }}
//               >
//                 <Form.Item
//                   name="Input"
//                   rules={[{ required: true, message: "Please input!" }]}
//                 >
//                   <Input
//                     onChange={(e) => setSearchProduct(e.target.value)}
//                     prefix={
//                       <IoSearch style={{ width: "20px", height: "20px" }} />
//                     }
//                     style={{
//                       width: "399px",
//                       height: "35px",
//                       backgroundColor: "#FFFFFFFF",
//                       // borderBlock: "#000000",
//                       color: "#CCCCCC",
//                       borderRadius: "10px",
//                     }}
//                   />
//                 </Form.Item>

//                 <Table
//                   dataSource={filterDataByProduct}
//                   columns={columns}
//                   scroll={{ x: 450 }}
//                   style={{
//                     textAlign: "center",
//                     // width: "445px",
//                     // height: "40px",
//                   }}
//                   onRow={(record) => ({
//                     onClick: () => {
//                       handleRowProduct(record);
//                       setOpenProductModal(false);
//                     },
//                   })}
//                 />
//               </Modal.Body>
//             </Modal>
//           </div>
//         </div>
//         <div className="d-flex flex-column g-5">
//           <Form
//             layout="vertical"
//             autoComplete="off"
//             // onFinish={(values) => {
//             //   getDataProduct(values);
//             //   createProduct(values.product_id);
//             // }}
//             onFinish={createJob}
//             form={formProduct}
//             className="content-sub-form-body"
//             initialValues={{ jobStatus: showStatus() }}
//           >
//             <Form.Item
//               name="jobRef"
//               label="เลขงาน"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input prefix={<MdOutlineWorkOutline />} />
//               {/* {dataProduct.map((item) => (
//                 <Input
//                   prefix={<MdOutlineWorkOutline />}
//                   key={item.product_id}
//                   value={item.product_name}
//                 />
//               ))} */}
//             </Form.Item>

//             <Form.Item
//               name="jobStatus"
//               label="สถานะ"
//               rules={[{ required: true }]}
//               className="form-item-custom-size"
//             >
//               <Input prefix={<MdOutlineWorkOutline />} disabled={true} />
//             </Form.Item>

//             <Form.Item
//               name="createDate"
//               label="วันที่เปิดงาน"
//               rules={[{ required: true }]}
//               className="form-item-custom-size"
//               initialValue={dayjs()}
//             >
//               <DatePicker
//                 format="DD/MM/YYYY"
//                 locale={locale}
//                 style={{ width: "100%" }}
//                 disabled={true}
//               />
//               {/* pattern job = "job2025081801" */}
//             </Form.Item>

//             <Form.Item
//               name="serialNumber"
//               label="Serial Number"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input prefix={<MdOutlineWorkOutline />} />
//             </Form.Item>

//             <Form.Item
//               name="product_name"
//               label="ชื่อสินค้า"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<MdOutlineWorkOutline />}
//                 disabled={isFormProductDisabled}
//               />
//             </Form.Item>

//             <Form.Item
//               name="productRef"
//               label="รหัสสินค้า"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<MdOutlineWorkOutline />}
//                 disabled={isFormProductDisabled}
//               />
//             </Form.Item>

//             <Form.Item
//               name="sku"
//               label="SKU"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<MdOutlineWorkOutline />}
//                 disabled={isFormProductDisabled}
//               />
//             </Form.Item>

//             {/* <Form.Item
//               name="image"
//               label="รูปภาพสินค้า"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input prefix={<MdOutlineWorkOutline />} />
//             </Form.Item> */}

//             <Form.Item
//               name="brand"
//               label="แบรนด์"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<MdOutlineWorkOutline />}
//                 disabled={isFormProductDisabled}
//               />
//             </Form.Item>

//             <Form.Item
//               name="category"
//               label="ประเภทสินค้า"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<MdOutlineWorkOutline />}
//                 disabled={isFormProductDisabled}
//               />
//             </Form.Item>

//             <Form.Item
//               name="description"
//               label="รายละเอียดสินค้า"
//               rules={[{ required: true }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<MdOutlineDescription />}
//                 disabled={isFormProductDisabled}
//               />
//             </Form.Item>

//             <Form.Item
//               name="unit"
//               label="จำนวนสินค้าที่เคลม"
//               rules={[{ required: true }, { type: "number" }]}
//               className="form-item-custom-size"
//             >
//               <InputNumber
//                 prefix={<MdOutlineDescription />}
//                 className="form-item-custom-size"
//                 min={1}
//               />
//             </Form.Item>

//             <Form.Item
//               name="pcs"
//               label="หน่วย"
//               rules={[{ required: true }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<MdOutlineDescription />}
//                 disabled={isFormProductDisabled}
//               />
//             </Form.Item>

//             <Form.Item
//               name="expected_completion_date"
//               label="วันที่คาดว่าจะซ่อมสินค้าสำเร็จ"
//               rules={[{ required: true }]}
//               className="form-item-custom-size"
//             >
//               <DatePicker
//                 format="DD/MM/YYYY"
//                 locale={locale}
//                 style={{ width: "100%" }}
//                 onChange={handleDateChange}
//                 disabledDate={disableDatePass}
//               />
//               {/* <Input prefix={<MdOutlineDescription />} /> */}
//             </Form.Item>

//             <Form.Item
//               name="repair_duration"
//               label="ระยะเวลาในการซ่อมสินค้า"
//               rules={[{ required: true }]}
//               className="form-item-custom-size"
//             >
//               <Input prefix={<MdOutlineDescription />} disabled />
//             </Form.Item>

//             {/* <Form.Item
//               name="image"
//               label="รูปภาพสินค้าที่ต้องการเคลม"
//               valuePropName="fileList"
//               rules={[{ required: true }]}
//               className="form-item-custom-size"
//             >
//               {dataProduct.map((item) => (
//                 <Input
//                   prefix={<MdOutlineDescription />}
//                   key={item.id}
//                   value={item.image}
//                 />
//               ))}
//             </Form.Item> */}
//           </Form>
//         </div>
//       </div>

//       {/*///////////////////////////////////////////////////////////// ข้อมูลลูกค้า ///////////////////////////////////////////////////////////*/}

//       <div>
//         <div className="d-flex align-items-center justify-content-flex-start gap-3 mt-5 mb-4">
//           <h4>ข้อมูลลูกค้า</h4>
//           <Button
//             // style={{
//             //   color: "#213F66",
//             //   borderColor: "#213F66",
//             //   height: "59px",
//             //   fontSize: "16px",
//             // }}
//             className="d-flex align-items-center justify-content-between btn-data margin-top-100"
//             onClick={() => setOpenModalCustomer(true)}
//           >
//             <GrDatabase className="button-icon justify-content-start" />
//             <span className="d-flex justify-content-end">ฐานข้อมูลลูกค้า</span>
//           </Button>

//           <Button
//             className="d-flex align-items-center justify-content-between btn-table margin-top-100"
//             onClick={toCreateCustomer}
//           >
//             <FaUserPlus className="button-icon justify-content-start" />
//             <span className="d-flex justify-content-end">
//               เพิ่มข้อมูลลูกค้า
//             </span>
//           </Button>

//           <div>
//             <Modal show={openModalCustomer} onHide={handleCloseCustomerModal}>
//               <Modal.Body
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   flexDirection: "column",
//                 }}
//               >
//                 <Form.Item
//                   name="Input"
//                   rules={[{ required: true, message: "Please input!" }]}
//                 >
//                   <Input
//                     onChange={(e) => setSearchCustomer(e.target.value)}
//                     prefix={
//                       <IoSearch style={{ width: "20px", height: "20px" }} />
//                     }
//                     style={{
//                       width: "399px",
//                       height: "35px",
//                       backgroundColor: "#FFFFFFFF",
//                       // borderBlock: "#000000",
//                       color: "#CCCCCC",
//                       borderRadius: "10px",
//                     }}
//                   />
//                 </Form.Item>

//                 <Table
//                   dataSource={filterDataByCustomer}
//                   columns={columnsCustomer}
//                   scroll={{ x: 450 }}
//                   style={{
//                     textAlign: "center",
//                     // width: "445px",
//                     // height: "40px",
//                   }}
//                   onRow={(record) => ({
//                     onClick: () => {
//                       handleRowCustomer(record);
//                       setOpenModalCustomer(false);
//                     },
//                   })}
//                 />
//               </Modal.Body>
//             </Modal>
//           </div>
//         </div>
//         <div>
//           <Form
//             layout="vertical"
//             autoComplete="off"
//             form={formCustomer}
//             onFinish={createJob}
//             className="content-sub-form-body"
//           >
//             <Form.Item
//               name="customerRef"
//               label="รหัสลูกค้า"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<LiaUserEditSolid />}
//                 disabled={isFormCustomerDisabled}
//                 // disabled
//               />
//             </Form.Item>

//             <Form.Item
//               name="customer_firstname"
//               label="ชื่อ"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input prefix={<LiaUserEditSolid />} disabled />
//             </Form.Item>

//             <Form.Item
//               name="customer_lastname"
//               label="นามสกุล"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<LiaUserEditSolid />}
//                 // disabled={isFormCustomerDisabled}
//                 disabled
//               />
//             </Form.Item>

//             <Form.Item
//               name="username"
//               label="Username"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<LiaUserEditSolid />}
//                 // disabled={isFormCustomerDisabled}
//                 disabled
//               />
//             </Form.Item>

//             <Form.Item
//               name="customer_old"
//               label="อายุ"
//               rules={[{ required: true }, { type: "number" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<LiaUserEditSolid />}
//                 // disabled={isFormCustomerDisabled}
//                 disabled
//               />
//             </Form.Item>

//             <Form.Item
//               name="email"
//               label="Email"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Input
//                 prefix={<MdOutlineEmail />}
//                 // disabled={isFormCustomerDisabled}
//                 disabled
//               />
//             </Form.Item>

//             <Form.Item
//               name="customer_contact"
//               label="ช่องทางติดต่อ"
//               rules={[{ required: true }, { type: "string" }]}
//               className="form-item-custom-size"
//             >
//               <Select placeholder="กรุณาเลือกช่องทางติดต่อ">
//                 <Select.Option value="phone">เบอร์โทรศัพท์</Select.Option>
//                 <Select.Option value="line">Line</Select.Option>
//                 <Select.Option value="address">ที่อยู่ลูกค้า</Select.Option>
//               </Select>
//             </Form.Item>
//             {/* <Form.Item
//               dependencies={["contact"]}
//               className="form-item-custom-size d-flex "
//             >
//               {({ getFieldValue }) => {
//                 const contactMethod = getFieldValue("contact");
//                 return (
//                   <div className="content-sub-form-body">
//                     <Form.Item
//                       name="phone"
//                       label="เบอร์โทรศัพท์"
//                       rules={[
//                         { required: contactMethod === "phone" },
//                         { type: "string" },
//                       ]}
//                       className="form-item-custom-contact "
//                     >
//                       <Input
//                         prefix={<FiPhoneCall />}
//                         disabled={contactMethod !== "phone"}
//                       />
//                     </Form.Item>

//                     <Form.Item
//                       name="line"
//                       label="Line ID"
//                       rules={[
//                         { required: contactMethod === "line" },
//                         { type: "string" },
//                       ]}
//                       className="form-item-custom-contact "
//                     >
//                       <Input
//                         prefix={<FaLine />}
//                         disabled={contactMethod !== "line"}
//                       />
//                     </Form.Item>

//                     <Form.Item
//                       name="address"
//                       label="ที่อยู่ลูกค้า"
//                       rules={[
//                         { required: contactMethod === "address" },
//                         { type: "string" },
//                       ]}
//                       className="form-item-custom-contact "
//                     >
//                       <Input
//                         prefix={<FiHome />}
//                         disabled={contactMethod !== "address"}
//                       />
//                     </Form.Item>
//                   </div>
//                 );
//               }} */}
//             {/* </Form.Item> */}
//           </Form>
//         </div>
//         <div className="d-flex justify-content-center mt-5 mb-5">
//           {/* <Button
//             className="d-flex align-items-center justify-content-center btn-save margin-top-100"
//             onClick={() => {
//               // showModalJob();
//               form.submit();
//               formCustomer.submit();
//             }}
//           >
//             <FaRegSave />
//             <span className="button-text">บันทึกข้อมูลงาน</span>
//           </Button> */}

//           <Button
//             className="d-flex align-items-center justify-content-between btn-save margin-top-100"
//             onClick={() => {
//               // showModalJob();
//               handleCombinedSubmit();
//               // formProduct.submit();
//               // formCustomer.submit();
//             }}
//           >
//             <FaRegSave className="button-icon justify-content-start" />
//             <span className="button-text">บันทึกข้อมูลงาน</span>
//           </Button>

//           <Modal show={openModalJob} onHide={handleCloseJob}>
//             <Modal.Body
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 flexDirection: "column",
//               }}
//             >
//               <IoMdCheckmarkCircle className="modal-icon" />
//               <p>การเพิ่มรายชื่อลูกค้าเข้าในระบบสำเร็จ</p>
//               <Button
//                 style={{
//                   backgroundColor: "#36783C",
//                   color: "#FFFFFF",
//                   alignItems: "center",
//                   display: "flex",
//                   width: "149px",
//                   height: "49px",
//                   fontSize: "20px",
//                 }}
//                 onClick={handleCreateJob}
//               >
//                 สร้างงาน
//               </Button>
//             </Modal.Body>
//           </Modal>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import {
//   Form,
//   Input,
//   Select,
//   DatePicker,
//   Table,
//   InputNumber,
//   message,
// } from "antd";
// import Button from "react-bootstrap/Button";
// import {
//   MdOutlineWorkOutline,
//   MdOutlineDescription,
//   MdProductionQuantityLimits,
//   MdOutlineEmail,
// } from "react-icons/md";
// import { FaRegSave, FaUserPlus } from "react-icons/fa";
// import { LiaUserEditSolid } from "react-icons/lia";
// import { GrDatabase } from "react-icons/gr";
// import Modal from "react-bootstrap/Modal";
// import { IoSearch } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import dayjs from "dayjs";
// import buddhistEra from "dayjs/plugin/buddhistEra";
// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";
// import axios from "axios";

// dayjs.extend(buddhistEra);
// dayjs.locale("th");

// export default function CreateJobForm() {
//   const [formProduct] = Form.useForm();
//   const [formCustomer] = Form.useForm();

//   const [dataProduct, setDataProduct] = useState([]);
//   const [dataCustomer, setDataCustomer] = useState([]);

//   const [openProductModal, setOpenProductModal] = useState(false);
//   const [openModalCustomer, setOpenModalCustomer] = useState(false);

//   const [searchCustomer, setSearchCustomer] = useState("");
//   const [searchProduct, setSearchProduct] = useState("");

//   const [selectedDataProduct, setSelectedDataProduct] = useState(null);
//   const [selectedDataCustomer, setSelectedDataCustomer] = useState(null);
//   const [isFormProductDisabled, setIsFormProductDisabled] = useState(true);
//   const [isFormCustomerDisabled, setIsFormCustomerDisabled] = useState(true);

//   const [isGenerated, setIsGenerated] = useState(false);

//   const navigate = useNavigate();

//   // ----- Data Fetching and Initialization -----
//   useEffect(() => {
//     // Initial data fetch on component mount
//     getDataProduct();
//     getDataCustomer();
//   }, []);

//   useEffect(() => {
//     // Logic to fill the product form and generate Job ID
//     if (selectedDataProduct) {
//       // If a product is selected, fill the form
//       formProduct.setFieldsValue({
//         product_name: selectedDataProduct.product_name,
//         productRef: selectedDataProduct.productRef,
//         sku: selectedDataProduct.sku,
//         brand: selectedDataProduct.brand,
//         pcs: selectedDataProduct.pcs,
//         category: selectedDataProduct.category,
//         description: selectedDataProduct.description,
//       });
//       setIsFormProductDisabled(true);
//     } else {
//       // If no product is selected, reset form and enable editing
//       setIsFormProductDisabled(false);
//       formProduct.resetFields();
//     }

//     // Generate Job ID only once when the component mounts and no product is selected
//     if (!selectedDataProduct && !isGenerated) {
//       generateJobId();
//     }
//   }, [selectedDataProduct, formProduct, isGenerated]);

//   useEffect(() => {
//     // Logic to fill the customer form
//     if (selectedDataCustomer) {
//       formCustomer.setFieldsValue({
//         customerRef: selectedDataCustomer.customerRef,
//         customer_firstname: selectedDataCustomer.customer_firstname,
//         customer_lastname: selectedDataCustomer.customer_lastname,
//         customer_old: selectedDataCustomer.customer_old,
//         username: selectedDataCustomer.username,
//         email: selectedDataCustomer.email,
//         line_id: selectedDataCustomer.line_id,
//         phone: selectedDataCustomer.phone,
//       });
//       setIsFormCustomerDisabled(true);
//     } else {
//       setIsFormCustomerDisabled(false);
//       formCustomer.resetFields();
//     }
//   }, [selectedDataCustomer, formCustomer]);

//   const generateJobId = () => {
//     // Logic to generate the job ID
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");
//     const datePrefix = `${year}${month}${day}`;

//     const lastGeneratedData = JSON.parse(
//       localStorage.getItem("lastGeneratedJob")
//     );
//     let sequenceNumber = 1;
//     if (lastGeneratedData && lastGeneratedData.date === datePrefix) {
//       sequenceNumber = lastGeneratedData.sequence + 1;
//     }
//     const formattedSequence = String(sequenceNumber).padStart(3, "0");
//     const newJobId = `JOB${datePrefix}${formattedSequence}`;

//     const newLastGeneratedData = {
//       date: datePrefix,
//       sequence: sequenceNumber,
//     };
//     localStorage.setItem(
//       "lastGeneratedJob",
//       JSON.stringify(newLastGeneratedData)
//     );

//     formProduct.setFieldsValue({
//       jobRef: newJobId,
//       jobStatus: "เริ่มงาน", // Set a clear initial status
//       createDate: dayjs(), // Set initial date
//     });
//     setIsGenerated(true);
//   };

//   const getDataProduct = () => {
//     axios
//       .get("http://localhost:3302/get-product")
//       .then((res) => setDataProduct(res.data))
//       .catch((error) => console.error("Error fetching product data:", error));
//   };

//   const getDataCustomer = () => {
//     axios
//       .get("http://localhost:3302/get-customer")
//       .then((res) => setDataCustomer(res.data))
//       .catch((error) => console.error("Error fetching customer data:", error));
//   };

//   const createJob = (data) => {
//     axios
//       .post("http://localhost:3302/create-job", data)
//       .then((res) => {
//         message.success("บันทึกงานใหม่สำเร็จ!");
//         console.log("Job created successfully:", res.data);
//         formProduct.resetFields();
//         formCustomer.resetFields();
//         setIsGenerated(false); // Reset to generate new Job ID
//       })
//       .catch((error) => {
//         message.error("เกิดข้อผิดพลาดในการบันทึกงาน!");
//         console.error("Error creating job:", error);
//       });
//   };

//   // ----- Form and Modal Handlers -----
//   const showProductModal = () => setOpenProductModal(true);
//   const handleCloseProductModal = () => setOpenProductModal(false);
//   const handleCloseCustomerModal = () => setOpenModalCustomer(false);

//   const handleRowProduct = (record) => {
//     setSelectedDataProduct(record);
//     setOpenProductModal(false);
//   };

//   const handleRowCustomer = (record) => {
//     setSelectedDataCustomer(record);
//     setOpenModalCustomer(false);
//   };

//   const disableDatePass = (current) =>
//     current && current < dayjs().startOf("day");

//   const handleDateChange = (date) => {
//     if (date) {
//       const today = dayjs();
//       const duration = date.diff(today, "day");
//       formProduct.setFieldsValue({
//         repair_duration: duration + 1,
//       });
//     } else {
//       formProduct.setFieldsValue({
//         repair_duration: null,
//       });
//     }
//   };

//   const handleCombinedSubmit = async () => {
//     try {
//       const productValues = await formProduct.validateFields();
//       const customerValues = await formCustomer.validateFields();

//       const combinedData = {
//         ...productValues,
//         ...customerValues,
//       };

//       if (combinedData.expected_completion_date) {
//         combinedData.expected_completion_date = dayjs(
//           combinedData.expected_completion_date
//         ).format("YYYY-MM-DD HH:mm:ss");
//       }

//       console.log("ข้อมูลที่ถูกรวมและแปลงแล้วก่อนส่ง API:", combinedData);
//       createJob(combinedData);
//     } catch (errorInfo) {
//       console.error("Validation Failed:", errorInfo);
//       message.warning("กรุณาตรวจสอบข้อมูลที่ยังไม่ครบถ้วน");
//     }
//   };

//   // ----- Table Columns and Filters -----
//   const columns = [
//     {
//       title: "ชื่อสินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//       sorter: (a, b) => a.product_name.localeCompare(b.product_name),
//     },
//     {
//       title: "แบรนด์",
//       dataIndex: "brand",
//       key: "brand",
//       sorter: (a, b) => a.brand.localeCompare(b.brand),
//     },
//     {
//       title: "SKU",
//       dataIndex: "sku",
//       key: "sku",
//       sorter: (a, b) => a.sku.localeCompare(b.sku),
//     },
//   ];

//   const columnsCustomer = [
//     {
//       title: "รหัสลูกค้า",
//       dataIndex: "customerRef",
//       key: "customerRef",
//       sorter: (a, b) => a.customerRef.localeCompare(b.customerRef),
//     },
//     {
//       title: "ชื่อ",
//       dataIndex: "customer_firstname",
//       key: "customer_firstname",
//       sorter: (a, b) =>
//         a.customer_firstname.localeCompare(b.customer_firstname),
//     },
//     {
//       title: "นามสกุล",
//       dataIndex: "customer_lastname",
//       key: "customer_lastname",
//       sorter: (a, b) => a.customer_lastname.localeCompare(b.customer_lastname),
//     },
//     {
//       title: "Username",
//       dataIndex: "username",
//       key: "username",
//       sorter: (a, b) => a.username.localeCompare(b.username),
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       key: "email",
//       sorter: (a, b) => a.email.localeCompare(b.email),
//     },
//     {
//       title: "Line id",
//       dataIndex: "line_id",
//       key: "line_id",
//       sorter: (a, b) => a.line_id.localeCompare(b.line_id),
//     },
//     {
//       title: "เบอร์โทรศัพท์",
//       dataIndex: "phone",
//       key: "phone",
//       sorter: (a, b) => a.phone.localeCompare(b.phone),
//     },
//   ];

//   const filterDataByProduct = dataProduct.filter(
//     (item) =>
//       item.product_name.toLowerCase().includes(searchProduct.toLowerCase()) ||
//       item.brand.toLowerCase().includes(searchProduct.toLowerCase()) ||
//       item.sku.toLowerCase().includes(searchProduct.toLowerCase())
//   );

//   const filterDataByCustomer = dataCustomer.filter((customer) => {
//     const fields = [
//       "customerRef",
//       "customer_firstname",
//       "customer_lastname",
//       "username",
//       "email",
//       "line_id",
//       "phone",
//     ];
//     return fields.some((field) => {
//       const fieldValue = customer[field];
//       return (
//         typeof fieldValue === "string" &&
//         fieldValue.toLowerCase().includes(searchCustomer.toLowerCase())
//       );
//     });
//   });

//   // ----- Render Section -----
//   return (
//     <div className="contain-main">
//       <h2 className="text-dark mb-4 mt-5 text-center">Create Job</h2>
//       {/*... (rest of your JSX code, unchanged) ...*/}

//       {/* Example for the main form submission button, placed at the end */}
//       <div className="d-flex justify-content-center mt-4">
//         <Button variant="primary" onClick={handleCombinedSubmit}>
//           <FaRegSave className="button-icon" /> บันทึกงาน
//         </Button>
//       </div>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import Chart from "react-apexcharts";

// // Define your mock data outside the component
// const MOCK_API_DATA = [
//   { name: "Category A", value: 10 },
//   { name: "Category B", value: 18 },
//   { name: "Category C", value: 13 },
//   { name: "Category D", value: 25 },
//   { name: "Category E", value: 7 },
// ];

// function Edit() {
//   // 1. Transform the mock data to the format ApexCharts expects
//   const transformedData = MOCK_API_DATA.map((item) => ({
//     x: item.name,
//     y: item.value,
//   }));

//   // 2. Use useState to hold the data for the chart
//   const [chartData, setChartData] = useState(transformedData);

//   // 3. Define the chart options
//   const options = {
//     chart: {
//       type: "bar",
//       height: 350,
//     },
//     plotOptions: {
//       bar: {
//         horizontal: true,
//       },
//     },
//     series: [
//       {
//         data: chartData, // The chart will use the data from the state
//       },
//     ],
//   };

//   return (
//     <div className="chart-container">
//       <h2>Horizontal Bar Chart (Mock Data)</h2>
//       {/* 4. Render the Chart component */}
//       <Chart
//         options={options}
//         series={options.series}
//         type="bar"
//         height={350}
//       />
//     </div>
//   );
// }

// export default Edit;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Chart from "react-apexcharts";

// function Edit() {
//   // 1. Initialize state for chart data
//   const [chartData, setChartData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // 2. Define the chart options
//   const options = {
//     chart: {
//       type: "bar",
//       height: 350,
//     },
//     plotOptions: {
//       bar: {
//         horizontal: true,
//       },
//     },
//     series: [
//       {
//         data: chartData, // This will be updated by the state
//       },
//     ],
//   };

//   // 3. Use useEffect to fetch data when the component mounts
//   useEffect(() => {
//     // We use an async function inside useEffect to handle the promise
//     const fetchData = async () => {
//       try {
//         // Replace with your actual API endpoint
//         const response = await axios.get("https://api.example.com/data");

//         // Transform the data to match the chart's required format
//         const transformedData = response.data.map((item) => ({
//           x: item.name,
//           y: item.value,
//         }));

//         // Update the state with the new data
//         setChartData(transformedData);
//         setLoading(false);
//       } catch (err) {
//         // Handle any errors during the fetch
//         setError(err);
//         setLoading(false);
//       }
//     };

//     fetchData(); // Call the async function
//   }, []); // The empty array ensures this effect runs only once when the component mounts

//   // 4. Render the chart or a loading/error message
//   if (loading) {
//     return <div>Loading chart data...</div>;
//   }

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }

//   return (
//     <div className="chart-container">
//       <h2>Bar Chart</h2>
//       {/* Pass the options to the Chart component */}
//       <Chart
//         options={options}
//         series={options.series}
//         type="bar"
//         height={350}
//       />
//     </div>
//   );
// }

// export default Edit;

// import React, { useState } from "react";

// function Login() {
//   const [usernameOrEmail, setUsernameOrEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     try {
//       const response = await fetch("http://localhost:3303/api/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ usernameOrEmail, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Store the token in local storage
//         localStorage.setItem("tokenKey", data.tokenKey);
//         // Redirect to the protected page
//         window.location.href = "/protected"; // You will set up this route later
//       } else {
//         setError(data.error);
//       }
//     } catch (err) {
//       setError("An error occurred. Please try again later.");
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <input
//             type="text"
//             placeholder="Username or Email"
//             value={usernameOrEmail}
//             onChange={(e) => setUsernameOrEmail(e.target.value)}
//           />
//         </div>
//         <div>
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }

// export default Login;

// // login.js;
// // App.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom"; // ✅ ต้องมีบรรทัดนี้

// // ไอคอนเดิมของคุณ
// const PeopleCircleIcon = ({ style }) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     style={style}
//   >
//     <path
//       fillRule="evenodd"
//       d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0ZM18.586 19.894c.092.344.341.654.69.832A6.742 6.742 0 0 0 21 12a9.75 9.75 0 0 0-3.235-7.279c-1.664-1.665-3.882-2.5-6.185-2.5h-.114A9.75 9.75 0 0 0 3 12c0 2.298.835 4.49 2.304 6.136.345.389.743.72 1.18.997a7.79 7.79 0 0 1 2.871 1.72l-.004.004-.004.004c.386.205.792.392 1.205.568.12.051.242.099.366.144a.75.75 0 0 0 .114 0c.124-.045.246-.093.366-.144.413-.176.82-.363 1.205-.568l-.004-.004-.004-.004a7.79 7.79 0 0 1 2.871-1.72c.437-.277.835-.608 1.18-.997A9.75 9.75 0 0 0 21 12c0-2.298-.835-4.49-2.304-6.136Z"
//       clipRule="evenodd"
//     />
//   </svg>
// );

// // Main App Component
// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   // const [showHomePage, setShowHomePage] = useState(false); // Removed: Not needed for direct navigate
//   const navigate = useNavigate(); // ✅ ต้องมีบรรทัดนี้

//   // useEffect to check for "remembered" user on component mount
//   useEffect(() => {
//     const rememberedUser = localStorage.getItem("rememberedUser");
//     if (rememberedUser) {
//       // In a real app, you'd probably validate a token with backend here
//       setIsLoggedIn(true);
//       navigate("/Home"); // Navigate directly to Home if remembered
//     }
//   }, []); // Run only once on mount

//   const handleLoginSuccess = (rememberMeChecked) => {
//     setIsLoggedIn(true);
//     // When login is successful, navigate immediately
//     navigate("/Home");
//   };

//   // This handleLogout would typically be on the Home page component
//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     localStorage.removeItem("rememberedUser"); // Clear remembered user on logout
//     navigate("/"); // Navigate back to login page
//   };

//   // Render content based on login state
//   return (
//     <div
//       className="container-fluid d-flex justify-content-center align-items-center"
//       style={{ minHeight: "100vh", backgroundColor: "#F0F0F0" }}
//     >
//       {isLoggedIn ? (
//         // This block will now effectively serve as the "loading" state
//         // before navigate("/Home") takes effect, or simply a success message
//         // if navigation is not immediate in some router setups.
//         // If react-router-dom is fully configured, this screen will flash
//         // briefly or not at all before navigating.
//         <div
//           className="text-center p-5 bg-white rounded-4 shadow"
//           style={{ maxWidth: "500px" }}
//         >
//           <h2 className="fs-1 fw-bold text-dark mb-4">เข้าสู่ระบบสำเร็จ!</h2>
//           <p className="text-secondary mb-6 fs-5">
//             กำลังนำทางไปยังหน้า Home...
//           </p>
//           {/* A button to manually navigate in case auto-navigate fails or is slow */}
//         </div>
//       ) : (
//         // Display the Login component if the user is not logged in
//         <Login onLoginSuccess={handleLoginSuccess} />
//       )}
//     </div>
//   );
// }

// export default App;

// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   DatePicker,
//   Select,
//   Space,
//   Dropdown,
//   Row,
//   Col,
//   Card,
// } from "antd";
// import dayjs from "dayjs";
// import weekOfYear from "dayjs/plugin/weekOfYear";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import { BiFilterAlt, BiBarChart, BiUser, BiPackage } from "react-icons/bi";
// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
// } from "react-icons/fa";
// import axios from "axios";
// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";
// dayjs.extend(weekOfYear);
// dayjs.extend(customParseFormat);
// dayjs.locale("th");

// const { Option } = Select;

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [statusCounts, setStatusCounts] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
//   const [topCustomer, setTopCustomer] = useState({ name: "-", count: 0 });
//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());

//   const statusIcons = [
//     { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
//     { name: "สั่งอะไหล่", icon: <FaTools /> },
//     { name: "ซ่อมสำเร็จ", icon: <FaCheck /> },
//     { name: "รอทดสอบ", icon: <FaFileAlt /> },
//     { name: "รอจัดส่ง", icon: <FaTruck /> },
//     { name: "จัดส่งสำเร็จ", icon: <BiPackage /> },
//   ];

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-dashboard";
//       const response = await axios.get(url);
//       setData(response.data);
//       console.log("Fetched data:", response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const filterAndCount = () => {
//     // If data is not yet available, stop
//     if (!data || data.length === 0) {
//       // Initialize counts to 0 for all statuses
//       const emptyCounts = statusIcons.map((item) => ({ ...item, count: 0 }));
//       setStatusCounts(emptyCounts);
//       setTotalCount(0);
//       setTopCategory({ name: "-", count: 0 });
//       setTopCustomer({ name: "-", count: 0 });
//       return;
//     }

//     const filtered = data.filter((item) => {
//       const itemDate = dayjs(item.createAt);
//       return itemDate.isSame(selectedDate, dateType);
//     });

//     setTotalCount(filtered.length);

//     const categoryCount = {};
//     const customerCount = {};
//     const statusCount = {};

//     filtered.forEach((item) => {
//       const cat = item.category;
//       categoryCount[cat] = (categoryCount[cat] || 0) + 1;
//       const cus = item.username;
//       customerCount[cus] = (customerCount[cus] || 0) + 1;
//       const status = item.status;
//       statusCount[status] = (statusCount[status] || 0) + 1;
//     });

//     let topCat = { name: "-", count: 0 };
//     for (const [cat, count] of Object.entries(categoryCount)) {
//       if (count > topCat.count) {
//         topCat = { name: cat, count };
//       }
//     }

//     let topcus = { name: "-", count: 0 };
//     for (const [cus, count] of Object.entries(customerCount)) {
//       if (count > topcus.count) {
//         topcus = { name: cus, count };
//       }
//     }

//     const updatedStatusCounts = statusIcons.map((item) => {
//       const count = statusCount[item.name] || 0;
//       return { ...item, count };
//     });

//     setTopCategory(topCat);
//     setTopCustomer(topcus);
//     setStatusCounts(updatedStatusCounts);
//   };

//   // useEffect 1: Fetch data once on initial render
//   useEffect(() => {
//     getData();
//   }, []);

//   // useEffect 2: Run calculations whenever data or filters change
//   useEffect(() => {
//     filterAndCount();
//   }, [data, selectedDate, dateType]);

//   const handleDateChange = (value) => {
//     setSelectedDate(value);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="month"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="year"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1 className="text-center mb-4">Dashboard</h1>
//       <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-4">
//         <Space>
//           <Dropdown
//             menu={
//               {
//                 /* ...menuProps */
//               }
//             }
//           >
//             <Button>
//               <BiFilterAlt /> สถานะ
//             </Button>
//           </Dropdown>
//         </Space>

//         <Space.Compact>
//           {renderDatePicker()}
//           <Select
//             value={dateType}
//             onChange={handleDateTypeChange}
//             style={{ width: "100px" }}
//           >
//             <Option value="day">วัน</Option>
//             <Option value="month">เดือน</Option>
//             <Option value="year">ปี</Option>
//           </Select>
//         </Space.Compact>
//       </div>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiPackage />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">{totalCount}</h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   จำนวนสินค้าที่รับเคลมต่อวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiBarChart />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCategory.name}, {topCategory.count} ชิ้น
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ประเภทสินค้าที่ถูกเคลมสูงสุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <div className="d-flex align-items-center">
//               <div className="me-3 fs-3 text-dark">
//                 <BiUser />
//               </div>
//               <div>
//                 <h2 className="mb-1 fs-5">
//                   {topCustomer.name}, {topCustomer.count} รายการ
//                 </h2>
//                 <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                   ลูกค้าที่ส่งเคลมสินค้ามากที่สุดประจำวัน
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">จำนวนสินค้าที่ค้นหาสูงสุดประจำวัน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={8}>
//           <Card>
//             <h3 className="mb-3">ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "150px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               Placeholder for Chart
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       <Card>
//         <h3 className="text-center mb-4">จำนวนสถานะงานที่ค้าง</h3>
//         <Row gutter={[16, 16]} justify="center">
//           {(statusCounts || []).map((item, index) => (
//             <Col key={index} xs={12} sm={8} md={4} className="text-center">
//               <div className="d-flex flex-column align-items-center">
//                 <span className="fs-3 mb-2">{item.icon}</span>
//                 <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                   {item.name}
//                 </p>
//                 <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                   {item.count}
//                 </span>
//               </div>
//             </Col>
//           ))}
//         </Row>
//         <div className="mt-4 text-center">
//           <Button
//             type="primary"
//             style={{ backgroundColor: "#213f66", width: "200px" }}
//           >
//             ไปที่หน้างาน
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { Row, Col, DatePicker, Select } from "antd";
// import dayjs from "dayjs";
// import {
//   FaRegLightbulb,
//   FaTools,
//   FaCheck,
//   FaFileAlt,
//   FaTruck,
// } from "react-icons/fa";
// import { BiPackage } from "react-icons/bi";
// import locale from "antd/es/date-picker/locale/th_TH";
// import axios from "axios";

// // ตัวอย่างข้อมูลที่รับเข้ามาจาก API
// // const mockData = [
// //   { createAt: "2025-08-25T10:00:00Z", status: "เริ่มงาน" },
// //   { createAt: "2025-08-25T11:00:00Z", status: "สั่งอะไหล่" },
// //   { createAt: "2025-08-25T12:00:00Z", status: "เริ่มงาน" },
// //   { createAt: "2025-08-26T09:00:00Z", status: "สั่งอะไหล่" },
// //   { createAt: "2025-08-26T10:00:00Z", status: "ซ่อมสำเร็จ" },
// //   { createAt: "2025-08-26T11:00:00Z", status: "รอจัดส่ง" },
// //   { createAt: "2025-08-26T12:00:00Z", status: "สั่งอะไหล่" },
// //   { createAt: "2025-08-26T13:00:00Z", status: "สั่งอะไหล่" },
// //   { createAt: "2025-08-26T14:00:00Z", status: "สั่งอะไหล่" },
// // ];

// // ข้อมูล icons และชื่อสถานะ
// const statusIcons = [
//   { name: "เริ่มงาน", icon: <FaRegLightbulb /> },
//   { name: "สั่งอะไหล่", icon: <FaTools /> },
//   { name: "ซ่อมสำเร็จ", icon: <FaCheck /> },
//   { name: "รอทดสอบ", icon: <FaFileAlt /> },
//   { name: "รอจัดส่ง", icon: <FaTruck /> },
//   { name: "จัดส่งสำเร็จ", icon: <BiPackage /> },
// ];

// const RepairDashboard = () => {
//   const [data, setData] = useState([]); // สมมติว่าข้อมูลมาจาก API
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [dateType, setDateType] = useState("day");

//   // State สำหรับเก็บยอดนับที่คำนวณได้
//   const [statusCounts, setStatusCounts] = useState([]);

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-dashboard";
//       const response = await axios.get(url);
//       setData(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };
//   useEffect(() => {
//     getData();
//   }, []);

//   // ฟังก์ชันสำหรับกรองและนับข้อมูล
//   const filterAndCount = () => {
//     // 1. กรองข้อมูลตามวัน เดือน หรือปี
//     const filtered = data.filter((item) => {
//       const itemDate = dayjs(item.createAt);
//       return itemDate.isSame(selectedDate, dateType);
//     });

//     // 2. สร้าง object สำหรับนับจำนวนในแต่ละสถานะ
//     const statusCountMap = {};
//     filtered.forEach((item) => {
//       const status = item.status;
//       statusCountMap[status] = (statusCountMap[status] || 0) + 1;
//     });

//     // 3. รวมข้อมูลยอดนับเข้ากับ array สถานะ icons
//     const updatedStatusCounts = statusIcons.map((item) => {
//       const count = statusCountMap[item.action_status] || 0; // ถ้าไม่พบยอดนับ ให้เป็น 0
//       return { ...item, count }; // สร้าง Object ใหม่พร้อมยอดนับ
//     });

//     // 4. อัปเดต State เพื่อให้ Component Render ใหม่
//     setStatusCounts(updatedStatusCounts);
//   };

//   // ใช้ useEffect เพื่อเรียกฟังก์ชัน filterAndCount เมื่อ selectedDate หรือ dateType เปลี่ยน
//   useEffect(() => {
//     filterAndCount();
//   }, [selectedDate, dateType, data]); // เพิ่ม `data` ใน dependencies ถ้าข้อมูลมีการเปลี่ยนแปลง

//   const handleDateChange = (value) => {
//     setSelectedDate(value);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="month"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="year"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div>
//       <div style={{ marginBottom: "20px" }}>
//         <Select
//           defaultValue="day"
//           style={{ width: 120, marginRight: "10px" }}
//           onChange={handleDateTypeChange}
//         >
//           <Select.Option value="day">รายวัน</Select.Option>
//           <Select.Option value="month">รายเดือน</Select.Option>
//           <Select.Option value="year">รายปี</Select.Option>
//         </Select>
//         {renderDatePicker()}
//       </div>

//       <Row gutter={[16, 16]} justify="center">
//         {statusCounts.map((item, index) => (
//           <Col key={index} xs={12} sm={8} md={4} className="text-center">
//             <div className="d-flex flex-column align-items-center">
//               <span className="fs-3 mb-2">{item.icon}</span>
//               <p className="mb-0" style={{ fontSize: "0.8rem" }}>
//                 {item.name}
//               </p>
//               <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
//                 {item.count}
//               </span>
//             </div>
//           </Col>
//         ))}
//       </Row>
//     </div>
//   );
// };
// export default RepairDashboard;

// import { Table, Tag, Button, Select, message, Space } from "antd";
// import { useState, useEffect } from "react";
// import axios from "axios";

// const { Option } = Select;

// const Edit = () => {
//   const [data, setData] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatuses, setChangedStatuses] = useState({});

//   // Function to fetch initial data
//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-job";
//       const response = await axios.get(url);

//       // *** FIX 1: Add a key to each data object
//       const formattedData = response.data.map((item) => ({
//         ...item,
//         key: item.jobRef, // Assign jobRef as the unique key
//       }));

//       setData(formattedData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   // Toggles the editing mode for the status column
//   const handleEditStatus = () => {
//     setIsEditing(!isEditing);
//     if (isEditing) {
//       setChangedStatuses({}); // Clear changes when exiting edit mode
//     }
//   };

//   // Handles a status change for a specific row
//   const handleStatusChange = (newStatus, jobRef) => {
//     setChangedStatuses((prev) => ({
//       ...prev,
//       [jobRef]: newStatus,
//     }));
//   };

//   // Handles the final confirmation button click
//   const handleConfirm = async () => {
//     try {
//       // Iterate through the changed statuses and send API calls
//       const updatePromises = Object.keys(changedStatuses).map((jobRef) => {
//         const newStatus = changedStatuses[jobRef];
//         return axios.put(`http://localhost:3302/update-status/${jobRef}`, {
//           action_status: newStatus,
//         });
//       });

//       await Promise.all(updatePromises); // Wait for all updates to complete
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");

//       // After successful updates, re-fetch data to reflect changes
//       await getData();

//       // Exit editing mode and clear pending changes
//       setIsEditing(false);
//       setChangedStatuses({});
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       console.error("Failed to update status:", error);
//     }
//   };

//   const columns = [
//     {
//       title: "สถานะ",
//       key: "action_status",
//       dataIndex: "action_status",
//       render: (status, record) => {
//         const currentStatus = changedStatuses[record.jobRef] || status;
//         let color = "yellow";
//         if (currentStatus === "กำลังดำเนินการ") {
//           color = "orange";
//         } else if (currentStatus === "รอจัดส่ง") {
//           color = "geekblue";
//         } else if (currentStatus === "จัดส่งแล้ว") {
//           color = "green";
//         }

//         return isEditing ? (
//           <Select
//             defaultValue={currentStatus}
//             style={{ width: 120 }}
//             // Corrected: Add onClick to stop event propagation
//             onClick={(e) => e.stopPropagation()}
//             onChange={(value) => handleStatusChange(value, record.jobRef)}
//           >
//             <Option value="กำลังดำเนินการ">กำลังดำเนินการ</Option>
//             <Option value="รอจัดส่ง">รอจัดส่ง</Option>
//             <Option value="จัดส่งแล้ว">จัดส่งแล้ว</Option>
//           </Select>
//         ) : (
//           <Tag color={color}>{status}</Tag>
//         );
//       },
//     },
//     {
//       title: "เลขงาน",
//       dataIndex: "jobRef",
//       key: "jobRef",
//     },
//     {
//       title: "สินค้า",
//       dataIndex: "product_name",
//       key: "product_name",
//     },
//   ];

//   const hasChanges = Object.keys(changedStatuses).length > 0;

//   return (
//     <div>
//       <Space style={{ marginBottom: 16 }}>
//         <Button onClick={handleEditStatus}>
//           {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
//         </Button>
//         {isEditing && hasChanges && (
//           <Button type="primary" onClick={handleConfirm}>
//             ยืนยันการแก้ไข
//           </Button>
//         )}
//       </Space>
//       <Table columns={columns} dataSource={data} rowKey="jobRef" />
//     </div>
//   );
// };

// export default Edit;

// import axios from "axios";
// import React from "react";
// import { useEffect } from "react";
// import { useState } from "react";
// import Chart from "react-apexcharts";

// export default function Edit() {
//   const [data, setData] = useState([]);
//   const getData = () => {
//     const url = "http://localhost:3302/get-chart";
//     axios
//       .get(url)
//       .then((res) => {
//         setData(res.data);
//         console.log(res.data);
//       })
//       .catch((error) => {
//         console.error("Error");
//       });
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   const state = {
//     options: {
//       chart: {
//         id: "basic-bar",
//       },
//       xaxis: {
//         categories: [
//           "ประเภทที่ 1",
//           "ประเภทที่ 2",
//           "ประเภทที่ 3",
//           "ประเภทที่ 4",
//           "ประเภทที่ 5",
//           "ประเภทที่ 6",
//         ],
//       },
//     },
//     series: [
//       {
//         name: "series-1",
//         data: data.category,
//       },
//     ],
//   };
//   return (
//     <div className="app">
//       <div className="row">
//         <div className="mixed-chart">
//           <Chart
//             options={state.options}
//             series={state.series}
//             type="bar"
//             width="500"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
// import Accordion from "react-bootstrap/Accordion";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// // import { Timeline } from "antd";

// function Edit() {
//   const [data, setData] = useState([]); // เริ่มต้น state ด้วย null เพื่อแยกแยะระหว่าง undefined กับข้อมูลที่โหลดแล้ว

//   const getData = () => {
//     const url = `http://localhost:3302/get-detail/JOB2025081301`;
//     axios
//       .get(url)
//       .then((response) => {
//         // ตรวจสอบข้อมูลที่ได้รับ หากไม่ใช่ array ให้แปลงเป็น array
//         const responseData = Array.isArray(response.data)
//           ? response.data
//           : [response.data];
//         setData(responseData);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   };

//   useEffect(() => {
//     getData();
//   }, []);
//   return (
//     <div className="d-flex flex-row">
//       <div className="contain-job">
//         <Accordion defaultActiveKey="0">
//           <Accordion.Item eventKey="0">
//             <Accordion.Header>ข้อมูลลูกค้า</Accordion.Header>
//             <Accordion.Body>
//               {data &&
//                 data.map((element, index) => (
//                   <div key={index} className="product-details row">
//                     {/* <div className="d-flex flex-wrap mt-5 gap-5 justify-content-center "> */}
//                     <div>
//                       <p>
//                         <strong>ชื่อ</strong>
//                       </p>
//                       <p>{element.customer_firstname}</p>
//                       <p>
//                         <strong>นามสกุล</strong>
//                       </p>
//                       <p>{element.customer_lastname}</p>
//                       <p>
//                         <strong>อายุ</strong>
//                       </p>
//                       <p>{element.Customer_old}</p>
//                       <p>
//                         <strong>Email</strong>
//                       </p>
//                       <p>{element.email}</p>
//                       <p>
//                         <strong>Username</strong>
//                       </p>
//                       <p>{element.username}</p>
//                       <p>
//                         <strong>ช่องทางติดต่อ</strong>
//                       </p>
//                       <p>{element.contact}</p>
//                       <p>
//                         <strong>Line ID</strong>
//                       </p>
//                       <p>{element.line_id}</p>
//                       <p>
//                         <strong>เบอร์โทรศัพท์</strong>
//                       </p>
//                       <p>{element.phone}</p>
//                     </div>
//                     <div className="col-6"></div>
//                   </div>
//                 ))}
//             </Accordion.Body>
//           </Accordion.Item>
//           <Accordion.Item eventKey="1">
//             <Accordion.Header>ข้อมูลสินค้า</Accordion.Header>
//             <Accordion.Body>
//               {data &&
//                 data.map((element, index) => (
//                   <div key={index} className="product-details row">
//                     <div className="col-6">
//                       <p>
//                         <strong>เลขงาน</strong>
//                       </p>
//                       <p>{element.jobRef}</p>
//                       <p>
//                         <strong>Serial Number</strong>
//                       </p>
//                       <p>{element.serialNumber}</p>
//                       <p>
//                         <strong>Brand</strong>
//                       </p>
//                       <p>{element.brand}</p>
//                       <p>
//                         <strong>จำนวนสินค้าที่ซ่อม</strong>
//                       </p>
//                       <p>{element.unit}</p>
//                       <p>
//                         <strong>รายละเอียดสินค้า</strong>
//                       </p>
//                       <p>{element.description}</p>
//                       <p>
//                         <strong>วันที่เปิดซ่อม</strong>
//                       </p>
//                       <p>{element.createAt}</p>
//                     </div>
//                     <div className="col-6">
//                       <p>
//                         <strong>ชื่อสินค้า</strong>
//                       </p>
//                       <p>{element.product_name}</p>
//                       <p>
//                         <strong>SKU</strong>
//                       </p>
//                       <p>{element.sku}</p>
//                       <p>
//                         <strong>ประเภทสินค้า</strong>
//                       </p>
//                       <p>{element.category}</p>
//                       <p>
//                         <strong>หน่วย</strong>
//                       </p>
//                       <p>{element.pcs}</p>
//                       <p>
//                         <strong>รูปภาพสินค้า</strong>
//                       </p>
//                       <p>{element.image}</p>
//                     </div>
//                   </div>
//                 ))}
//             </Accordion.Body>
//           </Accordion.Item>
//         </Accordion>
//       </div>
//     </div>
//   );
// }

// export default Edit;

// import React from "react";
// import { Form, Input, Button, Card, message } from "antd";
// import axios from "axios";
// import { LiaUserEditSolid } from "react-icons/lia";

// // สมมติว่านี่คือ Component หลักของคุณ
// const Edit = () => {
//   const [formProduct] = Form.useForm();
//   const [formCustomer] = Form.useForm();
//   const isFormCustomerDisabled = false;

//   // ฟังก์ชันสมมติเพื่อแสดงสถานะเริ่มต้นของฟอร์ม
//   const showStatus = () => "รอการดำเนินการ";

//   // ฟังก์ชันที่คุณใช้สำหรับส่งข้อมูลไปยัง API
//   const createJob = (data) => {
//     const url = "http://localhost:3302/create-job";
//     axios
//       .post(url, data)
//       .then((res) => {
//         // แสดงข้อความเมื่อส่งข้อมูลสำเร็จ
//         message.success("บันทึกงานใหม่สำเร็จ!");
//         console.log("Job created successfully:", res.data);

//         // ล้างข้อมูลในฟอร์มหลังจากส่งสำเร็จ
//         formProduct.resetFields();
//         formCustomer.resetFields();
//       })
//       .catch((error) => {
//         // แสดงข้อความเมื่อเกิดข้อผิดพลาด
//         message.error("เกิดข้อผิดพลาดในการบันทึกงาน!");
//         console.error("Error creating job:", error);
//       });
//   };

//   // ฟังก์ชันหลักที่จัดการการรวมและส่งข้อมูล
//   const handleCombinedSubmit = async () => {
//     try {
//       // ตรวจสอบความถูกต้องของข้อมูลจากทั้งสองฟอร์ม
//       const productValues = await formProduct.validateFields();
//       const customerValues = await formCustomer.validateFields();

//       // รวมข้อมูลจากทั้งสองฟอร์มเข้าด้วยกันเป็น Object เดียว
//       const combinedData = {
//         ...productValues,
//         ...customerValues,
//       };

//       // แสดงข้อมูลที่ถูกรวมใน console เพื่อการตรวจสอบ
//       console.log("ข้อมูลที่ถูกรวมกันก่อนส่ง API:", combinedData);

//       // เรียกใช้ฟังก์ชัน createJob เพื่อส่งข้อมูลที่รวมแล้ว
//       createJob(combinedData);
//     } catch (errorInfo) {
//       console.error("Validation Failed:", errorInfo);
//       // แสดงข้อความแจ้งเตือนผู้ใช้ว่ามีข้อมูลไม่ครบถ้วน
//       message.warning("กรุณาตรวจสอบข้อมูลที่ยังไม่ครบถ้วน");
//     }
//   };

//   return (
//     <Card title="แบบฟอร์มรวมข้อมูลลูกค้าและสินค้า">
//       <Form
//         layout="vertical"
//         autoComplete="off"
//         form={formProduct}
//         className="content-sub-form-body"
//         initialValues={{ action_status: showStatus() }}
//       >
//         <Form.Item
//           name="jobRef"
//           label="เลขงาน"
//           rules={[
//             { required: true, message: "กรุณากรอกเลขงาน" },
//             { type: "string" },
//           ]}
//         >
//           <Input />
//         </Form.Item>
//       </Form>

//       <Form
//         layout="vertical"
//         autoComplete="off"
//         form={formCustomer}
//         className="content-sub-form-body"
//       >
//         <Form.Item
//           name="customerRef"
//           label="รหัสลูกค้า"
//           rules={[
//             { required: true, message: "กรุณากรอกรหัสลูกค้า" },
//             { type: "string" },
//           ]}
//         >
//           <Input
//             prefix={<LiaUserEditSolid />}
//             disabled={isFormCustomerDisabled}
//           />
//         </Form.Item>
//       </Form>

//       {/* ปุ่มสำหรับส่งข้อมูลทั้งหมด */}
//       <Button
//         type="primary"
//         onClick={handleCombinedSubmit}
//         style={{ marginTop: 16 }}
//       >
//         บันทึกงานใหม่
//       </Button>
//     </Card>
//   );
// };

// export default Edit;

// import React, { useEffect, useState } from "react";
// import { DatePicker, Select, Space } from "antd";
// import dayjs from "dayjs";
// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";

// const { Option } = Select;

// const Edit = () => {
//   const [totalCount, setTotalCount] = useState(0);
//   const [topCategory, setTopCategory] = useState({ name: "-", count: 0 });
//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());

//   // Mock data ที่มี category
//   const mockData = [
//     { id: 1, timestamp: "2025-08-25T09:00:00Z", category: "ผลไม้" },
//     { id: 2, timestamp: "2025-08-24T14:30:00Z", category: "ผัก" },
//     { id: 3, timestamp: "2025-08-25T18:15:00Z", category: "ผลไม้" },
//     { id: 4, timestamp: "2025-08-23T10:45:00Z", category: "ของใช้" },
//     { id: 5, timestamp: "2025-08-25T23:59:59Z", category: "ผลไม้" },
//     { id: 6, timestamp: "2025-08-25T12:00:00Z", category: "ของใช้" },
//     { id: 7, timestamp: "2025-07-25T10:00:00Z", category: "ผัก" },
//     { id: 8, timestamp: "2025-08-01T11:00:00Z", category: "ของใช้" },
//   ];

//   const filterAndCount = () => {
//     // กรองตามช่วงวันที่ที่เลือก (day / month / year)
//     const filtered = mockData.filter((item) => {
//       const itemDate = dayjs(item.timestamp);
//       return itemDate.isSame(selectedDate, dateType);
//     });

//     // รวมจำนวนทั้งหมด
//     const total = filtered.length;
//     setTotalCount(total);

//     // รวมยอดตาม category
//     const categoryCount = {};
//     filtered.forEach((item) => {
//       const cat = item.category;
//       categoryCount[cat] = (categoryCount[cat] || 0) + 1;
//     });

//     // หา category ที่มียอดมากที่สุด
//     let top = { name: "-", count: 0 };
//     for (const [cat, count] of Object.entries(categoryCount)) {
//       if (count > top.count) {
//         top = { name: cat, count };
//       }
//     }

//     setTopCategory(top);
//   };

//   useEffect(() => {
//     filterAndCount();
//   }, [selectedDate, dateType]);

//   const handleDateChange = (value) => {
//     setSelectedDate(value);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="month"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="year"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div>
//       <Space.Compact>
//         {renderDatePicker()}
//         <Select
//           value={dateType}
//           onChange={handleDateTypeChange}
//           style={{ width: "100px" }}
//         >
//           <Option value="day">วัน</Option>
//           <Option value="month">เดือน</Option>
//           <Option value="year">ปี</Option>
//         </Select>
//       </Space.Compact>

//       {/* h2 แรก: แสดงจำนวนรวม */}
//       <h2 className="mb-1 fs-5" style={{ marginTop: "16px" }}>
//         {totalCount} ชิ้น
//       </h2>

//       {/* h2 ที่สอง: แสดง category ที่มียอดมากสุด */}
//       <h2 className="mb-1 fs-5">
//         หมวดหมู่ที่มียอดมากที่สุด: {topCategory.name} ({topCategory.count} ชิ้น)
//       </h2>
//     </div>
//   );
// };

// export default Edit;

// import React, { useEffect, useState } from "react";
// import { DatePicker, Select, Space } from "antd";
// import dayjs from "dayjs"; // ใช้สำหรับจัดการวันที่
// import "dayjs/locale/th"; // ถ้าอยากให้เป็นภาษาไทย
// import locale from "antd/es/date-picker/locale/th_TH";

// const { Option } = Select;

// const Edit = () => {
//   const [count, setCount] = useState(0);
//   const [dateType, setDateType] = useState("day");
//   const [selectedDate, setSelectedDate] = useState(dayjs());

//   // mock data แทน response จาก backend
//   const mockData = [
//     { id: 1, timestamp: "2025-08-25T09:00:00Z" },
//     { id: 2, timestamp: "2025-08-24T14:30:00Z" },
//     { id: 3, timestamp: "2025-08-25T18:15:00Z" },
//     { id: 4, timestamp: "2025-08-23T10:45:00Z" },
//     { id: 5, timestamp: "2025-08-25T23:59:59Z" },
//     { id: 6, timestamp: "2025-07-15T12:00:00Z" },
//     { id: 7, timestamp: "2024-08-25T10:00:00Z" },
//   ];

//   const filterDataByDate = () => {
//     const count = mockData.filter((item) => {
//       const itemDate = dayjs(item.timestamp);

//       switch (dateType) {
//         case "day":
//           return itemDate.isSame(selectedDate, "day");
//         case "month":
//           return itemDate.isSame(selectedDate, "month");
//         case "year":
//           return itemDate.isSame(selectedDate, "year");
//         default:
//           return false;
//       }
//     }).length;

//     setCount(count);
//   };

//   useEffect(() => {
//     filterDataByDate(); // เรียกเมื่อ component โหลดครั้งแรก
//   }, [selectedDate, dateType]); // เรียกใหม่เมื่อมีการเปลี่ยนวันที่หรือประเภท

//   const handleDateChange = (value) => {
//     setSelectedDate(value);
//   };

//   const handleDateTypeChange = (value) => {
//     setDateType(value);
//   };

//   const renderDatePicker = () => {
//     switch (dateType) {
//       case "day":
//         return (
//           <DatePicker
//             locale={locale}
//             value={selectedDate}
//             onChange={handleDateChange}
//             format="DD MMM YYYY"
//             placeholder="เลือกวันที่"
//           />
//         );
//       case "month":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="month"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกเดือน"
//           />
//         );
//       case "year":
//         return (
//           <DatePicker
//             locale={locale}
//             picker="year"
//             value={selectedDate}
//             onChange={handleDateChange}
//             placeholder="เลือกปี"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div>
//       <Space.Compact>
//         {renderDatePicker()}
//         <Select
//           value={dateType}
//           onChange={handleDateTypeChange}
//           style={{ width: "100px" }}
//         >
//           <Option value="day">วัน</Option>
//           <Option value="month">เดือน</Option>
//           <Option value="year">ปี</Option>
//         </Select>
//       </Space.Compact>

//       <h2 className="mb-1 fs-5" style={{ marginTop: "16px" }}>
//         {count} ชิ้น
//       </h2>
//     </div>
//   );
// };

// export default Edit;

// import React from "react";
// import { Form, DatePicker, Input } from "antd";
// import dayjs from "dayjs";
// import { MdOutlineDescription } from "react-icons/md";

// import "dayjs/locale/th";
// import locale from "antd/es/date-picker/locale/th_TH";

// const Edit = () => {
//   const [form] = Form.useForm();

//   const disabledFutureDate = (current) => {
//     return current && current > dayjs().endOf("day");
//   };

//   const handleDateChange = (date) => {
//     if (date) {
//       const today = dayjs();
//       const duration = date.diff(today, "day");

//       form.setFieldsValue({
//         repair_duration: duration + 1,
//       });
//     } else {
//       form.setFieldsValue({
//         repair_duration: null,
//       });
//     }
//   };

//   return (
//     <Form
//       layout="vertical"
//       autoComplete="off"
//       form={form}
//       className="content-sub-form-body"
//     >
//       <Form.Item
//         name="expected_completion_date"
//         label="วันที่คาดว่าจะซ่อมสินค้าสำเร็จ"
//         rules={[{ required: true }]}
//         className="form-item-custom-size"
//       >
//         <DatePicker
//           format="DD/MM/YYYY"
//           locale={locale}
//           style={{ width: "100%" }}
//           onChange={handleDateChange}
//           disabledDate={disabledFutureDate} // **** เพิ่มบรรทัดนี้ ****
//         />
//       </Form.Item>

//       <Form.Item
//         name="repair_duration"
//         label="ระยะเวลาในการซ่อมสินค้า"
//         rules={[{ required: true }]}
//         className="form-item-custom-size"
//       >
//         <Input prefix={<MdOutlineDescription />} disabled />
//       </Form.Item>
//     </Form>
//   );
// };

// export default Edit;
// import React, { useState } from "react";
// import { Button, Tag, Select, Table } from "antd";
// import { MdEditDocument } from "react-icons/md";
// import axios from "axios";

// const { Option } = Select;

// export default function Edit() {
//   const initialData = [
//     { id: 1, name: "งานที่ 1", jobStatus: "กำลังดำเนินการ" },
//     { id: 2, name: "งานที่ 2", jobStatus: "รอจัดส่ง" },
//     { id: 3, name: "งานที่ 3", jobStatus: "จัดส่งแล้ว" },
//   ];

//   const [isEditingAll, setIsEditingAll] = useState(false);

//   const [rowStatus, setRowStatus] = useState(
//     initialData.reduce((acc, curr) => {
//       acc[curr.id] = curr.jobStatus;
//       return acc;
//     }, {})
//   );

//   // Function to toggle the edit mode for the entire table
//   const handleEditAllClick = () => {
//     setIsEditingAll(!isEditingAll);
//   };

//   const columns = [
//     {
//       title: "ชื่อ",
//       key: "name",
//       dataIndex: "name",
//     },
//     {
//       title: "สถานะ",
//       key: "jobStatus",
//       dataIndex: "jobStatus",
//       render: (status, record) => {
//         const currentStatus = rowStatus[record.id];

//         const handleStatusChange = async (newStatus) => {
//           // Update local state immediately for a fast UI
//           setRowStatus({ ...rowStatus, [record.id]: newStatus });

//           try {
//             // Mock API call, replace with your actual endpoint
//             await axios.put(`/api/update-status/${record.id}`, { newStatus });
//             console.log("Status updated successfully!");
//           } catch (error) {
//             console.error("Error updating status:", error);
//             // Revert state if the API call fails
//             setRowStatus({ ...rowStatus, [record.id]: status });
//           }
//         };

//         let color = "yellow";
//         if (currentStatus === "กำลังดำเนินการ") {
//           color = "orange";
//         } else if (currentStatus === "รอจัดส่ง") {
//           color = "geekblue";
//         } else if (currentStatus === "จัดส่งแล้ว") {
//           color = "green";
//         }

//         return isEditingAll ? (
//           <Select
//             defaultValue={currentStatus}
//             style={{ width: 120 }}
//             onChange={handleStatusChange}
//           >
//             <Option value="กำลังดำเนินการ">กำลังดำเนินการ</Option>
//             <Option value="รอจัดส่ง">รอจัดส่ง</Option>
//             <Option value="จัดส่งแล้ว">จัดส่งแล้ว</Option>
//           </Select>
//         ) : (
//           <Tag color={color}>{currentStatus}</Tag>
//         );
//       },
//     },
//   ];

//   return (
//     <>
//       <Button
//         className="btn-edit-all"
//         type="primary"
//         onClick={handleEditAllClick}
//         style={{ marginBottom: 16 }}
//       >
//         <MdEditDocument /> {isEditingAll ? "เสร็จสิ้น" : "แก้ไขสถานะทั้งหมด"}
//       </Button>
//       <Table dataSource={initialData} columns={columns} rowKey="id" />
//     </>
//   );
// }

// import React, { useState } from "react";
// import { Radio, Timeline } from "antd";
// import { data } from "react-router-dom";
// const App = () => {
//   const [mode, setMode] = useState("left");
//   // const onChange = (e) => {
//   //   setMode(e.target.value);
//   // };
//   return (
//     <>
//       {/* <Radio.Group
//         // onChange={onChange}
//         value={mode}
//         // style={{
//         //   marginBottom: 20,
//         // }}
//       >
//         <Radio value="left">Left</Radio>
//         <Radio value="right">Right</Radio>
//         <Radio value="alternate">Alternate</Radio>
//       </Radio.Group> */}
//       <Timeline
//         mode={"left"}
//         items={[
//           {
//             label: "เริ่มงาน",
//             children: data,
//           },
//           {
//             label: "สั่งอะไหล่",
//             children: "2015-09-01 09:12:11",
//           },
//           {
//             label: "ซ่อมสำเร็จ",
//             children: "2015-09-01 09:12:11",
//           },
//           {
//             label: "รอจัดส่ง",
//             children: "2015-09-01 09:12:11",
//           },
//           {
//             label: "จัดส่งสำเร็จ",
//             children: "2015-09-01 09:12:11",
//           },
//         ]}
//       />
//     </>
//   );
// };
// export default App;

// // import React, { useState } from "react";
// // import { Button, Tag, Select, Table } from "antd";
// // import { MdEditDocument } from "react-icons/md";
// // import axios from "axios";

// // const { Option } = Select;

// // export default function Edit() {
// //   // สมมติว่านี่คือข้อมูลที่คุณได้รับมาจาก API
// //   const initialData = [
// //     { id: 1, name: "งานที่ 1", jobStatus: "กำลังดำเนินการ" },
// //     { id: 2, name: "งานที่ 2", jobStatus: "รอจัดส่ง" },
// //     { id: 3, name: "งานที่ 3", jobStatus: "จัดส่งแล้ว" },
// //   ];

// //   // Use a state object to track the editing state for each row
// //   const [editingRows, setEditingRows] = useState({});

// //   // Use a state object to track the status for each row
// //   const [rowStatus, setRowStatus] = useState(
// //     initialData.reduce((acc, curr) => {
// //       acc[curr.id] = curr.jobStatus;
// //       return acc;
// //     }, {})
// //   );

// //   const handleEditClick = (record) => {
// //     record.map((item) => {
// //       // Set editing state to true for this row
// //       const currentStatus = rowStatus[item.id];
// //       const isEditing = editingRows[item.id] || false;
// //       setEditingRows({ ...editingRows, [item.id]: true });

// //       let color = "yellow";
// //       if (currentStatus === "กำลังดำเนินการ") {
// //         color = "orange";
// //       } else if (currentStatus === "รอจัดส่ง") {
// //         color = "geekblue";
// //       } else if (currentStatus === "จัดส่งแล้ว") {
// //         color = "green";
// //       } else if (currentStatus === "ยกเลิก") {
// //         color = "red";
// //       }
// //     });
// //   };

// //   const columns = [
// //     {
// //       title: "ชื่อ",
// //       key: "name",
// //       dataIndex: "name",
// //     },
// //     {
// //       title: "การดำเนินการ",
// //       key: "action",
// //       render: (text, record) => (
// //         <Button onClick={() => handleEditClick([record])}>แก้ไข</Button>
// //       ),
// //     },
// //     {
// //       title: "สถานะ",
// //       key: "jobStatus",
// //       dataIndex: "jobStatus",
// //       render: (status, record) => {
// //         // Check if this specific row is in editing mode
// //         const isEditing = editingRows[record.id];
// //         const currentStatus = rowStatus[record.id];

// //         const handleStatusChange = async (newStatus) => {
// //           // Set editing state to false for this row
// //           setEditingRows({ ...editingRows, [record.id]: false });

// //           // Update local state immediately for a fast UI
// //           setRowStatus({ ...rowStatus, [record.id]: newStatus });

// //           try {
// //             // This is a mock API call, replace with your actual endpoint
// //             await axios.put(`/api/update-status/${record.id}`, { newStatus });
// //             console.log("Status updated successfully!");
// //           } catch (error) {
// //             console.error("Error updating status:", error);
// //             // Revert state if the API call fails
// //             setRowStatus({ ...rowStatus, [record.id]: status });
// //           }
// //         };

// //         // const handleEditClick = () => {
// //         //   // Set editing state to true for this row

// //         //   setEditingRows({ ...editingRows, [record.id]: true });
// //         // };

// //         let color = "yellow";
// //         if (currentStatus === "กำลังดำเนินการ") {
// //           color = "orange";
// //         } else if (currentStatus === "รอจัดส่ง") {
// //           color = "geekblue";
// //         } else if (currentStatus === "จัดส่งแล้ว") {
// //           color = "green";
// //         }

// //         return isEditing ? (
// //           <Select
// //             defaultValue={currentStatus}
// //             style={{ width: 120 }}
// //             onChange={handleStatusChange}
// //             autoFocus
// //           >
// //             <Option value="กำลังดำเนินการ">กำลังดำเนินการ</Option>
// //             <Option value="รอจัดส่ง">รอจัดส่ง</Option>
// //             <Option value="จัดส่งแล้ว">จัดส่งแล้ว</Option>
// //           </Select>
// //         ) : (
// //           <div style={{ display: "flex", alignItems: "center" }}>
// //             <Tag color={color}>{currentStatus}</Tag>
// //           </div>
// //         );
// //       },
// //     },
// //   ];

// //   return (
// //     <div>
// //       <Table dataSource={initialData} columns={columns} rowKey="id" />
// //       {/* <Button className="btn-edit-status" onClick={handleEditClick}>
// //         <MdEditDocument className="button-icon" />
// //       </Button> */}
// //     </div>
// //   );
// // }
