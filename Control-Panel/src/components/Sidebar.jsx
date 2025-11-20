// src/components/Sidebar.jsx
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onSelect, mobileOpen }) {
  const { role } = useAuth();

  const menuItems = [
    "Dashboard",
    "Product Catalog",
    "Documents",
    "Leads",
    "Inquiries",
    "Profile",
  ];

  const adminOnly = ["User Management", "Reports"];

  return (
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item} onClick={() => onSelect(item)}>
              {item}
            </li>
          ))}

          {role === "admin" &&
            adminOnly.map((item) => (
              <li key={item} className="admin-item" onClick={() => onSelect(item)}>
                {item}
              </li>
            ))}
        </ul>
      </nav>

      <style>{`
        .sidebar {
          width: 240px;
          background: #1e293b;
          padding: 20px 0;
          height: 100%;
          border-right: 1px solid #334155;
          position: relative;
          z-index: 11;
        }

        /* Menu list */
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          padding: 14px 20px;
          cursor: pointer;
          font-size: 1rem;
          color: #e2e8f0;
          transition: 0.2s;
        }

        li:hover {
          background: #334155;
        }

        /* Admin-only section */
        .admin-item {
          border-top: 1px solid #334155;
          margin-top: 10px;
          padding-top: 16px;
        }

        /* MOBILE SIDEBAR */
        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            left: -260px;
            top: 0;
            height: 100vh;
            transition: left 0.3s ease;
          }

          .sidebar.open {
            left: 0;
          }
        }
      `}</style>
    </aside>
  );
}
