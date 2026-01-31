# CBWIS - Quick Reference Guide

## 🚀 30-Minute Setup

### Step 1: Run Setup Script (2 min)

```bash
# Windows
setup.bat

# macOS/Linux
bash setup.sh
```

### Step 2: Firebase Configuration (15 min)

1. Go to https://console.firebase.google.com
2. Create project: `cbwis-warehouse`
3. Enable Firestore Database
4. Enable Email/Password Authentication
5. Create collections: users, inventory, transactions
6. Get Firebase config (Project Settings)
7. Get Admin SDK credentials (Service Accounts)

### Step 3: Update Environment Files (3 min)

```bash
# Edit frontend/.env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# (copy from Firebase console)

# Edit backend/.env
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

### Step 4: Set User Roles (5 min)

```bash
cd backend
node scripts/set-user-roles.js
```

### Step 5: Start Application (3 min)

```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && npm start
```

### Step 6: Login (2 min)

- Email: admin@example.com
- Password: admin123456

---

## 📁 File Structure

```
CBWIS/
├── frontend/              React application
├── backend/               Express server
├── firebase-setup/        Firebase configs
├── README.md             Main documentation
├── INSTALLATION.md       Detailed setup
├── API_DOCUMENTATION.md  API reference
└── DELIVERY_SUMMARY.md   This summary
```

---

## 🔑 Key URLs

| Component          | URL                                 |
| ------------------ | ----------------------------------- |
| Frontend           | http://localhost:5173               |
| Backend            | http://localhost:3000               |
| Firebase Console   | https://console.firebase.google.com |
| Firestore Database | Project → Firestore Database        |
| Authentication     | Project → Authentication            |

---

## 👤 Test Accounts

| Role  | Email             | Password    |
| ----- | ----------------- | ----------- |
| Admin | admin@example.com | admin123456 |
| Staff | staff@example.com | staff123456 |

---

## 🎯 Core Endpoints

| Method | Endpoint           | Role  | Purpose          |
| ------ | ------------------ | ----- | ---------------- |
| GET    | /inventory         | Any   | Get all items    |
| POST   | /inventory         | Admin | Add item         |
| POST   | /transactions/in   | Any   | Record goods in  |
| POST   | /transactions/out  | Any   | Record goods out |
| GET    | /transactions      | Any   | Get history      |
| GET    | /reports/inventory | Any   | Inventory report |
| GET    | /reports/dashboard | Any   | Dashboard stats  |

---

## 📊 Features by Page

### Dashboard

- Total items, low stock count
- Transaction statistics
- Stock trend charts (7 days)
- Key metrics

### Inventory

- View all items
- Add/Edit/Delete (Admin)
- Low stock highlighting
- Search and filter

### Goods In/Out

- Quick transaction form
- Real-time quantity updates
- Transaction history
- Today's summary

### Reports

- Inventory status report
- Transaction summaries
- Interactive charts
- PDF/Excel export

---

## 🔧 Common Commands

```bash
# Frontend
npm install          # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build

# Backend
npm install         # Install dependencies
npm start          # Start server
npm run dev        # Start with auto-reload
node scripts/set-user-roles.js  # Set user roles

# Firebase
firebase login     # Login
firebase deploy    # Deploy
firebase init      # Initialize project
```

---

## ❌ Troubleshooting Quick Fixes

| Issue               | Solution                             |
| ------------------- | ------------------------------------ |
| Module not found    | `rm -rf node_modules && npm install` |
| Port already in use | Change PORT in .env or kill process  |
| Firebase errors     | Check .env credentials               |
| Login fails         | Verify Auth enabled, users created   |
| Permission denied   | Check Firestore rules published      |
| CORS errors         | Verify FRONTEND_URL in backend .env  |

---

## 🔒 Security Checklist

- ✅ Use .env for all secrets
- ✅ Never commit .env files
- ✅ Firebase Auth enabled
- ✅ Firestore rules published
- ✅ Custom role claims set
- ✅ API tokens validated
- ✅ CORS configured

---

## 📝 Environment Variables

**Frontend (.env)**

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_BACKEND_URL=http://localhost:3000
```

**Backend (.env)**

```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🗂️ Database Schema

**users**

```javascript
{
  username, email, role, displayName, createdAt;
}
```

**inventory**

```javascript
{
  itemName, category, supplier, quantity, unitPrice, createdAt;
}
```

**transactions**

```javascript
{
  itemId, itemName, transactionType, quantity, performedBy, timestamp;
}
```

---

## 🔐 Security Rules Summary

| Collection   | Read       | Write      |
| ------------ | ---------- | ---------- |
| users        | Self/Admin | Self/Admin |
| inventory    | All Auth   | Admin      |
| transactions | All Auth   | All Auth   |

---

## 📊 API Response Examples

**GET /inventory**

```json
[{ id, itemName, category, quantity, unitPrice }]
```

**POST /transactions/in**

```json
{ success: true, transaction: {...} }
```

**GET /reports/dashboard**

```json
{ totalItems, totalStock, lowStockItems, totalTransactions }
```

---

## 🚀 Deployment Checklist

- [ ] Update .env for production
- [ ] Set NODE_ENV=production in backend
- [ ] Build frontend: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Deploy frontend to Firebase Hosting
- [ ] Deploy backend to Heroku/Railway/DigitalOcean
- [ ] Update API URLs
- [ ] Test all features in production
- [ ] Monitor for errors
- [ ] Set up backups

---

## 📚 Documentation Files

| File                                 | Purpose           |
| ------------------------------------ | ----------------- |
| README.md                            | Project overview  |
| INSTALLATION.md                      | Setup guide       |
| API_DOCUMENTATION.md                 | API reference     |
| firebase-setup/SETUP_INSTRUCTIONS.md | Firebase setup    |
| firebase-setup/SCHEMA.md             | Database design   |
| DELIVERY_SUMMARY.md                  | What you received |

---

## 💡 Tips & Tricks

1. **Add demo data** - Use UI to create items and transactions
2. **Export reports** - Try PDF and Excel export features
3. **Test roles** - Login as admin and staff to see differences
4. **Monitor Firestore** - Watch data appear in real-time
5. **Check browser console** - See detailed error messages
6. **Enable Firebase Emulator** - Test locally without Firebase

---

## 🎓 Learning Path

1. Understand React components (`frontend/src/components/`)
2. Learn Express routes (`backend/routes/`)
3. Study Firestore schema (`firebase-setup/SCHEMA.md`)
4. Review security rules (`firebase-setup/*.rules`)
5. Explore API endpoints (`API_DOCUMENTATION.md`)
6. Customize styling (`frontend/tailwind.config.js`)

---

## 📞 Getting Help

1. Check relevant documentation file
2. Review troubleshooting section
3. Check Firebase/React official docs
4. Review browser console for errors
5. Check backend logs for API errors

---

## 🎯 Common Tasks

**Add new inventory item:**

1. Login as Admin
2. Go to Inventory
3. Click "Add Item"
4. Fill form and submit

**Record stock in:**

1. Go to Goods In/Out
2. Select item and quantity
3. Select "Stock In"
4. Click record button

**Export report:**

1. Go to Reports
2. Choose report type
3. Click "Export PDF" or "Export Excel"

**Change user role:**

1. Use Firebase Console
2. Or run: `node scripts/set-user-roles.js`

---

**Version:** 1.0.0  
**Last Updated:** January 16, 2026  
**Status:** Ready to Use ✅

For detailed information, refer to the comprehensive documentation files included in the project.
