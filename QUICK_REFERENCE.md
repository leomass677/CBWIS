# Quick Reference: New Features

## At a Glance

| Feature              | Location              | Who Can Use | Status   |
| -------------------- | --------------------- | ----------- | -------- |
| **Search & Filter**  | Inventory Page        | Everyone    | ✅ Ready |
| **User Management**  | Users Menu            | Admin Only  | ✅ Ready |
| **Low Stock Alerts** | Dashboard + Inventory | Everyone    | ✅ Ready |

---

## Feature 1: Search & Filtering

### Where to Find It

**Path:** Dashboard → Inventory → Filter Section

### What You Can Do

- 🔍 **Search** by item name
- 📂 **Filter** by category
- 🏭 **Filter** by supplier
- 📊 **Filter** by quantity range

### Quick Example

```
1. Type "paper" in search box
   → Shows only items with "paper" in name

2. Select "Office Supplies" in Category dropdown
   → Shows only office items

3. Set Min Qty to 5, Max to 50
   → Shows items between 5-50 units

4. All filters work together
   → Shows items matching ALL criteria
```

### Status Badges in Table

| Badge     | Meaning                    |
| --------- | -------------------------- |
| 🔴 RED    | Critical stock (< 5 units) |
| 🟡 YELLOW | Low stock (5-20 units)     |
| 🟢 GREEN  | Good stock (20+ units)     |

---

## Feature 2: User Management

### Where to Find It

**Path:** Navbar → Users (Admin Only)

### What You Can Do

- ➕ **Create** new users
- ✏️ **Edit** existing users
- 🗑️ **Delete** users
- 👤 **Assign** roles (Admin/Staff)

### Step-by-Step

#### Create User

```
1. Click "+ Add User" button
2. Enter email address
3. Enter display name (optional)
4. Select role: Admin or Staff
5. Click "Create"
6. User receives temporary password: TempPassword123!
```

#### Edit User

```
1. Click "Edit" button on user row
2. Modify display name or role
3. Click "Update"
4. User's role updates immediately
```

#### Delete User

```
1. Click "Delete" button on user row
2. Confirm deletion
3. User completely removed from system
```

### User Roles

| Role      | Permissions                                          |
| --------- | ---------------------------------------------------- |
| **Admin** | Full system access, manage users, all reports        |
| **Staff** | View inventory, record transactions, limited reports |

### Default Password

```
TempPassword123!
(User must reset on first login)
```

---

## Feature 3: Low Stock Alerts

### Where to Find It

**Location 1:** Dashboard → Low Stock Alert Section
**Location 2:** Inventory Page → Low Stock Alerts Card
**Location 3:** Inventory Table → Quantity Column

### What It Shows

#### Dashboard View

```
⚠️ Low Stock Alerts (3 items)
┌─────────────────────────────────┐
│ 🔴 CRITICAL: Paper A4           │
│ Quantity: 3 units               │
├─────────────────────────────────┤
│ 🟡 LOW: Pen Black 0.7mm         │
│ Quantity: 15 units              │
└─────────────────────────────────┘
```

#### Inventory Page View

```
⚠️ Low Stock Alerts (2 items)
[Shows same format as Dashboard]
```

#### Table Column View

```
Item Name      | Qty | Status
────────────────────────────
Paper A4       | 3   | 🔴
Pen Black      | 15  | 🟡
Notebook       | 25  | 🟢
```

### Alert Thresholds

```
Quantity Range  | Status    | Color  | Emoji
────────────────────────────────────────────
< 5 units       | CRITICAL  | Red    | 🔴
5-20 units      | LOW       | Yellow | 🟡
20+ units       | GOOD      | Green  | 🟢
```

---

## Common Tasks

### Search for an Item

```
1. Go to Inventory
2. Type item name in search box
3. Table filters in real-time
4. Click "Edit" or "Delete" as needed
```

### Find Low Stock Items

```
Method 1:
1. Go to Dashboard
2. See "Low Stock Alert" section
3. Items listed by urgency

Method 2:
1. Go to Inventory
2. Scroll down to "Low Stock Alerts" card
3. See all low stock items
```

### Add a New User

```
1. Go to Users menu (admin only)
2. Click "+ Add User"
3. Fill form:
   - Email: user@example.com
   - Name: John Doe
   - Role: Staff
4. Click "Create"
5. Share password: TempPassword123!
6. User logs in and resets password
```

### Change User Role

```
1. Go to Users menu
2. Click "Edit" on user
3. Change role dropdown
4. Click "Update"
5. User's role changes immediately
```

### Filter Inventory

```
1. Go to Inventory
2. Use filter sections:
   - Search: Type name
   - Category: Select dropdown
   - Supplier: Select dropdown
   - Quantity: Enter Min/Max
3. Table updates automatically
4. See count: "Showing X of Y items"
```

---

## Tips & Tricks

### Filtering Pro Tips

✓ Combine multiple filters for precise results
✓ Use search for quick name lookup
✓ Quantity filter useful for finding bulk items
✓ Clear filters by selecting empty dropdown option

### User Management Tips

✓ Create admin account first for your team lead
✓ Temporary password is same for all new users
✓ Users must reset password on first login
✓ Check role badges to quickly identify admins

### Alert Tips

✓ Check Dashboard daily for low stock items
✓ Order items marked 🔴 CRITICAL immediately
✓ Plan orders for 🟡 LOW stock items
✓ Green items don't need immediate action

---

## Keyboard Shortcuts

| Action       | Shortcut                        |
| ------------ | ------------------------------- |
| Filter items | Type in search box (auto-focus) |
| Cancel form  | Esc key (to be added)           |
| Delete user  | Click Delete → Confirm dialog   |

---

## Troubleshooting

### Problem: Filters not showing results

```
Solution:
1. Clear all filters
2. Try one filter at a time
3. Check spelling in search box
4. Refresh page if stuck
```

### Problem: User creation failed

```
Solution:
1. Check email format is valid
2. Ensure email not already in system
3. Verify backend is running
4. Check browser console for errors
```

### Problem: Low stock alerts not showing

```
Solution:
1. Ensure items have quantity < 20
2. Refresh the page
3. Check Firestore has inventory data
4. Look in both Dashboard and Inventory pages
```

### Problem: Can't see Users menu

```
Solution:
1. You must be logged in as admin
2. Check role in navbar
3. Ask admin to upgrade your account
4. Refresh page after role change
```

---

## Menu Navigation

```
NAVBAR (Top)
├── CBWIS (Home)
├── Dashboard ..................... View stats & low stock
├── Inventory ..................... Manage items & filters
├── Goods ......................... Record stock in/out
├── Reports ....................... Export reports
├── Users (admin only) ............ Manage users
└── Logout ........................ Sign out

INVENTORY PAGE FLOW
├── Filter Section
│   ├── Search input
│   ├── Category dropdown
│   ├── Supplier dropdown
│   └── Qty range inputs
├── Low Stock Alerts Card ......... Yellow warning section
└── Items Table
    ├── Columns: Name, Category, Supplier, Qty, Price, Actions
    └── Qty badges: 🔴 🟡 🟢

USERS PAGE FLOW
├── "+ Add User" button
├── Users Table
│   ├── Columns: Email, Name, Role, Actions
│   └── Actions: Edit, Delete
└── Forms: Create/Edit modals
```

---

## API Endpoints (Backend)

### For Developers

```bash
# Create user
POST http://localhost:3000/api/users/create
Body: {email, displayName, role}

# Update user
POST http://localhost:3000/api/users/update
Body: {uid, displayName, role}

# Delete user
DELETE http://localhost:3000/api/users/delete/:uid

# Get user
GET http://localhost:3000/api/users/:uid
```

---

## File Locations

### Frontend Files

```
frontend/src/
├── pages/
│   ├── InventoryPage.jsx ........ Search & Filter (Feature 1)
│   ├── UserManagementPage.jsx ... User Management (Feature 2)
│   └── DashboardPage.jsx ........ Low Stock Alerts (Feature 3)
├── components/
│   └── Navbar.jsx ............... Users link (updated)
└── App.jsx ...................... Routes (updated)
```

### Backend Files

```
backend/
├── routes/
│   └── users.js ................. User endpoints
└── server.js .................... Route registration
```

### Documentation Files

```
CBWIS/
├── FEATURES_ENHANCEMENT_REPORT.md ... Detailed feature docs
├── TESTING_GUIDE.md ..................... Test steps
├── IMPLEMENTATION_SUMMARY.md ........... Code changes
├── ARCHITECTURE_DIAGRAMS.md ............ Visual diagrams
└── QUICK_REFERENCE.md ................. This file
```

---

## Getting Help

### Where to Look

1. **This document** - Quick answers
2. **TESTING_GUIDE.md** - Test procedures
3. **FEATURES_ENHANCEMENT_REPORT.md** - Feature details
4. **ARCHITECTURE_DIAGRAMS.md** - System diagrams
5. **Code comments** - In source files
6. **Git history** - See what changed when

### Asking for Help

- Check the relevant documentation first
- Describe what you're trying to do
- Share error messages if applicable
- Note which feature is affected (1, 2, or 3)

---

## Feature Status

### Feature 1: Advanced Search & Filtering

```
Status: ✅ COMPLETE
Files Modified: InventoryPage.jsx
Lines Added: ~150
Test Coverage: Manual testing
Ready for: PRODUCTION
```

### Feature 2: User Management

```
Status: ✅ COMPLETE
Files Created: UserManagementPage.jsx, users.js
Lines Added: ~280
Test Coverage: Manual testing
Ready for: PRODUCTION
```

### Feature 3: Low Stock Alerts

```
Status: ✅ COMPLETE
Files Modified: DashboardPage.jsx, InventoryPage.jsx
Lines Added: ~100
Test Coverage: Manual testing
Ready for: PRODUCTION
```

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Status:** Ready for Testing & Deployment
