import React, { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  InputNumber,
  message,
  Upload
} from "antd";
import Button from "react-bootstrap/Button";
import { MdOutlineWorkOutline } from "react-icons/md";
import { MdOutlineDescription } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { LiaUserEditSolid } from "react-icons/lia";
import { MdOutlineEmail } from "react-icons/md";
import { GrDatabase } from "react-icons/gr";
import Modal from "react-bootstrap/Modal";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import locale from "antd/es/date-picker/locale/th_TH";
import axios from "axios";
import { IoSearch } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { MdProductionQuantityLimits } from "react-icons/md";
import { FiHome } from "react-icons/fi";
import { IoMdCloseCircle } from "react-icons/io";


const { Dragger } = Upload;
dayjs.extend(buddhistEra);
dayjs.locale("th");
export default function CreateJobForm() {
  // const [form] = Form.useForm();
  const [formCustomer] = Form.useForm();
  const [formProduct] = Form.useForm();

  const [dataProduct, setDataProduct] = useState([]);
  const [dataCustomer, setDataCustomer] = useState([]);

  const [openProductModal, setOpenProductModal] = useState(false);

  const [openModalJob, setOpenModalJob] = useState(false);

  const [openModalCustomer, setOpenModalCustomer] = useState(false);

  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const [selectedDataProduct, setSelectedDataProduct] = useState(null);
  const [selectedDataCustomer, setSelectedDataCustomer] = useState(null);
  const [isFormProductDisabled, setIsFormProductDisabled] = useState(true);
  const [isFormCustomerDisabled, setIsFormCustomerDisabled] = useState(true);

  const [isGenerated, setIsGenerated] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const [openModalJobError, setOpenModalJobError] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [fileList, setFileList] = useState([]);

  function showStatus() {
    let status = "เริ่มงาน";
    console.log("สถานะภายในฟังก์ชัน:", status);
    return status;
  }
  showStatus();

  const showModalJob = () => {
    // console.log("showModalJob");
    setOpenModalJob(true);
  };
  const handleCloseJob = () => {
    setOpenModalJob(false);
  };

  const showProductModal = () => {
    setOpenProductModal(true);
  };
  const handleCloseProductModal = () => {
    setOpenProductModal(false);
  };

  const handleCloseCustomerModal = () => {
    setOpenModalCustomer(false);
  };
  const navigate = useNavigate();

  const handletoJob = () => {
    navigate("/job");
  };

  const toCreateProduct = () => {
    navigate("/create-product");
  };

  const toCreateCustomer = () => {
    navigate("/create-customer");
  };

  const getDataProduct = () => {
    const url = "http://localhost:3302/get-product";
    axios
      .get(url)
      .then((res) => {
        setDataProduct(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
      });
  };

  const getDataCustomer = () => {
    const url = "http://localhost:3302/get-customer";
    axios
      .get(url)
      .then((res) => {
        setDataCustomer(res.data);
        setSelectedDataProduct(res.data[0]);
        console.log(res.data);
      })
      .catch((error) => {
        console.error("Error fetching customer data:", error);
      });
  };

  // const createJob = (data) => {
  //   const url = "http://localhost:3302/create-job";
  //   axios
  //     .post(url, data)
  //     .then((res) => {
  //       setDataCustomer(res.data);
  //       console.log("Job created successfully:", res.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error creating job:", error);
  //     });
  // };

  // const createJob = (data) => {
  //   const url = "http://localhost:3302/create-job";
  //   axios
  //     .post(url, data)
  //     .then((res) => {
  //       // แสดงข้อความเมื่อส่งข้อมูลสำเร็จ
  //       message.success("บันทึกงานใหม่สำเร็จ!");
  //       console.log("Job created successfully:", res.data);

  //       // ล้างข้อมูลในฟอร์มหลังจากส่งสำเร็จ
  //       formProduct.resetFields();
  //       formCustomer.resetFields();
  //     })
  //     .catch((error) => {
  //       // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  //       message.error("เกิดข้อผิดพลาดในการบันทึกงาน!");
  //       console.error("Error creating job:", error);
  //     });
  // };

  const createJob = (data) => {
    const url = "http://localhost:3302/create-job";
    axios
      .post(url, data)
      .then((res) => {
        message.success("บันทึกงานใหม่สำเร็จ!");
        console.log("Job created successfully:", res.data);

        formProduct.resetFields();
        formCustomer.resetFields();

        setOpenModalJob(true); // ✅ เปิดโมดัล “สำเร็จ”
      })
      .catch((error) => {
        message.error("เกิดข้อผิดพลาดในการบันทึกงาน!");
        console.error("Error creating job:", error);

        setOpenModalJobError(true); // ❌ เปิดโมดัล “ไม่สำเร็จ”
      });
  };

  // ✅ ดึงค่าทุกอย่างจาก formProduct (รวม URL ที่ set ไว้)
  const onFinish = (values) => {
    console.log("test")
    const serviceRef = localStorage.getItem("serviceRef") || sessionStorage.getItem("serviceRef");
    console.log("🧪 serviceRef ที่ดึงจาก localStorage/sessionStorage:", serviceRef);

    const jobData = {
      ...values,
      imageUrls: uploadedUrls,
      serviceRef,
    };

    createJob(jobData);
  };
  // const onFinish = (values) => {
  //   if (!values.claimImage || values.claimImage.length === 0) {
  //     message.error("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
  //     return;
  //   }

  //   const jobData = {
  //     ...values,
  //     imageUrls: uploadedUrls,
  //     serviceRef: localStorage.getItem("serviceRef") || sessionStorage.getItem("serviceRef"), // ✅ เพิ่มบรรทัดนี้
  //     // claimImage: JSON.stringify(values.claimImage),
  //   }
  //   console.log("🚀 ส่ง jobData ไป backend:", jobData); // ✅ ดูว่า serviceRef มีมั้ย
  //   createJob(jobData);
  // };


  useEffect(() => {
    getDataProduct();
    getDataCustomer();
    showStatus();
  }, []);

  useEffect(() => {
    // Logic ของ useEffect ที่สอง
    if (selectedDataProduct) {
      formProduct.setFieldsValue({
        product_name: selectedDataProduct.product_name,
        productRef: selectedDataProduct.productRef,
        sku: selectedDataProduct.sku,
        brand: selectedDataProduct.brand,
        pcs: selectedDataProduct.pcs,
        category: selectedDataProduct.category,
        description: selectedDataProduct.description,
      });
      setIsFormProductDisabled(true);
    } else {
      // ถ้าไม่มีข้อมูลสินค้าถูกเลือก ให้ reset ฟอร์มและสร้าง Job ID
      setIsFormProductDisabled(false);
      formProduct.resetFields();

      // Logic ของ useEffect ตัวแรก
      const generateJobId = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const datePrefix = `${year}${month}${day}`;

        const lastGeneratedData = JSON.parse(
          localStorage.getItem("lastGeneratedJob")
        );
        let sequenceNumber = 1;
        if (lastGeneratedData && lastGeneratedData.date === datePrefix) {
          sequenceNumber = lastGeneratedData.sequence + 1;
        }
        const formattedSequence = String(sequenceNumber).padStart(3, "0");

        const newJobId = `JOB${datePrefix}${formattedSequence}`;

        const newLastGeneratedData = {
          date: datePrefix,
          sequence: sequenceNumber,
        };
        localStorage.setItem(
          "lastGeneratedJob",
          JSON.stringify(newLastGeneratedData)
        );

        formProduct.setFieldsValue({ jobRef: newJobId });
        setIsGenerated(true);
      };

      generateJobId();
    }
  }, [selectedDataProduct, formProduct]);

  // useEffect(() => {
  //   const generateJobId = () => {
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

  //     // 4. จัดรูปแบบเลขลำดับให้มี 3 หลัก
  //     const formattedSequence = String(sequenceNumber).padStart(3, "0");

  //     // 5. สร้างหมายเลข Job ID ใหม่
  //     const newJobId = `JOB${datePrefix}${formattedSequence}`;

  //     // 6. บันทึกข้อมูลเลขลำดับล่าสุดลงใน localStorage
  //     const newLastGeneratedData = {
  //       date: datePrefix,
  //       sequence: sequenceNumber,
  //     };
  //     localStorage.setItem(
  //       "lastGeneratedJob",
  //       JSON.stringify(newLastGeneratedData)
  //     );

  //     // 7. กำหนดค่าลงในฟอร์ม
  //     form.setFieldsValue({
  //       jobRef: newJobId,
  //     });
  //     setIsGenerated(true);
  //   };

  //   // เรียกฟังก์ชันสร้างเลข Job ทันทีที่หน้าเว็บถูกเปิด
  //   // ตรวจสอบเพื่อไม่ให้สร้างซ้ำซ้อนถ้ามีการ re-render
  //   if (!isGenerated) {
  //     generateJobId();
  //   }
  // }, [form, isGenerated]);

  // useEffect(() => {
  //   if (selectedDataProduct) {
  //     form.setFieldsValue({
  //       product_name: selectedDataProduct.product_name,
  //       sku: selectedDataProduct.sku,
  //       brand: selectedDataProduct.brand,
  //       pcs: selectedDataProduct.pcs,
  //       description: selectedDataProduct.description,
  //     });
  //   }
  // }, [selectedDataProduct, form]);

  // useEffect(() => {
  //   if (selectedDataProduct) {
  //     form.setFieldsValue({
  //       product_name: selectedDataProduct.product_name,
  //       sku: selectedDataProduct.sku,
  //       brand: selectedDataProduct.brand,
  //       pcs: selectedDataProduct.pcs,
  //       description: selectedDataProduct.description,
  //     });
  //     setIsFormProductDisabled(true);
  //   } else {
  //     setIsFormProductDisabled(false);
  //     form.resetFields();
  //   }
  // }, [selectedDataProduct, form]);

  useEffect(() => {
    if (selectedDataCustomer) {
      formCustomer.setFieldsValue({
        customerRef: selectedDataCustomer.customerRef,
        customer_firstname: selectedDataCustomer.customer_firstname,
        customer_lastname: selectedDataCustomer.customer_lastname,
        customer_old: selectedDataCustomer.customer_old,
        username: selectedDataCustomer.username,
        email: selectedDataCustomer.email,
        line_id: selectedDataCustomer.line_id,
        phone: selectedDataCustomer.phone,
        address: selectedDataCustomer.address,
      });
      setIsFormCustomerDisabled(true);
    } else {
      setIsFormCustomerDisabled(false);
      formCustomer.resetFields();
    }
  }, [selectedDataCustomer, formCustomer]);

  const handleRowProduct = (record) => {
    if (
      selectedDataProduct &&
      selectedDataProduct.product_id === record.product_id
    ) {
      setSelectedDataProduct(null);
    } else {
      setSelectedDataProduct(record);
    }
  };

  const handleRowCustomer = (record) => {
    if (
      selectedDataCustomer &&
      selectedDataCustomer.customer_id === record.customer_id
    ) {
      setSelectedDataCustomer(null);
    } else {
      setSelectedDataCustomer(record);
    }
  };

  const columns = [
    {
      title: "ชื่อสินค้า",
      dataIndex: "product_name",
      key: "product_name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
    },
    {
      title: "แบรนด์",
      dataIndex: "brand",
      key: "brand",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.sku.localeCompare(b.sku),
    },
  ];

  const columnsCustomer = [
    {
      title: "รหัสลูกค้า",
      dataIndex: "customerRef",
      key: "customerRef",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.customerRef.localeCompare(b.customerRef),
    },
    {
      title: "ชื่อ",
      dataIndex: "customer_firstname",
      key: "customer_firstname",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) =>
        a.customer_firstname.localeCompare(b.customer_firstname),
    },
    {
      title: "นามสกุล",
      dataIndex: "customer_lastname",
      key: "customer_lastname",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.customer_lastname.localeCompare(b.customer_lastname),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Line id",
      dataIndex: "line_id",
      key: "line_id",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.line_id.localeCompare(b.line_id),
    },
    {
      title: "เบอร์โทรศัพท์",
      dataIndex: "phone",
      key: "phone",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
  ];

  const filterDataByProduct = dataProduct.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchProduct.toLocaleLowerCase()) ||
      item.sku.toLowerCase().includes(searchProduct.toLocaleLowerCase())
  );

  const filterDataByCustomer = dataCustomer.filter((customer) => {
    const fields = [
      "customerRef",
      "customer_firstname",
      "customer_lastname",
      "username",
      "email",
      "line_id",
      "phone",
    ];
    return fields.some((field) => {
      const fieldValue = customer[field];
      return (
        typeof fieldValue === "string" &&
        fieldValue.toLowerCase().includes(searchCustomer.toLowerCase())
      );
    });
  });

  const disableDatePass = (current) => {
    return current && current < dayjs().endOf("day");
    // const today = dayjs();
    //   return current && current.isBefore(today, 'day');
  };

  const handleDateChange = (date) => {
    if (date) {
      const today = dayjs();
      const duration = date.diff(today, "day");
      formProduct.setFieldsValue({
        repair_duration: duration + 1,
      });
    } else {
      formProduct.setFieldsValue({
        repair_duration: null,
      });
    }
  };

  const handleCombinedSubmit = async () => {
    try {
      const productValues = await formProduct.validateFields();
      const customerValues = await formCustomer.validateFields();
      const serviceRef = localStorage.getItem("serviceRef") || sessionStorage.getItem("serviceRef");
      console.log("serviceRef จาก localStorage/sessionStorage:", serviceRef);

      const combinedData = { ...productValues, ...customerValues };

      if (combinedData.expected_completion_date) {
        combinedData.expected_completion_date = dayjs(
          combinedData.expected_completion_date
        ).format("YYYY-MM-DD HH:mm:ss");
      }

      combinedData.serviceRef = serviceRef; // เพิ่มบรรทัดนี้

    combinedData.items = [
      {
        jobRef: combinedData.jobRef,
        productRef: combinedData.productRef,
        serialNumber: combinedData.serialNumber,
        pcs: combinedData.pcs,
        unit: combinedData.unit,
        jobStatus: combinedData.jobStatus,
        serviceRef: serviceRef // ใช้ค่าที่ดึงมาโดยตรง
      },
    ];

      console.log("ข้อมูลที่ถูกรวมและแปลงแล้วก่อนส่ง API:", combinedData);
      createJob(combinedData);
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
      message.warning("กรุณาตรวจสอบข้อมูลที่ยังไม่ครบถ้วน");
      setOpenModalJobError(true);
    }
  };


  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const uploadProps = {
    name: "imageFile",
    multiple: true,
    action: "http://localhost:3303/upload",
    listType: "picture",
    fileList: fileList, // ✅ ให้ Upload ใช้ fileList จาก state

    onChange(info) {
      const newFileList = info.fileList;

      // ✅ filter เฉพาะรูปที่อัปโหลดสำเร็จ และมี URL
      const uploadedUrls = newFileList
        .filter(file => file.status === "done")
        .map(file => file.response?.url || file.url) // response.url สำหรับใหม่, file.url สำหรับที่ลบแล้วแต่อยาก preview
        .filter(Boolean);

      // ✅ อัปเดต form ด้วย URL ล่าสุด
      formProduct.setFieldsValue({ claimImage: uploadedUrls });

      // ✅ อัปเดต fileList
      setFileList(newFileList);
    },

    // ✅ ฟังก์ชันลบรูป (อัปเดต fileList และ form ด้วย)
    onRemove(file) {
      const newFileList = fileList.filter(f => f.uid !== file.uid);
      setFileList(newFileList);

      const uploadedUrls = newFileList
        .filter(file => file.status === "done")
        .map(file => file.response?.url || file.url)
        .filter(Boolean);

      formProduct.setFieldsValue({ claimImage: uploadedUrls });
    },
  };

  return (
    <div className="container-fluid min-vh-100 py-4">
      {/* Header */}
      <div className="container mb-3">
        <div className="text-white rounded-3 shadow-sm p-3 p-md-4 header-gradient-card">
          <h2 className="m-0 fw-bold">เพิ่มงานซ่อม</h2>
        </div>
      </div>

      {/* Form Card */}
      <div className="container">
        <div className="card rounded-4 shadow-sm border">
          <div className="small bg-warning-subtle border rounded p-2 m-3">
            * กรุณากรอกข้อมูลตามจริงเพื่อความถูกต้องของงานบริการ
          </div>
          <div className="card-body p-3 p-md-4">
            <div className="row g-3 g-md-4">
              {/* Left Column: Customer Information Form */}
              <div className="col-12 col-md-6">
                <Form
                  form={formCustomer}
                  layout="vertical"
                  autoComplete="off"
                  onFinish={createJob}
                >
                  <div className="d-flex align-items-center mb-5">
                    <h6 className="fw-bold text-dark m-0 border-start border-4 border-warning ps-2">
                      ข้อมูลลูกค้า
                    </h6>
                    <div className="ms-auto d-flex gap-2">
                      <Button
                        className="d-flex align-items-center justify-content-between btn-data margin-top-100"
                        onClick={() => setOpenModalCustomer(true)}
                      >
                        <GrDatabase className="button-icon justify-content-start" />
                        <span className="d-flex justify-content-end">ฐานข้อมูลลูกค้า</span>
                      </Button>
                      <Button
                        className="d-flex align-items-center justify-content-between btn-table margin-top-100"
                        onClick={toCreateCustomer}
                      >
                        <FaUserPlus className="button-icon justify-content-start" />
                        <span className="d-flex justify-content-end">
                          เพิ่มข้อมูลลูกค้า
                        </span>
                      </Button>
                    </div>
                  </div>
                  <Form.Item name="customerRef" label="รหัสลูกค้า" rules={[{ required: true }, { type: "string" }]}>
                    <Input prefix={<LiaUserEditSolid />} disabled />
                  </Form.Item>
                  <Form.Item name="customer_firstname" label="ชื่อ" rules={[{ required: true }, { type: "string" }]}>
                    <Input prefix={<LiaUserEditSolid />} disabled />
                  </Form.Item>
                  <Form.Item name="customer_lastname" label="นามสกุล" rules={[{ required: true }, { type: "string" }]}>
                    <Input prefix={<LiaUserEditSolid />} disabled />
                  </Form.Item>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true }, { type: "string" }]}
                  >
                    <Input
                      prefix={<LiaUserEditSolid />}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item
                    name="customer_old"
                    label="อายุ"
                    rules={[{ required: true }, { type: "number" }]}
                  >
                    <Input
                      prefix={<LiaUserEditSolid />}
                      // disabled={isFormCustomerDisabled}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true }, { type: "string" }]}
                  >
                    <Input
                      prefix={<MdOutlineEmail />}
                      // disabled={isFormCustomerDisabled}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item name="phone" label="เบอร์โทรศัพท์" rules={[{ required: true }, { type: "string" }]}>
                    <Input prefix={<MdOutlineEmail />} disabled />
                  </Form.Item>
                  <Form.Item name="address" label="ที่อยู่" rules={[{ required: true }, { type: "string" }]}>
                    <Input.TextArea prefix={<MdOutlineEmail />} autoSize={{ minRows: 3, maxRows: 5 }} disabled />
                  </Form.Item>
                  <Form.Item name="customer_contact" label="ช่องทางติดต่อ" rules={[{ required: true }, { type: "string" }]}>
                    <Select placeholder="กรุณาเลือกช่องทางติดต่อ">
                      <Select.Option value="phone">เบอร์โทรศัพท์</Select.Option>
                      <Select.Option value="line">Line</Select.Option>
                      <Select.Option value="address">ที่อยู่ลูกค้า</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>
              </div>

              {/* Right Column: Product and Job Information Form */}
              <div className="col-12 col-md-6">
                <Form
                  form={formProduct}
                  layout="vertical"
                  autoComplete="off"
                  onFinish={onFinish}
                  initialValues={{ jobStatus: showStatus() }}
                >
                  <div className="d-flex align-items-center mb-5 ">
                    <h6 className="fw-bold text-dark m-0 border-start border-4 border-warning ps-2">
                      ข้อมูลสินค้าและงานซ่อม
                    </h6>
                    <div className="ms-auto d-flex gap-2">
                      <Button
                        className="d-flex align-items-center justify-content-between btn-data margin-top-100"
                        onClick={showProductModal}
                      >
                        <GrDatabase className="button-icon justify-content-start" />
                        <span className="d-flex justify-content-center">
                          ข้อมูลสินค้าในคลัง
                        </span>
                      </Button>
                      <Button
                        className="d-flex align-items-center justify-content-between btn-table margin-top-100"
                        onClick={toCreateProduct}
                      >
                        <MdProductionQuantityLimits className="button-icon justify-content-start" />
                        <span className="d-flex justify-content-end">
                          เพิ่มข้อมูลสินค้า
                        </span>
                      </Button>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <Form.Item name="jobRef" label="เลขงาน" rules={[{ required: true }, { type: "string" }]}>
                        <Input prefix={<MdOutlineWorkOutline />} disabled />
                      </Form.Item>
                    </div>
                    <div className="col-6">
                      <Form.Item name="createDate" label="วันที่เปิดงาน" initialValue={dayjs()} rules={[{ required: true }]}>
                        <DatePicker format="DD/MM/YYYY" locale={locale} style={{ width: "100%" }} disabled />
                      </Form.Item>
                    </div>
                  </div>
                  <Form.Item
                    name="jobStatus"
                    label="สถานะ"
                    rules={[{ required: true }]}
                  >
                    <Input prefix={<MdOutlineWorkOutline />} disabled={true} />
                  </Form.Item>
                  <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true }, { type: "string" }]}>
                    <Input prefix={<MdOutlineWorkOutline />} />
                  </Form.Item>
                  <Form.Item name="product_name" label="ชื่อสินค้า" rules={[{ required: true }, { type: "string" }]}>
                    <Input prefix={<MdOutlineWorkOutline />} disabled />
                  </Form.Item>
                  <Form.Item
                    name="productRef"
                    label="รหัสสินค้า"
                    rules={[{ required: true }, { type: "string" }]}
                  >
                    <Input
                      prefix={<MdOutlineWorkOutline />}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item
                    name="sku"
                    label="SKU"
                    rules={[{ required: true }, { type: "string" }]}
                  >
                    <Input
                      prefix={<MdOutlineWorkOutline />}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item
                    name="brand"
                    label="แบรนด์"
                    rules={[{ required: true }, { type: "string" }]}
                  >
                    <Input
                      prefix={<MdOutlineWorkOutline />}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item
                    name="category"
                    label="ประเภทสินค้า"
                    rules={[{ required: true }, { type: "string" }]}
                  >
                    <Input
                      prefix={<MdOutlineWorkOutline />}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item name="description" label="รายละเอียด/อาการเสีย" rules={[{ required: true }]}>
                    <Input.TextArea prefix={<MdOutlineDescription />} autoSize={{ minRows: 3, maxRows: 5 }} disabled />
                  </Form.Item>
                  <Form.Item
                    name="unit"
                    label="จำนวนสินค้าที่เคลม"
                    rules={[{ required: true }, { type: "number" }]}
                  >
                    <InputNumber
                      prefix={<MdOutlineDescription />}
                      min={1}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="pcs"
                    label="หน่วย"
                    rules={[{ required: true }]}
                  >
                    <Input
                      prefix={<MdOutlineDescription />}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item name="expected_completion_date" label="วันที่คาดว่าจะซ่อมสินค้าสำเร็จ" rules={[{ required: true }]}>
                    <DatePicker format="DD/MM/YYYY" locale={locale} style={{ width: "100%" }} onChange={handleDateChange} disabledDate={disableDatePass} />
                  </Form.Item>
                  <Form.Item
                    name="repair_duration"
                    label="ระยะเวลาในการซ่อมสินค้า"
                    rules={[{ required: true }]}
                  >
                    <Input prefix={<MdOutlineDescription />} disabled />
                  </Form.Item>
                  {/* <Form.Item name="image" label="รูปภาพสินค้าที่นำมาซ่อม" valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: true, message: "กรุณาอัปโหลดรูปภาพ" }]}>
                    <Input type="file" />
                  </Form.Item> */}
                  <Form.Item
                    name="image"
                    label="รูปภาพสินค้า"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: "กรุณาอัปโหลดรูปภาพ" }]}
                    className="form-item-custom-size"
                  >
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <MdOutlineWorkOutline />
                      </p>
                      <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
                      <p className="ant-upload-hint">
                        รองรับการอัปโหลดไฟล์เดียวหรือหลายไฟล์
                      </p>
                    </Dragger>
                  </Form.Item>
                  <Form.Item name="claimImage" hidden>
                    <Input />
                  </Form.Item>
                </Form>
              </div>
            </div>

            {/* Global Save Button */}
            <div className="d-flex justify-content-end mt-4">
              <Button
                className="d-flex align-items-center justify-content-between btn-save margin-top-100"
                onClick={() => {
                  // showModalJob();
                  handleCombinedSubmit();
                  // formProduct.submit();
                  // formCustomer.submit();
                }}
              >
                <FaRegSave className="button-icon justify-content-start" />
                <span className="button-text">บันทึกข้อมูลงาน</span>
              </Button>
              {/* <Button
                className="d-flex align-items-center fw-bold rounded-3 shadow-sm btn-submit-form"
                variant="primary"
                onClick={handleCombinedSubmit} // This function now triggers validation for BOTH forms
              >
                <FaRegSave className="me-2" />
                บันทึกข้อมูลงาน
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Modals: Placed outside the main layout for clarity */}
      {/* Customer Search Modal */}
      <Modal show={openModalCustomer} onHide={handleCloseCustomerModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="text-center">ฐานข้อมูลลูกค้า</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Input
            onChange={(e) => setSearchCustomer(e.target.value)}
            prefix={
              <IoSearch style={{ width: "20px", height: "20px" }} />
            }
            style={{
              width: "399px",
              height: "35px",
              backgroundColor: "#FFFFFFFF",
              // borderBlock: "#000000",
              color: "#CCCCCC",
              borderRadius: "10px",
            }}
          />
          <Table
            dataSource={filterDataByCustomer}
            columns={columnsCustomer}
            scroll={{ x: 450 }}
            onRow={(record) => ({
              onClick: () => {
                handleRowCustomer(record);
                setOpenModalCustomer(false);
              },
            })}
          />
        </Modal.Body>
      </Modal>

      {/* Product Search Modal */}
      <Modal show={openProductModal} onHide={handleCloseProductModal}>
        <Modal.Body
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Form.Item
            name="Input"
            rules={[{ required: true, message: "Please input!" }]}
          >
            <Input
              onChange={(e) => setSearchProduct(e.target.value)}
              prefix={
                <IoSearch style={{ width: "20px", height: "20px" }} />
              }
              style={{
                width: "399px",
                height: "35px",
                backgroundColor: "#FFFFFFFF",
                // borderBlock: "#000000",
                color: "#CCCCCC",
                borderRadius: "10px",
              }}
            />
          </Form.Item>

          <Table
            dataSource={filterDataByProduct}
            columns={columns}
            scroll={{ x: 450 }}
            style={{
              textAlign: "center",
            }}
            onRow={(record) => ({
              onClick: () => {
                handleRowProduct(record);
                setOpenProductModal(false);
              },
            })}
          />
        </Modal.Body>
      </Modal>

      {/* Success Modal */}
      <Modal show={openModalJob} onHide={() => setOpenModalJob(false)}>
        <Modal.Body className="text-center p-4">
          <IoMdCheckmarkCircle className="text-success" style={{ fontSize: 64 }} />
          <p className="mt-3 mb-3 fw-bold">การเพิ่มงานเข้าในระบบสำเร็จ</p>
          <Button onClick={handletoJob} variant="success" className="fw-bold">
            ดูงานทั้งหมด
          </Button>
        </Modal.Body>
      </Modal>

      {/* Error Modal */}
      <Modal show={openModalJobError} onHide={() => setOpenModalJobError(false)}>
        <Modal.Body className="text-center p-4">
          <IoMdCloseCircle className="text-danger" style={{ fontSize: 64 }} />
          <p className="mt-3 mb-3 fw-bold">กรอกข้อมูลไม่สำเร็จ กรุณาตรวจสอบ</p>
          <Button onClick={() => setOpenModalJobError(false)} variant="danger" className="fw-bold">
            กลับไปแก้ไข
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
