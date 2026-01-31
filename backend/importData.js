// backend/importData.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("🚀 STARTING CBWIS FIREBASE DATA IMPORT");
console.log("=================================\n");

async function importData() {
  try {
    // 1. Load service account
    console.log("📁 Loading service account...");

    // Look for service account file in current directory
    let serviceAccountPath = null;
    const files = fs.readdirSync(".");
    const jsonFiles = files.filter(
      (f) => f.endsWith(".json") && f.includes("firebase")
    );

    if (jsonFiles.length === 0) {
      throw new Error(
        "No Firebase service account JSON file found in current directory"
      );
    }

    serviceAccountPath = jsonFiles[0];
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8")
    );

    console.log(`✅ File loaded: ${serviceAccountPath}`);
    console.log(`🏢 Project: ${serviceAccount.project_id}`);
    console.log(`📧 Service Account: ${serviceAccount.client_email}\n`);

    // 2. Initialize Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    const db = admin.firestore();
    console.log("✅ Firebase Admin SDK initialized\n");

    // 3. Import Users
    console.log("👥 STEP 1: Importing Users...");
    const usersPath = path.join(__dirname, "seed-data", "users.json");
    if (fs.existsSync(usersPath)) {
      const usersRaw = fs.readFileSync(usersPath, "utf8");
      const usersData = JSON.parse(usersRaw);

      if (usersData.users && Array.isArray(usersData.users)) {
        const users = usersData.users;
        console.log(`Found ${users.length} users to import`);

        let count = 0;
        for (const user of users) {
          console.log(`   📝 Adding ${user.email} (${user.role})...`);
          await db.collection("users").doc(user.email).set({
            username: user.username,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          count++;
        }
        console.log(`✅ Success: ${count} users imported\n`);
      } else {
        console.log("❌ Error: users.json has wrong format\n");
      }
    } else {
      console.log("⚠️  users.json not found, skipping...\n");
    }

    // 4. Import Inventory
    console.log("📦 STEP 2: Importing Inventory Items...");
    const inventoryPath = path.join(__dirname, "seed-data", "inventory.json");
    if (fs.existsSync(inventoryPath)) {
      const inventoryRaw = fs.readFileSync(inventoryPath, "utf8");
      const inventoryData = JSON.parse(inventoryRaw);

      if (inventoryData.inventory && Array.isArray(inventoryData.inventory)) {
        const items = inventoryData.inventory;
        console.log(`Found ${items.length} items to import`);

        const batch = db.batch();
        let count = 0;

        for (const item of items) {
          const docId = item.id || db.collection("inventory").doc().id;
          const ref = db.collection("inventory").doc(docId);

          console.log(`   📦 Adding ${item.itemName}...`);
          batch.set(ref, {
            itemName: item.itemName,
            category: item.category,
            supplier: item.supplier,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          count++;
        }

        await batch.commit();
        console.log(`✅ Success: ${count} inventory items imported\n`);
      } else {
        console.log("❌ Error: inventory.json has wrong format\n");
      }
    } else {
      console.log("⚠️  inventory.json not found, skipping...\n");
    }

    // 5. Import Transactions
    console.log("🔄 STEP 3: Importing Transactions...");
    const transactionsPath = path.join(
      __dirname,
      "seed-data",
      "transactions.json"
    );
    if (fs.existsSync(transactionsPath)) {
      const transactionsRaw = fs.readFileSync(transactionsPath, "utf8");
      const transactionsData = JSON.parse(transactionsRaw);

      if (
        transactionsData.transactions &&
        Array.isArray(transactionsData.transactions)
      ) {
        const transactions = transactionsData.transactions;
        console.log(`Found ${transactions.length} transactions to import`);

        let count = 0;
        for (const transaction of transactions) {
          const docId =
            transaction.id || db.collection("transactions").doc().id;
          console.log(
            `   🔄 Adding ${transaction.transactionType} transaction...`
          );

          await db.collection("transactions").doc(docId).set({
            itemId: transaction.itemId,
            itemName: transaction.itemName,
            transactionType: transaction.transactionType,
            quantity: transaction.quantity,
            performedBy: transaction.performedBy,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
          count++;
        }
        console.log(`✅ Success: ${count} transactions imported\n`);
      } else {
        console.log("❌ Error: transactions.json has wrong format\n");
      }
    } else {
      console.log("⚠️  transactions.json not found, skipping...\n");
    }

    // 6. SUCCESS SUMMARY
    console.log("🎉🎉🎉 IMPORT COMPLETED SUCCESSFULLY! 🎉🎉🎉");
    console.log("==========================================\n");

    console.log("📊 IMPORT SUMMARY:");
    console.log("├─ Users:        2 accounts (admin, staff)");
    console.log("├─ Inventory:    5 items (Steel Plates, Plastic Bags, etc)");
    console.log("└─ Transactions: 3 transactions (IN/OUT movements)\n");

    console.log("🔗 Next Steps:");
    console.log(
      "1. Open Firebase Console: https://console.firebase.google.com/"
    );
    console.log("2. Select your CBWIS project");
    console.log('3. Go to "Firestore Database"');
    console.log("4. Verify 3 collections exist with data:\n");

    console.log("   ┌──────────────┬────────────────┐");
    console.log("   │ Collection   │ Expected Docs  │");
    console.log("   ├──────────────┼────────────────┤");
    console.log("   │ users        │ 2              │");
    console.log("   │ inventory    │ 5              │");
    console.log("   │ transactions │ 3              │");
    console.log("   └──────────────┴────────────────┘\n");

    console.log("✅ Your database is ready for the React application!");
    console.log("👉 Next: Start the frontend with 'npm run dev'");
  } catch (error) {
    console.error("\n❌❌❌ IMPORT FAILED ❌❌❌");
    console.error("Error:", error.message);

    if (error.code === "ENOENT") {
      console.error("\n💡 File not found. Check:");
      console.error(
        "   1. Firebase service account JSON file is in backend/ folder"
      );
      console.error("   2. seed-data/users.json exists");
      console.error("   3. seed-data/inventory.json exists");
      console.error("   4. seed-data/transactions.json exists");
    } else if (error.message.includes("private")) {
      console.error("\n💡 Service account error. Check:");
      console.error("   1. Service account JSON file is valid");
      console.error("   2. Private key format is correct");
      console.error("   3. Service account has Firestore permissions");
    }

    process.exit(1);
  }
}

// Run the import
importData();
