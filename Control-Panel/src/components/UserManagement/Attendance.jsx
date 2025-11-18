import React, { useState, useEffect } from "react";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);

  // ===== UTILITIES ===== //
  function parseTime(t) {
    if (!t) return null;
    if (typeof t === "string") {
      const d = new Date(t);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof t === "object" && t._seconds !== undefined) {
      return new Date(t._seconds * 1000 + t._nanoseconds / 1e6);
    }
    return null;
  }

  function getTotalHours(clockIn, clockOut) {
    const ci = parseTime(clockIn);
    const co = parseTime(clockOut);

    if (!ci || !co) return null;

    const diffMs = co - ci;
    return (diffMs / (1000 * 60 * 60)).toFixed(2);
  }

  // replace this with fetch from backend
  useEffect(() => {
    fetch("http://localhost:5000/get-all-attendance") // or your DB call
      .then((r) => r.json())
      .then((data) => setRecords(data.records));
  }, []);

  // ===== DELETE ===== //
  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // ===== EDIT ===== //
  const saveEdit = () => {
    setRecords((prev) =>
      prev.map((r) => (r.id === editRecord.id ? editRecord : r))
    );
    setEditRecord(null);
  };

  return (
    <div className="attendance">
      <h2>Attendance Records</h2>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Total Hours</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => {
            const total = getTotalHours(r.clockIn, r.clockOut);

            return (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{parseTime(r.clockIn)?.toLocaleString() ?? "-"}</td>
                <td>{parseTime(r.clockOut)?.toLocaleString() ?? "-"}</td>
                <td>{total ?? "-"}</td>

                <td>
                  <button onClick={() => setEditRecord(r)}>Edit</button>
                  <button onClick={() => deleteRecord(r.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      {editRecord && (
        <div className="modal">
          <h3>Edit Attendance</h3>

          <label>Clock In</label>
          <input
            type="datetime-local"
            value={
              parseTime(editRecord.clockIn)
                ?.toISOString()
                .slice(0, 16) ?? ""
            }
            onChange={(e) =>
              setEditRecord({
                ...editRecord,
                clockIn: new Date(e.target.value).toISOString(),
              })
            }
          />

          <label>Clock Out</label>
          <input
            type="datetime-local"
            value={
              parseTime(editRecord.clockOut)
                ?.toISOString()
                .slice(0, 16) ?? ""
            }
            onChange={(e) =>
              setEditRecord({
                ...editRecord,
                clockOut: new Date(e.target.value).toISOString(),
              })
            }
          />

          <button onClick={saveEdit}>Save</button>
          <button onClick={() => setEditRecord(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
