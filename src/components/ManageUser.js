// src/pages/ManageUser.js
import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    Tag,
    Form,
    Input,
    Space,
    Dropdown,
    Select,
    message,
    Modal,
    DatePicker,
    Popconfirm,
} from "antd";
import { IoSearch } from "react-icons/io5";
import { BiFilterAlt } from "react-icons/bi";
import { FaPlus } from "react-icons/fa6";
import { MdEdit, MdDelete } from "react-icons/md";
import dayjs from "dayjs";
import axios from "axios";


const calcAge = (date) => {
    if (!date) return "";
    const d = dayjs.isDayjs(date) ? date : dayjs(date);
    if (!d.isValid()) return "";
    return String(dayjs().diff(d, "year"));
};

const { Option } = Select;
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3302";

export default function ManageUser() {
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState(null);
    const [loading, setLoading] = useState(false);

    const [openForm, setOpenForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    const userRole =
        localStorage.getItem("permission") || sessionStorage.getItem("permission");

    const fetchList = async (params = {}) => {
        setLoading(true);
        try {
            const q = new URLSearchParams({
                page: String(params.page ?? page),
                limit: String(params.limit ?? pageSize),
                search: search.trim(),
            }).toString();

            const { data } = await axios.get(`${API_BASE}/api/users?${q}`);
            // server: { items, total, page, limit }
            let items = data?.items || [];
            if (roleFilter) {
                items = items.filter((x) => (x.role || "").toLowerCase() === roleFilter);
            }
            setList(items);
            setTotal(roleFilter ? items.length : data?.total ?? 0);
        } catch (err) {
            console.error(err);
            message.error("โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList({ page: 1, limit: pageSize });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter]);

    const onTableChange = (pg) => {
        setPage(pg.current);
        setPageSize(pg.pageSize);
        fetchList({ page: pg.current, limit: pg.pageSize });
    };

    const handleSearchPress = () => {
        setPage(1);
        fetchList({ page: 1, limit: pageSize });
    };

    const openCreate = () => {
        setEditingId(null);
        form.resetFields();
        setOpenForm(true);
    };

    const openEdit = (record) => {
        setEditingId(record.service_id);
        form.setFieldsValue({
            serviceRef: record.serviceRef ?? "",
            service_firstname: record.service_firstname ?? "",
            service_lastname: record.service_lastname ?? "",
            birth_date: record.birth_date ? dayjs(record.birth_date) : null,
            // ถ้า DB ไม่มีค่า service_old หรืออยากรีคำนวณใหม่ทุกครั้ง ให้ใช้ calcAge
            service_old: record.birth_date ? calcAge(record.birth_date) : (record.service_old ?? ""),
            username: record.username ?? "",
            email: record.email ?? "",
            line_id: record.line_id ?? "",
            phone: record.phone ?? "",
            role: record.role ?? "user",
        });
        setOpenForm(true);
    };

    const handleDelete = async (record) => {
        try {
            await axios.delete(`${API_BASE}/api/users/${record.service_id}`);
            message.success("ลบข้อมูลสำเร็จ");
            fetchList({ page, limit: pageSize });
        } catch (err) {
            console.error(err);
            message.error("ลบข้อมูลไม่สำเร็จ");
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                birth_date: values.birth_date ? dayjs(values.birth_date).format("YYYY-MM-DD") : null,
            };

            if (editingId) {
                await axios.put(`${API_BASE}/api/users/${editingId}`, payload);
                message.success("บันทึกการแก้ไขสำเร็จ");
            } else {
                await axios.post(`${API_BASE}/api/users`, payload);
                message.success("เพิ่มผู้ใช้สำเร็จ");
            }
            setOpenForm(false);
            setEditingId(null);
            fetchList({ page: 1, limit: pageSize });
            setPage(1);
        } catch (err) {
            if (err?.errorFields) return; // validation error
            const msg = err?.response?.data?.message || "บันทึกไม่สำเร็จ";
            message.error(msg);
        }
    };

    const roleMenu = {
        items: [
            { key: "all", label: "ทั้งหมด" },
            { key: "super service", label: "super service" },
            { key: "service", label: "service" },
            { key: "admin", label: "admin" },
        ],
        onClick: (e) => {
            if (e.key === "all") setRoleFilter(null);
            else setRoleFilter(e.key);
        },
    };

    const columns = useMemo(
        () => [
            {
                title: "ID",
                dataIndex: "service_id",
                key: "service_id",
                width: 80,
                align: "center",
            },
            {
                title: "รหัสอ้างอิง",
                dataIndex: "serviceRef",
                key: "serviceRef",
                width: 120,
                align: "center",
            },
            {
                title: "ชื่อ-นามสกุล",
                key: "fullname",
                render: (_, r) => (
                    <span className="font-semibold">
                        {r.service_firstname || "-"} {r.service_lastname || ""}
                    </span>
                ),
            },
            {
                title: "วันเกิด",
                dataIndex: "birth_date",
                key: "birth_date",
                width: 130,
                align: "center",
                render: (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "-"),
                sorter: (a, b) =>
                    dayjs(a.birth_date || 0).valueOf() - dayjs(b.birth_date || 0).valueOf(),
            },
            {
                title: "อายุ",
                dataIndex: "service_old",
                key: "service_old",
                width: 80,
                align: "center",
                render: (v, r) => v || (r.birth_date ? calcAge(r.birth_date) : "-"),
            },
            {
                title: "Username",
                dataIndex: "username",
                key: "username",
                width: 160,
                ellipsis: true,
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                width: 220,
                ellipsis: true,
            },
            {
                title: "LINE ID",
                dataIndex: "line_id",
                key: "line_id",
                width: 140,
            },
            {
                title: "โทรศัพท์",
                dataIndex: "phone",
                key: "phone",
                width: 140,
            },
            {
                title: "Role",
                dataIndex: "role",
                key: "role",
                width: 120,
                align: "center",
                filters: [
                    { text: "super service", value: "super service" },
                    { text: "service", value: "service" },
                    { text: "admin", value: "admin" },
                ],
                onFilter: (val, rec) => (rec.role || "").toLowerCase() === val,
                render: (r) => {
                    const map = {
                        admin: "magenta",
                        manager: "geekblue",
                        user: "green",
                    };
                    return <Tag color={map[r] || "default"}>{r || "-"}</Tag>;
                },
            },
            {
                title: "",
                key: "actions",
                fixed: "right",
                width: 120,
                align: "center",
                render: (_, record) => (
                    <Space>
                        <a onClick={() => openEdit(record)} className="btn-link">
                            <MdEdit /> แก้ไข
                        </a>
                        <Popconfirm
                            title="ยืนยันการลบ?"
                            okText="ลบ"
                            cancelText="ยกเลิก"
                            onConfirm={() => handleDelete(record)}
                        >
                            <a className="btn-link danger">
                                <MdDelete /> ลบ
                            </a>
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [list]
    );

    return (
        <div className="container-fluid py-3" style={{ background: "#fafafa" }}>
            <style>{`
        .ui-card { border-radius: 16px; border: 1px solid #eaeaea; background: #fff; }
        .ui-card-shadow { box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
        .toolbar { position: sticky; top: 0; z-index: 9; background: linear-gradient(180deg,#ffffff,#ffffffef); backdrop-filter: blur(6px); }
        .btn-pill { border-radius: 999px; padding: .6rem 1.1rem; }
        .btn-ghost { background:#f7f7f7; color:#616161; border:1px solid #e7e7e7; }
        .btn-gradient { background: linear-gradient(135deg,#213F66,#5a83b7); color:#fff; border: none; }
        .btn-link { display:inline-flex; align-items:center; gap:.35rem; }
        .btn-link.danger { color:#d84a4a; }
        .list-heading { font-weight: 800; letter-spacing: .2px; }
        .ant-input-affix-wrapper { border-radius: 999px !important; padding: 8px 14px !important; }
        .ant-table { border-radius: 14px !important; overflow: hidden; }
        .ant-table-thead > tr > th { font-size: .95rem !important; font-weight: 700 !important; background: #f3f6fa !important; }
      `}</style>

            {/* Toolbar */}
            <div className="toolbar ui-card ui-card-shadow p-3 mb-3">
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-lg-4 order-2 order-lg-1">
                        <h2 className="m-0 list-heading">จัดการบัญชีผู้ใช้</h2>
                        <small className="text-muted">
                            จัดการข้อมูลผู้ใช้จากตาราง
                        </small>
                    </div>

                    <div className="col-12 col-lg-4 order-1 order-lg-2">
                        <Form.Item name="search" className="m-0">
                            <Input
                                allowClear
                                size="large"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onPressEnter={handleSearchPress}
                                prefix={<IoSearch style={{ width: 22, height: 22, color: "grey" }} />}
                                placeholder="ค้นหาชื่อ/อีเมล/เบอร์/รหัสอ้างอิง..."
                            />
                        </Form.Item>
                    </div>

                    <div className="col-12 col-lg-4 order-3">
                        <div className="d-flex justify-content-lg-end gap-2 flex-wrap">
                            <Dropdown menu={roleMenu} trigger={["click"]}>
                                <button className="btn-ghost btn-pill d-inline-flex align-items-center gap-2">
                                    <BiFilterAlt />
                                    {roleFilter || "กรองตาม Role"}
                                </button>
                            </Dropdown>

                            {userRole === "admin" && (
                                <button className="btn-gradient btn-pill d-inline-flex align-items-center gap-2" onClick={openCreate}>
                                    <FaPlus /> เพิ่มผู้ใช้
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="ui-card ui-card-shadow p-3">
                <Table
                    rowKey="service_id"
                    dataSource={list}
                    loading={loading}
                    columns={columns}
                    scroll={{ x: true }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        showTotal: (t) => `รวม ${t} รายการ`,
                    }}
                    onChange={onTableChange}
                />
            </div>

            {/* Modal Form */}
            <Modal
                title={editingId ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
                open={openForm}
                onCancel={() => setOpenForm(false)}
                onOk={handleSubmit}
                okText={editingId ? "บันทึกการแก้ไข" : "บันทึก"}
                cancelText="ยกเลิก"
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{ role: "user" }}
                >
                    <Form.Item label="รหัสอ้างอิง (serviceRef)" name="serviceRef">
                        <Input placeholder="เช่น EMP-001" />
                    </Form.Item>

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <Form.Item
                                label="ชื่อ"
                                name="service_firstname"
                                rules={[{ required: true, message: "กรอกชื่อ" }]}
                            >
                                <Input placeholder="ชื่อจริง" />
                            </Form.Item>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Item label="นามสกุล" name="service_lastname">
                                <Input placeholder="นามสกุล" />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <Form.Item label="วันเกิด" name="birth_date">
                                <DatePicker
                                    className="w-100"
                                    format="DD/MM/YYYY"
                                    onChange={(val) => {
                                        // เมื่อเลือกวันเกิด -> คำนวณอายุ แล้ว set ลง service_old
                                        const age = calcAge(val);
                                        form.setFieldsValue({ service_old: age });
                                    }}
                                />
                            </Form.Item>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Item label="อายุ" name="service_old">
                                <Input placeholder="อายุ (คำนวณอัตโนมัติ)" readOnly />
                            </Form.Item>
                        </div>
                    </div>

                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: "กรอก Username" }]}
                    >
                        <Input placeholder="username" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "กรอก Email" },
                            { type: "email", message: "รูปแบบ Email ไม่ถูกต้อง" },
                        ]}
                    >
                        <Input placeholder="name@example.com" />
                    </Form.Item>

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <Form.Item label="LINE ID" name="line_id">
                                <Input placeholder="LINE ID" />
                            </Form.Item>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Item label="เบอร์โทรศัพท์" name="phone">
                                <Input placeholder="เช่น 089-xxx-xxxx" />
                            </Form.Item>
                        </div>
                    </div>

                    <Form.Item label="Role" name="role">
                        <Select>
                            <Option value="super service">super service</Option>
                            <Option value="service">service</Option>
                            <Option value="admin">admin</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
