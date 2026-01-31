/\*\*

- CBWIS - Firebase Setup Instructions
-
- Complete guide to set up Firebase for the Warehousing Information System
  \*/

# Firebase Project Setup for CBWIS

## Prerequisites

- Google Account
- Firebase CLI installed: `npm install -g firebase-tools`

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: `cbwis-warehouse`
4. Accept the terms and create project
5. Wait for project to be ready

## Step 2: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode"
4. Choose location (select closest to your region)
5. Click "Enable"

### Create Collections

Create the following collections in Firestore:

#### Collection 1: users

- Document: admin@example.com (or use auto ID)
  ```
  {
    "username": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "displayName": "Administrator",
    "createdAt": "2024-01-16T10:00:00Z"
  }
  ```

#### Collection 2: inventory

Leave empty initially - will be populated by app

#### Collection 3: transactions

Leave empty initially - will be populated by app

## Step 3: Set Firestore Security Rules

1. Go to "Firestore Database" > "Rules"
2. Replace default rules with content from `firestore.security.rules`
3. Click "Publish"

## Step 4: Enable Authentication

1. Go to "Authentication" in Firebase Console
2. Click "Get Started"
3. Enable "Email/Password" provider
4. Click "Enable" and save

### Create Test Users

1. Go to "Authentication" > "Users"
2. Click "Add user"
3. Create Admin User:

   - Email: admin@example.com
   - Password: admin123456
   - Click "Add user"

4. Create Staff User:
   - Email: staff@example.com
   - Password: staff123456
   - Click "Add user"

## Step 5: Set Custom Claims for Users

Use Firebase Console or Admin SDK to set custom claims:

```javascript
// Using Firebase Admin SDK (run this once from backend)
const uid_admin = "UID_OF_ADMIN@example.com";
const uid_staff = "UID_OF_STAFF@example.com";

admin
  .auth()
  .setCustomUserClaims(uid_admin, { role: "admin" })
  .then(() => console.log("Admin role set"));

admin
  .auth()
  .setCustomUserClaims(uid_staff, { role: "staff" })
  .then(() => console.log("Staff role set"));
```

## Step 6: Get Firebase Configuration

1. Go to "Project Settings" > "General"
2. Scroll to "Your apps" and click on web app (if not exists, click "Add app")
3. Copy Firebase config object
4. Create `.env` file in `frontend` folder with:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 7: Get Firebase Admin SDK Credentials

1. Go to "Project Settings" > "Service Accounts"
2. Click "Generate new private key"
3. A JSON file will download - save it securely
4. Extract these values from the JSON:

   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY
   - `client_email` → FIREBASE_CLIENT_EMAIL

5. Create `.env` file in `backend` folder:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project_id.iam.gserviceaccount.com
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Step 8: Set Up Composite Indexes (Optional but Recommended)

In Firestore Console, create these indexes for better query performance:

1. Collection: `transactions`

   - Field 1: `transactionType` (Ascending)
   - Field 2: `timestamp` (Descending)

2. Collection: `transactions`

   - Field 1: `itemId` (Ascending)
   - Field 2: `timestamp` (Descending)

3. Collection: `inventory`
   - Field 1: `category` (Ascending)
   - Field 2: `quantity` (Ascending)

## Step 9: Enable Firestore API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable "Cloud Firestore API" for your project
3. Enable "Cloud Storage API" (if using file storage)

## Deployment

### Firebase Hosting (Optional)

To deploy frontend to Firebase Hosting:

```bash
cd frontend
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Verification

Test your setup:

```bash
# Backend health check
curl http://localhost:3000/health

# Frontend should load at
http://localhost:5173

# Test login with:
# Email: admin@example.com
# Password: admin123456
```

## Troubleshooting

### "Permission denied" errors

- Check Firestore security rules are published
- Verify user custom claims are set correctly
- Ensure user is authenticated

### "Cannot read properties of undefined"

- Check .env files have correct values
- Verify Firebase credentials are valid
- Check browser console for specific errors

### Backend cannot connect to Firebase

- Verify FIREBASE_PRIVATE_KEY format (check \n characters)
- Ensure FIREBASE_PROJECT_ID matches
- Check IAM permissions in Google Cloud Console

### Authentication not working

- Verify Firebase Auth provider is enabled
- Check that user exists in Firebase Auth
- Clear browser cache and try again

## Security Best Practices

1. ✅ Use environment variables for all credentials
2. ✅ Never commit .env files to version control
3. ✅ Enable Firestore security rules in production
4. ✅ Set up proper role-based access control
5. ✅ Enable audit logging in Google Cloud
6. ✅ Use strong passwords for test accounts
7. ✅ Rotate credentials periodically
8. ✅ Monitor Firestore usage and costs

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Google Cloud Console](https://console.cloud.google.com)
