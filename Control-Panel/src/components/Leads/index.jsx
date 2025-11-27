import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";

export default function Leads() {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [usedEmails, setUsedEmails] = useState([]); // track batches already used
  const [batchSize, setBatchSize] = useState(20);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  // load sheet names
  useEffect(() => {
    const loadSheetNames = async () => {
      const snap = await getDocs(collection(db, "companies"));
      const names = new Set();
      snap.forEach((d) => names.add(d.data().sheetName));
      setSheets([...names]);
    };
    loadSheetNames();
  }, []);

  // load companies for a sheet
  const loadCompanies = async (sheet) => {
    setLoading(true);
    const q = query(collection(db, "companies"), where("sheetName", "==", sheet));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCompanies(rows);
    setSelectedEmails([]);
    setUsedEmails([]);
    setLoading(false);
  };

  // computed counts
  const totalEmailsCount = companies.filter((c) => c.email).length;
  const remainingEmailsCount = companies
    .map((c) => c.email)
    .filter((e) => e && !usedEmails.includes(e)).length;

  // toggle a single checkbox email
  const toggleEmail = (email) => {
    if (!email) return;
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  // send (redirect to Gmail) and mark selected as used
  const sendEmail = () => {
    if (selectedEmails.length === 0) return;
    const list = selectedEmails.join(",");
    window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${list}`;
    setUsedEmails((prev) => {
      const added = selectedEmails.filter((e) => e && !prev.includes(e));
      return [...prev, ...added];
    });
    setSelectedEmails([]);
  };

  // NEXT BATCH: choose next batchSize emails excluding already used
  const selectNextBatch = () => {
    const allEmails = companies.map((c) => c.email).filter((e) => e);
    const remaining = allEmails.filter((e) => !usedEmails.includes(e));
    const nextBatch = remaining.slice(0, batchSize);
    setSelectedEmails(nextBatch);
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setEditForm({ ...company });
  };

  const saveEdit = async () => {
    if (!editingCompany) return;
    await updateDoc(doc(db, "companies", editingCompany.id), editForm);
    setEditingCompany(null);
    await loadCompanies(selectedSheet);
  };

  // filtered list by search
  const filteredCompanies = companies.filter((c) =>
    (c.companyName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>Leads</h1>

      {/* Sticky top control bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#ffffff",
          zIndex: 30,
          padding: "10px 0",
          marginBottom: 12,
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={selectedSheet}
            onChange={(e) => {
              setSelectedSheet(e.target.value);
              loadCompanies(e.target.value);
            }}
            style={{
              padding: 8,
              minWidth: 180,
              fontSize: 14,
            }}
          >
            <option value="">Select Group / Sheet</option>
            {sheets.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 8, minWidth: 200, flex: "1 1 240px" }}
          />

          <select
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            style={{ padding: 8, minWidth: 110 }}
          >
            <option value={10}>Batch 10</option>
            <option value={20}>Batch 20</option>
            <option value={50}>Batch 50</option>
            <option value={100}>Batch 100</option>
          </select>

          <button
            onClick={selectNextBatch}
            style={{
              padding: "8px 12px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: 4,
            }}
            title="Select next batch of emails (excluding used ones)"
          >
            Next Batch ({batchSize})
          </button>

          <button
            onClick={sendEmail}
            disabled={selectedEmails.length === 0}
            style={{
              padding: "8px 12px",
              background: selectedEmails.length === 0 ? "#9ca3af" : "#16a34a",
              color: "#fff",
              border: "none",
              cursor: selectedEmails.length === 0 ? "not-allowed" : "pointer",
              borderRadius: 4,
            }}
            title="Open Gmail with selected emails"
          >
            Send Email ({selectedEmails.length})
          </button>

          {/* counts */}
          <div style={{ marginLeft: "auto", fontSize: 14 }}>
            <span style={{ marginRight: 12 }}>
              <strong>Total emails:</strong> {totalEmailsCount}
            </span>
            <span>
              <strong>Remaining:</strong> {remainingEmailsCount}
            </span>
          </div>
        </div>
      </div>

      {/* List / cards (responsive) */}
      <div style={{ display: "grid", gap: 12 }}>
        {loading ? (
          <p>Loading...</p>
        ) : filteredCompanies.length === 0 ? (
          <p style={{ color: "#444" }}>No companies to show.</p>
        ) : (
          filteredCompanies.map((c) => (
            <div
              key={c.id}
              className="company-card"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 12,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(c.email || "")}
                  onChange={() => toggleEmail(c.email || "")}
                />
                <div style={{ fontWeight: 600 }}>{c.companyName || "-"}</div>
                <div style={{ marginLeft: "auto", fontSize: 13, color: "#555" }}>
                  {c.sheetName}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>Email</div>
                  <div style={{ fontSize: 14, color: c.email ? "#111" : "#999" }}>
                    {c.email || "-"}
                  </div>
                </div>

                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>Industry</div>
                  <div style={{ fontSize: 14 }}>{c.industry || "-"}</div>
                </div>

                <div style={{ minWidth: 120, flex: "1 1 200px" }}>
                  <div style={{ fontSize: 12, color: "#666" }}>Website</div>
                  <div style={{ fontSize: 14, wordBreak: "break-word" }}>
                    {c.companyWebsite ? (
                      <a href={c.companyWebsite} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                        {c.companyWebsite}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => openEditModal(c)}
                  style={{ padding: "6px 10px", borderRadius: 4 }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit modal */}
      {editingCompany && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
          }}
        >
          <div style={{ background: "#fff", padding: 18, borderRadius: 8, width: "92%", maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>Edit Company</h3>

            <input
              style={{ width: "100%", margin: "8px 0", padding: 8 }}
              placeholder="Company Name"
              value={editForm.companyName || ""}
              onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
            />
            <input
              style={{ width: "100%", margin: "8px 0", padding: 8 }}
              placeholder="Email"
              value={editForm.email || ""}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <input
              style={{ width: "100%", margin: "8px 0", padding: 8 }}
              placeholder="Industry"
              value={editForm.industry || ""}
              onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
            />
            <input
              style={{ width: "100%", margin: "8px 0", padding: 8 }}
              placeholder="Website"
              value={editForm.companyWebsite || ""}
              onChange={(e) => setEditForm({ ...editForm, companyWebsite: e.target.value })}
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <button onClick={saveEdit} style={{ padding: "8px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4 }}>
                Save
              </button>
              <button onClick={() => setEditingCompany(null)} style={{ padding: "8px 12px", borderRadius: 4 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* small responsive style for large screens as table-like rows */}
      <style>{`
        @media (min-width: 880px) {
          .company-card {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 12px;
            padding: 12px;
          }
          .company-card > div { margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
