// src/components/Sidebar.jsx
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onSelect }) {
  const { role, logout } = useAuth();

  // Define sidebar items based on user role
  const items =
    role === "admin"
      ? [
          "Dashboard",
          "User Management",
          "Reports",
          "Product Catalog",
          "Documents",
          "Leads",
          "Inquiries",
          "Profile",
        ]
      : [
          "Dashboard",
          "Product Catalog",
          "Documents",
          "Leads",
          "Inquiries",
          "Profile",
        ];

  return (
    <aside className="sidebar">
      <h2>Control Panel</h2>
      <nav>
        {items.map((item) => (
          <button key={item} onClick={() => onSelect(item)}>
            {item}
          </button>
        ))}
      </nav>

      <button className="logout" onClick={logout}>
        Logout
      </button>

      {/* Regular <style> tag for React (no jsx attr) */}
      <style>{`
        .sidebar {
          width: 220px;
          background: #111827;
          color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        h2 {
          font-size: 1.3rem;
          margin-bottom: 20px;
          text-align: center;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        button {
          background: transparent;
          color: white;
          border: none;
          text-align: left;
          padding: 10px;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s;
        }

        button:hover {
          background: #374151;
        }

        .logout {
          background: #dc2626;
          margin-top: 20px;
          padding: 10px;
          border-radius: 6px;
          font-weight: bold;
          text-align: center;
        }

        .logout:hover {
          background: #b91c1c;
        }
      `}</style>
    </aside>
  );
}
