import Link from "react-router-dom/Link";
import { useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();
  // const handleLogout = () => {
  //   localStorage.clear();
  //   sessionStorage.clear();
  //   navigate("/");
  // };

  const clearAuthData = () => {
  ["token", "permission"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const handleLogout = () => {
  clearAuthData();
  window.location.href = "/";
};
  return (
    <div className="sidebar">
      <h1 className="text-3xl font-bold mb-8">System</h1>
      <nav>
        <ul>
          <li>
            {/* ใช้ Link แทน Link เพื่อจัดการ class 'active' โดยอัตโนมัติ */}
            <Link to="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>หน้าหลัก</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.254A8.01 8.01 0 0010 2a8 8 0 00-8 8h8V2.254z" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/create-customer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <span>สร้างลูกค้า</span>
            </Link>
          </li>
          <li>
            <Link to="/create-product">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7z" />
                <path
                  fillRule="evenodd"
                  d="M18 8a2 2 0 012 2v2a2 2 0 01-2 2H2a2 2 0 01-2-2v-2a2 2 0 012-2h1V5a3 3 0 013-3h8a3 3 0 013 3v3h1zm-1 4v-2h-2V5a1 1 0 00-1-1H7a1 1 0 00-1 1v5H4v2h12z"
                  clipRule="evenodd"
                />
              </svg>
              <span>สร้างสินค้า</span>
            </Link>
          </li>
          <li>
            <Link to="/create-job">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span>สร้างงาน</span>
            </Link>
          </li>
          <li>
            <Link to="/show-customer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17.555 8.927l-2.457 1.419a4 4 0 000-2.852l2.457-1.419a1 1 0 111 1.732L18.555 8.927zM14 6a4 4 0 10-8 0 4 4 0 008 0z" />
              </svg>
              <span>แสดงลูกค้า</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto">
        <Link to="/logout">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a8 8 0 00-8 8v7a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-7a8 8 0 00-8-8z" />
          </svg>
          <span>ออกจากระบบ</span>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
