# Firebase Data Import Guide

## 📋 Overview

This guide explains how to import sample data into your Firestore database using the Firebase Admin SDK.

---

## ✅ Prerequisites

Before importing, make sure:

1. ✅ Firebase project is created
2. ✅ Firestore database is enabled
3. ✅ Authentication is enabled with Email/Password
4. ✅ Test users are created in Firebase:
   - `admin@example.com` / `admin123456`
   - `staff@example.com` / `staff123456`
5. ✅ User roles are set (run `node scripts/set-user-roles.js`)
6. ✅ Firebase service account JSON is in `backend/` folder

---

## 🚀 Step-by-Step Import

### Step 1: Download Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your CBWIS project
3. Click **⚙️ Settings** > **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file will download (e.g., `cbwis-xxx-firebase-adminsdk-xxxx.json`)
7. Move this file to the `backend/` folder

**File should be in:** `CBWIS/backend/[your-firebase-service-account].json`

---

### Step 2: Review Sample Data

The import script uses these sample JSON files:

- **users.json** - 2 test accounts (admin, staff)
- **inventory.json** - 5 sample inventory items
- **transactions.json** - 3 sample transactions

Edit these files if you want different data before importing.

**Location:** `CBWIS/backend/seed-data/`

---

### Step 3: Run Import Script

Open terminal in the `CBWIS/backend` folder and run:

```bash
node importData.js
```

**Expected Output:**

```
🚀 STARTING CBWIS FIREBASE DATA IMPORT
=================================

📁 Loading service account...
✅ File loaded: cbwis-xxx-firebase-adminsdk-xxx.json
🏢 Project: cbwis-xxx
📧 Service Account: firebase-adminsdk-xxx@cbwis-xxx.iam.gserviceaccount.com

✅ Firebase Admin SDK initialized

👥 STEP 1: Importing Users...
Found 2 users to import
   📝 Adding admin@example.com (admin)...
   📝 Adding staff@example.com (staff)...
✅ Success: 2 users imported

📦 STEP 2: Importing Inventory Items...
Found 5 items to import
   📦 Adding Steel Plate A4...
   📦 Adding Plastic Bags 5kg...
   ✅ Success: 5 inventory items imported

🔄 STEP 3: Importing Transactions...
Found 3 transactions to import
   🔄 Adding IN transaction...
   🔄 Adding OUT transaction...
   ✅ Success: 3 transactions imported

🎉🎉🎉 IMPORT COMPLETED SUCCESSFULLY! 🎉🎉🎉
```

---

### Step 4: Verify Data in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your CBWIS project
3. Go to **Firestore Database**
4. You should see 3 collections with data:

```
users (2 documents)
├── admin@example.com
└── staff@example.com

inventory (5 documents)
├── item_001: Steel Plate A4
├── item_002: Plastic Bags 5kg
├── item_003: Aluminum Sheets
├── item_004: Cardboard Boxes
└── item_005: Copper Wire

transactions (3 documents)
├── trans_001: IN - Steel Plate A4
├── trans_002: IN - Plastic Bags
└── trans_003: OUT - Steel Plate A4
```

---

## 🔧 Troubleshooting

### Error: "No Firebase service account JSON file found"

**Solution:** Download service account JSON from Firebase Console and save to `backend/` folder

### Error: "users.json not found"

**Solution:** Check that `seed-data/users.json` exists in the backend folder

### Error: "private key format is incorrect"

**Solution:** Make sure the JSON file is valid and not modified

### Import runs but no data appears

**Solution:**

1. Check Firestore rules allow writes
2. Make sure service account has Firestore permissions
3. Check Firebase Console > Firestore to see if collections exist

---

## ✏️ Customizing Data

### Edit Sample Users

Open `backend/seed-data/users.json` and modify:

```json
{
  "users": [
    {
      "id": "your-email@example.com",
      "username": "your_username",
      "email": "your-email@example.com",
      "role": "admin",
      "displayName": "Your Name"
    }
  ]
}
```

### Edit Sample Inventory

Open `backend/seed-data/inventory.json` and add/modify items:

```json
{
  "inventory": [
    {
      "id": "item_006",
      "itemName": "Your Product",
      "category": "Your Category",
      "supplier": "Your Supplier",
      "quantity": 100,
      "unitPrice": 25.0
    }
  ]
}
```

### Edit Sample Transactions

Open `backend/seed-data/transactions.json` and add/modify:

```json
{
  "transactions": [
    {
      "id": "trans_004",
      "itemId": "item_001",
      "itemName": "Steel Plate A4",
      "transactionType": "IN",
      "quantity": 50,
      "performedBy": "admin@example.com"
    }
  ]
}
```

After editing, run `node importData.js` again.

---

## 🔄 Re-importing Data

If you want to clear and re-import:

1. Go to Firebase Console > Firestore Database
2. Delete collections: `users`, `inventory`, `transactions`
3. Run `node importData.js` again

---

## ✅ Testing the Data

After successful import:

1. Go to frontend: `cd CBWIS/frontend`
2. Run: `npm run dev`
3. Open http://localhost:5173
4. Login with: `admin@example.com` / `admin123456`
5. Go to Inventory page - you should see 5 items
6. Go to Reports - you should see transaction summary

---

## 📚 More Info

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/database/admin/start)
- [Firestore Data Structure](./firebase-setup/SCHEMA.md)
- [API Documentation](./API_DOCUMENTATION.md)
