import { useState } from "react";
import AddUserForm from "./AddUserForm";
import UserList from "./UserList";
import { useAuth } from "../../context/AuthContext";

export default function UserManagement() {
  const { role } = useAuth();
  const [refresh, setRefresh] = useState(false);
  const [view, setView] = useState("list"); // "list" | "add"

  const handleUserAdded = () => {
    setRefresh(!refresh);
    setView("list"); // go back to list after adding
  };

  if (role !== "admin") return <p>❌ Access denied.</p>;

  return (
    <div style={container}>
      <h2 style={heading}>User Management</h2>

      <div style={tabs}>
        <button
          onClick={() => setView("list")}
          style={view === "list" ? activeTab : tab}
        >
          👥 User List
        </button>
        <button
          onClick={() => setView("add")}
          style={view === "add" ? activeTab : tab}
        >
          ➕ Add User
        </button>
      </div>

      <div style={content}>
        {view === "add" ? (
          <AddUserForm onUserAdded={handleUserAdded} />
        ) : (
          <UserList refresh={refresh} />
        )}
      </div>
    </div>
  );
}

const container = {
  background: "#1f2937",
  padding: "20px",
  borderRadius: "10px",
  color: "#fff",
  minHeight: "100%",
};

const heading = {
  fontSize: "1.5rem",
  marginBottom: "15px",
};

const tabs = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
};

const tab = {
  background: "#374151",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};

const activeTab = {
  ...tab,
  background: "#3b82f6",
};

const content = {
  marginTop: "10px",
  background: "#111827",
  padding: "20px",
  borderRadius: "10px",
};
