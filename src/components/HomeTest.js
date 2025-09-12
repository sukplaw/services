import React, { useState } from "react";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './HomeTest.css'; // ไฟล์ CSS ที่จะสร้างขึ้นมา

const HomeTest = () => {
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDetailDropdownOpen, setIsDetailDropdownOpen] = useState(false);

  return (
    <div
      className="dropdown"
      onMouseEnter={() => setIsEditDropdownOpen(true)}
      onMouseLeave={() => setIsEditDropdownOpen(false)}
    >
      <button
        className="btn btn-secondary dropdown-toggle btn-showData-Edit"
        type="button"
        aria-expanded={isEditDropdownOpen}
      >
        แก้ไขงาน
      </button>
      {isEditDropdownOpen && (
        <ul className="dropdown-menu show">
          <li
            className="dropdown-hover-right"
            onMouseEnter={() => setIsDetailDropdownOpen(true)}
            onMouseLeave={() => setIsDetailDropdownOpen(false)}
          >
            <a className="dropdown-item" href="#">
              แก้ไขรายละเอียดงาน
            </a>
            {isDetailDropdownOpen && (
              <ul className="dropdown-menu show">
                <li>
                  <a className="dropdown-item" href="#">
                    แก้ไขหัวข้อ
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    แก้ไขคำอธิบาย
                  </a>
                </li>
              </ul>
            )}
          </li>
          <li
            className="dropdown-hover-right"
            onMouseEnter={() => setIsStatusDropdownOpen(true)}
            onMouseLeave={() => setIsStatusDropdownOpen(false)}
          >
            <a className="dropdown-item" href="#">
              แก้ไขสถานะงาน
            </a>
            {isStatusDropdownOpen && (
              <ul className="dropdown-menu show">
                <li>
                  <a className="dropdown-item" href="#">
                    กำลังดำเนินการ
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    เสร็จสิ้น
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    รอการอนุมัติ
                  </a>
                </li>
              </ul>
            )}
          </li>
        </ul>
      )}
    </div>
  );
};

export default HomeTest;

// import React, { useState, useEffect } from "react";
// import ApexCharts from "react-apexcharts";
// import axios from "axios";
// import { Col, Card } from "antd";

// const HomeTest = () => {
//   const [data, setData] = useState([]);
//   const [chartOptions, setChartOptions] = useState({
//     options: {
//       chart: {
//         id: "product-bar-chart",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [], // จะถูกแทนที่ด้วย 'category' ที่ไม่ซ้ำกัน
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#4F46E5"],
//     },
//     series: [
//       {
//         name: "หน่วย (Unit)",
//         data: [], // จะถูกแทนที่ด้วย 'unit' ที่รวมยอดแล้ว
//       },
//     ],
//   });

//   const [customerChartOptions, setCustomerChartOptions] = useState({
//     options: {
//       chart: {
//         id: "customer-bar-chart",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [], // จะถูกแทนที่ด้วย 'customer' ที่ไม่ซ้ำกัน
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#22C55E"],
//     },
//     series: [
//       {
//         name: "จำนวนลูกค้า",
//         data: [], // จะถูกแทนที่ด้วยจำนวนลูกค้าแต่ละประเภท
//       },
//     ],
//   });

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-dashboard";
//       const response = await axios.get(url);
//       const rawData = response.data;

//       // หมวดหมู่คงที่สำหรับสินค้า
//       const staticCategories = ["ประเภทที่ 1", "ประเภทที่ 2", "ประเภทที่ 3"];

//       // รวมยอด unit สำหรับ category ที่ซ้ำกัน
//       const aggregatedProductData = rawData.reduce((acc, item) => {
//         const { category, unit } = item;
//         acc[category] = (acc[category] || 0) + unit;
//         return acc;
//       }, {});

//       // สร้างข้อมูลสำหรับกราฟสินค้าจากหมวดหมู่คงที่
//       const productCategories = staticCategories;
//       const productUnits = productCategories.map(
//         (cat) => aggregatedProductData[cat] || 0
//       );

//       // รวมยอดลูกค้าจากข้อมูลที่มีอยู่จริง
//       const aggregatedCustomerData = rawData.reduce((acc, item) => {
//         const customer = item.customer || "ลูกค้าไม่ระบุ"; // สมมติว่ามี customer field
//         acc[customer] = (acc[customer] || 0) + 1; // นับจำนวนครั้ง
//         return acc;
//       }, {});

//       // สร้างข้อมูลสำหรับกราฟลูกค้าจาก aggregated data
//       const customerNames = Object.keys(aggregatedCustomerData);
//       const customerCounts = Object.values(aggregatedCustomerData);

//       // อัปเดต state ของข้อมูลและกราฟสินค้า
//       setData(rawData);
//       setChartOptions((prevState) => ({
//         ...prevState,
//         options: {
//           ...prevState.options,
//           xaxis: {
//             categories: productCategories,
//           },
//         },
//         series: [
//           {
//             ...prevState.series[0],
//             data: productUnits,
//           },
//         ],
//       }));

//       // อัปเดต state ของกราฟลูกค้า
//       setCustomerChartOptions((prevState) => ({
//         ...prevState,
//         options: {
//           ...prevState.options,
//           xaxis: {
//             categories: customerNames,
//           },
//         },
//         series: [
//           {
//             ...prevState.series[0],
//             data: customerCounts,
//           },
//         ],
//       }));
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   return (
//     <div className="app">
//       {/* Note: You will need to import 'Col' and 'Card' from your UI library, e.g., 'antd' */}
//       <div className="row flex flex-wrap -mx-2">
//         <Col xs={24} sm={12} className="px-2 mb-4">
//           <Card>
//             <h3 className="mb-3">ประเภทสินค้าที่ถูกเคลมสูงสุดประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "250px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {chartOptions.options.xaxis.categories.length > 0 ? (
//                 <ApexCharts
//                   options={chartOptions.options}
//                   series={chartOptions.series}
//                   type="bar"
//                   width="100%"
//                   height="100%"
//                 />
//               ) : (
//                 <div className="flex justify-center items-center h-full">
//                   <p>กำลังโหลดข้อมูล...</p>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} sm={12} className="px-2 mb-4">
//           <Card>
//             <h3 className="mb-3">จำนวนลูกค้าประจำเดือน</h3>
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{
//                 height: "250px",
//                 backgroundColor: "#f0f0f0",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {customerChartOptions.options.xaxis.categories.length > 0 ? (
//                 <ApexCharts
//                   options={customerChartOptions.options}
//                   series={customerChartOptions.series}
//                   type="bar"
//                   width="100%"
//                   height="100%"
//                 />
//               ) : (
//                 <div className="flex justify-center items-center h-full">
//                   <p>กำลังโหลดข้อมูล...</p>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//       </div>
//     </div>
//   );
// };

// export default HomeTest;

// import React, { useState, useEffect } from "react";
// import ApexCharts from "react-apexcharts";
// import axios from "axios";

// const HomeTest = () => {
//   const [data, setData] = useState([]);
//   const [chartOptions, setChartOptions] = useState({
//     options: {
//       chart: {
//         id: "basic-bar",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [], // จะถูกแทนที่ด้วย 'category' ที่ไม่ซ้ำกัน
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#4F46E5"],
//     },
//     series: [
//       {
//         name: "หน่วย (Unit)",
//         data: [], // จะถูกแทนที่ด้วย 'unit' ที่รวมยอดแล้ว
//       },
//     ],
//   });

//   const getData = async () => {
//     try {
//       const url = "http://localhost:3302/get-dashboard";
//       const response = await axios.get(url);
//       const rawData = response.data;

//       // หมวดหมู่คงที่ที่คุณต้องการแสดงผล
//       const staticCategories = ["ประเภทที่ 1", "ประเภทที่ 2", "ประเภทที่ 3"];

//       // รวมยอด unit สำหรับ category ที่ซ้ำกัน
//       const aggregatedData = rawData.reduce((acc, item) => {
//         const { category, unit } = item;
//         // หาก category นั้นมีอยู่แล้วใน acc ให้เพิ่ม unit เข้าไป
//         // หากยังไม่มี ให้สร้างขึ้นใหม่
//         acc[category] = (acc[category] || 0) + unit;
//         return acc;
//       }, {});

//       // สร้างข้อมูลสำหรับกราฟจากหมวดหมู่คงที่
//       const categories = staticCategories;
//       const units = categories.map((cat) => aggregatedData[cat] || 0);

//       // อัปเดต state ของข้อมูลและกราฟ
//       setData(rawData);
//       setChartOptions((prevState) => ({
//         ...prevState,
//         options: {
//           ...prevState.options,
//           xaxis: {
//             categories: categories,
//           },
//         },
//         series: [
//           {
//             ...prevState.series[0],
//             data: units,
//           },
//         ],
//       }));
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []); // เรียก getData() เมื่อ component โหลดครั้งแรก

//   return (
//     <div className="app">
//       <div className="row">
//         <div className="mixed-chart">
//           {/* ตรวจสอบว่ามีข้อมูลก่อน render chart เพื่อป้องกัน error */}
//           {chartOptions.options.xaxis.categories.length > 0 ? (
//             <ApexCharts
//               options={chartOptions.options}
//               series={chartOptions.series}
//               type="bar"
//               width="500"
//             />
//           ) : (
//             <div className="flex justify-center items-center h-full">
//               <p>กำลังโหลดข้อมูล...</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomeTest;

// import React, { useState } from "react";
// import ApexCharts from "react-apexcharts";
// import axios from "axios";

// const HomeTest = () => {
//   const [data, setData] = useState([]);
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

//   const [chartState] = useState({
//     options: {
//       chart: {
//         id: "basic-bar",
//         toolbar: {
//           show: false,
//         },
//       },
//       xaxis: {
//         categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 5,
//           horizontal: false,
//         },
//       },
//       colors: ["#4F46E5"],
//     },
//     series: [
//       {
//         name: "Series 1",
//         data: [30, 40, 45, 50, 49, 60, 70, 91],
//       },
//     ],
//   });

//   return (
//     <div className="app">
//       <div className="row">
//         <div className="mixed-chart">
//           <ApexCharts
//             options={chartState.options}
//             series={chartState.series}
//             type="bar"
//             width="500"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomeTest;

// import React from "react";
// import { Table, Tag, Form, Input, Space, Dropdown } from "antd";
// import Button from "react-bootstrap/Button";
// import { IoSearch } from "react-icons/io5";
// import { BiFilterAlt } from "react-icons/bi";
// import { FaPlus } from "react-icons/fa";
// import { MdEditDocument } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useState } from "react";
// import { useEffect } from "react";

// export default function Home() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [toggleStatus, setToggleStatus] = useState(false);

//   const getData = () => {
//     const url = "http://localhost:3302/get-job";
//     axios
//       .get(url)
//       .then((response) => {
//         setData(response.data);
//         console.log(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   };

//   useEffect(() => {
//     getData();
//     // getDataProduct();
//   }, []);

//   const handleToggleStatus = () => {
//     setToggleStatus(!toggleStatus);
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
//       dataIndex: "customerName",
//       key: "customerName",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "createdBy",
//       key: "createdBy",
//     },
//     {
//       title: "สถานะ",
//       key: "action_status",
//       dataIndex: "action_status",
//       render: (status) => {
//         let color = "yellow";
//         if (status === "กำลังดำเนินการ") {
//           color = "orange";
//         } else if (status === "รอจัดส่ง") {
//           color = "geekblue";
//         } else if (status === "จัดส่งแล้ว") {
//           color = "green";
//         }
//         return <Tag color={color}>{status}</Tag>;
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
//       key: "กำลังดำเนินการ",
//       label: "กำลังดำเนินการ",
//     },
//     {
//       key: "ซ่อมเสร็จ",
//       label: "ซ่อมเสร็จ",
//     },
//     {
//       key: "4",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "5",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "6",
//       label: "จัดส่งแล้ว",
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
//     // Check against the new list of fields for searching
//     const searchableFields = [
//       "jobRef",
//       "product",
//       "serialNumber",
//       "sku",
//       "customerName",
//       "createdBy",
//       "action_status",
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
//       ? item.action_status === selectedStatus
//       : true;

//     return matchesSearch && matchesStatus;
//   });

//   const countRemainingTime = (filterData) => {
//     return filterData.map((item) => {
//       const updateAt = new Date(item.expected_completion_date);
//       const createAt = new Date();
//       const remainingTimeInMilliseconds =
//         updateAt.getTime() - createAt.getTime();

//       // คำนวณและปัดเศษลงให้เป็นจำนวนเต็มวัน
//       const remainingTimeInDays = Math.floor(
//         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//       );

//       return {
//         ...item,
//         remainingTime: remainingTimeInDays,
//       };
//     });
//   };

//   const countRemainingTimeWarning = (data) => {
//     return (
//       data
//         // First, filter the data
//         .filter((item) => {
//           const updateAt = new Date(item.expected_completion_date);
//           const createAt = new Date();
//           const remainingTimeInMilliseconds =
//             updateAt.getTime() - createAt.getTime();
//           const remainingTimeInDays = Math.floor(
//             remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//           );
//           // Keep only the items where remaining time is <= 2 days
//           return remainingTimeInDays <= 2;
//         })
//         // Then, map the filtered data to add the new 'remainingTime' property
//         .map((item) => {
//           const updateAt = new Date(item.expected_completion_date);
//           const createAt = new Date();
//           const remainingTimeInMilliseconds =
//             updateAt.getTime() - createAt.getTime();
//           const remainingTimeInDays = Math.floor(
//             remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//           );

//           return {
//             ...item,
//             remainingTime: remainingTimeInDays,
//           };
//         })
//     );
//   };

//   return (
//     <div className="contain-main">
//       <div>
//         <h1 className="text-danger mb-4 mt-5 text-center ">
//           แจ้งเตือนสถานะงานที่คงค้าง
//         </h1>
//         <Table
//           dataSource={countRemainingTimeWarning(data)}
//           columns={columns}
//           scroll={{ x: 1300 }}
//           style={{
//             textAlign: "center",
//           }}
//         />
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
//             <Button
//               className="btn-edit-status align-items-center"
//               onClick={handleToggleStatus}
//             >
//               <MdEditDocument className="button-icon justify-content-start" />
//               <span className="d-flex justify-content-center">แก้ไขสถานะ</span>
//             </Button>

//             <Space className="button">
//               <Dropdown menu={menuProps} trigger={["click"]}>
//                 <Button
//                   type="primary"
//                   style={{ backgroundColor: "#F7F7F7", color: "#616161" }}
//                   className="button"
//                 >
//                   <BiFilterAlt type="primary" className="button-icon" />
//                   รอดำเนิการ
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
//           </div>
//         </div>
//       </div>
//       <div>
//         <Table
//           dataSource={countRemainingTime(filterData)}
//           columns={columns}
//           scroll={{ x: 1300 }}
//         />
//         {/* <h2>Remaining Time: {countRemainingTime}</h2> */}
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import { Table, Tag, Form, Input, Space, Dropdown } from "antd";
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

// export default function Home() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [toggleStatus, setToggleStatus] = useState(false);

//   const getData = () => {
//     const url = "http://localhost:3302/get-job";
//     axios
//       .get(url)
//       .then((response) => {
//         setData(response.data);
//         console.log(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   // const filterStatus = (status) => {
//   //   if (status === "รอจัดส่ง") {
//   //     return "orange";
//   //   } else if (status === "จัดส่งแล้ว") {
//   //     return "green";
//   //   }
//   //   return "yellow";
//   // };

//   const handleToggleStatus = () => {
//     setToggleStatus(!toggleStatus);
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
//       dataIndex: "customerName",
//       key: "customerName",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "createdBy",
//       key: "createdBy",
//     },
//     {
//       title: "สถานะ",
//       key: "action_status",
//       dataIndex: "action_status",
//       render: (status) => {
//         let color = "yellow";
//         if (status === "กำลังดำเนินการ") {
//           color = "orange";
//         } else if (status === "รอจัดส่ง") {
//           color = "geekblue";
//         } else if (status === "จัดส่งแล้ว") {
//           color = "green";
//         }
//         return <Tag color={color}>{status}</Tag>;
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

//   // const countRemainingTime = (data) => {
//   //   data.map((item) => {
//   //     const updateAt = item.updateAt;
//   //     const createAt = item.createAt;
//   //     const remainingTime = updateAt - createAt;
//   //     console.log("Remaining Time:", remainingTime);
//   //   });
//   //   // updateAt = data.updateAt;
//   // };

//   // Then, in your component:
//   // <Table dataSource={} columns={columns} />;

//   // const data = [
//   //   {
//   //     key: "1",
//   //     name: "John Brown",
//   //     job: "JOB1234567890",
//   //     product: " เครื่องช่วยฟัง รุ่น B-HA02",
//   //     serialNumber: "GGG123UI4L567X",
//   //     sku: "1234567-012",
//   //     customerName: "สมชาย ใจดี",
//   //     createdBy: "Raviteja Bandila",
//   //     createdAt: "01/08/2568",
//   //     remainingTime: "2 วัน",
//   //     updatedAt: "01/08/2568",
//   //     updatedBy: "Varsha Mishra",
//   //     tags: ["จัดส่งสำเร็จ"],
//   //   },
//   //   {
//   //     key: "1",
//   //     name: "John Brown",
//   //     job: "JOB1234567890",
//   //     product: " เครื่องช่วยฟัง รุ่น B-HA02",
//   //     serialNumber: "GGG123UI4L567X",
//   //     sku: "1234567-012",
//   //     customerName: "สมชาย ใจดี",
//   //     createdBy: "Raviteja Bandila",
//   //     createdAt: "01/08/2568",
//   //     remainingTime: "2 วัน",
//   //     updatedAt: "01/08/2568",
//   //     updatedBy: "Varsha Mishra",
//   //     tags: ["เริ่มงาน"],
//   //   },
//   //   {
//   //     key: "1",
//   //     name: "John Brown",
//   //     job: "JOB1234567890",
//   //     product: " เครื่องช่วยฟัง รุ่น B-HA02",
//   //     serialNumber: "GGG123UI4L567X",
//   //     sku: "1234567-012",
//   //     customerName: "สมชาย ใจดี",
//   //     createdBy: "Raviteja Bandila",
//   //     createdAt: "01/08/2568",
//   //     remainingTime: "2 วัน",
//   //     updatedAt: "01/08/2568",
//   //     updatedBy: "Varsha Mishra",
//   //     tags: ["ซ่อมสำเร็จ"],
//   //   },
//   //   {
//   //     key: "1",
//   //     name: "John Brown",
//   //     job: "JOB1234567890",
//   //     product: " เครื่องช่วยฟัง รุ่น B-HA02",
//   //     serialNumber: "GGG123UI4L567X",
//   //     sku: "1234567-012",
//   //     customerName: "สมชาย ใจดี",
//   //     createdBy: "Raviteja Bandila",
//   //     createdAt: "01/08/2568",
//   //     remainingTime: "2 วัน",
//   //     updatedAt: "01/08/2568",
//   //     updatedBy: "Varsha Mishra",
//   //     tags: ["รอจัดส่ง"],
//   //   },
//   // ];

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
//       key: "กำลังดำเนินการ",
//       label: "กำลังดำเนินการ",
//     },
//     {
//       key: "ซ่อมเสร็จ",
//       label: "ซ่อมเสร็จ",
//     },
//     {
//       key: "4",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "5",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "6",
//       label: "จัดส่งแล้ว",
//     },
//   ];

//   // const fields = [
//   //   "job_id",
//   //   "product",
//   //   "serialNumber",
//   //   "sku",
//   //   "customerName",
//   //   "createdBy",
//   //   "action_status",
//   //   "createAt",
//   //   "remainingTime",
//   //   "updateAt",
//   //   "updatedBy",
//   // ];

//   // const filterData = data.filter((item) => {
//   //   return fields.some((field) => {
//   //     const fieldValue = item[field];
//   //     return (
//   //       typeof fieldValue === "string" &&
//   //       fieldValue.toLowerCase().includes(searchData.toLowerCase())
//   //     );
//   //   });
//   // });

//   const handleMenuClick = (e) => {
//     console.log("Clicked item:", e.key);
//     setSelectedStatus(e.key);
//   };
//   const menuProps = {
//     items: menuItems,
//     onClick: handleMenuClick,
//   };

//   const filterData = data.filter((item) => {
//     // Check against the new list of fields for searching
//     const searchableFields = [
//       "jobRef",
//       "product",
//       "serialNumber",
//       "sku",
//       "customerName",
//       "createdBy",
//       "action_status",
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
//       ? item.action_status === selectedStatus
//       : true;

//     return matchesSearch && matchesStatus;
//   });

//   const countRemainingTime = (filterData) => {
//     return filterData.map((item) => {
//       const updateAt = new Date(item.expected_completion_date);
//       const createAt = new Date();
//       const remainingTimeInMilliseconds =
//         updateAt.getTime() - createAt.getTime();

//       // คำนวณและปัดเศษลงให้เป็นจำนวนเต็มวัน
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
//             <Button
//               className="btn-edit-status align-items-center"
//               onClick={handleToggleStatus}
//             >
//               <MdEditDocument className="button-icon justify-content-start" />
//               <span className="d-flex justify-content-center">แก้ไขสถานะ</span>
//             </Button>

//             <Space className="button">
//               <Dropdown menu={menuProps} trigger={["click"]}>
//                 <Button
//                   type="primary"
//                   style={{ backgroundColor: "#F7F7F7", color: "#616161" }}
//                   className="button"
//                 >
//                   <BiFilterAlt type="primary" className="button-icon" />
//                   รอดำเนิการ
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

// const { Option } = Select;

// export default function HomeTest() {
//   const [data, setData] = useState([]);
//   const [searchData, setSearchData] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [changedStatus, setChangedStatus] = useState({});

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

//   // const updateJobStatus = async (jobRef, newStatus) => {
//   //   const url = `http://localhost:3302/update-status/${jobRef}`;
//   //   try {
//   //     const response = await axios.put(url, {
//   //       action_status: newStatus,
//   //     });
//   //     console.log(response.data.message); // "Job status updated successfully"
//   //   } catch (error) {
//   //     console.error("Failed to update status:", error);
//   //   }
//   // };

//   // const getDataProduct = () => {
//   //   const url = "http://localhost:3302/get-product";
//   //   axios
//   //     .get(url)
//   //     .then((response) => {
//   //       setData(response.data);
//   //       console.log(response.data);
//   //     })
//   //     .catch((error) => {
//   //       console.error("Error fetching data:", error);
//   //     });
//   // };

//   useEffect(() => {
//     getData();
//     // getDataProduct();
//   }, []);

//   // const filterStatus = (status) => {
//   //   if (status === "รอจัดส่ง") {
//   //     return "orange";
//   //   } else if (status === "จัดส่งแล้ว") {
//   //     return "green";
//   //   }
//   //   return "yellow";
//   // };

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
//           action_status: newStatus,
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

//   // const handleToggleStatus = () => {
//   //   setToggleStatus(!toggleStatus);
//   // };

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
//       dataIndex: "customerName",
//       key: "customerName",
//     },
//     {
//       title: "ชื่อผู้เปิดงาน",
//       dataIndex: "createdBy",
//       key: "createdBy",
//     },
//     {
//       title: "สถานะ",
//       key: "action_status",
//       dataIndex: "action_status",
//       render: (status, record) => {
//         // const currentStatus = rowStatus[record.id];

//         // const handleStatusChange = async (newStatus) => {
//         //   setRowStatus({ ...rowStatus, [record.id]: newStatus });

//         //   try {
//         //     await axios.put(`/api/update-status/${record.id}`, { newStatus });
//         //     console.log("Status updated successfully!");
//         //   } catch (error) {
//         //     console.error("Error updating status:", error);
//         //     setRowStatus({ ...rowStatus, [record.id]: status });
//         //   }
//         // };
//         const currentStatus = changedStatus[record.jobRef] || status;
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

//   // const countRemainingTime = (data) => {
//   //   data.map((item) => {
//   //     const updateAt = item.updateAt;
//   //     const createAt = item.createAt;
//   //     const remainingTime = updateAt - createAt;
//   //     console.log("Remaining Time:", remainingTime);
//   //   });
//   //   // updateAt = data.updateAt;
//   // };

//   // Then, in your component:
//   // <Table dataSource={} columns={columns} />;

//   // const data = [
//   //   {
//   //     key: "1",
//   //     name: "John Brown",
//   //     job: "JOB1234567890",
//   //     product: " เครื่องช่วยฟัง รุ่น B-HA02",
//   //     serialNumber: "GGG123UI4L567X",
//   //     sku: "1234567-012",
//   //     customerName: "สมชาย ใจดี",
//   //     createdBy: "Raviteja Bandila",
//   //     createdAt: "01/08/2568",
//   //     remainingTime: "2 วัน",
//   //     updatedAt: "01/08/2568",
//   //     updatedBy: "Varsha Mishra",
//   //     tags: ["จัดส่งสำเร็จ"],
//   //   },
//   //   {
//   //     key: "1",
//   //     name: "John Brown",
//   //     job: "JOB1234567890",
//   //     product: " เครื่องช่วยฟัง รุ่น B-HA02",
//   //     serialNumber: "GGG123UI4L567X",
//   //     sku: "1234567-012",
//   //     customerName: "สมชาย ใจดี",
//   //     createdBy: "Raviteja Bandila",
//   //     createdAt: "01/08/2568",
//   //     remainingTime: "2 วัน",
//   //     updatedAt: "01/08/2568",
//   //     updatedBy: "Varsha Mishra",
//   //     tags: ["เริ่มงาน"],
//   //   },
//   //   {
//   //     key: "1",
//   //     name: "John Brown",
//   //     job: "JOB1234567890",
//   //     product: " เครื่องช่วยฟัง รุ่น B-HA02",
//   //     serialNumber: "GGG123UI4L567X",
//   //     sku: "1234567-012",
//   //     customerName: "สมชาย ใจดี",
//   //     createdBy: "Raviteja Bandila",
//   //     createdAt: "01/08/2568",
//   //     remainingTime: "2 วัน",
//   //     updatedAt: "01/08/2568",
//   //     updatedBy: "Varsha Mishra",
//   //     tags: ["ซ่อมสำเร็จ"],
//   //   },
//   //   {
//   //     key: "1",
//   //     name: "John Brown",
//   //     job: "JOB1234567890",
//   //     product: " เครื่องช่วยฟัง รุ่น B-HA02",
//   //     serialNumber: "GGG123UI4L567X",
//   //     sku: "1234567-012",
//   //     customerName: "สมชาย ใจดี",
//   //     createdBy: "Raviteja Bandila",
//   //     createdAt: "01/08/2568",
//   //     remainingTime: "2 วัน",
//   //     updatedAt: "01/08/2568",
//   //     updatedBy: "Varsha Mishra",
//   //     tags: ["รอจัดส่ง"],
//   //   },
//   // ];

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
//       key: "กำลังดำเนินการ",
//       label: "กำลังดำเนินการ",
//     },
//     {
//       key: "ซ่อมเสร็จ",
//       label: "ซ่อมเสร็จ",
//     },
//     {
//       key: "4",
//       label: "รอทดสอบ",
//     },
//     {
//       key: "5",
//       label: "รอจัดส่ง",
//     },
//     {
//       key: "6",
//       label: "จัดส่งแล้ว",
//     },
//   ];

//   // const fields = [
//   //   "job_id",
//   //   "product",
//   //   "serialNumber",
//   //   "sku",
//   //   "customerName",
//   //   "createdBy",
//   //   "action_status",
//   //   "createAt",
//   //   "remainingTime",
//   //   "updateAt",
//   //   "updatedBy",
//   // ];

//   // const filterData = data.filter((item) => {
//   //   return fields.some((field) => {
//   //     const fieldValue = item[field];
//   //     return (
//   //       typeof fieldValue === "string" &&
//   //       fieldValue.toLowerCase().includes(searchData.toLowerCase())
//   //     );
//   //   });
//   // });

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
//       "action_status",
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
//       ? item.action_status === selectedStatus
//       : true;

//     return matchesSearch && matchesStatus;
//   });

//   // const [rowStatus, setRowStatus] = useState(
//   //   filterData.reduce((acc, curr) => {
//   //     acc[curr.id] = curr.action_status;
//   //     return acc;
//   //   }, {})
//   // );

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

//   // const countRemainingTimeWarning = (data) => {
//   //   return data
//   //     .filter((item) => {
//   //       const updateAt = new Date(item.expected_completion_date);
//   //       const createAt = new Date();
//   //       const remainingTimeInMilliseconds =
//   //         updateAt.getTime() - createAt.getTime();
//   //       const remainingTimeInDays = Math.floor(
//   //         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//   //       );
//   //       return remainingTimeInDays <= 2;
//   //     })
//   //     .map((item) => {
//   //       const updateAt = new Date(item.expected_completion_date);
//   //       const createAt = new Date();
//   //       const remainingTimeInMilliseconds =
//   //         updateAt.getTime() - createAt.getTime();
//   //       const remainingTimeInDays = Math.floor(
//   //         remainingTimeInMilliseconds / (1000 * 60 * 60 * 24)
//   //       );

//   //       return {
//   //         ...item,
//   //         remainingTime: remainingTimeInDays,
//   //       };
//   //     });
//   // };

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
//                   รอดำเนิการ
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
//           </div>
//         </div>
//       </div>
//       <div>
//         <Table
//           dataSource={countRemainingTime(filterData)}
//           columns={columns}
//           scroll={{ x: 1300 }}
//         />
//         {/* <h2>Remaining Time: {countRemainingTime}</h2> */}
//       </div>
//     </div>
//   );
// }
