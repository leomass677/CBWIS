# CBWIS API Documentation

Complete API reference for the Computer-Based Warehousing Information System backend.

## Base URL

```
http://localhost:3000
```

## Authentication

All endpoints (except `/health`) require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

To get a token from Firebase:

```javascript
// In frontend code
import { auth } from "@/utils/firebase";

const token = await auth.currentUser.getIdToken();
```

## Response Format

All responses are JSON. Successful responses include:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses include:

```json
{
  "error": "Error message"
}
```

---

## 🏥 Health Check

### GET /health

Health check endpoint - no authentication required.

**Response:**

```json
{
  "status": "ok",
  "message": "CBWIS Backend is running"
}
```

---

## 📦 Inventory Endpoints

### GET /inventory

Get all inventory items.

**Authentication:** Required  
**Role:** Any (Staff or Admin)

**Query Parameters:** None

**Response (200):**

```json
[
  {
    "id": "item_123",
    "itemName": "Steel Plate A4",
    "category": "Metal Sheets",
    "supplier": "Supplier Co Ltd",
    "quantity": 150,
    "unitPrice": 45.50,
    "createdAt": "2024-01-10T08:30:00Z"
  },
  ...
]
```

---

### GET /inventory/:id

Get a specific inventory item.

**Authentication:** Required  
**Role:** Any

**Parameters:**

- `id` (path) - Item document ID

**Response (200):**

```json
{
  "id": "item_123",
  "itemName": "Steel Plate A4",
  "category": "Metal Sheets",
  "supplier": "Supplier Co Ltd",
  "quantity": 150,
  "unitPrice": 45.5,
  "createdAt": "2024-01-10T08:30:00Z"
}
```

**Response (404):**

```json
{
  "error": "Item not found"
}
```

---

### POST /inventory

Create a new inventory item.

**Authentication:** Required  
**Role:** Admin only

**Request Body:**

```json
{
  "itemName": "Steel Plate A4",
  "category": "Metal Sheets",
  "supplier": "Supplier Co Ltd",
  "quantity": 150,
  "unitPrice": 45.5
}
```

**Response (201):**

```json
{
  "id": "item_123",
  "itemName": "Steel Plate A4",
  "category": "Metal Sheets",
  "supplier": "Supplier Co Ltd",
  "quantity": 150,
  "unitPrice": 45.5,
  "createdAt": "2024-01-16T10:00:00Z"
}
```

**Response (400):**

```json
{
  "error": "Missing required fields"
}
```

**Response (403):**

```json
{
  "error": "Admin access required"
}
```

---

### PUT /inventory/:id

Update an inventory item.

**Authentication:** Required  
**Role:** Admin only

**Parameters:**

- `id` (path) - Item document ID

**Request Body (all fields optional):**

```json
{
  "itemName": "Steel Plate A4",
  "category": "Metal Sheets",
  "supplier": "Supplier Co Ltd",
  "quantity": 160,
  "unitPrice": 46.0
}
```

**Response (200):**

```json
{
  "success": true,
  "id": "item_123",
  "itemName": "Steel Plate A4",
  "category": "Metal Sheets",
  "quantity": 160,
  "unitPrice": 46.0
}
```

---

### DELETE /inventory/:id

Delete an inventory item.

**Authentication:** Required  
**Role:** Admin only

**Parameters:**

- `id` (path) - Item document ID

**Response (200):**

```json
{
  "success": true,
  "id": "item_123"
}
```

**Response (400):**

```json
{
  "error": "Cannot delete item with existing transactions. Delete transactions first."
}
```

---

## 🔄 Transaction Endpoints

### POST /transactions/in

Record goods received (Stock In).

**Authentication:** Required  
**Role:** Any (Staff or Admin)

**Request Body:**

```json
{
  "itemId": "item_123",
  "quantity": 50,
  "performedBy": "admin@example.com"
}
```

**Response (201):**

```json
{
  "success": true,
  "transaction": {
    "itemId": "item_123",
    "itemName": "Steel Plate A4",
    "transactionType": "IN",
    "quantity": 50,
    "performedBy": "admin@example.com",
    "timestamp": "2024-01-16T14:30:00Z"
  }
}
```

**Effects:**

- Creates transaction record in `transactions` collection
- Increases item quantity in `inventory` collection by 50

---

### POST /transactions/out

Record goods issued (Stock Out).

**Authentication:** Required  
**Role:** Any

**Request Body:**

```json
{
  "itemId": "item_123",
  "quantity": 30,
  "performedBy": "staff@example.com"
}
```

**Response (201):**

```json
{
  "success": true,
  "transaction": {
    "itemId": "item_123",
    "itemName": "Steel Plate A4",
    "transactionType": "OUT",
    "quantity": 30,
    "performedBy": "staff@example.com",
    "timestamp": "2024-01-16T14:35:00Z"
  }
}
```

**Response (400):**

```json
{
  "error": "Insufficient stock"
}
```

**Effects:**

- Creates transaction record in `transactions` collection
- Decreases item quantity in `inventory` collection by 30
- Prevents transactions if quantity would go negative

---

### GET /transactions

Get all transactions.

**Authentication:** Required  
**Role:** Any

**Query Parameters:** None

**Response (200):**

```json
[
  {
    "id": "trans_123",
    "itemId": "item_123",
    "itemName": "Steel Plate A4",
    "transactionType": "IN",
    "quantity": 50,
    "performedBy": "admin@example.com",
    "timestamp": "2024-01-16T14:30:00Z"
  },
  ...
]
```

**Note:** Results are sorted by timestamp (newest first)

---

### GET /transactions/item/:id

Get transactions for a specific item.

**Authentication:** Required  
**Role:** Any

**Parameters:**

- `id` (path) - Item document ID

**Response (200):**

```json
[
  {
    "id": "trans_123",
    "itemId": "item_123",
    "itemName": "Steel Plate A4",
    "transactionType": "IN",
    "quantity": 50,
    "performedBy": "admin@example.com",
    "timestamp": "2024-01-16T14:30:00Z"
  },
  ...
]
```

---

### GET /transactions/range

Get transactions within a date range.

**Authentication:** Required  
**Role:** Any

**Query Parameters:**

- `startDate` (optional) - Start date (ISO 8601 format)
- `endDate` (optional) - End date (ISO 8601 format)

**Example:**

```
GET /transactions/range?startDate=2024-01-10&endDate=2024-01-20
```

**Response (200):**

```json
[
  {
    "id": "trans_123",
    "itemId": "item_123",
    "itemName": "Steel Plate A4",
    "transactionType": "IN",
    "quantity": 50,
    "performedBy": "admin@example.com",
    "timestamp": "2024-01-16T14:30:00Z"
  },
  ...
]
```

---

## 📊 Report Endpoints

### GET /reports/inventory

Get inventory status report.

**Authentication:** Required  
**Role:** Any

**Response (200):**

```json
{
  "totalItems": 5,
  "totalQuantity": 1250,
  "totalValue": 15234.50,
  "lowStockItems": 2,
  "items": [
    {
      "id": "item_123",
      "itemName": "Steel Plate A4",
      "category": "Metal Sheets",
      "supplier": "Supplier Co Ltd",
      "quantity": 150,
      "unitPrice": 45.50,
      "createdAt": "2024-01-10T08:30:00Z"
    },
    ...
  ]
}
```

**Fields:**

- `totalItems` - Number of inventory items
- `totalQuantity` - Sum of all quantities
- `totalValue` - Sum of (quantity × unitPrice) for all items
- `lowStockItems` - Count of items with quantity < 10

---

### GET /reports/transactions

Get transaction summary.

**Authentication:** Required  
**Role:** Any

**Query Parameters:**

- `startDate` (optional) - Start date (ISO 8601)
- `endDate` (optional) - End date (ISO 8601)

**Response (200):**

```json
{
  "totalStockIn": 500,
  "totalStockOut": 300,
  "transactionCount": 45,
  "byItem": {
    "Steel Plate A4": {
      "in": 200,
      "out": 50
    },
    "Plastic Bags": {
      "in": 300,
      "out": 250
    }
  },
  "byDate": {
    "2024-01-15": {
      "in": 100,
      "out": 50
    },
    "2024-01-16": {
      "in": 400,
      "out": 250
    }
  }
}
```

---

### GET /reports/dashboard

Get dashboard statistics.

**Authentication:** Required  
**Role:** Any

**Response (200):**

```json
{
  "totalItems": 5,
  "totalStock": 1250,
  "lowStockItems": 2,
  "totalTransactions": 45,
  "todayTransactions": 8,
  "stockInToday": 5,
  "stockOutToday": 3
}
```

---

## 🔐 Error Codes

| Code | Meaning      | Solution                                |
| ---- | ------------ | --------------------------------------- |
| 400  | Bad Request  | Check request body and parameters       |
| 401  | Unauthorized | Check Authorization header and token    |
| 403  | Forbidden    | User doesn't have required role (Admin) |
| 404  | Not Found    | Item doesn't exist                      |
| 500  | Server Error | Check backend logs                      |

---

## 📝 Example Requests

### Using curl

```bash
# Login to get token
curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456",
    "returnSecureToken": true
  }'

# Get all inventory
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/inventory

# Create inventory item
curl -X POST http://localhost:3000/inventory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Steel Plate A4",
    "category": "Metal Sheets",
    "supplier": "Supplier Co Ltd",
    "quantity": 150,
    "unitPrice": 45.50
  }'

# Record goods in
curl -X POST http://localhost:3000/transactions/in \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "item_123",
    "quantity": 50,
    "performedBy": "admin@example.com"
  }'

# Get dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/reports/dashboard
```

### Using JavaScript/Fetch

```javascript
import { auth } from "@/utils/firebase";

// Get token
const token = await auth.currentUser.getIdToken();

// Get all inventory
const response = await fetch("http://localhost:3000/inventory", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const items = await response.json();
console.log(items);

// Create item
const createResponse = await fetch("http://localhost:3000/inventory", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    itemName: "Steel Plate A4",
    category: "Metal Sheets",
    quantity: 150,
    unitPrice: 45.5,
  }),
});
const newItem = await createResponse.json();
console.log(newItem);
```

### Using Axios

```javascript
import axios from "axios";
import { auth } from "@/utils/firebase";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Add token to all requests
api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser.getIdToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Get inventory
const { data: items } = await api.get("/inventory");

// Create item
const { data: newItem } = await api.post("/inventory", {
  itemName: "Steel Plate A4",
  category: "Metal Sheets",
  quantity: 150,
  unitPrice: 45.5,
});

// Record goods in
const { data: transaction } = await api.post("/transactions/in", {
  itemId: "item_123",
  quantity: 50,
  performedBy: "admin@example.com",
});
```

---

## 🧪 Testing

To test the API, you can use:

1. **Postman** - Import requests and test manually
2. **curl** - Command-line testing (examples above)
3. **Insomnia** - Alternative to Postman
4. **Thunder Client** - VS Code extension

---

## 📈 Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:

- Express rate limiter
- Firebase Cloud Functions throttling
- API key quotas

---

## 📚 More Information

For more details, see:

- [README.md](./README.md) - Project overview
- [INSTALLATION.md](./INSTALLATION.md) - Setup guide
- [firebase-setup/SETUP_INSTRUCTIONS.md](./firebase-setup/SETUP_INSTRUCTIONS.md) - Firebase setup
- [firebase-setup/SCHEMA.md](./firebase-setup/SCHEMA.md) - Database schema

---

**Last Updated:** January 16, 2024
