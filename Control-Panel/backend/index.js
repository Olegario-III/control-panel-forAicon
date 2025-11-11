// backend/index.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load Firebase Admin credentials
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

// 🟢 GET all users
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

// 🟡 DELETE a user
app.delete("/delete-user/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    await db.collection("users").doc(uid).delete();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// 🟢 ADD a new user
app.post("/add-user", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save user info in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role,
    });

    res.json({
      success: true,
      message: "✅ User created successfully",
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});


// ─────────────────────────────────────────────
// 👤 PROFILE ROUTES
// ─────────────────────────────────────────────

// 📝 Add Daily Report
app.post("/add-report", async (req, res) => {
  try {
    const { uid, email, report } = req.body;
    if (!uid || !email || !report) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await db.collection("reports").add({
      uid,
      email,
      report,
      date: new Date(),
    });

    res.json({ success: true, message: "✅ Report submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// 📜 Get Reports by User
app.get("/get-reports/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const snapshot = await db
      .collection("reports")
      .where("uid", "==", uid)
      .orderBy("date", "desc")
      .get();

    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ⏰ Clock In
app.post("/clock-in", async (req, res) => {
  try {
    const { uid, email } = req.body;
    await db.collection("attendance").add({
      uid,
      email,
      clockIn: new Date(),
      clockOut: null,
    });
    res.json({ success: true, message: "🕒 Clock-in recorded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to clock in" });
  }
});

// ⏰ Clock Out (latest record)
app.post("/clock-out", async (req, res) => {
  try {
    const { uid } = req.body;

    // Find latest attendance with no clockOut
    const snapshot = await db
      .collection("attendance")
      .where("uid", "==", uid)
      .where("clockOut", "==", null)
      .orderBy("clockIn", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ error: "No active clock-in found" });
    }

    const docRef = snapshot.docs[0].ref;
    await docRef.update({ clockOut: new Date() });

    res.json({ success: true, message: "✅ Clock-out recorded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to clock out" });
  }
});

// 📆 Get Attendance History
app.get("/get-attendance/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const snapshot = await db
      .collection("attendance")
      .where("uid", "==", uid)
      .orderBy("clockIn", "desc")
      .get();

    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// ✅ UPDATE USER endpoint
app.put("/update-user/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, email, role } = req.body;

    // Update in Firebase Auth (if email changed)
    await admin.auth().updateUser(uid, { email, displayName: name });

    // Update in Firestore
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



// ─────────────────────────────────────────────
// 🚀 SERVER START
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
