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

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const daysBetween = (a, b) => {
    const ms = b.getTime() - a.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };

  const rowClassName = (record) => {
    if (
      record.jobStatus === "จัดส่งสำเร็จ" ||
      record.jobStatus === "ยกเลิกการเคลมสินค้า"
    ) {
      return "";
    }
    return record.remainingTime <= 2 ? "row-red-text" : "pointer-cursor";
  };

  const computeTimeProgress = (createAtISO, expectedISO) => {
    const now = new Date();
    const start = new Date(createAtISO);
    const end = new Date(expectedISO);
    const totalMs = Math.max(1, end.getTime() - start.getTime());
    const remainingDays = daysBetween(now, end);

    let percentRemaining = ((end.getTime() - now.getTime()) / totalMs) * 100;
    if (remainingDays <= 0) {
      percentRemaining = 100;
    } else {
      percentRemaining = clamp(Math.round(percentRemaining), 0, 100);
    }

    let colorClass = "bg-success";
    if (remainingDays <= 5 && remainingDays >= 3) {
      colorClass = "bg-warning";
    }
    if (remainingDays <= 2 && remainingDays > 0) {
      colorClass = "bg-danger";
    }
    if (remainingDays <= 0) {
      colorClass = "bg-danger";
    }

    const labelText =
      remainingDays < 0
        ? `เลยกำหนด | ${Math.abs(remainingDays)} วัน`
        : remainingDays === 0
        ? "ครบเวลาดำเนินการ"
        : `${remainingDays} วัน`;

    return { percentRemaining, remainingDays, colorClass, labelText };
  };


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
      dataIndex: "serviceRef",
      key: "serviceRef",
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
      align: "center",
      sorter: (a, b) => a.remainingTime - b.remainingTime,
      render: (text, record) => {
        const { percentRemaining, colorClass, labelText } = computeTimeProgress(
          record.createAt,
          record.expected_completion_date
        );
        return (
          <div style={{ minWidth: 240 }}>
            <div className="progress pretty" title={labelText}>
              <div
                className={`progress-bar ${colorClass}`}
                role="progressbar"
                style={{
                  width: `${percentRemaining}%`,
                  transition: "width .5s ease",
                }}
                aria-valuenow={percentRemaining}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span className="text-muted" style={{ fontSize: 12 }}>
                ความคืบหน้า
              </span>
              <span className="progress-label" style={{ fontSize: 12 }}>
                ⏳ {labelText}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "วันที่แก้ไขสถานะล่าสุด",
      dataIndex: "latestUpdateAt",
      key: "latestUpdateAt",
      align: "center",
      render: (d) => new Date(d).toLocaleDateString("th-TH"),
    },
    {
      title: "ผู้แก้ไขสถานะล่าสุด",
      dataIndex: "latestUpdateBy",
      key: "latestUpdateBy",
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
