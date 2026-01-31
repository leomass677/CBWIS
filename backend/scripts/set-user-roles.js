import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

console.log("🔐 Setting up user roles in Firebase...\n");

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  async function setUserRoles() {
    try {
      // Set Admin role
      console.log("📝 Setting role for admin@example.com...");
      const adminUser = await admin.auth().getUserByEmail("admin@example.com");
      await admin.auth().setCustomUserClaims(adminUser.uid, { role: "admin" });
      console.log("✅ Admin role set successfully\n");

      // Set Staff role
      console.log("📝 Setting role for staff@example.com...");
      const staffUser = await admin.auth().getUserByEmail("staff@example.com");
      await admin.auth().setCustomUserClaims(staffUser.uid, { role: "staff" });
      console.log("✅ Staff role set successfully\n");

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✨ User role setup complete!\n");
      console.log("Test Accounts:");
      console.log("  Admin: admin@example.com (password: admin123456)");
      console.log("  Staff: staff@example.com (password: staff123456)");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      process.exit(0);
    } catch (error) {
      console.error("❌ Error setting roles:", error.message);
      if (error.code === "auth/user-not-found") {
        console.error(
          "\n⚠️  User not found. Make sure to create test users in Firebase Console:"
        );
        console.error("  1. Go to Firebase Console > Authentication > Users");
        console.error("  2. Add email: admin@example.com");
        console.error("  3. Add email: staff@example.com");
      }
      process.exit(1);
    }
  }

  setUserRoles();
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
  console.error("\n⚠️  Make sure your .env file is configured correctly:");
  console.error("  - FIREBASE_PROJECT_ID");
  console.error("  - FIREBASE_PRIVATE_KEY");
  console.error("  - FIREBASE_CLIENT_EMAIL");
  process.exit(1);
}
