import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import InquiryView from "./InquiryView";

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Load inquiries in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inquiries"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInquiries(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      
      {/* LEFT PANEL — Inquiry List */}
      <div style={{ width: "40%", borderRight: "1px solid #ddd" }}>
        <h2 style={{ padding: "10px" }}>Inquiries</h2>

        {inquiries.map((inq) => {
          const isActive = selectedInquiry?.id === inq.id;

          return (
            <div
              key={inq.id}
              onClick={() => setSelectedInquiry(inq)}
              style={{
                padding: "12px",
                cursor: "pointer",
                background: isActive ? "#d5deeb" : "#ffffff",
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{inq.name}</strong>
              <p style={{ margin: 0 }}>{inq.product}</p>
            </div>
          );
        })}
      </div>

      {/* RIGHT PANEL — Selected Inquiry Details */}
      <div style={{ flexGrow: 1 }}>
        {selectedInquiry ? (
          <InquiryView inquiry={selectedInquiry} />
        ) : (
          <p style={{ padding: "20px" }}>
            Select an inquiry to view the conversation.
          </p>
        )}
      </div>
    </div>
  );
}
