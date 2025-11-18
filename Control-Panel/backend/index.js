import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import { Timestamp } from "firebase-admin/firestore";

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// 🔥 FIREBASE ADMIN INITIALIZE
// ─────────────────────────────────────────────
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─────────────────────────────────────────────
// 🧩 USER MANAGEMENT ROUTES
// ─────────────────────────────────────────────

// GET all users
app.get("/get-users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ADD user
app.post("/add-user", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role || !password)
      return res.status(400).json({ error: "Missing fields" });

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({ name, email, role });

    res.json({ success: true, message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user
app.put("/update-user/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, email, role } = req.body;

    await admin.auth().updateUser(uid, { email, displayName: name });

    await db.collection("users").doc(uid).update({
      name,
      email,
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete("/delete-user/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    await db.collection("users").doc(uid).delete();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ─────────────────────────────────────────────
// 📝 REPORT ROUTES
// ─────────────────────────────────────────────

// Add report (optional custom date)
app.post("/add-report", async (req, res) => {
  try {
    const { uid, email, report, date } = req.body;
    if (!uid || !email || !report)
      return res.status(400).json({ error: "Missing fields" });

    const finalDate = date ? new Date(date) : new Date();

    await db.collection("reports").add({ uid, email, report, date: finalDate });

    res.json({ success: true, message: "Report submitted" });
  } catch (error) {
    console.error("add-report error:", error);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// Get reports by user
app.get("/get-reports/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const snapshot = await db
      .collection("reports")
      .where("uid", "==", uid)
      .orderBy("date", "desc")
      .get();

    const reports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ reports });
  } catch (error) {
    console.error("get-reports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Get all reports (admin)
app.get("/get-all-reports", async (req, res) => {
  try {
    const snapshot = await db.collection("reports").orderBy("date", "desc").get();
    const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ records });
  } catch (error) {
    console.error("get-all-reports error:", error);
    res.status(500).json({ error: "Failed to fetch all reports" });
  }
});

// Update report
app.put("/update-report/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { report, date } = req.body;
    const updateData = {};
    if (report !== undefined) updateData.report = report;
    if (date !== undefined) updateData.date = new Date(date);

    await db.collection("reports").doc(id).update(updateData);

    res.json({ success: true, message: "Report updated" });
  } catch (error) {
    console.error("update-report error:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
});

// Delete report
app.delete("/delete-report/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("reports").doc(id).delete();
    res.json({ success: true, message: "Report deleted" });
  } catch (error) {
    console.error("delete-report error:", error);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

// ─────────────────────────────────────────────
// ⏱ ATTENDANCE ROUTES
// ─────────────────────────────────────────────

// Clock-in
app.post("/clock-in", async (req, res) => {
  try {
    const { uid, email } = req.body;
    const now = new Date().toISOString();

    const docRef = await db.collection("attendance").add({ uid, email, clockIn: now, clockOut: null });
    const snap = await docRef.get();
    res.json({ success: true, record: { id: docRef.id, ...snap.data() } });
  } catch (error) {
    console.error("clock-in error:", error);
    res.status(500).json({ error: "Failed to clock in" });
  }
});

// Clock-out
app.post("/clock-out", async (req, res) => {
  try {
    const { uid, recordId } = req.body;
    let docRef;

    if (recordId) {
      docRef = db.collection("attendance").doc(recordId);
    } else {
      const snapshot = await db
        .collection("attendance")
        .where("uid", "==", uid)
        .where("clockOut", "==", null)
        .orderBy("clockIn", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) return res.status(400).json({ error: "No active session found" });

      docRef = snapshot.docs[0].ref;
    }

    const now = new Date().toISOString();
    await docRef.update({ clockOut: now });

    const updated = await docRef.get();
    res.json({ success: true, record: { id: docRef.id, ...updated.data() } });
  } catch (error) {
    console.error("clock-out error:", error);
    res.status(500).json({ error: "Failed to clock out" });
  }
});

// Get attendance for specific user
app.get("/get-attendance/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const snapshot = await db.collection("attendance").where("uid", "==", uid).orderBy("clockIn", "desc").get();
    const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ records });
  } catch (error) {
    console.error("get-attendance error:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// Get all attendance
app.get("/get-all-attendance", async (req, res) => {
  try {
    const snapshot = await db.collection("attendance").orderBy("clockIn", "desc").get();
    const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ records });
  } catch (error) {
    console.error("get-all-attendance error:", error);
    res.status(500).json({ error: "Failed to fetch all attendance" });
  }
});

// Update attendance
app.put("/update-attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const payload = {};

    if (updates.clockIn) payload.clockIn = Timestamp.fromDate(new Date(updates.clockIn));
    if (updates.clockOut) payload.clockOut = Timestamp.fromDate(new Date(updates.clockOut));
    if (updates.totalHours !== undefined) payload.totalHours = updates.totalHours;

    await db.collection("attendance").doc(id).update(payload);
    res.json({ success: true });
  } catch (error) {
    console.error("update-attendance error:", error);
    res.status(500).json({ error: "Failed to update attendance" });
  }
});

// Delete attendance
app.delete("/delete-attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("attendance").doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("delete-attendance error:", error);
    res.status(500).json({ error: "Failed to delete attendance" });
  }
});


// ─────────────────────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
