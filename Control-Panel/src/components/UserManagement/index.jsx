import React, { useState } from "react";
import UserList from "./UserList";
import AddUser from "./AddUser";
import Attendance from "./Attendance";
import "./UserManagement.css";

export default function UserManagement() {
  const [page, setPage] = useState("list");

  return (
    <div className="um-container">

      {/* PAGE TITLE */}
      <h2 className="um-title">User Management</h2>

      {/* TOP TABS */}
      <div className="um-tabs">
        <button
          className={page === "list" ? "active-tab" : ""}
          onClick={() => setPage("list")}
        >
          👥 User List
        </button>

        <button
          className={page === "add" ? "active-tab" : ""}
          onClick={() => setPage("add")}
        >
          ➕ Add User
        </button>

        <button
          className={page === "attendance" ? "active-tab" : ""}
          onClick={() => setPage("attendance")}
        >
          🕒 Attendance
        </button>
      </div>

      {/* CONTENT */}
      <div className="um-content-box">
        {page === "list" && <UserList />}
        {page === "add" && <AddUser />}
        {page === "attendance" && <Attendance />}
      </div>
    </div>
  );
}
