import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function UserList({ refresh }) {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [refresh]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/get-users");
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleDelete = async (uid, userRole) => {
    if (userRole === "admin") {
      alert("❌ You cannot delete an admin!");
      return;
    }
    if (confirm("Delete this user?")) {
      try {
        const res = await fetch(`http://localhost:5000/delete-user/${uid}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u.uid);
    setEditData({ name: u.name, email: u.email, role: u.role });
  };

  const handleSave = async (uid) => {
    try {
      const res = await fetch(`http://localhost:5000/update-user/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="user-list">
      <h3>👥 User Management</h3>

      {users.length === 0 ? (
        <p>No users yet.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td>
                    {editingUser === u.uid ? (
                      <input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                    ) : (
                      u.name
                    )}
                  </td>

                  <td>
                    {editingUser === u.uid ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                      />
                    ) : (
                      u.email
                    )}
                  </td>

                  <td>
                    {editingUser === u.uid ? (
                      <select
                        value={editData.role}
                        onChange={(e) =>
                          setEditData({ ...editData, role: e.target.value })
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="client">Client</option>
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>

                  <td className="actions">
                    {editingUser === u.uid ? (
                      <>
                        <button className="save" onClick={() => handleSave(u.uid)}>
                          Save
                        </button>
                        <button className="cancel" onClick={() => setEditingUser(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="edit" onClick={() => handleEdit(u)}>
                          Edit
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDelete(u.uid, u.role)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      <style>{`
        .user-list {
          background: #1f2937;
          padding: 1.5rem;
          border-radius: 12px;
          color: #f9fafb;
          width: 100%;
        }

        h3 {
          margin-bottom: 1rem;
        }

        /* WRAPPER FOR RESPONSIVE SCROLL */
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 600px;
          border-collapse: collapse;
          background: #374151;
          border-radius: 8px;
          overflow: hidden;
        }

        th, td {
          padding: 12px 10px;
          border-bottom: 1px solid #4b5563;
        }

        th {
          background: #111827;
          text-align: left;
        }

        input, select {
          background: #1f2937;
          border: 1px solid #4b5563;
          color: #f9fafb;
          padding: 6px;
          border-radius: 6px;
          width: 100%;
        }

        .actions {
          text-align: center;
          min-width: 150px;
        }

        button {
          margin: 4px;
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: 0.2s;
        }

        button.edit { background: #3b82f6; color: white; }
        button.delete { background: #ef4444; color: white; }
        button.save { background: #10b981; color: white; }
        button.cancel { background: #6b7280; color: white; }

        button:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }

        /* =============== RESPONSIVE =============== */

        /* Small tablets and below */
        @media (max-width: 768px) {
          .user-list {
            padding: 1rem;
          }

          table {
            font-size: 0.9rem;
          }

          th, td {
            padding: 8px;
          }

          .actions {
            min-width: 120px;
          }
        }

        /* Mobile – Convert table rows into cards */
        @media (max-width: 520px) {
          table {
            display: none;
          }

          .user-card {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
