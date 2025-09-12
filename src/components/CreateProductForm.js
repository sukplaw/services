import React, { useState } from "react";
import { Form, Input, Select, message, Upload } from "antd";
import Button from "react-bootstrap/Button";
import { MdOutlineWorkOutline } from "react-icons/md";
import { MdOutlineDescription } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { FaRegPlusSquare } from "react-icons/fa";
// import Dragger from "antd/es/upload/Dragger";
import Modal from "react-bootstrap/Modal";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

const { Dragger } = Upload;
export default function CreateProductForm() {
  const [form] = Form.useForm();
  const [formJob] = Form.useForm();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [type, setType] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const navigate = useNavigate();
  const handleCreateJob = () => {
    navigate("/create-job");
  };

  // const onPostProduct = (data) => {
  //   console.log(data);
  //   const url = "http://localhost:3302/create-product";
  //   axios
  //     .post(url, data)
  //     .then((res) => {
  //       setData(res.data);
  //       console.log("Product created successfully:", res.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error creating product:", error);
  //     });
  // };

  const getCategory = () => {
    const url = "http://localhost:3302/get-category";

    axios
      .get(url)
      .then((res) => {
        setType(res.data);
        console.log("Types fetched successfully:", res.data);
      })
      .catch((error) => {
        console.error("Error fetching types:", error);
      });
  };

  const onPostCategory = (category) => {
    console.log(category);
    const url = "http://localhost:3302/create-category";
    axios
      .post(url, category)
      .then((res) => {
        // setData(res.data);
        console.log(res.category);
        form.resetFields();
        formJob.resetFields();
      })
      .catch((error) => {
        console.error("Error creating category:", error);
      });
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const uploadProps = {
    name: "imageFile",
    multiple: false,
    action: "http://localhost:3303/upload",
    listType: "picture",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} อัปโหลดสำเร็จ.`);

        const imageUrl = info.file.response.url;
        console.log("URL ของรูปภาพ:", imageUrl);
      } else if (status === "error") {
        message.error(`${info.file.name} อัปโหลดไม่สำเร็จ.`);
      }
    },
  };

  const onFinish = (values) => {
    const fileList = values.image;

    if (fileList && fileList.length > 0 && fileList[0].status === "done") {
      const name = fileList[0].response.url;
      const productData = {
        productRef: values.productRef,
        product_name: values.product_name,
        sku: values.sku,
        pcs: values.pcs,
        category: values.category,
        brand: values.brand,
        description: values.description,
        image: name,
      };

      fetch("http://localhost:3302/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => {
          message.success("บันทึกสินค้าสำเร็จ!");
          console.log("Backend response:", data);

          // ✅ ล้างค่าทั้งหมดในฟอร์ม + ล้างไฟล์อัปโหลด
          formJob.resetFields();
          formJob.setFieldsValue({ image: [] });

          // ✅ ให้ระบบ gen รหัสสินค้าใหม่รอบถัดไป
          setIsGenerated(false);

          // ✅ เปิด modal สำเร็จหลังบันทึกเสร็จจริง
          setOpen(true);
        })
        .catch((err) => {
          message.error("เกิดข้อผิดพลาดในการบันทึกสินค้า");
          console.error("Error saving product:", err);
        });
    } else {
      message.error("กรุณาอัปโหลดรูปภาพให้สำเร็จก่อนบันทึก.");
      console.error("การอัปโหลดรูปภาพยังไม่สำเร็จ");
    }
  };

  // const onFinish = (values) => {
  //   const fileList = values.image;

  //   if (fileList && fileList.length > 0 && fileList[0].status === "done") {
  //     const name = fileList[0].response.url;
  //     const productData = {
  //       productRef: values.productRef,
  //       product_name: values.product_name,
  //       sku: values.sku,
  //       pcs: values.pcs,
  //       category: values.category,
  //       brand: values.brand,
  //       description: values.description,
  //       image: name,
  //     };

  //     console.log("ข้อมูลที่จะส่งไปบันทึกในฐานข้อมูล:", productData);
  //     fetch("http://localhost:3302/create-product", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(productData),
  //     })
  //       .then((res) => {
  //         if (!res.ok) {
  //           throw new Error("Network response was not ok");
  //         }
  //         return res.json();
  //       })
  //       .then((data) => {
  //         message.success("บันทึกสินค้าสำเร็จ!");
  //         console.log("Backend response:", data);
  //         // สามารถรีเซ็ตฟอร์มได้ที่นี่ถ้าต้องการ
  //         // form.resetFields();
  //       })
  //       .catch((err) => {
  //         message.error("เกิดข้อผิดพลาดในการบันทึกสินค้า");
  //         console.error("Error saving product:", err);
  //       });
  //   } else {
  //     message.error("กรุณาอัปโหลดรูปภาพให้สำเร็จก่อนบันทึก.");
  //     console.error("การอัปโหลดรูปภาพยังไม่สำเร็จ");
  //   }
  // };

  useEffect(() => {
    getCategory();
  }, []);

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

  //     const formattedSequence = String(sequenceNumber).padStart(3, "0");

  //     const newJobId = `PRODUCT${datePrefix}${formattedSequence}`;

  //     const newLastGeneratedData = {
  //       date: datePrefix,
  //       sequence: sequenceNumber,
  //     };
  //     localStorage.setItem(
  //       "lastGeneratedJob",
  //       JSON.stringify(newLastGeneratedData)
  //     );

  //     formJob.setFieldsValue({
  //       productRef: newJobId,
  //     });
  //     setIsGenerated(true);
  //   };

  //   if (!isGenerated) {
  //     generateJobId();
  //   }
  // }, [formJob, isGenerated]);

  return (
    <div className="contain-main">
      <h2 className="text-dark mb-4 mt-5 text-center">เพิ่มข้อมูลสินค้า</h2>
      <div>
        {/* <div className="content-sub-form-header">
          <h4>ข้อมูลสินค้า</h4>
        </div> */}
        <div className="d-flex flex-column g-5">
          <Form
            layout="vertical"
            autoComplete="off"
            form={formJob}
            onFinish={onFinish}
            className="content-sub-form-body"
          >
            <Form.Item
              name="productRef"
              label="ID"
              rules={[{ required: true }, { type: "string" }]}
              className="form-item-custom-size"
            >
              <Input prefix={<MdOutlineWorkOutline />} />
            </Form.Item>
            <Form.Item
              name="product_name"
              label="ชื่อสินค้า"
              rules={[{ required: true }, { type: "string" }]}
              className="form-item-custom-size"
            >
              <Input prefix={<MdOutlineWorkOutline />} />
            </Form.Item>

            <Form.Item
              name="sku"
              label="SKU"
              rules={[{ required: true }, { type: "string" }]}
              className="form-item-custom-size"
            >
              <Input prefix={<MdOutlineWorkOutline />} />
            </Form.Item>

            <Form.Item
              name="pcs"
              label="หน่วย"
              rules={[{ required: true }, { type: "string" }]}
              className="form-item-custom-size"
            >
              <Select placeholder="กรุณาเลือกหน่วยของสินค้า">
                {type
                  .filter((item) => item.pcs !== null)
                  .map((types) => (
                    <Select.Option key={types.id} value={types.pcs}>
                      {types.pcs}
                    </Select.Option>
                  ))}
                {/* <Select.Option value="pcs">ชิ้น</Select.Option>
                <Select.Option value="box">กล่อง</Select.Option>
                <Select.Option value="set">ชุด</Select.Option> */}
              </Select>
            </Form.Item>

            <Form.Item
              name="brand"
              label="แบรนด์"
              rules={[{ required: true }, { type: "string" }]}
              className="form-item-custom-size"
            >
              <Select placeholder="กรุณาเลือกแบรนด์ของสินค้า">
                {type
                  .filter((item) => item.brand != null)
                  .map((types) => (
                    <Select.Option key={types.type_id} value={types.brand}>
                      {types.brand}
                    </Select.Option>
                  ))}
                {/* {type.map((types) => (
                  <Select.Option key={types.id} value={types.id}>
                    {types.brand}
                  </Select.Option>
                ))} */}
                {/* <Select.Option value="bluedot">Blue dot</Select.Option>
                <Select.Option value="brand2">Beurer</Select.Option>
                <Select.Option value="brand3">แบรนด์ 3</Select.Option> */}
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label="ประเภทสินค้า"
              rules={[{ required: true }, { type: "string" }]}
              className="form-item-custom-size"
            >
              {/* <Input prefix={<MdOutlineWorkOutline />} /> */}

              <Select placeholder="กรุณาเลือกประเภทของสินค้า">
                {type
                  .filter((item) => item.category !== null)
                  .map((types) => (
                    <Select.Option key={types.id} value={types.category}>
                      {types.category}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="รายละเอียดสินค้า"
              rules={[{ required: true }, { type: "string" }]}
            >
              <Input.TextArea
                prefix={<MdOutlineDescription />}
                className="form-item-custom-size-description"
              />
            </Form.Item>

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
          </Form>
        </div>
        <div className="d-flex justify-content-center gap-5 mt-4 mb-5">
          {/* <Button
            className="btn btn-primary btn-save d-flex align-items-center justify-content-between"
            onClick={() => {
              setOpen(true);
              formJob.submit();
            }}
          >
            <FaRegSave className="button-icon justify-content-start" />
            <span className="button-text">บันทึกข้อมูลสินค้า</span>
          </Button> */}
          <Button
            className="btn btn-primary btn-save d-flex align-items-center justify-content-between"
            onClick={() => {
              formJob.submit(); // ⬅️ ให้ onFinish จัดการเปิด modal เอง
            }}
          >
            <FaRegSave className="button-icon justify-content-start" />
            <span className="button-text">บันทึกข้อมูลสินค้า</span>
          </Button>

          <Modal
            show={open}
            onHide={() => {
              setOpen(false);
            }}
          >
            <Modal.Body
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <IoMdCheckmarkCircle className="modal-icon" />
              <p className="d-flex mt-3 mb-3">การเพิ่มสินค้าเข้าในระบบสำเร็จ</p>
              <Button
                onClick={handleCreateJob}
                className="d-flex align-items-center justify-content-center btn-modal margin-top-100"
              >
                <span className="d-flex justify-content-end">สร้างงาน</span>
              </Button>
            </Modal.Body>
          </Modal>

          <Button
            className="btn btn-primary btn-add-category d-flex align-items-center justify-content-between"
            onClick={() => setOpenModal(true)}
          >
            <FaRegPlusSquare className="button-icon justify-content-start" />
            <span className="button-text">เพิ่มประเภทสินค้า</span>
          </Button>

          <Modal show={openModal} onHide={() => setOpenModal(false)}>
            <Modal.Body
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <p>เพิ่มประเภทสินค้า</p>
              <Form
                form={form}
                onFinish={onPostCategory}
                layout="vertical"
                autoComplete="off"
              >
                <Form.Item
                  name="category"
                  rules={[{ required: true }, { type: "string" }]}
                  className="d-flex align-item-center justify-content form-modal"
                >
                  <Input
                    placeholder="กรอกชื่อประเภทสินค้า"
                    style={{ width: "400px", height: "60px" }}
                  />
                </Form.Item>
              </Form>

              <Button
                className="d-flex align-items-center justify-content-center btn-table margin-top-100"
                onClick={() => form.submit()}
              >
                <span className="d-flex justify-content-end">
                  สร้างประเภทสินค้า
                </span>
              </Button>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
}
