import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value === "object" && value._seconds) {
    return new Date(value._seconds * 1000);
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }
  if (value instanceof Date) return value;
  return null;
}

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`http://localhost:5000/get-attendance/${user.uid}`);
        const data = await res.json();
        const recs = data.records || [];

        // Normalize dates (convert Firestore TS or ISO strings into Date objects)
        const normalized = recs.map((r) => ({
          ...r,
          clockInDate: normalizeDate(r.clockIn),
          clockOutDate: normalizeDate(r.clockOut),
        }));

        setRecords(normalized);

        // Calculate total work hours safely
        let total = 0;
        normalized.forEach((r) => {
          const inD = r.clockInDate;
          const outD = r.clockOutDate;
          if (inD && outD && !isNaN(inD) && !isNaN(outD)) {
            total += (outD - inD) / (1000 * 60 * 60);
          }
        });
        setTotalHours(total);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setRecords([]);
        setTotalHours(0);
      }
    };

    fetchAttendance();
  }, [user.uid]);

  return (
    <div>
      <h3>Attendance History</h3>
      {records.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const clockIn = r.clockInDate;
                const clockOut = r.clockOutDate;
                const hours =
                  clockIn && clockOut
                    ? ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2)
                    : "—";

                return (
                  <tr key={r.id}>
                    <td>{clockIn ? clockIn.toLocaleString() : "—"}</td>
                    <td>{clockOut ? clockOut.toLocaleString() : "—"}</td>
                    <td>{hours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p>Total Work Hours: {totalHours.toFixed(2)}</p>
        </>
      )}

      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
          background: #374151;
          border-radius: 8px;
          overflow: hidden;
        }

        th,
        td {
          padding: 10px;
          border-bottom: 1px solid #475569;
        }

        th {
          background: #1f2937;
          text-align: left;
        }
      `}</style>
    </div>
  );
}
