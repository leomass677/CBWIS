# Firestore Setup - Quick Start Guide

## 🚀 Follow These Steps in Order

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter project name: `cbwis` (or any name you prefer)
4. Click **Create project** and wait for it to complete

---

### Step 2: Create Firestore Database

1. In Firebase Console, click **"Firestore Database"** (left menu)
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select your region (closest to you)
5. Click **"Enable"** and wait

---

### Step 3: Create Collections in Firestore

1. Click **"Start collection"** button

#### Create Collection 1: **users**

- Collection ID: `users`
- Click **"Next"** (don't add document yet)
- Click **"Save"**

#### Create Collection 2: **inventory**

- Collection ID: `inventory`
- Click **"Next"**
- Click **"Save"**

#### Create Collection 3: **transactions**

- Collection ID: `transactions`
- Click **"Next"**
- Click **"Save"**

---

### Step 4: Set Firestore Security Rules

1. Go to **"Firestore Database"** > **"Rules"** tab
2. Click **"Edit rules"**
3. Delete all existing code and paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - admins can read/write all, users can read/write own
    match /users/{document=**} {
      allow read, write: if request.auth != null &&
        (request.auth.token.role == 'admin' || request.auth.uid == document);
    }

    // Inventory collection - all authenticated users can read, only admins write
    match /inventory/{document=**} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null &&
        request.auth.token.role == 'admin';
    }

    // Transactions collection - all authenticated users can read and create
    match /transactions/{document=**} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        request.auth.token.role == 'admin';
    }
  }
}
```

4. Click **"Publish"**

---

### Step 5: Enable Authentication

1. Go to **"Authentication"** (left menu)
2. Click **"Get started"**
3. Click on **"Email/Password"**
4. Toggle **"Enable"**
5. Click **"Save"**

---

### Step 6: Create Test Users

1. Go to **"Authentication"** > **"Users"** tab
2. Click **"Add user"**

**Create Admin User:**

- Email: `admin@example.com`
- Password: `admin123456`
- Click **"Add user"**

**Create Staff User:**

- Email: `staff@example.com`
- Password: `staff123456`
- Click **"Add user"**

---

### Step 7: Get Your Firebase Config

1. Click **⚙️ (Settings icon)** at top left
2. Click **"Project Settings"**
3. Go to **"General"** tab
4. Scroll down to **"Your apps"** section
5. Look for Web App (if none exists, click **"Add app"** and select Web)
6. Click the **"<>"** button to copy the config

You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "cbwis-xxx.firebaseapp.com",
  projectId: "cbwis-xxx",
  storageBucket: "cbwis-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};
```

---

### Step 8: Update Frontend .env.local

1. Open `CBWIS/frontend/.env.local` (or create it)
2. Fill in the values from Step 7:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=cbwis-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cbwis-xxx
VITE_FIREBASE_STORAGE_BUCKET=cbwis-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

VITE_BACKEND_URL=http://localhost:3000
```

3. Save the file

---

### Step 9: Get Firebase Admin SDK Credentials (For Backend)

1. Go to **⚙️ Settings** > **"Project Settings"**
2. Go to **"Service Accounts"** tab
3. Click **"Generate New Private Key"**
4. A JSON file will download - save it somewhere safe
5. Open the JSON file and find these values:
   - `project_id`
   - `private_key` (copy everything including quotes)
   - `client_email`

---

### Step 10: Update Backend .env

1. Create or open `CBWIS/backend/.env`
2. Fill in the values from Step 9:

```
FIREBASE_PROJECT_ID=cbwis-xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cbwis-xxx.iam.gserviceaccount.com
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

⚠️ **IMPORTANT:** Keep the private key on ONE line with `\n` for newlines

---

### Step 11: Set User Roles (Custom Claims)

1. Open terminal in `CBWIS/backend` directory
2. Run:

```bash
node scripts/set-user-roles.js
```

Wait for success message showing roles are set.

---

### Step 12: Test the Setup

1. Go to frontend directory: `cd CBWIS/frontend`
2. Run: `npm run dev`
3. Open http://localhost:5173
4. Try logging in with:
   - Email: `admin@example.com`
   - Password: `admin123456`
   - Role: Admin (select from dropdown)

---

## ✅ All Done!

Your Firestore database is now set up and ready to use!

**Next Steps:**

- Test admin login
- Go to backend and run: `npm start`
- Create some inventory items
- Try stock in/out transactions

---

## 🔗 Need Help?

- Firebase Console: https://console.firebase.google.com
- Firebase Docs: https://firebase.google.com/docs
- See `firebase-setup/SETUP_INSTRUCTIONS.md` for detailed info
