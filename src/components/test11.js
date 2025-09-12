const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "your-very-secret-key";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "your_database",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("--- Token Check in Middleware ---");
  console.log("Received Authorization Header:", authHeader);
  console.log("Extracted Token:", token);

  if (!token) {
    console.log("Action: No token provided, sending 401.");
    return res.status(401).json({ error: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("Token is valid. Decoded user data:", req.user);
    next();
  } catch (error) {
    console.log("Action: Invalid token, sending 403.");
    res.status(403).json({ error: "Access Denied: Invalid Token" });
  }
};

app.get("/profile", authenticateToken, async (req, res) => {
  console.log("--- Request Reached Profile Endpoint ---");
  console.log("Service Reference from Token:", req.user.serviceRef);
  try {
    const serviceRef = req.user.serviceRef;

    const [rows] = await pool.query(
      `SELECT * FROM service WHERE serviceRef = ?`,
      [serviceRef]
    );

    if (rows.length === 0) {
      console.log("Action: Service not found, sending 404.");
      return res.status(404).json({ error: "Service not found for this user" });
    }

    res.json(rows[0]);
    console.log(
      `Profile for service reference ${serviceRef} retrieved successfully.`
    );
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 3302;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
