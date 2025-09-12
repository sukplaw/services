app.post("/register", async (req, res) => {
  // ดึงข้อมูลที่ส่งมาจาก body
  const { serviceRef, email, password, role } = req.body;

  // ขั้นที่ 1: การตรวจสอบข้อมูลเบื้องต้น
  if (!serviceRef || !email || !password || !role) {
    return res.status(400).json({ error: "โปรดกรอกข้อมูลให้ครบถ้วน" });
  }
  try {
    // ขั้นที่ 2: ตรวจสอบข้อมูลซ้ำในฐานข้อมูล
    const checkSql =
      "SELECT serviceRef, email FROM service WHERE serviceRef = ? OR email = ?";
    db.query(checkSql, [serviceRef, email], async (checkErr, checkResult) => {
      if (checkErr) {
        // หากเกิดข้อผิดพลาดในการ query
        console.error("Database query error:", checkErr);
        return res.status(500).json({ error: "ข้อผิดพลาดของฐานข้อมูล" });
      }

      if (checkResult.length > 0) {
        // ถ้าพบข้อมูลซ้ำ
        const existingRecord = checkResult[0];
        if (existingRecord.serviceRef === serviceRef) {
          return res
            .status(400)
            .json({ error: "รหัสอ้างอิงบริการ (serviceRef) มีอยู่ในระบบแล้ว" });
        }
        if (existingRecord.email === email) {
          return res.status(400).json({ error: "อีเมลนี้มีผู้ใช้งานแล้ว" });
        }
      }

      // ขั้นที่ 3: เข้ารหัสรหัสผ่านและเพิ่มข้อมูลลงฐานข้อมูล
      const hashed = await bcrypt.hash(password, 10);
      const insertSql =
        "INSERT INTO service (serviceRef, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(
        insertSql,
        [serviceRef, email, hashed, role],
        (insertErr, insertResult) => {
          if (insertErr) {
            // หากเกิดข้อผิดพลาดในการเพิ่มข้อมูล
            console.error("Database insert error:", insertErr);
            return res
              .status(500)
              .json({ error: "ข้อผิดพลาดในการบันทึกข้อมูล" });
          }
          res.status(201).json({ message: "ลงทะเบียนสำเร็จ" });
        }
      );
    });
  } catch (error) {
    // จัดการข้อผิดพลาดที่อาจเกิดขึ้นจากการเข้ารหัส
    console.error("General error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});
