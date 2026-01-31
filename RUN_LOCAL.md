# 🚀 CBWIS - How to Run Locally

## Prerequisites Verified ✅

- Node.js installed
- npm installed
- Frontend dependencies installed (317 packages)
- Backend dependencies installed

## Step 1: Start Frontend (Port 5173)

Open **Terminal 1** and run:

```bash
cd C:\Users\hp\Desktop\sudais\Project1\CBWIS\frontend
npm run dev
```

**Expected Output:**

```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Step 2: Start Backend (Port 3000)

Open **Terminal 2** and run:

```bash
cd C:\Users\hp\Desktop\sudais\Project1\CBWIS\backend
npm start
```

**Expected Output:**

```
✅ CBWIS Backend running on http://localhost:3000
📦 Frontend URL: http://localhost:5173
```

## Step 3: Open Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the CBWIS login page

## Step 4: Configure Firebase (First Time Only)

⚠️ **Before logging in**, you need to set up Firebase:

1. Follow the guide in: `firebase-setup/SETUP_INSTRUCTIONS.md`

   - Create Firebase project
   - Enable Firestore
   - Enable Authentication
   - Set up security rules
   - Get your credentials

2. Create `.env` file in `frontend/`:

   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ... (see .env.example)
   ```

3. Create `.env` file in `backend/`:

   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_email
   ```

4. Set user roles:
   ```bash
   cd backend
   node scripts/set-user-roles.js
   ```

## Step 5: Login

Use test credentials:

- **Email:** admin@example.com
- **Password:** admin123456

(Or use staff@example.com / staff123456 for staff role)

---

## 🔧 Troubleshooting

### Frontend won't start

```bash
cd frontend
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start

```bash
cd backend
rm -r node_modules package-lock.json
npm install
npm start
```

### Port already in use

- Frontend uses: **5173**
- Backend uses: **3000**

If ports are busy, modify in:

- `frontend/vite.config.js` (change server.port)
- `backend/.env` (change PORT)

### "Cannot find module" errors

```bash
# Delete node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. ✅ Frontend running on http://localhost:5173
2. ✅ Backend running on http://localhost:3000
3. ⏭️ Read `INSTALLATION.md` for Firebase setup
4. ⏭️ Follow Firebase configuration
5. ⏭️ Test all features

---

## 📋 Quick Command Reference

```bash
# Start Frontend
cd frontend && npm run dev

# Start Backend
cd backend && npm start

# Health Check
curl http://localhost:3000/health

# Set User Roles
cd backend && node scripts/set-user-roles.js

# Frontend Build
cd frontend && npm run build

# Reset Dependencies
rm -r node_modules package-lock.json && npm install
```

---

**Need help?** Check `INSTALLATION.md` for detailed troubleshooting.
