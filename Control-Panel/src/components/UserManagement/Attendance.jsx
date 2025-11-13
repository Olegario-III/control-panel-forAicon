import React, { useEffect, useState } from "react";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/get-all-attendance");
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        // Convert Firestore timestamps to readable strings
        const records = data.records.map((rec) => ({
          ...rec,
          clockIn: rec.clockIn?._seconds
            ? new Date(rec.clockIn._seconds * 1000).toLocaleString()
            : "N/A",
          clockOut: rec.clockOut?._seconds
            ? new Date(rec.clockOut._seconds * 1000).toLocaleString()
            : "N/A",
        }));

        setAttendance(records);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) return <p>Loading attendance...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <table border="1" cellPadding="5">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Clock In</th>
          <th>Clock Out</th>
        </tr>
      </thead>
      <tbody>
        {attendance.map((record) => (
          <tr key={record.id}>
            <td>{record.id}</td>
            <td>{record.name || "N/A"}</td>
            <td>{record.clockIn}</td>
            <td>{record.clockOut}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Attendance;
