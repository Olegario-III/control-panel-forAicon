import React, { useEffect, useState } from "react";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/get-all-reports");
      const data = await res.json();

      // Backend returns an object with key 'records'
      setReports(data.records || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;

    try {
      await fetch(`http://localhost:5000/delete-report/${id}`, { method: "DELETE" });
      fetchReports(); // refresh
    } catch {
      alert("Failed to delete report");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    if (date._seconds) return new Date(date._seconds * 1000).toLocaleString();
    return new Date(date).toLocaleString();
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Reports</h2>
      {loading && <p>Loading reports...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && reports.length === 0 && <p>No reports found.</p>}

      {!loading && reports.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>User</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Report</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Date</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{r.email || "Unknown"}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{r.report}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                  {formatDate(r.date)}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                  <button
                    onClick={() => deleteReport(r.id)}
                    style={{
                      background: "#d9534f",
                      color: "#fff",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
