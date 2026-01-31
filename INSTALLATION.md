# CBWIS Installation & Setup Guide

Complete step-by-step guide to get CBWIS running on your local machine.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js v16+ ([Download](https://nodejs.org))
- ✅ npm v8+ (comes with Node.js)
- ✅ Git (optional, for version control)
- ✅ Google Account (for Firebase)
- ✅ A code editor (VS Code recommended)

## 🔥 Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: `cbwis-warehouse`
4. Click "Continue"
5. Uncheck "Enable Google Analytics" (optional)
6. Click "Create project"
7. Wait for project to be ready (2-3 minutes)

### 1.2 Enable Firestore Database

1. In Firebase Console, click "Firestore Database" from left menu
2. Click "Create database"
3. Select "Start in production mode"
4. Choose location closest to you
5. Click "Enable"

### 1.3 Create Firestore Collections

1. In Firestore, click "Start collection"
2. Create collection named: **users** (auto-generate document IDs)
3. Click "Start collection" again
4. Create collection named: **inventory** (auto-generate document IDs)
5. Click "Start collection" again
6. Create collection named: **transactions** (auto-generate document IDs)

### 1.4 Enable Authentication

1. Go to "Authentication" from left menu
2. Click "Get Started"
3. Click "Email/Password" provider
4. Toggle "Enable"
5. Click "Save"

### 1.5 Create Test Users

1. In Authentication section, click "Users" tab
2. Click "Add user"
3. Create **Admin User**:
   - Email: `admin@example.com`
   - Password: `admin123456`
   - Click "Add user"
4. Click "Add user" again
5. Create **Staff User**:
   - Email: `staff@example.com`
   - Password: `staff123456`
   - Click "Add user"

### 1.6 Set Custom User Roles

1. Go to Authentication > Users
2. For each user, click the three dots menu
3. This requires running a backend function OR using Firebase CLI

**Option A: Using Firebase CLI (Recommended)**

```bash
npm install -g firebase-tools
firebase login
firebase functions:config:set cbwis.admin_email="admin@example.com"

# Create a Cloud Function to set roles
# Or use the backend setup script below
```

**Option B: Using Backend Script**

After backend setup (Step 3), run:

```bash
node scripts/set-user-roles.js
```

### 1.7 Get Firebase Configuration

1. Go to "Project Settings" (gear icon) > "General"
2. Scroll to "Your apps" section
3. Click the web app icon (if not exists, click "Add app" first)
4. Copy the Firebase config object
5. **Save this information** - you'll need it soon:

```javascript
{
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
}
```

### 1.8 Get Firebase Admin SDK Credentials

1. Go to "Project Settings" > "Service Accounts"
2. Click "Generate new private key"
3. A JSON file will download - **save it securely**
4. **Save these values** from the JSON:
   - `project_id`
   - `private_key`
   - `client_email`

### 1.9 Deploy Firestore Security Rules

1. Go to "Firestore Database" > "Rules"
2. Replace ALL content with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth.uid == userId ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Inventory collection - readable by all, writable by admin
    match /inventory/{itemId} {
      allow read: if request.auth != null;
      allow create, update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Transactions collection - readable by all, writable by any authenticated
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Click "Publish"

## 💻 Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd CBWIS/frontend
npm install
```

This will install:

- React 18
- React Router
- Firebase SDK
- TailwindCSS
- Chart.js
- jsPDF, xlsx, and other utilities

### 2.2 Create Environment File

1. In `frontend` folder, create file `.env` (copy from `.env.example`)
2. Fill in with your Firebase config from Step 1.7:

```
VITE_FIREBASE_API_KEY=your_api_key_from_firebase
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:3000
```

### 2.3 Start Frontend Dev Server

```bash
npm run dev
```

Output should show:

```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**✅ Frontend is running!** Visit http://localhost:5173

## 🖥️ Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd CBWIS/backend
npm install
```

### 3.2 Create Environment File

1. In `backend` folder, create file `.env` (copy from `.env.example`)
2. Fill in with credentials from Step 1.8:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project_id.iam.gserviceaccount.com
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important**: The FIREBASE_PRIVATE_KEY must have actual newlines. When copying from JSON:

- Original: `"private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- In .env: Keep as-is with `\n` characters (they'll be interpreted as newlines)

### 3.3 Set User Roles (Important!)

Create file `backend/scripts/set-user-roles.js`:

```javascript
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

async function setRoles() {
  try {
    const adminUser = await admin.auth().getUserByEmail("admin@example.com");
    await admin.auth().setCustomUserClaims(adminUser.uid, { role: "admin" });
    console.log("✅ Admin role set for admin@example.com");

    const staffUser = await admin.auth().getUserByEmail("staff@example.com");
    await admin.auth().setCustomUserClaims(staffUser.uid, { role: "staff" });
    console.log("✅ Staff role set for staff@example.com");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setRoles();
```

### 3.4 Run the Setup Script

```bash
node scripts/set-user-roles.js
```

Output should show:

```
✅ Admin role set for admin@example.com
✅ Staff role set for staff@example.com
```

### 3.5 Start Backend Server

```bash
npm start
```

Output should show:

```
✅ CBWIS Backend running on http://localhost:3000
📦 Frontend URL: http://localhost:5173
```

## 🎯 Step 4: Test the Application

### 4.1 Login to Application

1. Open http://localhost:5173 in your browser
2. Login with:

   - **Admin Account**:

     - Email: `admin@example.com`
     - Password: `admin123456`

   - **Staff Account**:
     - Email: `staff@example.com`
     - Password: `staff123456`

### 4.2 Verify Features

**Dashboard Page:**

- [ ] See stat cards (Total Items, Low Stock, Transactions)
- [ ] See charts (Stock in/out trend)

**Inventory Page:**

- [ ] See inventory table (empty initially)
- [ ] Admin: Click "Add Item" button
- [ ] Add a test item:
  - Name: "Laptop"
  - Category: "Electronics"
  - Supplier: "Tech Corp"
  - Quantity: 50
  - Unit Price: 899.99
- [ ] Verify item appears in table
- [ ] Admin: Click Edit/Delete buttons
- [ ] Staff: Cannot see Add/Edit/Delete buttons ✅

**Goods In/Out Page:**

- [ ] Select item from dropdown
- [ ] Select "Stock In" transaction type
- [ ] Enter quantity: 10
- [ ] Click "Record Stock In"
- [ ] Verify transaction appears in history
- [ ] Check inventory quantity increased
- [ ] Try "Stock Out" transaction
- [ ] Verify quantity decreased

**Reports Page:**

- [ ] Switch between "Inventory Status" and "Transactions"
- [ ] See charts and statistics
- [ ] Click "Export PDF" button
- [ ] PDF should download
- [ ] Click "Export Excel" button
- [ ] Excel should download

## 🔄 Running the Application

Once setup is complete, to run the application:

### Terminal 1: Frontend

```bash
cd CBWIS/frontend
npm run dev
# http://localhost:5173
```

### Terminal 2: Backend

```bash
cd CBWIS/backend
npm start
# http://localhost:3000
```

## 🆘 Troubleshooting

### Issue: "Error: Cannot find module"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "FIREBASE_PRIVATE_KEY is invalid"

- Make sure newlines in .env are preserved
- Try setting it without quotes and with actual newlines
- Use this tool: Copy paste private key exactly from JSON

### Issue: "Permission denied" when accessing Firestore

```
Solution:
1. Go to Firestore > Rules
2. Check rules are published
3. Try setting rules to DEVELOPMENT mode temporarily:
   match /{document=**} {
     allow read, write;
   }
4. Then re-apply production rules after verification
```

### Issue: Login not working

```
Check:
1. Firebase Auth provider is enabled
2. User exists in Authentication > Users
3. Custom role claims are set
4. .env has correct config
5. Clear browser cache: Ctrl+Shift+Delete
```

### Issue: Data not appearing after adding items

```
Check:
1. Go to Firestore Console
2. Check if "inventory" collection exists
3. Check if documents are being added
4. Check browser console for errors (F12)
5. Check backend is running on correct port
```

### Issue: Backend crashes on startup

```
Check .env:
- FIREBASE_PROJECT_ID must match actual project
- FIREBASE_PRIVATE_KEY format correct
- FIREBASE_CLIENT_EMAIL is valid
- Run: node scripts/set-user-roles.js to verify setup
```

### Issue: CORS errors

```
Solution:
1. Verify FRONTEND_URL in backend .env matches where frontend is running
2. Restart backend server
3. Check network tab in browser dev tools
4. Try accessing http://localhost:3000/health
```

## 📊 Demo Data

To populate with demo data, use the application UI:

1. **Add Inventory** (as Admin):

   - Steel Plates: 200 units @ $45.50
   - Plastic Bags: 5000 units @ $0.50
   - Wooden Boxes: 150 units @ $12.00

2. **Record Transactions**:

   - Stock In: 100 Steel Plates
   - Stock Out: 50 Plastic Bags
   - Stock In: 75 Wooden Boxes

3. **Generate Reports**:
   - View Inventory Report
   - View Transaction Report
   - Export to PDF and Excel

## 🚀 Next Steps

After setup:

1. **Customize** - Modify theme colors in `tailwind.config.js`
2. **Add Features** - Extend with more functionality
3. **Deploy** - Deploy to Firebase Hosting, Heroku, or Railway
4. **Backup** - Set up Firestore backups
5. **Monitor** - Set up Firebase alerts for errors

## 📚 Useful Commands

```bash
# Frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build

# Backend
npm start         # Start server
npm run dev       # Start with auto-reload (requires nodemon)
npm test          # Run tests (if configured)

# Firebase
firebase login    # Login to Firebase
firebase deploy   # Deploy project
firebase emulators:start  # Start local emulator
```

## ✅ Verification Checklist

- [ ] Node.js v16+ installed
- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Authentication enabled
- [ ] Test users created
- [ ] Security rules deployed
- [ ] Frontend .env configured
- [ ] Backend .env configured
- [ ] User roles set
- [ ] Frontend running on port 5173
- [ ] Backend running on port 3000
- [ ] Can login with admin account
- [ ] Can add inventory items
- [ ] Can record transactions
- [ ] Can view reports
- [ ] Can export PDF/Excel

## 🎓 Learning Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Express.js Guide](https://expressjs.com)
- [Firestore Security](https://firebase.google.com/docs/firestore/security/start)

---

**Your CBWIS application is now ready!** 🎉

For issues, check the Troubleshooting section or refer to the main README.md file.
