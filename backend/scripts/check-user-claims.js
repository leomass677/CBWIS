import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function checkClaims() {
  try {
    console.log("Checking custom claims for test users...");

    const adminUser = await admin.auth().getUserByEmail("admin@example.com");
    console.log("admin@example.com claims:", adminUser.customClaims || null);

    const staffUser = await admin.auth().getUserByEmail("staff@example.com");
    console.log("staff@example.com claims:", staffUser.customClaims || null);

    process.exit(0);
  } catch (err) {
    console.error("Error checking claims:", err.message || err);
    process.exit(1);
  }
}

checkClaims();
