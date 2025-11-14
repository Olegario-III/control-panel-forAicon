import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function DailyReports() {
  const { user } = useAuth();

  const [report, setReport] = useState("");
  const [date, setDate] = useState("");
  const [reports, setReports] = useState([]);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  // --------------------------
  // SAFE DATE PARSING
  // --------------------------
  const parseDate = (val) => {
    if (!val) return null;

    // Firestore timestamp { _seconds, _nanoseconds }
    if (typeof val === "object" && "_seconds" in val) {
      return new Date(val._seconds * 1000);
    }

    // ISO string
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d)) return d;
    }

    // JS Date object
    if (val instanceof Date) return val;

    return null;
  };

  const formatDisplayDate = (val) => {
    const d = parseDate(val);
    if (!d) return "Invalid Date";
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const formatDateInput = (val) => {
    const d = parseDate(val) || new Date();
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // --------------------------
  // FETCH REPORTS
  // --------------------------
  const fetchReports = async () => {
    const res = await fetch(`http://localhost:5000/get-reports/${user.uid}`);
    const data = await res.json();
    setReports(data.reports || []);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // --------------------------
  // SUBMIT / UPDATE REPORT
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // auto-assign today's date if empty
    const reportDate = date ? new Date(date) : new Date();

    const payload = {
      uid: user.uid,
      email: user.email,
      report,
      date: reportDate.toISOString(),
    };

    let url = "http://localhost:5000/add-report";
    let method = "POST";

    if (editingId) {
      url = `http://localhost:5000/update-report/${editingId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setMsg(data.message || data.error);

    setReport("");
    setDate("");
    setEditingId(null);

    fetchReports();
  };

  // --------------------------
  // EDIT REPORT
  // --------------------------
  const editReport = (item) => {
    setEditingId(item.id);
    setReport(item.report);
    setDate(formatDateInput(item.date));
  };

  // --------------------------
  // DELETE REPORT
  // --------------------------
  const deleteReport = async (id) => {
    if (!confirm("Delete this report?")) return;
    const res = await fetch(`http://localhost:5000/delete-report/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    fetchReports();
  };

  return (
    <div>
      <h3>Daily Report</h3>

      <form onSubmit={handleSubmit}>
        <label>Date *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ display: "block", marginBottom: 10, padding: 6 }}
        />

        <textarea
          placeholder="What did you do today?"
          value={report}
          onChange={(e) => setReport(e.target.value)}
          required
          style={{ width: "100%", height: 120, marginBottom: 10, padding: 10 }}
        />

        <button type="submit">
          {editingId ? "Update Report" : "Submit Report"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setReport("");
              setDate("");
            }}
            style={{ marginLeft: 10, background: "gray" }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <p>{msg}</p>

      <hr style={{ margin: "20px 0" }} />

      <h4>Previous Reports</h4>

      {reports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        <ul>
          {reports.map((r) => (
            <li key={r.id}>
              <strong>{formatDisplayDate(r.date)}</strong>
              <br />
              {r.report}
              <div style={{ marginTop: 8 }}>
                <button onClick={() => editReport(r)} style={{ marginRight: 10, background: "#3b82f6" }}>
                  Edit
                </button>
                <button onClick={() => deleteReport(r.id)} style={{ background: "#ef4444" }}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style>{`
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
