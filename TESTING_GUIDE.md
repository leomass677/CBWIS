# Testing Guide: New Features

## Quick Start - Testing All 3 New Features

### Prerequisites

- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- Admin account logged in (admin@example.com / admin123456)

---

## Feature 1: Advanced Search & Filtering

### Location

Dashboard → Inventory Page

### Test Steps

1. **Open Inventory Page**

   - Click "Inventory" in navbar
   - Verify you see the list of all inventory items

2. **Test Search Filter**

   - Click in the search box
   - Type "paper" (should filter to items with "paper" in name)
   - Clear and try "pen"
   - Notice the count at bottom: "Showing X of Y items"

3. **Test Category Filter**

   - Open "Category" dropdown
   - Select a category (e.g., "Office Supplies")
   - Table updates to show only that category
   - Try combining with search

4. **Test Supplier Filter**

   - Open "Supplier" dropdown
   - Select a supplier
   - Combines with previous filters
   - All filters work together

5. **Test Quantity Range Filter**

   - Enter Min Qty: 5
   - Table shows only items with 5+ units
   - Add Max Qty: 50
   - Now shows items between 5-50 units
   - Clear filters to reset

6. **Verify Quantity Badges**
   - Scroll table quantity column
   - 🔴 Red badge = < 5 units (Critical)
   - 🟡 Yellow badge = 5-20 units (Low)
   - 🟢 Green badge = 20+ units (Good)

---

## Feature 2: User Management

### Location

Dashboard → Users (admin-only, in navbar)

### Test Steps - Create User

1. **Access Users Page**

   - Click "Users" in navbar (only visible if admin)
   - See existing users table
   - Click "+ Add User" button

2. **Create New Staff User**

   - Email: `testaff@example.com`
   - Name: Test Staff User
   - Role: Staff
   - Click "Create" button
   - Verify success message
   - See new user in table

3. **Create New Admin User**
   - Click "+ Add User" again
   - Email: `testadmin@example.com`
   - Name: Test Admin User
   - Role: Admin
   - Click "Create" button
   - See purple admin badge in table

### Test Steps - Edit User

1. **Edit a User**
   - Find a user in table
   - Click "Edit" button
   - Change display name to "Updated Name"
   - Change role from Staff to Admin
   - Click "Update"
   - Verify success message
   - Check user badge changed color

### Test Steps - Delete User

1. **Delete a User**
   - Find the test user you created
   - Click "Delete" button
   - Confirm deletion in dialog
   - User removed from table
   - Verify success message

### Test Steps - Login with New User

1. **Logout**

   - Click "Logout" button

2. **Login as New User**

   - Email: `testaff@example.com`
   - Password: `TempPassword123!`
   - Should successfully login

3. **Verify Permissions**
   - Staff user: Should NOT see "Users" in navbar
   - Admin user: Should see "Users" in navbar

---

## Feature 3: Low Stock Alerts & Notifications

### Location

1. **Dashboard Page** - Low Stock Alert section
2. **Inventory Page** - Low Stock Alerts card + Table badges

### Test Steps - Dashboard

1. **Open Dashboard**

   - Click "Dashboard" in navbar
   - Scroll to see stats cards
   - Find "Low Stock" stat card (should show number > 0)

2. **View Low Stock Alert Section**

   - Below stats cards, see "⚠️ Low Stock Alerts"
   - Shows count of low stock items
   - Items sorted by quantity (most critical first)

3. **Verify Item Categories**
   - 🔴 Critical Stock: Items with < 5 units
   - 🟡 Low Stock: Items with 5-20 units
   - Shows item name, category, and quantity

### Test Steps - Inventory Page

1. **Open Inventory Page**

   - Click "Inventory" in navbar
   - Scroll down below filters

2. **View Low Stock Alerts Card**

   - See yellow warning card
   - Shows total count of items < 20 units
   - Grid of low stock items
   - Color-coded backgrounds (red for critical, yellow for low)

3. **Check Table Quantity Column**

   - Scroll right to see Quantity column
   - Items with < 5 units: 🔴 Red badge
   - Items with 5-20 units: 🟡 Yellow badge
   - Items with 20+ units: 🟢 Green badge
   - Emoji indicator appears next to critical/low items

4. **Test Filter with Low Stock Items**
   - In quantity filter, enter Min: 0, Max: 20
   - Table shows only low stock items
   - Verify count updates
   - Badges still visible in filtered view

---

## Integration Testing

### Test All Features Together

1. **Filter Low Stock Items**

   - Go to Inventory
   - Set Quantity Max to 20
   - See only low stock items
   - Badges and alerts visible

2. **Create User and Login**

   - Go to Users page
   - Create a staff user
   - Logout
   - Login as new staff user
   - Verify they can't access Users page
   - Can see low stock alerts on Dashboard/Inventory

3. **Monitor Stock Changes**
   - Go to Goods page
   - Record stock out for low stock item
   - Return to Inventory
   - Item quantity decreased
   - Badge may change (e.g., 🟡→🔴)
   - Alert updates automatically

---

## Expected Results

### Feature 1: Filters

- ✅ Search works instantly
- ✅ Category/supplier dropdowns filter correctly
- ✅ Quantity range works
- ✅ Filters combine (AND logic)
- ✅ Count shows correct numbers
- ✅ Quantity badges display correctly

### Feature 2: Users

- ✅ Admin can create users
- ✅ Admin can edit user roles
- ✅ Admin can delete users
- ✅ New users can login
- ✅ Staff users can't access Users page
- ✅ Role badges display correctly

### Feature 3: Alerts

- ✅ Dashboard shows low stock section
- ✅ Inventory shows low stock card
- ✅ Table badges visible
- ✅ Color coding correct (🔴 < 5, 🟡 5-20, 🟢 20+)
- ✅ Alerts update when stock changes
- ✅ Counts accurate

---

## Common Issues & Fixes

### Issue: Users page shows "Access Denied"

**Fix:** Must be logged in as admin. Check role in navbar.

### Issue: Filters not working

**Fix:** Clear all filters and try one at a time. Check for typos in search.

### Issue: User creation fails

**Fix:** Check backend is running on localhost:3000. Verify email is unique.

### Issue: Low stock alerts not showing

**Fix:** Ensure inventory items have quantities < 20. Refresh page.

### Issue: Quantity badges not visible

**Fix:** Scroll right in table. May need to adjust column widths.

---

## Cleanup After Testing

If you created test users:

1. Go to Users page
2. Delete test users (testaff@, testadmin@, etc.)
3. This removes them from Firebase

If you want to reset inventory:

1. Use Goods page to adjust stock levels
2. Or go to Firebase Console and update quantities directly

---

**Testing Checklist**

- [ ] Feature 1: All filter combinations work
- [ ] Feature 1: Quantity badges display correctly
- [ ] Feature 2: Can create users
- [ ] Feature 2: Can edit users
- [ ] Feature 2: Can delete users
- [ ] Feature 2: New users can login
- [ ] Feature 2: Staff users restricted from Users page
- [ ] Feature 3: Low stock alerts visible on Dashboard
- [ ] Feature 3: Low stock alerts visible on Inventory
- [ ] Feature 3: Color coding correct
- [ ] All three features work together
- [ ] No console errors

**Sign Off**: ********\_******** Date: ****\_****
