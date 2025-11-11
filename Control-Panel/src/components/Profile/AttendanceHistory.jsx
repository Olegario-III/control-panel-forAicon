import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await fetch(`http://localhost:5000/get-attendance/${user.uid}`);
      const data = await res.json();
      const recs = data.records || [];
      setRecords(recs);

      // Calculate total work hours
      let total = 0;
      recs.forEach((r) => {
        if (r.clockIn && r.clockOut) {
          const inTime = r.clockIn._seconds * 1000;
          const outTime = r.clockOut._seconds * 1000;
          total += (outTime - inTime) / (1000 * 60 * 60); // hours
        }
      });
      setTotalHours(total);
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
                const clockIn = r.clockIn?._seconds * 1000;
                const clockOut = r.clockOut?._seconds * 1000;
                const hours = r.clockOut ? ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2) : "—";

                return (
                  <tr key={r.id}>
                    <td>{clockIn ? new Date(clockIn).toLocaleString() : "—"}</td>
                    <td>{clockOut ? new Date(clockOut).toLocaleString() : "—"}</td>
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

        th, td {
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
