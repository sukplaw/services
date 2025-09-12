// import React from "react";
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
// import { useState } from "react";
// import { useEffect } from "react";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";

// const { Option } = Select;

// export default function Job() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});
//   const [open, setOpen] = useState(false);
//   // const [statusCounts, setStatusCounts] = useState([]);

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

//   const handleStatusChange = (newStatus, jobRef) => {
//     setChangedStatus((prev) => ({
//       ...prev,
//       [jobRef]: newStatus,
//     }));
//   };

//   const handleConfirm = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//         const newStatus = changedStatus[jobRef];
//         return axios.put(`http://localhost:3302/update-status/${jobRef}`, {
//           jobStatus: newStatus,
//         });
//       });

//       await Promise.all(updatePromises);
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       setIsEditing(false);
//       setChangedStatus({});
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       console.error("Failed to update status:", error);
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
//         const currentStatus = changedStatus[record.jobRef] || status;
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
//             onChange={(value) => handleStatusChange(value, record.jobRef)}
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
//       sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
//       defaultSortOrder: "ascend",
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
//     {
//       key: "เริ่มงาน",
//       label: "เริ่มงาน",
//     },
//     {
//       key: "สั่งอะไหล่",
//       label: "สั่งอะไหล่",
//     },
//     {
//       key: "ซ่อมสำเร็จ",
//       label: "ซ่อมสำเร็จ",
//     },
//     {
//       key: "รอทดสอบ",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "รอจัดส่ง",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "จัดส่งสำเร็จ",
//       label: "จัดส่งสำเร็จ",
//     },
//     {
//       key: "ยกเลิกการเคลมสินค้า",
//       label: "ยกเลิกการเคลมสินค้า",
//     },
//   ];

//   const handleMenuClick = (e) => {
//     console.log("Clicked item:", e.key);
//     setSelectedStatus(e.key);
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product",
//       "serialNumber",
//       "sku",
//       "customerName",
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
//       const updateAt = new Date(item.expected_completion_date);
//       const createAt = new Date();
//       const remainingTimeInMilliseconds =
//         updateAt.getTime() - createAt.getTime();
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
//       <div className="text-dark mb-3 mt-4 ">
//         <div className="d-flex justify-content-end">
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
//             <Input
//               onChange={(e) => setSearchData(e.target.value)}
//               prefix={<IoSearch style={{ width: "30px", height: "30px" }} />}
//               placeholder="ค้นหางานที่ต้องการ"
//               style={{
//                 width: "399px",
//                 height: "49px",
//                 backgroundColor: "#FFFFFF",
//                 borderColor: "#AAAAAAFF",
//                 color: "#CCCCCC",
//                 borderRadius: "20px",
//               }}
//             />
//           </Form.Item>
//         </div>
//         <div className="d-flex align-items-center justify-content-between mb-5 mt-3 ms-5">
//           <h2>งานทั้งหมด</h2>
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
//               เพิ่มงานซ่อม
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
//                 onClick={() => {
//                   handleConfirm();
//                   setOpen(true);
//                 }}
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
//                 {/* <Button
//                   // onClick={handleCreateJob}
//                   className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
//                 >
//                   <span className="d-flex justify-content-end">สร้างงาน</span>
//                 </Button> */}
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
//         {/* <h2>Remaining Time: {countRemainingTime}</h2> */}
//       </div>
//     </div>
//   );
// }

// import React from "react";
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
// import { useState } from "react";
// import { useEffect } from "react";
// import Backlogs from "./Backlogs";
// import Modal from "react-bootstrap/Modal";
// import { IoMdCheckmarkCircle } from "react-icons/io";

// const { Option } = Select;

// export default function Home() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});
//   const [open, setOpen] = useState(false);
//   // const [statusCounts, setStatusCounts] = useState([]);

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

//   const handleStatusChange = (newStatus, jobRef) => {
//     setChangedStatus((prev) => ({
//       ...prev,
//       [jobRef]: newStatus,
//     }));
//   };

//   const handleConfirm = async () => {
//     try {
//       const updatePromises = Object.keys(changedStatus).map((jobRef) => {
//         const newStatus = changedStatus[jobRef];
//         return axios.put(`http://localhost:3302/update-status/${jobRef}`, {
//           jobStatus: newStatus,
//         });
//       });

//       await Promise.all(updatePromises);
//       message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
//       await getData();
//       setIsEditing(false);
//       setChangedStatus({});
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//       console.error("Failed to update status:", error);
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
//         const currentStatus = changedStatus[record.jobRef] || status;
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
//             onChange={(value) => handleStatusChange(value, record.jobRef)}
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
//     {
//       key: "เริ่มงาน",
//       label: "เริ่มงาน",
//     },
//     {
//       key: "สั่งอะไหล่",
//       label: "สั่งอะไหล่",
//     },
//     {
//       key: "ซ่อมสำเร็จ",
//       label: "ซ่อมสำเร็จ",
//     },
//     {
//       key: "รอทดสอบ",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "รอจัดส่ง",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "จัดส่งสำเร็จ",
//       label: "จัดส่งสำเร็จ",
//     },
//     {
//       key: "ยกเลิกการเคลมสินค้า",
//       label: "ยกเลิกการเคลมสินค้า",
//     },
//   ];

//   const handleMenuClick = (e) => {
//     console.log("Clicked item:", e.key);
//     setSelectedStatus(e.key);
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
//   };

//   const filterData = data.filter((item) => {
//     const searchableFields = [
//       "jobRef",
//       "product",
//       "serialNumber",
//       "sku",
//       "customerName",
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
//       const updateAt = new Date(item.expected_completion_date);
//       const createAt = new Date();
//       const remainingTimeInMilliseconds =
//         updateAt.getTime() - createAt.getTime();
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
//           <Form.Item
//             name="Input"
//             rules={[{ required: true, message: "Please input!" }]}
//           >
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
//                 onClick={() => {
//                   handleConfirm();
//                   setOpen(true);
//                 }}
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
//                 {/* <Button
//                   // onClick={handleCreateJob}
//                   className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
//                 >
//                   <span className="d-flex justify-content-end">สร้างงาน</span>
//                 </Button> */}
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
//         {/* <h2>Remaining Time: {countRemainingTime}</h2> */}
//       </div>
//     </div>
//   );
// }
