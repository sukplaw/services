import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Tag } from "antd";
import axios from "axios";

export default function JobStatusTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { jobStatus } = useParams(); // ดึงชื่อสถานะจาก URL
  const navigate = useNavigate();

  const getData = () => {
    const url = `http://localhost:3302/get-job/${jobStatus}`;

    axios
      .get(url)
      .then((response) => {
        const responseData = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setData(responseData);
        console.log(responseData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData([]); // Set to empty array on error
      });
  };

  useEffect(() => {
    getData();
  }, [jobStatus]);

  //   useEffect(() => {
  //     const fetchDataByStatus = async () => {
  //       setLoading(true);
  //       try {
  //         // ดึงข้อมูลทั้งหมดจาก API
  //         // *** ตรวจสอบ endpoint นี้ให้ดีว่ามีข้อมูลที่ถูกต้องหรือไม่
  //         const response = await axios.get("http://localhost:3302/get-home");
  //         const allJobs = response.data;

  //         // **ขั้นตอนที่ 1: ตรวจสอบข้อมูลดิบที่ได้จาก API**
  //         console.log("Data from API:", allJobs);

  //         // กรองข้อมูลเฉพาะสถานะที่ตรงกับที่ผู้ใช้กดเข้ามา
  //         const filteredJobs = allJobs.filter(
  //           (job) => job.jobStatus === statusName
  //         );

  //         // **ขั้นตอนที่ 2: ตรวจสอบข้อมูลที่ถูกกรองแล้ว**
  //         console.log("Filtered jobs for status:", statusName, filteredJobs);

  //         setData(filteredJobs);
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchDataByStatus();
  //   }, [statusName]);

  const columns = [
    // ... your columns
    {
      title: "ลำดับ",
      dataIndex: "job",
      key: "job",
      render: (text, record, index) => index + 1,
    },
    {
      title: "เลขงาน",
      dataIndex: "jobRef",
      key: "jobRef",
      sorter: (a, b) => a.jobRef.localeCompare(b.jobRef),
    },
    {
      title: "สินค้า",
      dataIndex: "product_name",
      key: "product_name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
    },
    {
      title: "Serial Number",
      dataIndex: "serialNumber",
      key: "serialNumber",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "ชื่อลูกค้า",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "ชื่อผู้เปิดงาน",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "สถานะ",
      key: "jobStatus",
      dataIndex: "jobStatus",
      render: (status) => {
        let color = "#ea7317";
        if (status === "สั่งอะไหล่") {
          color = "#ffba08";
        } else if (status === "เริ่มการซ่อม") {
          color = "#b36a5e";
        } else if (status === "ซ่อมสำเร็จ") {
          color = "#b36a5e";
        } else if (status === "รอทดสอบ") {
          color = "#2364aa";
        } else if (status === "รอจัดส่ง") {
          color = "#5a189a";
        } else if (status === "จัดส่งสำเร็จ") {
          color = "#386641";
        } else if (status === "ยกเลิกการเคลมสินค้า") {
          color = "#d00000";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "วันที่เปิดงาน",
      dataIndex: "createAt",
      key: "createAt",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "ระยะเวลาที่ดำเนินการคงเหลือ",
      dataIndex: "remainingTime",
      key: "remainingTime",
      sorter: (a, b) => a.remainingTime - b.remainingTime,
      defaultSortOrder: "ascend",
    },
    {
      title: "วันที่แก้ไขสถานะล่าสุด",
      dataIndex: "updateAt",
      key: "updateAt",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "ผู้แก้ไขสถานะล่าสุด",
      dataIndex: "updatedBy",
      key: "updatedBy",
    },
  ];

  return (
    <div className="contain-main">
      <div className="text-dark mb-3 mt-4">
        <div style={{ padding: "20px" }}>
          <h1>ข้อมูลสถานะ : {jobStatus}</h1>
          {/* {data.length > 0 && (
            <div>
              <h1>ข้อมูลสถานะ: {data[0].jobStatus}</h1>
            </div>
          )} */}

          <Button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
            &lt; กลับ
          </Button>
          <Table
            dataSource={data}
            columns={columns}
            loading={loading}
            rowKey="jobRef"
          />
        </div>
      </div>
    </div>
  );
}
