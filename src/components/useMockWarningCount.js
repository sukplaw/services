import React, { useState, createContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./other/Sidebar";
import Navbar from "./other/Navbar";

// These components would be imported from their respective files

// Context is created here to make the component self-contained.
const WarningContext = createContext(0);

// We'll mock the warning count for this example.
const useMockWarningCount = () => {
  const [warningCount, setWarningCount] = useState(5);
  return warningCount;
};

// Component สำหรับ Layout ที่มีการป้องกัน
const ProtectedLayout = () => {
  const warningCount = useMockWarningCount();

  return (
    <div
      className="d-flex"
      style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}
    >
      <Sidebar />
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{ paddingLeft: "250px" }}
      >
        <WarningContext.Provider value={warningCount}>
          <Navbar />
          {/* Outlet จะแสดง Component ที่ถูกเรียกใน Route ย่อย */}
          <Outlet />
        </WarningContext.Provider>
      </div>
    </div>
  );
};

export default ProtectedLayout;
