import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Divider,
  ConfigProvider,
  Card,
  message,
} from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const ROLE_OPTIONS = [
  { label: "Super Service", value: "super service" },
  { label: "Service", value: "service" },
  { label: "Admin", value: "admin" },
];

export default function Register() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // ฟังก์ชัน submit
  const handleFinish = async (values) => {
     console.log("values:", values);
    try {
      setSubmitting(true);
      const res = await axios.post(`http://localhost:3302/api/register`, values);
      message.success(res.data.message);
      form.resetFields();
      console.log(form.resetFields());
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || "Register failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { borderRadius: 8 } }}>
      <div
        className="min-h-screen w-screen flex items-center justify-center bg-[#f3f4f6] p-4"
        style={{ padding: "2rem" }}
      >
        <Card
          className="shadow-md w-full max-w-2xl"
          title={
            <div className="text-center mb-5 mt-5">
              <Title level={3} style={{ margin: 0 }}>
                Register
              </Title>
              <Text type="secondary">Create a new service account</Text>
            </div>
          }
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            requiredMark
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="serviceRef"
                label="รหัสพนักงาน"
                rules={[{ required: true, message: "กรุณากรอกรหัสพนักงาน" }]}
              >
                <Input placeholder="" allowClear />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input type="email" allowClear />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: "กรุณากรอก username" },
                ]}
              >
                <Input placeholder="" allowClear />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "กรุณากรอกรหัสผ่าน", min: 8 },
                ]}
              >
                <Input.Password allowClear />
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "กรุณาเลือก Role" }]}
              >
                <Select
                  options={ROLE_OPTIONS}
                  placeholder="เลือกบทบาท"
                  showSearch
                  optionFilterProp="label"
                  allowClear
                />
              </Form.Item>
            </div>

            {/* <Divider className="my-4" /> */}

            <div className="d-flex justify-content-center sm:justify-end mt-5 mb-5">
              <Button type="primary" htmlType="submit" loading={submitting}>
                ลงทะเบียน
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
}
