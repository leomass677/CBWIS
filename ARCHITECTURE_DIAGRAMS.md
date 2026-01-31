# Feature Architecture & Flow Diagrams

## Feature 1: Advanced Search & Filtering

### Component Flow

```
┌─────────────────────────────────────────────────┐
│         InventoryPage Component                 │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    State Layer              Filter Logic
    ┌──────────────────┐   ┌──────────────────┐
    │searchQuery       │   │filteredItems =   │
    │filterCategory    │──→│items.filter()    │
    │filterSupplier    │   │  - by name       │
    │filterQuantity    │   │  - by category   │
    │items[]           │   │  - by supplier   │
    │                  │   │  - by quantity   │
    └──────────────────┘   └──────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  UI Rendering    │
                         ├──────────────────┤
                         │• Filter inputs   │
                         │• Item table      │
                         │• Status badges   │
                         │• Count display   │
                         └──────────────────┘
```

### Data Flow: Search to Display

```
User Types in Search Box
        │
        ▼
searchQuery = "paper"
        │
        ▼
filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
)
        │
        ▼
filteredItems.map(item => <TableRow key={item.id} />)
        │
        ▼
Display filtered results with count
```

### Filter Combination (AND Logic)

```
items[] → [A, B, C, D, E] (all 5 items)
    │
    ├─ Search: "a" → [A, B] (2 items match)
    │
    ├─ Category: "Office" → [A] (1 item in Office)
    │
    ├─ Supplier: "SupplierX" → [A] (1 item from SupplierX)
    │
    └─ Quantity: 5-20 → [A] (1 item in range)
        │
        ▼
    filteredItems = [A] (only item matching ALL filters)
```

---

## Feature 2: User Management

### Architecture Overview

```
Frontend (React)          Backend (Node.js)         Database (Firebase)
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ UserManagement  │────→│ users.js routes  │────→│ Firestore: users │
│ Page            │     │                  │     │                  │
├─────────────────┤     ├──────────────────┤     ├──────────────────┤
│• User table     │     │ POST /create     │     │ ├─uid            │
│• Add form       │────→│ POST /update     │────→│ ├─email          │
│• Edit form      │     │ DELETE /delete   │     │ ├─role           │
│• Delete confirm │     │ GET /:uid        │     │ └─displayName    │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │Firebase Auth     │
                        ├──────────────────┤
                        │• Create user     │
                        │• Set claims      │
                        │• Delete user     │
                        └──────────────────┘
```

### User Creation Flow

```
Admin clicks "Add User"
        │
        ▼
UserManagementPage state:
showForm = true, editingUser = null
        │
        ▼
Form renders:
- Email input
- Name input
- Role selector
        │
        ▼
User fills form & submits
        │
        ▼
POST /api/users/create {email, displayName, role}
        │
        ▼
Backend:
1. auth.createUser({email, password})
2. auth.setCustomUserClaims(uid, {role})
3. db.users.doc(uid).set({uid, email, displayName, role})
        │
        ▼
Response: {success, uid, email}
        │
        ▼
Frontend: Refresh user list, show success message
```

### Access Control

```
User is admin?
    │
    ├─ YES ──→ Render full User Management page
    │         - Table of users
    │         - Add/Edit/Delete buttons
    │         - Admin menu link visible
    │
    └─ NO ──→ Render access denied message
              - "Only administrators can access"
              - Admin menu link hidden
```

---

## Feature 3: Low Stock Alerts

### Alert System Architecture

```
┌─────────────────────────────────────────────────┐
│        Firestore: inventory collection          │
│    [{itemName, quantity, category, ...}, ...]   │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    Dashboard              InventoryPage
    ┌──────────────┐      ┌──────────────┐
    │fetchData()   │      │fetchInventory│
    │  ├─filter:   │      │  ├─filter:   │
    │  │  qty<20   │      │  │  qty<20   │
    │  ├─sort by   │      │  ├─show in   │
    │  │  qty ASC  │      │  │  card     │
    │  └─show in   │      │  └─show in   │
    │     section  │      │     badges   │
    └──────────────┘      └──────────────┘
           │                      │
           └──────────┬───────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  Alert Display   │
            ├──────────────────┤
            │Color coded:      │
            │🔴 Red: < 5       │
            │🟡 Yellow: 5-20   │
            │🟢 Green: 20+     │
            └──────────────────┘
```

### Alert Threshold Logic

```
Get item quantity
        │
        ├─ quantity < 5
        │     │
        │     ├─ CRITICAL 🔴
        │     ├─ Red background
        │     ├─ Show in section
        │     └─ Show badge with emoji
        │
        ├─ 5 ≤ quantity < 20
        │     │
        │     ├─ LOW 🟡
        │     ├─ Yellow background
        │     ├─ Show in section
        │     └─ Show badge with emoji
        │
        └─ quantity ≥ 20
              │
              ├─ GOOD 🟢
              ├─ Green background
              ├─ Don't show in alert section
              └─ Show green badge
```

### Display Flow

```
Dashboard Page
    │
    ├─ Stats Cards
    │   └─ Low Stock count
    │
    └─ LOW STOCK ALERT SECTION (if count > 0)
        ├─ Card title: "⚠️ Low Stock Alerts"
        ├─ Count badge
        ├─ Grid of items:
        │   ├─ Item name
        │   ├─ Category
        │   ├─ Current qty
        │   └─ Status (🔴 or 🟡)
        └─ Each item color-coded


Inventory Page
    │
    ├─ Filter controls
    │
    └─ LOW STOCK ALERTS CARD (if count > 0)
        ├─ Yellow warning styling
        ├─ Count badge
        └─ Grid of low stock items


Table Rows
    │
    └─ Quantity column
        ├─ 🔴 Red badge: < 5
        ├─ 🟡 Yellow badge: 5-20
        └─ 🟢 Green badge: 20+
```

---

## Data Model Updates

### Users Collection Schema

```javascript
users/
├── {uid: "user123"}
│   ├── uid: "user123"
│   ├── email: "admin@example.com"
│   ├── displayName: "Admin User"
│   ├── role: "admin"  // custom claim
│   ├── createdAt: "2024-01-15T10:30:00Z"
│   └── updatedAt: "2024-01-15T10:30:00Z"
│
└── {uid: "user456"}
    ├── uid: "user456"
    ├── email: "staff@example.com"
    ├── displayName: "Staff User"
    ├── role: "staff"
    ├── createdAt: "2024-01-16T14:20:00Z"
    └── updatedAt: "2024-01-16T14:20:00Z"
```

### Inventory Collection (Enhanced)

```javascript
inventory/
├── {id: "item001"}
│   ├── itemName: "Paper A4 100gsm"
│   ├── category: "Office Supplies"
│   ├── supplier: "SupplierX"
│   ├── quantity: 3  // ← Triggers 🔴 CRITICAL
│   ├── unitPrice: 500
│   └── createdAt: "2024-01-10T08:00:00Z"
│
└── {id: "item002"}
    ├── itemName: "Pen Black 0.7mm"
    ├── category: "Office Supplies"
    ├── supplier: "SupplierY"
    ├── quantity: 15  // ← Triggers 🟡 LOW
    ├── unitPrice: 50
    └── createdAt: "2024-01-12T09:30:00Z"
```

---

## API Endpoints Diagram

### User Management Routes

```
/api/users/
├── POST /create
│   ├─ Input: {email, displayName, role}
│   ├─ Process: Auth + Firestore + Custom claims
│   └─ Output: {success, uid, email}
│
├── POST /update
│   ├─ Input: {uid, displayName, role}
│   ├─ Process: Update custom claims + Firestore
│   └─ Output: {success, uid}
│
├── DELETE /delete/:uid
│   ├─ Input: uid in URL
│   ├─ Process: Remove from both Auth & Firestore
│   └─ Output: {success, uid}
│
└── GET /:uid
    ├─ Input: uid in URL
    ├─ Process: Fetch from Firestore
    └─ Output: {success, data}
```

### Request/Response Flow

```
Frontend UI Action
    │
    ▼
JavaScript fetch() call
    │
    ▼
Request to: http://localhost:3000/api/users/{endpoint}
    │
    ├─ Headers: Content-Type: application/json
    └─ Body: JSON payload
    │
    ▼
Backend Route Handler
    │
    ├─ Validate input
    ├─ Firebase operations
    └─ Return response
    │
    ▼
Frontend receives Response
    │
    ├─ Check .ok status
    ├─ Parse .json()
    └─ Update state
    │
    ▼
UI updates
    │
    ├─ Close form
    ├─ Show message
    └─ Refresh list
```

---

## State Management Overview

### InventoryPage (Feature 1)

```
useState:
├─ items[] ..................... All inventory items
├─ filteredItems[] ............. Items after filtering (computed)
├─ searchQuery ................. Search text input
├─ filterCategory .............. Selected category
├─ filterSupplier .............. Selected supplier
├─ filterQuantityRange {min,max} Quantity range
├─ showForm .................... Modal visibility
├─ editingId ................... Current edit item
├─ formData .................... Form field values
└─ loading ..................... Loading state
```

### UserManagementPage (Feature 2)

```
useState:
├─ users[] ..................... All users from Firestore
├─ showForm .................... Modal visibility
├─ editingUser ................. Current edit user
├─ formData .................... Form field values
├─ message ..................... Status messages
└─ loading ..................... Loading state
```

### DashboardPage (Feature 3)

```
useState:
├─ stats {}
│  ├─ totalItems
│  ├─ lowStockItems ........... Count < 20 units
│  ├─ totalTransactions
│  ├─ stockInCount
│  └─ stockOutCount
├─ lowStockList[] ............. Items < 20 units
├─ chartData {}
└─ loading ..................... Loading state
```

---

## Security Model

### Feature 1: Filtering

```
Security Level: Frontend Only
├─ No sensitive data exposed
├─ Client-side filtering only
├─ No backend validation needed
└─ Safe for all user roles
```

### Feature 2: User Management

```
Security Level: Backend Validated
├─ Admin-only frontend check
├─ Backend should add auth middleware
├─ Custom claims checked in Firestore rules
├─ Passwords set by system (user must reset)
└─ User deletion removes all traces
```

### Feature 3: Alerts

```
Security Level: Frontend Display
├─ Data based on existing inventory
├─ No additional permissions needed
├─ No sensitive calculations
├─ Safe for all user roles
└─ Display based on actual stock levels
```

---

## Performance Considerations

### Feature 1: Filtering

```
Time Complexity:
  Search: O(n) where n = number of items
  Filters: O(n) per filter type
  Combined: O(n) (single pass)

Space Complexity:
  O(n) for filtered results array

Optimization:
  ✓ Client-side only (no network latency)
  ✓ Efficient array filter method
  ✓ Single pass through items
  ✓ Instant response (<50ms for 1000 items)
```

### Feature 2: User Management

```
Time Complexity:
  List: O(1) Firebase query
  Create: O(1) Firebase operations
  Update: O(1) Firebase operations
  Delete: O(1) Firebase operations

Optimization:
  ✓ Indexed Firestore queries
  ✓ Batch operations possible
  ✓ Can handle 1000+ users
  ✓ Async/await for responsiveness
```

### Feature 3: Alerts

```
Time Complexity:
  Filter: O(n) where n = number of items
  Sort: O(n log n) for critical items first
  Display: O(k) where k = low stock count

Optimization:
  ✓ Computed during data load
  ✓ Only calculates when needed
  ✓ Typically k << n (few low stock items)
  ✓ No additional queries
```

---

## Testing Architecture

```
Frontend Testing
├─ Unit Tests
│  ├─ Filter logic
│  ├─ State updates
│  └─ Component rendering
│
├─ Integration Tests
│  ├─ API calls
│  ├─ Form submission
│  └─ Page navigation
│
└─ E2E Tests
   ├─ Complete user flows
   ├─ Cross-feature scenarios
   └─ Permission checks


Backend Testing
├─ Unit Tests
│  ├─ Route handlers
│  ├─ Validation logic
│  └─ Error handling
│
└─ Integration Tests
   ├─ Firebase Auth operations
   ├─ Firestore persistence
   └─ Custom claims


Manual Testing
└─ See TESTING_GUIDE.md for detailed steps
```

---

**End of Architecture Diagrams**
