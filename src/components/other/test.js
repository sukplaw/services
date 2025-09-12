// import React, { useState } from 'react';

// // For this Canvas environment, we will define the CSS styles directly in a <style> tag
// // as external CSS files are not supported. This provides the necessary styling.
// // Please note that a real-world React app would typically use external CSS files.
// const style = `
// @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;700&display=swap');

// body {
//   margin: 0;
//   font-family: 'Kanit', sans-serif;
//   background-color: #4b0082;
// }

// /* Main container and layout */
// .container {
//   display: flex;
//   min-height: 100vh;
// }

// /* Sidebar styling */
// .sidebar {
//   width: 250px;
//   background-color: #0f4c75;
//   color: white;
//   padding: 20px;
//   box-sizing: border-box;
//   position: fixed;
//   height: 100vh;
//   left: 0;
//   top: 0;
//   z-index: 20;
// }

// .sidebar-header {
//   display: flex;
//   align-items: center;
//   margin-bottom: 30px;
//   font-size: 1.2rem;
//   font-weight: bold;
// }

// .sidebar-header img {
//   width: 40px;
//   margin-right: 10px;
//   border-radius: 50%;
// }

// .sidebar-nav ul {
//   list-style: none;
//   padding: 0;
// }

// .sidebar-nav li {
//   margin-bottom: 10px;
// }

// .sidebar-nav a {
//   color: white;
//   text-decoration: none;
//   padding: 10px;
//   display: block;
//   border-radius: 8px;
//   transition: background-color 0.3s;
// }

// .sidebar-nav a:hover,
// .sidebar-nav li.active a {
//   background-color: #5a1a9a;
// }

// .sidebar-nav .active {
//   background-color: #f7b731;
// }

// .sidebar-nav .active a {
//   color: black;
// }

// .sidebar-nav .active a:hover {
//   background-color: #f7b731;
// }

// .sidebar-nav a i {
//   margin-right: 10px;
// }

// /* Main content area */
// .main-content {
//   flex-grow: 1;
//   padding-left: 250px;
//   display: flex;
//   flex-direction: column;
// }

// /* Navbar */
// .navbar {
//   background-color: #ff4136;
//   padding: 10px 20px;
//   display: flex;
//   justify-content: flex-end;
//   align-items: center;
//   color: white;
//   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
//   position: sticky;
//   top: 0;
//   z-index: 10;
// }

// .navbar-right {
//   display: flex;
//   align-items: center;
// }

// .navbar-date,
// .navbar-service {
//   margin-right: 20px;
//   font-size: 1.1rem;
// }

// .navbar-user-icon {
//   width: 40px;
//   height: 40px;
//   background-color: #1abc9c;
//   border-radius: 50%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   font-weight: bold;
//   margin-right: 10px;
// }

// /* Dashboard content */
// .dashboard-content {
//   background-color: #f7b731;
//   margin: 20px;
//   padding: 20px;
//   border-radius: 10px;
//   overflow-y: auto;
//   flex-grow: 1; /* Allow dashboard content to fill the remaining space */
//   display: flex;
//   flex-direction: column;
// }

// .dashboard-content h1 {
//   color: black;
// }

// .dashboard-header {
//   display: flex;
//   align-items: center;
//   margin-bottom: 20px;
// }

// .date-picker,
// .dropdown {
//   background-color: white;
//   padding: 8px 15px;
//   border-radius: 20px;
//   margin-right: 10px;
//   display: flex;
//   align-items: center;
//   font-size: 0.9rem;
// }

// .date-picker i,
// .dropdown i {
//   margin-left: 5px;
// }

// /* Stats cards */
// .stats-cards {
//   display: flex;
//   flex-wrap: wrap; /* Added for responsiveness */
//   justify-content: space-between;
//   gap: 20px;
//   margin-bottom: 20px;
// }

// .card {
//   background-color: white;
//   border-radius: 10px;
//   padding: 20px;
//   flex: 1 1 300px; /* Added for responsiveness */
//   display: flex;
//   align-items: center;
//   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
// }

// .card-icon {
//   font-size: 2rem;
//   margin-right: 15px;
// }

// .card-text h2 {
//   margin: 0 0 5px 0;
// }

// .card-text p {
//   margin: 0;
//   font-size: 0.8rem;
//   color: #777;
// }

// /* Charts section */
// .charts-section {
//   display: flex;
//   flex-wrap: wrap; /* Added for responsiveness */
//   justify-content: space-between;
//   gap: 20px;
//   margin-bottom: 20px;
// }

// .chart {
//   background-color: white;
//   border-radius: 10px;
//   padding: 20px;
//   flex: 1 1 300px; /* Added for responsiveness */
//   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
// }

// .chart-placeholder {
//   height: 150px;
//   background-color: #e0e0e0;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   color: #555;
//   font-size: 0.9rem;
// }

// /* Task summary */
// .task-summary {
//   background-color: white;
//   border-radius: 10px;
//   padding: 20px;
//   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//   margin-top: 20px;
// }

// .task-grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); /* Adjusted for better responsiveness */
//   gap: 20px;
//   text-align: center;
//   margin-bottom: 20px;
// }

// .task-item {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// }

// .task-item i {
//   font-size: 1.5rem;
//   margin-bottom: 5px;
// }

// .task-item p {
//   margin: 0;
//   font-size: 0.8rem;
// }

// .task-item span {
//   font-size: 1.5rem;
//   font-weight: bold;
// }

// .goto-button {
//   background-color: #3498db;
//   color: white;
//   padding: 10px 20px;
//   border: none;
//   border-radius: 20px;
//   cursor: pointer;
//   display: block;
//   width: 200px;
//   margin: 0 auto;
// }
// `;

// // Component for the Sidebar
// const Sidebar = ({ currentPage, setCurrentPage }) => {
//   return (
//     <div className="sidebar">
//       <div className="sidebar-header">
//         {/* Using a placeholder image for the user icon */}
//         <img src="https://placehold.co/40x40/94A3B8/FFFFFF?text=USER" alt="user icon" />
//         <span>service system</span>
//       </div>
//       <nav className="sidebar-nav">
//         <ul>
//           <li className={currentPage === 'home' ? 'active' : ''}>
//             <a href="#" onClick={() => setCurrentPage('home')}>
//               <i className="fas fa-home"></i>
//               หน้าแรก
//             </a>
//           </li>
//           <li className={currentPage === 'dashboard' ? 'active' : ''}>
//             <a href="#" onClick={() => setCurrentPage('dashboard')}>
//               <i className="fas fa-chart-line"></i>
//               Dashboard
//             </a>
//           </li>
//           <li>
//             <a href="#logout">
//               <i className="fas fa-sign-out-alt"></i>
//               Log Out
//             </a>
//           </li>
//         </ul>
//       </nav>
//     </div>
//   );
// };

// // Component for the Navbar
// const Navbar = () => {
//   return (
//     <header className="navbar">
//       <div className="navbar-right">
//         <span className="navbar-date">Wed, 6 Aug 2025</span>
//         <span className="navbar-service">Service</span>
//         <div className="navbar-user-icon">S</div>
//         <i className="fas fa-chevron-down"></i>
//       </div>
//     </header>
//   );
// };

// // Component for the main Dashboard content
// const Dashboard = () => {
//   return (
//     <div className="dashboard-content">
//       <h1>Dashboard</h1>
//       <div className="dashboard-header">
//         <div className="date-picker">
//           <i className="fas fa-calendar-alt"></i>
//           <span>Wed, 6 Aug 2025</span>
//           <i className="fas fa-chevron-down"></i>
//         </div>
//         <div className="dropdown">
//           <span>วัน</span>
//           <i className="fas fa-chevron-down"></i>
//         </div>
//         <div className="dropdown">
//           <span>เลือกสถานะ:</span>
//           <i className="fas fa-chevron-down"></i>
//         </div>
//       </div>

//       <div className="stats-cards">
//         <div className="card">
//           <div className="card-icon">
//             <i className="fas fa-box"></i>
//           </div>
//           <div className="card-text">
//             <h2>1 ชิ้น</h2>
//             <p>จำนวนสินค้าที่ค้นหาต่อวัน</p>
//           </div>
//         </div>
//         <div className="card">
//           <div className="card-icon">
//             <i className="fas fa-th"></i>
//           </div>
//           <div className="card-text">
//             <h2>เครื่องช่วยฟัง</h2>
//             <p>ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำวัน</p>
//           </div>
//         </div>
//         <div className="card">
//           <div className="card-icon">
//             <i className="fas fa-users"></i>
//           </div>
//           <div className="card-text">
//             <h2>สมปอง, 1 รายการ</h2>
//             <p>ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำวัน</p>
//           </div>
//         </div>
//       </div>

//       <div className="charts-section">
//         <div className="chart">
//           <h3>จำนวนสินค้าที่ค้นหาสูงสุดประจำวัน</h3>
//           <div className="chart-placeholder">
//             {/* Recharts can be used here for actual charts */}
//             Chart placeholder 1
//           </div>
//         </div>
//         <div className="chart">
//           <h3>ประเภทสินค้าที่ถูกค้นหาสูงสุดประจำเดือน</h3>
//           <div className="chart-placeholder">
//             Chart placeholder 2
//           </div>
//         </div>
//         <div className="chart">
//           <h3>ลูกค้าที่ค้นหาสินค้ามากที่สุดประจำเดือน</h3>
//           <div className="chart-placeholder">
//             Chart placeholder 3
//           </div>
//         </div>
//       </div>

//       <div className="task-summary">
//         <h3>จำนวนสถานะงานที่ค้าง</h3>
//         <div className="task-grid">
//           <div className="task-item">
//             <i className="fas fa-lightbulb"></i>
//             <p>เริ่มต้น</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-box-open"></i>
//             <p>รอของ</p>
//             <span>8</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-file"></i>
//             <p>ช่องลง</p>
//             <span>0</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-check-circle"></i>
//             <p>รับเรื่อง</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-redo-alt"></i>
//             <p>รอดำเนินการ</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-clipboard-check"></i>
//             <p>ปิดงานแล้ว</p>
//             <span>3</span>
//           </div>
//         </div>
//         <button className="goto-button">ไปที่หน้างาน</button>
//       </div>

//       {/* Adding more content to demonstrate scrolling */}
//       <div className="task-summary mt-5">
//         <h3>จำนวนสถานะงานที่ค้าง (ตัวอย่างเพิ่มเติม)</h3>
//         <div className="task-grid">
//           <div className="task-item">
//             <i className="fas fa-lightbulb"></i>
//             <p>เริ่มต้น</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-box-open"></i>
//             <p>รอของ</p>
//             <span>8</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-file"></i>
//             <p>ช่องลง</p>
//             <span>0</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-check-circle"></i>
//             <p>รับเรื่อง</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-redo-alt"></i>
//             <p>รอดำเนินการ</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-clipboard-check"></i>
//             <p>ปิดงานแล้ว</p>
//             <span>3</span>
//           </div>
//         </div>
//         <button className="goto-button">ไปที่หน้างาน</button>
//       </div>

//       <div className="task-summary mt-5">
//         <h3>จำนวนสถานะงานที่ค้าง (ตัวอย่างเพิ่มเติม 2)</h3>
//         <div className="task-grid">
//           <div className="task-item">
//             <i className="fas fa-lightbulb"></i>
//             <p>เริ่มต้น</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-box-open"></i>
//             <p>รอของ</p>
//             <span>8</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-file"></i>
//             <p>ช่องลง</p>
//             <span>0</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-check-circle"></i>
//             <p>รับเรื่อง</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-redo-alt"></i>
//             <p>รอดำเนินการ</p>
//             <span>1</span>
//           </div>
//           <div className="task-item">
//             <i className="fas fa-clipboard-check"></i>
//             <p>ปิดงานแล้ว</p>
//             <span>3</span>
//           </div>
//         </div>
//         <button className="goto-button">ไปที่หน้างาน</button>
//       </div>

//     </div>
//   );
// };

// // Main App component with simple routing
// const App = () => {
//   const [currentPage, setCurrentPage] = useState('dashboard');

//   // Simple routing logic to display the correct page
//   const renderPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard />;
//       // Add other pages here as needed
//       case 'home':
//         return <div className="p-4 text-center text-white">หน้าแรก (Home Page) กำลังอยู่ในระหว่างการพัฒนา</div>
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <>
//       <style>{style}</style>
//       <div className="container">
//         {/* The Sidebar is always visible */}
//         <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

//         <div className="main-content">
//           {/* The Navbar is always visible and sticky */}
//           <Navbar />

//           {/* The main content area, which changes based on the page */}
//           {renderPage()}
//         </div>
//       </div>
//     </>
//   );
// };

// export default App;
