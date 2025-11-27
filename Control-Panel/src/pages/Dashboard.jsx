// src/pages/Dashboard.jsx
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

import UserManagement from "../components/UserManagement";
import Reports from "../components/Reports";
import ProductCatalog from "../components/ProductCatalog";
import Inquiries from "../components/Inquiries";
import Overview from "../components/Overview";
import Profile from "../components/Profile";
import Leads from "../components/Leads";
import Documents from "../components/Documents";

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const [selected, setSelected] = useState("Dashboard");

  // Mobile: sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  // Render pages
  const renderContent = () => {
    if (role === "admin" && selected === "User Management") return <UserManagement />;
    if (role === "admin" && selected === "Reports") return <Reports />;
    if (role !== "client" && selected === "Dashboard") return <Overview />;

    switch (selected) {
      case "Dashboard":
        return <p>Dashboard — overview of key metrics.</p>;
      case "Product Catalog":
        return <ProductCatalog />;
      case "Documents":
        return <Documents />;
      case "Leads":
        return <Leads />;
      case "Inquiries":
        return <Inquiries />;
      case "Profile":
        return <Profile />;
      default:
        return <p>Select a section from the sidebar.</p>;
    }
  };

  return (
    <div className="dashboard-wrapper">

      {/* Glow overlay when mobile sidebar is open */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <Sidebar
        onSelect={(item) => {
          setSelected(item);
          setSidebarOpen(false); // close after selection
        }}
        mobileOpen={sidebarOpen}
      />

      <main className="main-area">
        {/* Mobile Header */}
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>

        <header className="header">
          <h1>{selected}</h1>
          <p>
            Welcome,{" "}
            <strong>{role === "admin" ? "Admin" : "Staff"}</strong> ({user.email})
          </p>
        </header>

        <section className="content">{renderContent()}</section>
      </main>

      <style>{`
        .dashboard-wrapper {
          display: flex;
          width: 100vw;
          height: 100vh;
          background-color: #0f172a;
          color: #f9fafb;
          overflow: hidden;
          position: relative;
        }

        /* Mobile overlay when sidebar is open */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 9;
        }

        /* Main content */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow-y: auto;
        }

        /* Header */
        .header {
          border-bottom: 1px solid #1e293b;
          margin-bottom: 20px;
          padding-bottom: 10px;
        }

        h1 {
          font-size: 1.8rem;
          color: #facc15;
          margin: 0 0 5px;
        }

        .content {
          flex: 1;
          background: #1e293b;
          padding: 20px;
          border-radius: 10px;
        }

        /* MOBILE ONLY */
        .hamburger {
          display: none;
        }

        @media (max-width: 900px) {
          .hamburger {
            display: block;
            position: absolute;
            top: 15px;
            left: 15px;
            z-index: 10;
            background: #1e293b;
            border: 1px solid #334155;
            padding: 8px 12px;
            border-radius: 6px;
            color: white;
            font-size: 1.2rem;
          }

          .main-area {
            padding-top: 55px;
          }
        }
      `}</style>
    </div>
  );
}
