import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function DailyReports() {
  const { user } = useAuth();
  const [report, setReport] = useState("");
  const [msg, setMsg] = useState("");
  const [reports, setReports] = useState([]);

  const submitReport = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/add-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, email: user.email, report }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    setReport("");
    fetchReports();
  };

  const fetchReports = async () => {
    const res = await fetch(`http://localhost:5000/get-reports/${user.uid}`);
    const data = await res.json();
    setReports(data.reports || []);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h3>Daily Report</h3>
      <form onSubmit={submitReport}>
        <textarea
          placeholder="What did you do today?"
          value={report}
          onChange={(e) => setReport(e.target.value)}
          required
          style={{ width: "100%", height: "100px" }}
        />
        <button type="submit">Submit</button>
      </form>
      <p>{msg}</p>

      <h4>Previous Reports</h4>
      {reports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        <ul>
          {reports.map((r) => (
            <li key={r.id}>
              <strong>{new Date(r.date._seconds * 1000).toLocaleString()}</strong>
              <br />
              {r.report}
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        button {
          background: #10b981;
          color: white;
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          margin-top: 8px;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          background: #374151;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}
