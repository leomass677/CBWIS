import express from "express";
import admin from "firebase-admin";

const router = express.Router();

// Create a new user
router.post("/create", async (req, res) => {
  try {
    const { email, displayName, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: "TempPassword123!", // Temporary password, user should reset on first login
    });

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, { role: role || "staff" });

    // Create user document in Firestore
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email: email,
        displayName: displayName || "",
        role: role || "staff",
        createdAt: new Date().toISOString(),
      });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: error.message || "Failed to create user",
    });
  }
});

// Update user role and displayName
router.post("/update", async (req, res) => {
  try {
    const { uid, email, displayName, role } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    // Update custom claims
    if (role) {
      await auth.setCustomUserClaims(uid, { role: role });
    }

    // Update Firestore user document
    await db
      .collection("users")
      .doc(uid)
      .update({
        displayName: displayName || "",
        role: role || "staff",
        updatedAt: new Date().toISOString(),
      });

    res.json({
      success: true,
      message: "User updated successfully",
      uid: uid,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      error: error.message || "Failed to update user",
    });
  }
});

// Delete a user
router.delete("/delete/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    // Delete from Firestore
    await db.collection("users").doc(uid).delete();

    // Delete from Firebase Auth
    await auth.deleteUser(uid);

    res.json({
      success: true,
      message: "User deleted successfully",
      uid: uid,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      error: error.message || "Failed to delete user",
    });
  }
});

// Get user by ID
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      data: userDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch user",
    });
  }
});

export default router;
