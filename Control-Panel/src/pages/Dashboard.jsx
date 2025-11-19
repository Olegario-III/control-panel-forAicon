import { useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import UserManagement from "../components/UserManagement";
import Reports from "../components/Reports";
import ProductCatalog from "../components/ProductCatalog";
import Inquiries from "../components/Inquiries";
import Overview from "../components/Overview";
import Profile from "../components/Profile"; // your Profile folder index

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const [selected, setSelected] = useState("Dashboard");

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  // --- Render the selected page ---
  const renderContent = () => {
    if (role === "admin" && selected === "User Management") return <UserManagement />;
    if (role === "admin" && selected === "Reports") return <Reports />;

    switch (selected) {
      case "Dashboard":
        return <Overview />;

      case "Product Catalog":
        return <ProductCatalog />;

      case "Documents":
        return <p>Documents — upload and organize your files.</p>;

      case "Leads":
        return <p>Leads — track new potential clients.</p>;

      case "Inquiries":
        return <Inquiries />;

      case "Profile":
        return <Profile />; // ✅ just render the Profile component

      default:
        return <p>Select a section from the sidebar.</p>;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar onSelect={setSelected} />
      <main className="main">
        <header className="header">
          <h1>{selected}</h1>
          <p>
            Welcome, <strong>{role === "admin" ? "Admin" : "Staff"}</strong> ({user.email})
          </p>
        </header>

        <section className="content">{renderContent()}</section>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body, html, #root {
          height: 100%;
          margin: 0;
        }

        .dashboard {
          display: flex;
          width: 100vw;
          height: 100vh;
          background-color: #0f172a;
          color: #f9fafb;
          overflow: hidden;
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow-y: auto;
        }

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

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          margin-bottom: 10px;
          background: #334155;
          padding: 10px;
          border-radius: 6px;
        }

        li:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
