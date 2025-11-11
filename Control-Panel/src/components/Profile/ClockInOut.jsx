// src/components/Profile/ClockInOut.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase/firestore";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

export default function ClockInOut() {
  const { user } = useAuth();
  const [status, setStatus] = useState("Checking...");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [totalHours, setTotalHours] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const q = query(
        collection(db, "attendance"),
        where("uid", "==", user.uid),
        orderBy("clockIn", "desc"),
        limit(1)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        setCurrentRecord({ id: docSnap.id, ...data });

        if (!data.clockOut) {
          setStatus("Clocked In");
          setTotalHours(null);
          return;
        } else {
          const hours = calculateHours(data.clockIn, data.clockOut);
          setTotalHours(hours);
        }
      }

      setStatus("Clocked Out");
    } catch (err) {
      console.error("Error checking status:", err);
    }
  };

  const handleClockIn = async () => {
    try {
      const ref = await addDoc(collection(db, "attendance"), {
        uid: user.uid,
        email: user.email,
        clockIn: Timestamp.now(),
        clockOut: null,
      });
      setCurrentRecord({ id: ref.id, clockIn: Timestamp.now(), clockOut: null });
      setStatus("Clocked In");
      setTotalHours(null);
    } catch (err) {
      console.error("Clock-in failed:", err);
      alert("❌ Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    if (!currentRecord?.id) {
      alert("⚠️ No active session found to clock out!");
      return;
    }

    try {
      const ref = doc(db, "attendance", currentRecord.id);
      const clockOutTime = Timestamp.now();

      await updateDoc(ref, { clockOut: clockOutTime });
      const hours = calculateHours(currentRecord.clockIn, clockOutTime);

      setStatus("Clocked Out");
      setTotalHours(hours);
      setCurrentRecord(null);
    } catch (err) {
      console.error("Clock-out failed:", err);
      alert("❌ Failed to clock out");
    }
  };

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    const diffMs = clockOut.toDate() - clockIn.toDate();
    const hours = diffMs / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  return (
    <div style={card}>
      <h3>Attendance</h3>
      <p>Status: <strong>{status}</strong></p>

      {status === "Clocked Out" ? (
        <button onClick={handleClockIn}>Clock In</button>
      ) : status === "Clocked In" ? (
        <button onClick={handleClockOut}>Clock Out</button>
      ) : (
        <p>Checking status...</p>
      )}

      {totalHours && (
        <p style={{ marginTop: "10px", color: "#facc15" }}>
          ⏱ Total Hours Worked: {totalHours} hrs
        </p>
      )}
    </div>
  );
}

const card = {
  background: "#374151",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "20px",
};
