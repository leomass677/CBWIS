import "@/index.css";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import GoodsPage from "@/pages/GoodsPage";
import ReportsPage from "@/pages/ReportsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user role from custom claims
        const idTokenResult = await firebaseUser.getIdTokenResult();
        setUserRole(idTokenResult.claims.role || "staff");
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user && <Navbar user={user} role={userRole} />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route element={<ProtectedRoute user={user} />}>
            <Route
              path="/dashboard"
              element={<DashboardPage user={user} role={userRole} />}
            />
            <Route
              path="/inventory"
              element={<InventoryPage role={userRole} />}
            />
            <Route path="/goods" element={<GoodsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route
              path="/users"
              element={<UserManagementPage role={userRole} />}
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
