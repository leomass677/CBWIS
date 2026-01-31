/\*\*

- CBWIS - Firebase Firestore Schema Setup
-
- This document describes the Firestore collections and their structure
  \*/

// Collection: users
// Purpose: Store user account information and role assignments
// Access: Admin only (with exceptions for own user)
{
"users": {
"user_uid_1": {
"username": "admin_user", // String - unique username
"email": "admin@example.com", // String - user email
"role": "admin", // String - 'admin' or 'staff'
"displayName": "Administrator", // String - full name
"createdAt": "2024-01-16T10:00:00Z" // Timestamp
}
}
}

// Collection: inventory
// Purpose: Store warehouse inventory items
// Access: Read by all authenticated users, Write by admin
{
"inventory": {
"item_1": {
"itemName": "Steel Plate A4", // String - product name
"category": "Metal Sheets", // String - product category
"supplier": "Supplier Co Ltd", // String - supplier name (optional)
"quantity": 150, // Number - current stock level
"unitPrice": 45.50, // Number - unit price
"createdAt": "2024-01-10T08:30:00Z" // Timestamp - when item was added
}
}
}

// Collection: transactions
// Purpose: Record all goods in/out movements
// Access: Read by all authenticated users, Write by any authenticated user
{
"transactions": {
"trans_1": {
"itemId": "item_1", // String - reference to inventory item
"itemName": "Steel Plate A4", // String - item name (denormalized)
"transactionType": "IN", // String - 'IN' for goods received, 'OUT' for goods issued
"quantity": 50, // Number - quantity moved
"performedBy": "admin@example.com", // String - user who performed the transaction
"timestamp": "2024-01-16T14:30:00Z" // Timestamp - when transaction occurred
}
}
}

/\*\*

- FIRESTORE SECURITY RULES SUMMARY
-
- Users Collection:
- - Admins can read/write all user records
- - Users can only read/write their own records
-
- Inventory Collection:
- - All authenticated users can read
- - Only admins can create/update/delete
-
- Transactions Collection:
- - All authenticated users can read
- - Any authenticated user can create transactions
- - Only admins can update/delete transactions
    \*/

/\*\*

- DATA VALIDATION RULES
-
- Inventory Items:
- - itemName: Required, non-empty string
- - category: Required, non-empty string
- - quantity: Required, must be number >= 0
- - unitPrice: Required, must be number >= 0
-
- Transactions:
- - itemId: Required, must reference valid inventory item
- - transactionType: Required, must be 'IN' or 'OUT'
- - quantity: Required, must be positive number
- - performedBy: Required, must be valid user email
- - timestamp: Required, must be valid ISO 8601 format
-
- Stock Out Validation:
- - Cannot issue more quantity than currently available
- - Automatic quantity update upon transaction creation
    \*/

/\*\*

- INDEXES (for optimal query performance)
-
- Recommended composite indexes:
- 1.  transactions (transactionType, timestamp)
- 2.  transactions (itemId, timestamp)
- 3.  inventory (category, quantity)
      \*/
