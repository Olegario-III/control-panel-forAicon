// src/components/UserManagement/Attendance.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firestore";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./Attendance.css";

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  // -----------------------------
  // Helper: Convert Firestore timestamp to ISO string
  // -----------------------------
  const formatTimestamp = (ts) => {
    if (!ts) return "";
    if (typeof ts === "string") return ts;
    if (ts.seconds) return new Date(ts.seconds * 1000).toISOString();
    return "";
  };

  // -----------------------------
  // Fetch and group by day
  // -----------------------------
  const fetchAttendance = async () => {
    try {
      const snap = await getDocs(collection(db, "attendance"));
      const data = {};
      snap.forEach((docSnap) => {
        const entry = docSnap.data();
        if (!entry.clockIn) return;

        const clockInStr = formatTimestamp(entry.clockIn);
        const dateKey = clockInStr.split("T")[0]; // YYYY-MM-DD

        if (!data[dateKey]) data[dateKey] = [];
        data[dateKey].push({ ...entry, clockIn: clockInStr, clockOut: formatTimestamp(entry.clockOut), id: docSnap.id });
      });
      setAttendanceData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // -----------------------------
  // Export Excel
  // -----------------------------
  const exportToExcel = (day, rows) => {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map(r => ({
        Name: r.name,
        Email: r.email,
        "Clock In": r.clockIn,
        "Clock Out": r.clockOut
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const safeDay = day.replaceAll("-", "_");
    XLSX.writeFile(workbook, `Attendance-${safeDay}.xlsx`);
  };

  // -----------------------------
  // Export PDF
  // -----------------------------
  const exportToPDF = (day, rows) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Attendance for ${day}`, 10, 10);
      doc.autoTable({
        startY: 20,
        head: [["Name", "Email", "Clock In", "Clock Out"]],
        body: rows.map(r => [r.name, r.email, r.clockIn, r.clockOut]),
      });
      const safeDay = day.replaceAll("-", "_");
      doc.save(`Attendance-${safeDay}.pdf`);
    } catch (err) {
      console.error("PDF Export Failed:", err);
      alert("PDF export failed. Check console.");
    }
  };

  // -----------------------------
  // Delete record
  // -----------------------------
  const handleDelete = async (id) => {
    if (confirm("Delete this record?")) {
      try {
        await deleteDoc(doc(db, "attendance", id));
        fetchAttendance();
      } catch (err) {
        console.error(err);
        alert("Failed to delete record.");
      }
    }
  };

  // -----------------------------
  // Save edit
  // -----------------------------
  const handleSave = async () => {
    try {
      const { id, clockIn, clockOut, name, email } = editRecord;
      await updateDoc(doc(db, "attendance", id), { clockIn, clockOut, name, email });
      setEditRecord(null);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("Failed to save record.");
    }
  };

  if (loading) return <p>Loading attendance...</p>;

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Attendance Records</h2>

      {Object.keys(attendanceData).length === 0 ? (
        <p>No attendance data found.</p>
      ) : (
        <div className="attendance-grid">
          {Object.keys(attendanceData).map((day) => {
            const rows = attendanceData[day];
            return (
              <div className="attendance-card" key={day}>
                <div className="attendance-card-header">
                  <h3>{day}</h3>
                  <div className="attendance-buttons">
                    <button onClick={() => exportToExcel(day, rows)}>📄 Excel</button>
                    <button onClick={() => exportToPDF(day, rows)}>🖨 PDF</button>
                  </div>
                </div>

                <div className="attendance-table-wrapper">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <td>
                            {editRecord?.id === r.id ? (
                              <input
                                value={editRecord.name}
                                onChange={(e) =>
                                  setEditRecord({ ...editRecord, name: e.target.value })
                                }
                              />
                            ) : (
                              r.name
                            )}
                          </td>
                          <td>{r.email || "-"}</td>
                          <td>
                            {editRecord?.id === r.id ? (
                              <input
                                type="datetime-local"
                                value={editRecord.clockIn.slice(0, 16)}
                                onChange={(e) =>
                                  setEditRecord({
                                    ...editRecord,
                                    clockIn: new Date(e.target.value).toISOString(),
                                  })
                                }
                              />
                            ) : (
                              r.clockIn
                            )}
                          </td>
                          <td>
                            {editRecord?.id === r.id ? (
                              <input
                                type="datetime-local"
                                value={editRecord.clockOut?.slice(0, 16) || ""}
                                onChange={(e) =>
                                  setEditRecord({
                                    ...editRecord,
                                    clockOut: new Date(e.target.value).toISOString(),
                                  })
                                }
                              />
                            ) : (
                              r.clockOut
                            )}
                          </td>
                          <td className="actions">
                            {editRecord?.id === r.id ? (
                              <>
                                <button className="save" onClick={handleSave}>Save</button>
                                <button className="cancel" onClick={() => setEditRecord(null)}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button className="edit" onClick={() => setEditRecord(r)}>Edit</button>
                                <button className="delete" onClick={() => handleDelete(r.id)}>Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
