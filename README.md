# CBWIS - Computer-Based Warehousing Information System

> A complete web application for small-scale warehouse management built with React, Node.js, and Firebase

## 📋 Overview

CBWIS is a full-stack warehousing management system designed for small to medium-sized warehouses. It provides:

- **User Management** with role-based access control
- **Inventory Management** with real-time stock updates
- **Goods Handling** with transaction tracking
- **Reporting & Analytics** with PDF/Excel export
- **Dashboard** with interactive charts

## 🎯 Key Features

### 1. User Management

- Secure login/logout with Firebase Authentication
- Role-based access control (Admin, Warehouse Staff)
- Secure password handling via Firebase Auth

### 2. Inventory Management

- CRUD operations for inventory items
- Real-time stock level tracking
- Low stock alerts
- Supplier information management
- Unit pricing

### 3. Goods Handling

- Record goods received (Stock In)
- Record goods issued (Stock Out)
- Transaction history with timestamps
- Prevent invalid transactions (prevent negative stock)

### 4. Reporting & Analytics

- Inventory status reports
- Transaction summaries by date range
- Charts and visualizations (Chart.js)
- Export to PDF and Excel formats
- Dashboard with key metrics

## 📁 Project Structure

```
CBWIS/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Firebase config and utilities
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── .env.example         # Environment variables template
│
├── backend/                  # Node.js/Express backend
│   ├── config/
│   │   └── firebase.js      # Firebase Admin SDK setup
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── controllers/
│   │   ├── inventoryController.js
│   │   ├── transactionController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── inventory.js
│   │   ├── transactions.js
│   │   └── reports.js
│   ├── server.js            # Main server file
│   ├── package.json         # Backend dependencies
│   └── .env.example         # Environment variables template
│
└── firebase-setup/           # Firebase configuration files
    ├── SCHEMA.md            # Firestore schema documentation
    ├── SETUP_INSTRUCTIONS.md # Firebase setup guide
    ├── firestore.security.rules # Firestore security rules
    └── setup-demo-data.sh   # Demo data setup script
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project (free tier available)
- Git (optional)

### 1. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
```

The frontend will run on `http://localhost:5173`

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Firebase Admin SDK credentials
npm start
```

The backend will run on `http://localhost:3000`

### 3. Firebase Setup

Follow the complete guide in [firebase-setup/SETUP_INSTRUCTIONS.md](firebase-setup/SETUP_INSTRUCTIONS.md)

Key steps:

1. Create Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Set up Security Rules
5. Create test users
6. Get credentials for frontend and backend

### 4. Login to Application

```
Admin Account:
Email: admin@example.com
Password: admin123456

Staff Account:
Email: staff@example.com
Password: staff123456
```

## 🔑 Authentication & Authorization

### Roles

**Admin**

- Full access to all features
- Can manage inventory (create, update, delete)
- Can view all transactions and reports
- Can manage users (future feature)

**Staff/Warehouse Worker**

- Can view inventory
- Can record goods in/out
- Can view transaction history
- Cannot modify inventory master data

### Security Implementation

- Firebase Authentication for secure login
- Custom JWT tokens with role claims
- Server-side authorization middleware
- Firestore Security Rules for data access control

## 📊 API Endpoints

### Inventory

```
GET    /inventory              # Get all items
GET    /inventory/:id          # Get specific item
POST   /inventory              # Create item (Admin only)
PUT    /inventory/:id          # Update item (Admin only)
DELETE /inventory/:id          # Delete item (Admin only)
```

### Transactions

```
POST   /transactions/in        # Record goods in
POST   /transactions/out       # Record goods out
GET    /transactions           # Get all transactions
GET    /transactions/item/:id  # Get item transactions
GET    /transactions/range     # Get by date range
```

### Reports

```
GET    /reports/inventory      # Inventory status report
GET    /reports/transactions   # Transaction summary
GET    /reports/dashboard      # Dashboard statistics
```

All endpoints require authentication token in Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## 💾 Database Schema

### Collections

**users**

```javascript
{
  uid: {
    username: string,
    email: string,
    role: "admin" | "staff",
    displayName: string,
    createdAt: timestamp
  }
}
```

**inventory**

```javascript
{
  itemId: {
    itemName: string,
    category: string,
    supplier: string,
    quantity: number,
    unitPrice: number,
    createdAt: timestamp
  }
}
```

**transactions**

```javascript
{
  transactionId: {
    itemId: reference,
    itemName: string,
    transactionType: "IN" | "OUT",
    quantity: number,
    performedBy: string,
    timestamp: timestamp
  }
}
```

## 🛡️ Security Rules

Firestore security rules restrict access as follows:

- **Users**: Users can only read/write their own data; admins can access all
- **Inventory**: All authenticated users can read; only admins can write
- **Transactions**: All authenticated users can read/create; only admins can modify/delete

See [firebase-setup/firestore.security.rules](firebase-setup/firestore.security.rules) for complete rules.

## 📈 Features by Page

### Login Page

- Email/password authentication
- Error handling and validation
- Demo credentials display

### Dashboard

- Quick stats: Total items, low stock, transactions
- Line chart: Stock in/out trend (last 7 days)
- Bar chart: Transaction volume summary

### Inventory Page

- Table view of all items
- Search and filter capabilities
- Admin: Add/Edit/Delete items
- Low stock highlighting (< 10 units)
- Responsive design

### Goods In/Out Page

- Simple form to record transactions
- Dropdown to select item and quantity
- Real-time inventory updates
- Transaction history display
- Quick today's statistics

### Reports Page

- Switch between inventory and transaction reports
- Date range filtering for transactions
- Charts visualization (Doughnut, Bar)
- Summary statistics
- Export to PDF (red button)
- Export to Excel (green button)

## 🎨 Technology Stack

### Frontend

- **React.js** - UI library
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Vite** - Build tool
- **Firebase SDK** - Authentication & Firestore
- **Chart.js** - Data visualization
- **jsPDF** - PDF export
- **xlsx** - Excel export

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **Firebase Admin SDK** - Firestore & Auth management
- **CORS** - Cross-origin requests
- **dotenv** - Environment management

### Database

- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1920px+)
- Tablets (768px - 1024px)
- Mobile (< 768px)

All forms, tables, and components adapt to screen size.

## 🔄 Real-time Features

- Real-time inventory updates via Firestore listeners
- Automatic stock adjustment on transactions
- Live dashboard statistics
- No page refresh needed for data updates

## 📦 Deployment

### Frontend Deployment (Firebase Hosting)

```bash
cd frontend
npm run build
firebase init hosting
firebase deploy
```

### Backend Deployment

Options:

1. **Heroku**: Add Procfile and deploy
2. **Railway**: Connect GitHub repo and deploy
3. **Render**: Deploy from Git
4. **DigitalOcean App Platform**: Easy Node.js deployment

## 🔧 Development

### Run in Development Mode

**Terminal 1: Frontend**

```bash
cd frontend
npm install
npm run dev
```

**Terminal 2: Backend**

```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

**Terminal 3: Firebase Emulator (Optional)**

```bash
firebase emulators:start
```

### Environment Variables

**Frontend (.env)**

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_BACKEND_URL=http://localhost:3000
```

**Backend (.env)**

```
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🚨 Troubleshooting

### Issue: "Permission denied" errors in Firestore

**Solution**:

- Check security rules are published
- Verify custom claims are set for users
- Clear browser cache and logout/login again

### Issue: Backend cannot connect to Firebase

**Solution**:

- Verify FIREBASE_PRIVATE_KEY format (ensure \n are actual newlines)
- Check FIREBASE_PROJECT_ID matches
- Verify service account has correct permissions

### Issue: CORS errors

**Solution**:

- Check FRONTEND_URL in backend .env
- Verify backend is running on correct port
- Check browser console for specific error

### Issue: Cannot login

**Solution**:

- Verify Firebase Auth is enabled
- Check user exists in Firebase Authentication
- Verify custom role claims are set
- Check .env has correct Firebase config

### Issue: Data not appearing in Firestore

**Solution**:

- Check Firestore collections exist
- Verify security rules allow write operations
- Check network tab in browser for errors
- Verify user is authenticated

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)

## 📝 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues or questions:

1. Check the Troubleshooting section
2. Review Firebase documentation
3. Check browser console for errors
4. Verify all environment variables are set correctly

## 🎓 Learning Outcomes

By using this application, you'll learn:

- ✅ Modern React patterns and hooks
- ✅ RESTful API design with Express
- ✅ Firebase Firestore database design
- ✅ Authentication and authorization
- ✅ Real-time data synchronization
- ✅ Data visualization with Chart.js
- ✅ PDF and Excel export functionality
- ✅ TailwindCSS responsive design
- ✅ Full-stack application architecture

---

**Happy Warehouse Management!** 📦🎉
#   C B W I S  
 