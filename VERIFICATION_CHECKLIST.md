# CBWIS - Project Verification Checklist

Use this checklist to verify that your CBWIS installation is complete and working correctly.

## ✅ Pre-Installation Verification

- [ ] Node.js v16+ installed (`node -v`)
- [ ] npm v8+ installed (`npm -v`)
- [ ] Google Account available
- [ ] Internet connection available
- [ ] Text editor/IDE ready (VS Code recommended)

## ✅ Firebase Setup Verification

- [ ] Firebase project created (cbwis-warehouse)
- [ ] Firestore Database enabled
- [ ] Collections created: users, inventory, transactions
- [ ] Authentication enabled (Email/Password)
- [ ] Test users created:
  - [ ] admin@example.com / admin123456
  - [ ] staff@example.com / staff123456
- [ ] Custom claims set:
  - [ ] admin@example.com has role: "admin"
  - [ ] staff@example.com has role: "staff"
- [ ] Security rules published
- [ ] Firebase config obtained (for frontend .env)
- [ ] Admin SDK credentials obtained (for backend .env)

## ✅ Frontend Setup Verification

- [ ] `frontend/.env` file created
- [ ] All Firebase config values filled in VITE*FIREBASE*\*
- [ ] `frontend/node_modules` directory exists
- [ ] Frontend dependencies installed (`npm install` completed)
- [ ] No errors in `npm install` output

## ✅ Backend Setup Verification

- [ ] `backend/.env` file created
- [ ] All Firebase config values filled in:
  - [ ] FIREBASE_PROJECT_ID
  - [ ] FIREBASE_PRIVATE_KEY (with newlines)
  - [ ] FIREBASE_CLIENT_EMAIL
- [ ] PORT=3000 set
- [ ] NODE_ENV=development set
- [ ] FRONTEND_URL=http://localhost:5173 set
- [ ] `backend/node_modules` directory exists
- [ ] Backend dependencies installed (`npm install` completed)
- [ ] No errors in `npm install` output

## ✅ User Roles Setup Verification

- [ ] Backend scripts directory exists (`backend/scripts/`)
- [ ] `set-user-roles.js` script exists
- [ ] User roles set successfully:
  ```bash
  cd backend
  node scripts/set-user-roles.js
  ```
  Should show:
  ```
  ✅ Admin role set successfully
  ✅ Staff role set successfully
  ```

## ✅ Frontend Application Verification

Start frontend and verify:

```bash
cd frontend
npm run dev
```

Check that:

- [ ] Vite starts without errors
- [ ] Browser shows: "VITE v5.0.8 ready..."
- [ ] Development server URL shown: http://localhost:5173
- [ ] No errors in terminal
- [ ] Can access http://localhost:5173 in browser
- [ ] Login page loads correctly
- [ ] Demo credentials shown on login page

## ✅ Backend Application Verification

Start backend (in new terminal) and verify:

```bash
cd backend
npm start
```

Check that:

- [ ] Express server starts without errors
- [ ] Terminal shows: "✅ CBWIS Backend running on http://localhost:3000"
- [ ] No Firebase connection errors
- [ ] Test health endpoint:
  ```bash
  curl http://localhost:3000/health
  ```
  Should return: `{"status":"ok","message":"CBWIS Backend is running"}`

## ✅ Authentication Verification

- [ ] Admin login works:
  - [ ] Can login with admin@example.com / admin123456
  - [ ] Redirects to /dashboard
  - [ ] Shows email in navbar
  - [ ] Shows role "admin" in navbar
- [ ] Staff login works:
  - [ ] Can login with staff@example.com / staff123456
  - [ ] Redirects to /dashboard
  - [ ] Shows email in navbar
  - [ ] Shows role "staff" in navbar
- [ ] Logout works:
  - [ ] Logout button works
  - [ ] Redirects to login page
  - [ ] Can login again

## ✅ Dashboard Verification

- [ ] Dashboard page loads
- [ ] Shows stat cards:
  - [ ] Total Items
  - [ ] Low Stock
  - [ ] Total Transactions
  - [ ] Stock In
  - [ ] Stock Out
- [ ] Shows charts:
  - [ ] Stock In/Out trend line chart
  - [ ] Transaction volume bar chart
- [ ] Statistics update in real-time

## ✅ Inventory Management Verification (Admin)

- [ ] Inventory page loads
- [ ] "Add Item" button visible (admin only)
- [ ] Can create new inventory item:
  - [ ] Fill form with test data
  - [ ] Item appears in table
- [ ] Can edit item:
  - [ ] Click Edit button
  - [ ] Form prefills with item data
  - [ ] Changes save to table
- [ ] Can delete item:
  - [ ] Click Delete button
  - [ ] Confirmation dialog appears
  - [ ] Item removed from table
- [ ] Low stock highlighting:
  - [ ] Create item with quantity < 10
  - [ ] Quantity appears in red
- [ ] Table sorting/display works

## ✅ Inventory Verification (Staff)

- [ ] Inventory page loads
- [ ] Can view items
- [ ] "Add Item" button NOT visible
- [ ] Cannot edit or delete items
- [ ] Can navigate back to dashboard

## ✅ Goods In/Out Verification

Both Admin and Staff:

- [ ] Goods page loads
- [ ] Transaction form displays
- [ ] Can record Stock In:
  - [ ] Select item from dropdown
  - [ ] Enter quantity
  - [ ] Click "Record Stock In"
  - [ ] Transaction appears in history
  - [ ] Item quantity increases
  - [ ] Success message shown
- [ ] Can record Stock Out:
  - [ ] Select item from dropdown
  - [ ] Enter quantity
  - [ ] Click "Record Stock Out"
  - [ ] Transaction appears in history
  - [ ] Item quantity decreases
  - [ ] Success message shown
- [ ] Cannot overdraw stock:
  - [ ] Try to issue more than available
  - [ ] Error message appears
  - [ ] Transaction not created
- [ ] Quick stats display:
  - [ ] Today's Stock In count
  - [ ] Today's Stock Out count
- [ ] Transaction history displays:
  - [ ] Shows recent transactions
  - [ ] Sorted by date (newest first)
  - [ ] Shows item name, type, quantity

## ✅ Reports Verification

- [ ] Reports page loads
- [ ] Report type selector works:
  - [ ] Can switch between Inventory and Transactions
- [ ] Inventory Report:
  - [ ] Shows charts (stock by category)
  - [ ] Shows statistics (total items, stock, value)
  - [ ] Shows detailed inventory table
- [ ] Transactions Report:
  - [ ] Date range filtering works
  - [ ] Shows charts (transaction volume)
  - [ ] Shows statistics
  - [ ] Shows detailed transactions table
- [ ] Export functions:
  - [ ] "Export PDF" button works
  - [ ] PDF downloads correctly
  - [ ] "Export Excel" button works
  - [ ] Excel file downloads correctly

## ✅ Data Persistence Verification

- [ ] Added inventory items appear in Firestore:
  - [ ] Go to Firebase Console > Firestore
  - [ ] Check "inventory" collection
  - [ ] Items should appear
- [ ] Transactions appear in Firestore:
  - [ ] Check "transactions" collection
  - [ ] Transactions should appear
- [ ] Quantities update correctly:
  - [ ] Add stock in: Firestore quantity increases
  - [ ] Add stock out: Firestore quantity decreases

## ✅ Real-time Updates Verification

- [ ] Open app in two browser tabs
- [ ] In tab 1, add inventory item
- [ ] In tab 2:
  - [ ] Inventory page updates automatically
  - [ ] New item appears without refresh
- [ ] In tab 1, record transaction
- [ ] In tab 2:
  - [ ] Dashboard updates automatically
  - [ ] Transaction appears in history

## ✅ Responsive Design Verification

Test on different screen sizes:

- [ ] Desktop (1920x1080):
  - [ ] All elements visible
  - [ ] Navigation works
  - [ ] Tables display correctly
- [ ] Tablet (768x1024):
  - [ ] Layout adjusts
  - [ ] Forms readable
  - [ ] Navigation accessible
- [ ] Mobile (375x667):
  - [ ] Menu collapses (if implemented)
  - [ ] Forms stack vertically
  - [ ] Tables scroll horizontally
  - [ ] Buttons tappable

## ✅ Error Handling Verification

- [ ] Try login with wrong password:
  - [ ] Error message appears
  - [ ] Not logged in
- [ ] Try accessing inventory without login:
  - [ ] Redirected to login
- [ ] Try invalid data in forms:
  - [ ] Validation error appears
  - [ ] Form doesn't submit
- [ ] Try to overdraw stock:
  - [ ] Error message appears
  - [ ] Transaction blocked

## ✅ Network Verification

- [ ] Frontend can reach backend:
  - [ ] Open browser DevTools (F12)
  - [ ] Go to Network tab
  - [ ] Make a transaction
  - [ ] API requests should appear
  - [ ] Status should be 2xx (success)
- [ ] No CORS errors
- [ ] No 404 errors for API endpoints

## ✅ Security Verification

- [ ] Tokens are being sent:
  - [ ] DevTools > Network
  - [ ] Look for Authorization header
  - [ ] Should contain "Bearer <token>"
- [ ] Admin/Staff restrictions work:
  - [ ] Staff cannot see admin buttons
  - [ ] Admin can see all features
- [ ] Sensitive data not in console:
  - [ ] Open DevTools Console
  - [ ] No API keys visible
  - [ ] No private keys visible

## ✅ Performance Verification

- [ ] Pages load quickly (< 2 seconds)
- [ ] Charts render smoothly
- [ ] No memory leaks (check in DevTools)
- [ ] Transitions are smooth
- [ ] No lag in form input

## ✅ Documentation Verification

- [ ] README.md exists and readable
- [ ] INSTALLATION.md complete
- [ ] API_DOCUMENTATION.md detailed
- [ ] QUICK_START.md clear
- [ ] firebase-setup/SETUP_INSTRUCTIONS.md present
- [ ] firebase-setup/SCHEMA.md describes database

## ✅ Deployment Readiness

- [ ] Frontend build works: `npm run build`
- [ ] Frontend build is optimized
- [ ] Backend starts without .env errors
- [ ] No console errors in production
- [ ] Database backups available (Firebase)
- [ ] Security rules are restrictive

## 🎯 Final Verification Summary

**Total Checks:** \_**\_ / \_\_**

**Passing:** \_**\_ checks
**Failing:** \_\_** checks

### Status:

- [ ] ✅ All systems operational
- [ ] ⚠️ Some issues to resolve
- [ ] ❌ Critical issues found

### Issues Found:

```
(List any failing checks here)
1.
2.
3.
```

### Next Steps:

```
(Actions to fix any issues)
1.
2.
3.
```

---

## 🎓 Testing Checklist

Once verified, test these common workflows:

**Workflow 1: Complete Inventory Cycle**

1. [ ] Add new inventory item
2. [ ] Record stock in (goods received)
3. [ ] Record stock out (goods issued)
4. [ ] View updated quantities
5. [ ] Generate report

**Workflow 2: Role-Based Access**

1. [ ] Login as admin
2. [ ] Verify all features accessible
3. [ ] Logout
4. [ ] Login as staff
5. [ ] Verify limited to staff features

**Workflow 3: Report Generation**

1. [ ] Create multiple transactions
2. [ ] Go to Reports
3. [ ] Export to PDF
4. [ ] Export to Excel
5. [ ] Verify files contain correct data

**Workflow 4: Real-time Sync**

1. [ ] Open app in two windows
2. [ ] Add item in window 1
3. [ ] Verify appears in window 2
4. [ ] Record transaction in window 2
5. [ ] Verify quantity updates in window 1

---

**Verification Date:** ******\_\_\_\_******  
**Verified By:** ******\_\_\_\_******  
**Status:** ✅ Complete

All systems are operational and ready for use!
