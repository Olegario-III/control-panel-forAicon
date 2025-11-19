import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot, addDoc } from "firebase/firestore";

export default function InquiryView({ inquiry }) {
  const [replyText, setReplyText] = useState("");
  const [messages, setMessages] = useState([]);

  // Your REAL Apps Script Web App URL
  const WEBHOOK_URL =
    "https://script.google.com/macros/s/AKfycbyrra2JmDtHxMe1493i5-yuLwvXOF_8S5FVqe4U7nVtXgA5PKXp9mo3-2jh_q2XpTk/exec";

  // Load conversation messages live
  useEffect(() => {
    if (!inquiry?.id) return;

    const messagesRef = collection(db, `inquiries/${inquiry.id}/messages`);

    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(loaded);
    });

    return () => unsubscribe();
  }, [inquiry]);

  // Sending reply
  const sendReply = async () => {
    if (!replyText.trim()) return;

    try {
      // Apps Script needs form-data because JSON is blocked by CORS
      const formData = new FormData();
      formData.append("to", inquiry.email);
      formData.append("message", replyText);
      formData.append("inquiryId", inquiry.id);

      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors", // MUST USE no-cors for Apps Script
        body: formData,
      });

      // Save message to Firestore
      await addDoc(collection(db, `inquiries/${inquiry.id}/messages`), {
        message: replyText,
        sender: "admin",
        timestamp: Date.now(),
      });

      setReplyText("");
      alert("Reply sent!");
    } catch (err) {
      console.error("Send reply error:", err);
      alert("Failed to send reply.");
    }
  };

  return (
    <div style={{ padding: "20px", height: "100%" }}>
      <h2>{inquiry.name}</h2>
      <p><strong>Email:</strong> {inquiry.email}</p>
      <p><strong>Product:</strong> {inquiry.product}</p>
      <p><strong>Original Message:</strong> {inquiry.message}</p>

      <hr />

      <h3>Conversation</h3>
      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
          background: "#fafafa",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ddd",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              background: msg.sender === "admin" ? "#e7f0ff" : "#f2f2f2",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <strong>{msg.sender === "admin" ? "You" : inquiry.name}</strong>
            <p style={{ margin: "5px 0 0" }}>{msg.message}</p>
          </div>
        ))}
      </div>

      <hr />

      <h3>Write a Reply</h3>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        rows="4"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          resize: "vertical",
        }}
        placeholder="Type your reply..."
      />

      <button
        onClick={sendReply}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#1d4ed8",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Send Reply
      </button>
    </div>
  );
}
