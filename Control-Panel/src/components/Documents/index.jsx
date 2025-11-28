import { useState, useEffect } from "react";
import { db } from "../../firebase/firestore";
import { collection, addDoc, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";

export default function Documents({ userRole }) {
  const [title, setTitle] = useState("");
  const [embed, setEmbed] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDocuments(data);
  };

  const handleAdd = async () => {
    if (!title || !embed) {
      alert("Please enter both title and embed code.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "documents"), {
        title,
        embedCode: embed,
        createdAt: new Date().toISOString(),
      });

      setTitle("");
      setEmbed("");
      loadDocuments();
    } catch (err) {
      alert("Error adding embed: " + err.message);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;

    await deleteDoc(doc(db, "documents", id));
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="documents-page">
      <div className="box">
        <h2>Product Facebook Posts</h2>
        <p>Add a title and FB embed code to display below</p>

        {/* ONLY SHOW ADD FORM IF USER IS NOT CLIENT */}
        {userRole !== "client" && (
          <div className="form">
            <input
              type="text"
              placeholder="Post Title (ex. New Promo)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Paste Facebook Embed Code Here"
              rows={4}
              value={embed}
              onChange={(e) => setEmbed(e.target.value)}
              style={{
                padding: "12px",
                background: "#1f2937",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            />

            <button onClick={handleAdd} disabled={loading}>
              {loading ? "Saving..." : "Add Post"}
            </button>
          </div>
        )}

        <h3>Embedded Posts</h3>

        <div className="list">
          {documents.map((item) => (
            <div className="post-box" key={item.id}>
              <div className="header">
                <strong>{item.title}</strong>

                {/* DELETE BUTTON ONLY IF NOT CLIENT */}
                {userRole !== "client" && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                )}
              </div>

              <div
                className="embed-wrapper"
                dangerouslySetInnerHTML={{ __html: item.embedCode }}
              ></div>
            </div>
          ))}

          {documents.length === 0 && (
            <p style={{ color: "#9ca3af" }}>No posts added yet.</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .documents-page {
          padding: 30px;
          color: #e5e7eb;
          font-family: "Inter", sans-serif;
        }

        .box {
          max-width: 800px;
          margin: auto;
          background: rgba(31, 41, 55, 0.6);
          padding: 25px;
          border-radius: 12px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
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
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .post-box {
          background: #111827;
          padding: 15px;
          border-radius: 8px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .delete-btn {
          background: #ef4444;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .embed-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }

        .embed-wrapper * {
          max-width: 100% !important;
        }

        .embed-wrapper iframe {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
}
