import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function syncUsers() {
  try {
    console.log("🔁 Syncing user documents to users/{uid}...");

    // Fetch all auth users (paginated)
    let nextPageToken;
    let total = 0;
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      for (const userRecord of listUsersResult.users) {
        const uid = userRecord.uid;
        const email = userRecord.email;
        const claims = userRecord.customClaims || {};
        const roleFromClaims = claims.role || null;

        // Try to find existing user doc by email
        let role = roleFromClaims;
        const emailDocRef = db.collection("users").doc(email);
        const emailDoc = await emailDocRef.get();
        if (emailDoc.exists) {
          const data = emailDoc.data();
          // prefer role from existing doc if custom claim missing
          if (!role && data.role) role = data.role;
        }

        if (!role) role = "staff";

        const uidDocRef = db.collection("users").doc(uid);
        await uidDocRef.set(
          {
            username: email?.split("@")[0] || uid,
            email: email || "",
            role,
            displayName: userRecord.displayName || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        total++;
        console.log(` - Synced ${email} -> users/${uid} (role: ${role})`);
      }
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`✅ Synced ${total} users.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error syncing users:", err);
    process.exit(1);
  }
}

syncUsers();
