import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import "./Overview.css";

export default function Calendar({ title, offset }) {
  const [notes, setNotes] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [text, setText] = useState("");

  // ─────────────────────────────────────────────
  // 📅 Compute the month based on offset
  // ─────────────────────────────────────────────
  const today = new Date();
  const monthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const month = monthDate.getMonth();
  const year = monthDate.getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ONE shared Firestore document per month (visible to all users)
  const monthId = `${year}-${month + 1}`;
  const notesDocRef = doc(db, "calendarNotes", monthId);

  // ─────────────────────────────────────────────
  // 📌 Load notes from Firestore
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        console.log("Fetching:", monthId);
        const snap = await getDoc(notesDocRef);

        if (snap.exists()) {
          setNotes(snap.data());
        } else {
          setNotes({});
        }
      } catch (err) {
        console.error("Error loading notes:", err);
      }
    };

    fetchNotes();
  }, [year, month]);

  // ─────────────────────────────────────────────
  // 💾 Save note to Firestore
  // ─────────────────────────────────────────────
  const saveNote = async () => {
    try {
      const updated = { ...notes, [editingDate]: text };

      await setDoc(notesDocRef, updated, { merge: true });

      console.log("Saved:", updated);
      setNotes(updated);
      setEditingDate(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="calendar-box">
      <h3>{title}</h3>
      <h4>
        {monthDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </h4>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="day-header">
            {d}
          </div>
        ))}

        {/* Empty slots for alignment */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={"empty-" + i} className="day-cell empty"></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;

          return (
            <div
              key={day}
              className="day-cell"
              onClick={() => {
                setEditingDate(day);
                setText(notes[day] || "");
              }}
            >
              <div className="day-number">{day}</div>
              <div className="note-text">{notes[day]}</div>
            </div>
          );
        })}
      </div>

      {/* Popup Editor */}
      {editingDate && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Note — {editingDate}</h3>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter note..."
            />

            <div className="modal-actions">
              <button onClick={saveNote}>Save</button>
              <button onClick={() => setEditingDate(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
