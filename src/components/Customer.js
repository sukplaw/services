import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Timeline,
  Dropdown,
  Menu,
  Select,
} from "antd";
import axios from "axios";
import Accordion from "react-bootstrap/Accordion";
import { MdEdit, MdArrowRight } from "react-icons/md";
// import { FaCheck, FaTimes } from "react-icons/fa6";
import { IoMdPeople } from "react-icons/io";
import { PiPackageFill } from "react-icons/pi";

const { Dragger } = Upload;
const { Option } = Select;

export default function ShowDetail() {
  const [data, setData] = useState([]);
  const { jobRef } = useParams();
  const [changedStatus, setChangedStatus] = useState({});
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [changedDetails, setChangedDetails] = useState({});

  const getData = () => {
    const url = `http://localhost:3302/get-detail/${jobRef}`;
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
        setData([]);
      });
  };

  const deleteData = (jobRef) => {
    const url = `http://localhost:3302/delete-job/${jobRef}`;
    axios
      .delete(url)
      .then((res) => {
        message.success("ข้อมูลถูกลบเรียบร้อยแล้ว");
        console.log(res.jobRef);
      })
      .catch((error) => {
        message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        console.error("Error deleting job:", error);
      });
  };

  useEffect(() => {
    getData();
  }, [jobRef]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `วันที่: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const timelineItems = (
    data.length > 0
      ? [
          "เริ่มงาน",
          "สั่งอะไหล่",
          "เริ่มการซ่อม",
          "ซ่อมเสร็จ",
          "รอทดสอบ",
          "รอจัดส่ง",
          "จัดส่งแล้ว",
        ]
      : []
  ).map((status) => {
    const item = data.find((d) => d.jobStatus === status);
    return {
      label: item ? formatDate(item.updateAt) : status,
      children: item ? (
        <div>
                   {" "}
          <p className="font-semibold text-lg text-blue-600">
                        {item.jobStatus}         {" "}
          </p>
                   {" "}
          <p className="text-muted">
                        โดย: {item.customer_firstname} {item.customer_lastname} 
                   {" "}
          </p>
                 {" "}
        </div>
      ) : null,
    };
  });

  const countRemainingTime = (data) => {
    if (!data || data.length === 0) {
      return [];
    }
    const currentDate = new Date();
    return data.map((item) => {
      const completionDate = new Date(item.expected_completion_date);
      const remainingTimeInDays = Math.floor(
        (completionDate.getTime() - currentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return {
        ...item,
        remainingTime: remainingTimeInDays,
      };
    });
  };

  const warningJob = countRemainingTime(data);

  const handleEditDetails = () => {
    setIsEditingDetails(true);
    setChangedDetails(data.length > 0 ? { ...data[0] } : {});
  };

  const handleEditStatus = () => {
    setIsEditingStatus(true);
  };

  const handleCancelEdit = () => {
    setIsEditingDetails(false);
    setIsEditingStatus(false);
    setChangedDetails({});
    setChangedStatus({});
  };

  const handleDetailChange = (e, field) => {
    const { value } = e.target;
    setChangedDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmDetails = async () => {
    try {
      if (Object.keys(changedDetails).length > 0 && data.length > 0) {
        await axios.put(
          `http://localhost:3302/update-details/${jobRef}`,
          changedDetails
        );
        message.success("ข้อมูลรายละเอียดถูกอัปเดตเรียบร้อยแล้ว");
        await getData();
        handleCancelEdit();
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการอัปเดตรายละเอียด");
      console.error("Failed to update details:", error);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (data.length > 0) {
      const currentJobRef = data[0].jobRef;
      setChangedStatus({
        [currentJobRef]: newStatus,
      });
    }
  };

  const handleConfirmStatus = async () => {
    try {
      const updatePromises = Object.keys(changedStatus).map((currentJobRef) => {
        const newStatus = changedStatus[currentJobRef];
        return axios.put(
          `http://localhost:3302/update-status/${currentJobRef}`,
          {
            jobStatus: newStatus,
          }
        );
      });
      await Promise.all(updatePromises);
      message.success("สถานะทั้งหมดถูกอัปเดตเรียบร้อยแล้ว");
      await getData();
      handleCancelEdit();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      console.error("Failed to update status:", error);
    }
  };

  const editMenu = (
    <Menu>
           {" "}
      <Menu.SubMenu
        key="details"
        title="แก้ไขรายละเอียดงาน"
        icon={<MdArrowRight />}
      >
               {" "}
        <Menu.Item key="customer" onClick={handleEditDetails}>
                    แก้ไขข้อมูลลูกค้า        {" "}
        </Menu.Item>
               {" "}
        <Menu.Item key="product" onClick={handleEditDetails}>
                    แก้ไขข้อมูลสินค้า        {" "}
        </Menu.Item>
             {" "}
      </Menu.SubMenu>
           {" "}
      <Menu.SubMenu key="status" title="แก้ไขสถานะงาน" icon={<MdArrowRight />}>
               {" "}
        <Menu.Item
          key="สั่งอะไหล่"
          onClick={() => handleStatusChange("สั่งอะไหล่")}
        >
                    สั่งอะไหล่        {" "}
        </Menu.Item>
               {" "}
        <Menu.Item
          key="ซ่อมสำเร็จ"
          onClick={() => handleStatusChange("ซ่อมสำเร็จ")}
        >
                    ซ่อมสำเร็จ        {" "}
        </Menu.Item>
               {" "}
        <Menu.Item key="รอทดสอบ" onClick={() => handleStatusChange("รอทดสอบ")}>
                    รอทดสอบ        {" "}
        </Menu.Item>
               {" "}
        <Menu.Item
          key="รอจัดส่ง"
          onClick={() => handleStatusChange("รอจัดส่ง")}
        >
                    รอจัดส่ง        {" "}
        </Menu.Item>
               {" "}
        <Menu.Item
          key="จัดส่งสำเร็จ"
          onClick={() => handleStatusChange("จัดส่งสำเร็จ")}
        >
                    จัดส่งสำเร็จ        {" "}
        </Menu.Item>
               {" "}
        <Menu.Item
          key="ยกเลิกการเคลมสินค้า"
          onClick={() => handleStatusChange("ยกเลิกการเคลมสินค้า")}
        >
                    ยกเลิกการเคลมสินค้า        {" "}
        </Menu.Item>
             {" "}
      </Menu.SubMenu>
         {" "}
    </Menu>
  );

  const renderInput = (field, label, type = "text") => {
    if (!data.length) return null;
    if (isEditingDetails) {
      return (
        <>
                   {" "}
          <p className="mt-4">
                        <strong>{label}</strong>         {" "}
          </p>
                   {" "}
          <Input
            value={changedDetails[field] || data[0][field]}
            onChange={(e) => handleDetailChange(e, field)}
          />
                 {" "}
        </>
      );
    } else {
      return (
        <>
                   {" "}
          <p className="mt-4">
                        <strong>{label}</strong>         {" "}
          </p>
                    <p>{data[0][field]}</p>       {" "}
        </>
      );
    }
  };

  return (
    <div className="d-flex flex-row">
           {" "}
      <div className="contain-job">
               {" "}
        {warningJob.length > 0 && (
          <div className="d-flex align-items-center job-header mb-4 mt-5">
                        <h1 className="me-5">{warningJob[0].jobRef}</h1>       
               {" "}
            <h2
              className="me-3"
              style={warningJob[0].remainingTime < 0 ? { color: "red" } : {}}
            >
                           {" "}
              {warningJob[0].remainingTime > 0
                ? `ระยะเวลาที่คงเหลือ ${warningJob[0].remainingTime} วัน`
                : warningJob[0].remainingTime === 0
                ? "ไม่เหลือเวลา"
                : `เกินระยะเวลาที่กำหนด ${Math.abs(
                    warningJob[0].remainingTime
                  )} วัน`}
                         {" "}
            </h2>
                     {" "}
          </div>
        )}
               {" "}
        <Accordion defaultActiveKey="0">
                   {" "}
          <Accordion.Item eventKey="0" className="accordion-item">
                       {" "}
            <Accordion.Header className="accordion-header">
                            <IoMdPeople className="me-4 accordion-icon" />     
                      ข้อมูลลูกค้า            {" "}
            </Accordion.Header>
                       {" "}
            <Accordion.Body>
                           {" "}
              {data.length > 0 && (
                <div className="product-details row">
                                   {" "}
                  <div className="col-6">
                                       {" "}
                    {renderInput("customer_firstname", "ชื่อ")}                 
                      {renderInput("customer_old", "อายุ")}                   {" "}
                    {renderInput("username", "Username")}                   {" "}
                    {renderInput("line_id", "Line ID")}                   {" "}
                    {renderInput("address", "ที่อยู่")}                 {" "}
                  </div>
                                   {" "}
                  <div className="col-6">
                                       {" "}
                    {renderInput("customer_lastname", "นามสกุล")}               
                        {renderInput("email", "Email")}                   {" "}
                    {renderInput("customer_contact", "ช่องทางติดต่อ")}         
                              {renderInput("phone", "เบอร์โทรศัพท์")}           
                         {" "}
                  </div>
                                 {" "}
                </div>
              )}
                         {" "}
            </Accordion.Body>
                     {" "}
          </Accordion.Item>
                   {" "}
          <Accordion.Item eventKey="1" className="accordion-item">
                       {" "}
            <Accordion.Header className="accordion-header">
                            <PiPackageFill className="me-4 accordion-icon" />   
                        ข้อมูลสินค้า            {" "}
            </Accordion.Header>
                       {" "}
            <Accordion.Body>
                           {" "}
              {data.length > 0 && (
                <div className="product-details row">
                                   {" "}
                  <div className="col-6">
                                       {" "}
                    {renderInput("serialNumber", "Serial Number")}             
                          {renderInput("brand", "Brand")}                   {" "}
                    {renderInput("unit", "จำนวนสินค้าที่ซ่อม")}                 
                      {renderInput("description", "รายละเอียดสินค้า")}         
                              {renderInput("createAt", "วันที่เปิดซ่อม")}       
                             {" "}
                  </div>
                                   {" "}
                  <div className="col-6">
                                       {" "}
                    {renderInput("product_name", "ชื่อสินค้า")}                 
                      {renderInput("sku", "SKU")}                   {" "}
                    {renderInput("category", "ประเภทสินค้า")}                   {" "}
                    {renderInput("pcs", "หน่วย")}                   {" "}
                    <p className="mt-4">
                                            <strong>รูปภาพสินค้า</strong>       
                                 {" "}
                    </p>
                                       {" "}
                    <img
                      src={data[0].image}
                      alt="Image from server"
                      className="image-show-detail"
                    />
                                     {" "}
                  </div>
                                 {" "}
                </div>
              )}
                         {" "}
            </Accordion.Body>
                     {" "}
          </Accordion.Item>
                 {" "}
        </Accordion>
               {" "}
        {isEditingDetails && (
          <div className="d-flex justify-content-center gap-3 mt-4">
                       {" "}
            <Button
              type="primary"
              // icon={<FaCheck />}
              onClick={handleConfirmDetails}
            >
                            ยืนยัน            {" "}
            </Button>
                       {" "}
            <Button
              type="default"
              // icon={<FaTimes />}
              onClick={handleCancelEdit}
            >
                            ยกเลิก            {" "}
            </Button>
                     {" "}
          </div>
        )}
             {" "}
      </div>
            {/* Timeline and Status */}     {" "}
      <div className="contain-status">
                <h1 className="text-center mb-5 mt-5">สถานะ</h1>       {" "}
        <div>
                    <Timeline mode={"left"} items={timelineItems} />       {" "}
        </div>
               {" "}
        <div className="d-flex justify-content-center gap-3 mt-2 mb-2">
                   {" "}
          {isEditingStatus ? (
            <>
                           {" "}
              <div className="w-100">
                               {" "}
                <Select
                  placeholder="เลือกสถานะใหม่"
                  style={{ width: "100%" }}
                  onChange={handleStatusChange}
                >
                                   {" "}
                  {[
                    "สั่งอะไหล่",
                    "เริ่มการซ่อม",
                    "ซ่อมสำเร็จ",
                    "รอทดสอบ",
                    "รอจัดส่ง",
                    "จัดส่งสำเร็จ",
                    "ยกเลิกการเคลมสินค้า",
                  ].map((status) => (
                    <Option key={status} value={status}>
                                              {status}                     {" "}
                    </Option>
                  ))}
                                 {" "}
                </Select>
                             {" "}
              </div>
                           {" "}
              <Button
                type="primary"
                // icon={<FaCheck />}
                onClick={handleConfirmStatus}
                disabled={Object.keys(changedStatus).length === 0}
              >
                                ยืนยัน              {" "}
              </Button>
                           {" "}
              <Button
                type="default"
                // icon={<FaTimes />}
                onClick={handleCancelEdit}
              >
                                ยกเลิก              {" "}
              </Button>
                         {" "}
            </>
          ) : (
            <>
                           {" "}
              <Dropdown overlay={editMenu} trigger={["hover"]}>
                               {" "}
                <Button className="btn-showData-Edit" icon={<MdEdit />}>
                                    แก้ไขงาน                {" "}
                </Button>
                             {" "}
              </Dropdown>
                           {" "}
              <Button
                type="danger"
                className="btn-showData-delete"
                onClick={() => deleteData(jobRef)}
              >
                                ลบข้อมูล              {" "}
              </Button>
                         {" "}
            </>
          )}
                 {" "}
        </div>
               {" "}
        <div className="d-grid justify-content-center">
                    <button className="btn-exportData">Export Data</button>     
           {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
}
