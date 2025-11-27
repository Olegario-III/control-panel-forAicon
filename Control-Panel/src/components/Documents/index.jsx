import { useState, useEffect } from "react";
import { db } from "../../firebase/firestore";
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";

export default function Documents() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load documents from Firestore on start
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDocuments(data);
  };

  const handleAdd = async () => {
    if (!title || !url) {
      alert("Please enter both title and link.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "documents"), {
        title,
        url,
        createdAt: new Date().toISOString()
      });

      setTitle("");
      setUrl("");
      loadDocuments(); // refresh UI

    } catch (err) {
      alert("Error adding link: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="documents-page">
      <div className="box">
        <h2>Product Facebook Posts</h2>
        <p>Add a title and FB link to display below</p>

        <div className="form">
          <input
            type="text"
            placeholder="Post Title (ex. New Promo)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Facebook Post URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button onClick={handleAdd} disabled={loading}>
            {loading ? "Saving..." : "Add Link"}
          </button>
        </div>

        <h3>Saved Links</h3>
        <ul className="list">
          {documents.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong> –  
              <a href={item.url} target="_blank" rel="noopener noreferrer">View Post</a>
            </li>
          ))}

          {documents.length === 0 && (
            <p style={{ color: "#9ca3af" }}>No posts added yet.</p>
          )}
        </ul>
      </div>

      <style jsx>{`
        .documents-page {
          padding: 30px;
          color: #e5e7eb;
          font-family: "Inter", sans-serif;
        }

        .box {
          max-width: 700px;
          margin: auto;
          background: rgba(31, 41, 55, 0.6);
          padding: 25px;
          border-radius: 12px;
        }

        h2 {
          font-size: 1.6rem;
          margin-bottom: 5px;
          color: #fff;
        }

        h3 {
          margin-top: 35px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        input {
          padding: 12px;
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 8px;
          color: #f9fafb;
        }

        input:focus {
          border-color: #3b82f6;
        }

        button {
          padding: 10px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        button:hover {
          background: #059669;
        }

        .list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
          padding-left: 0;
        }

        li {
          background: #111827;
          padding: 12px;
          border-radius: 6px;
        }

        a {
          color: #3b82f6;
          margin-left: 8px;
        }
      `}</style>
    </div>
  );
}
