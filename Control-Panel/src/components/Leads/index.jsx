import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";

export default function Leads() {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSheetNames = async () => {
      const snap = await getDocs(collection(db, "companies"));
      const names = new Set();
      snap.forEach((d) => names.add(d.data().sheetName));
      setSheets([...names]);
    };
    loadSheetNames();
  }, []);

  const loadCompanies = async (sheet) => {
    setLoading(true);
    const q = query(collection(db, "companies"), where("sheetName", "==", sheet));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCompanies(rows);
    setLoading(false);
  };

  const toggleEmail = (email) => {
    if (!email) return;
    setSelectedEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const sendEmail = () => {
    if (selectedEmails.length === 0) return;
    const list = selectedEmails.join(",");
    window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${list}`;
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setEditForm({ ...company });
  };

  const saveEdit = async () => {
    if (!editingCompany) return;
    await updateDoc(doc(db, "companies", editingCompany.id), editForm);
    setEditingCompany(null);
    loadCompanies(selectedSheet);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Leads</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "15px 0" }}>
        <select
          value={selectedSheet}
          onChange={(e) => {
            setSelectedSheet(e.target.value);
            loadCompanies(e.target.value);
          }}
          style={{ flex: "1 1 200px", minWidth: "150px", padding: "5px" }}
        >
          <option value="">Select Group / Sheet</option>
          {sheets.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "2 1 250px", padding: "5px" }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #333" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>Select</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Company</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Industry</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Website</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>Loading...</td>
              </tr>
            ) : (
              companies
                .filter(c => (c.companyName || "").toLowerCase().includes(search.toLowerCase()))
                .map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(c.email || "")}
                        onChange={() => toggleEmail(c.email || "")}
                      />
                    </td>
                    <td>{c.companyName || "-"}</td>
                    <td>{c.email || "-"}</td>
                    <td>{c.industry || "-"}</td>
                    <td>
                      {c.companyWebsite ? (
                        <a href={c.companyWebsite} target="_blank" rel="noreferrer">
                          {c.companyWebsite}
                        </a>
                      ) : "-"}
                    </td>
                    <td>
                      <button onClick={() => openEditModal(c)} style={{ padding: "3px 6px" }}>Edit</button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {selectedEmails.length > 0 && (
        <button
          onClick={sendEmail}
          style={{ marginTop: "15px", padding: "10px 15px", background: "#1e40af", color: "white", border: "none", cursor: "pointer" }}
        >
          Send Email to {selectedEmails.length} selected
        </button>
      )}

      {editingCompany && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
            <h2>Edit Company</h2>
            <input style={{ width: "100%", margin: "5px 0" }} placeholder="Company Name" value={editForm.companyName || ""} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} />
            <input style={{ width: "100%", margin: "5px 0" }} placeholder="Email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input style={{ width: "100%", margin: "5px 0" }} placeholder="Industry" value={editForm.industry || ""} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} />
            <input style={{ width: "100%", margin: "5px 0" }} placeholder="Website" value={editForm.companyWebsite || ""} onChange={(e) => setEditForm({ ...editForm, companyWebsite: e.target.value })} />
            <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
              <button onClick={saveEdit} style={{ padding: "5px 10px" }}>Save</button>
              <button onClick={() => setEditingCompany(null)} style={{ padding: "5px 10px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
