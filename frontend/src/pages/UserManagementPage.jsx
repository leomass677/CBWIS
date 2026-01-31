import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";

// Import React Icons
import {
  FaUsers,
  FaUserPlus,
  FaUserEdit,
  FaUserTimes,
  FaUserShield,
  FaUser,
  FaEnvelope,
  FaIdBadge,
  FaShieldAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaCheck,
  FaSync,
} from "react-icons/fa";

export default function UserManagementPage({ role }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    role: "staff",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Check if user is admin
  if (role !== "admin") {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-3 text-2xl text-red-500" />
              <div>
                <h2 className="text-lg font-bold text-red-800">
                  Access Denied
                </h2>
                <p className="text-red-700">
                  Only administrators can access user management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage(`Error fetching users: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      displayName: "",
      role: "staff",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || "",
      displayName: user.displayName || "",
      role: user.role || "staff",
      password: "", // Password not shown for editing (reset separately)
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowForm(true);
  };

  const validateForm = () => {
    if (!formData.email || !formData.displayName) {
      setMessage("Email and display name are required");
      return false;
    }

    // Only validate passwords when creating new user
    if (!editingUser) {
      if (!formData.password) {
        setMessage("Password is required for new users");
        return false;
      }

      if (formData.password.length < 6) {
        setMessage("Password must be at least 6 characters");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setMessage("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setMessage(editingUser ? "Updating user..." : "Creating user...");

    try {
      const endpoint = editingUser ? "/api/users/update" : "/api/users/create";

      // Prepare payload
      const payload = editingUser
        ? {
            uid: editingUser.id,
            email: formData.email,
            displayName: formData.displayName,
            role: formData.role,
          }
        : {
            email: formData.email,
            displayName: formData.displayName,
            role: formData.role,
            password: formData.password, // Only include for new users
          };

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Operation failed");
      }

      setMessage(`User ${editingUser ? "updated" : "created"} successfully!`);
      setShowForm(false);
      setEditingUser(null);
      setFormData({
        email: "",
        displayName: "",
        role: "staff",
        password: "",
        confirmPassword: "",
      });
      setShowPassword(false);

      setTimeout(() => {
        fetchUsers();
        setMessage("");
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setMessage("Deleting user...");
      const response = await fetch(
        `http://localhost:3000/api/users/delete/${userId}`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Deletion failed");
      }

      setMessage("User deleted successfully!");
      setTimeout(() => {
        fetchUsers();
        setMessage("");
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleResetPassword = async (userId, email) => {
    if (!window.confirm(`Send password reset email to ${email}?`)) {
      return;
    }

    try {
      setMessage("Sending password reset email...");
      const response = await fetch(
        `http://localhost:3000/api/users/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send reset email");
      }

      setMessage("Password reset email sent successfully!");
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Count users by role
  const adminCount = users.filter((u) => u.role === "admin").length;
  const staffCount = users.filter((u) => u.role === "staff").length;

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="flex items-center justify-center text-gray-600">
              <FaSync className="mr-2 animate-spin" />
              Loading users...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FaUsers className="mr-3 text-3xl text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                User Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage user accounts, roles, and permissions
              </p>
            </div>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center px-6 py-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FaUserPlus className="mr-2" />
            Add User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
          <div className="border border-blue-200 card bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center text-sm font-medium text-gray-600">
                  <FaUsers className="mr-2" />
                  Total Users
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {users.length}
                </p>
              </div>
              <FaUsers className="text-2xl text-blue-500" />
            </div>
          </div>

          <div className="border border-purple-200 card bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center text-sm font-medium text-gray-600">
                  <FaUserShield className="mr-2" />
                  Administrators
                </p>
                <p className="mt-2 text-2xl font-bold text-purple-600">
                  {adminCount}
                </p>
              </div>
              <FaUserShield className="text-2xl text-purple-500" />
            </div>
          </div>

          <div className="border border-green-200 card bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center text-sm font-medium text-gray-600">
                  <FaUser className="mr-2" />
                  Staff Members
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {staffCount}
                </p>
              </div>
              <FaUser className="text-2xl text-green-500" />
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.includes("Error") ||
              message.includes("required") ||
              message.includes("match")
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            {message.includes("Error") ||
            message.includes("required") ||
            message.includes("match") ? (
              <FaTimesCircle className="mr-3 text-xl text-red-500" />
            ) : (
              <FaCheckCircle className="mr-3 text-xl text-green-500" />
            )}
            <p
              className={
                message.includes("Error") ||
                message.includes("required") ||
                message.includes("match")
                  ? "text-red-700"
                  : "text-green-700"
              }
            >
              {message}
            </p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="mb-6 bg-white card">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="flex items-center form-label">
                <FaSearch className="mr-2 text-gray-500" />
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="flex items-center form-label">
                <FaFilter className="mr-2 text-gray-500" />
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-input"
              >
                <option value="ALL">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="staff">Staff Members</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p className="flex items-center">
                  <FaInfoCircle className="mr-2" />
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center mb-4">
                {editingUser ? (
                  <FaUserEdit className="mr-3 text-2xl text-blue-600" />
                ) : (
                  <FaUserPlus className="mr-3 text-2xl text-green-600" />
                )}
                <h2 className="text-xl font-bold">
                  {editingUser ? "Edit User" : "Create New User"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center form-label">
                    <FaEnvelope className="mr-2 text-gray-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="form-input"
                    disabled={!!editingUser}
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="flex items-center form-label">
                    <FaIdBadge className="mr-2 text-gray-500" />
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    className="form-input"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="flex items-center form-label">
                    <FaShieldAlt className="mr-2 text-gray-500" />
                    User Role *
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="form-input"
                      required
                    >
                      <option value="staff">Staff Member</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <div
                      className={`text-sm p-2 rounded ${
                        formData.role === "admin"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {formData.role === "admin"
                        ? "Full system access with administrative privileges"
                        : "Limited access to inventory and transactions"}
                    </div>
                  </div>
                </div>

                {/* Password Fields - Only show for new users */}
                {!editingUser && (
                  <>
                    <div>
                      <label className="flex items-center form-label">
                        <FaLock className="mr-2 text-gray-500" />
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="pr-10 form-input"
                          placeholder="At least 6 characters"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute text-gray-500 right-3 top-3"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center form-label">
                        <FaLock className="mr-2 text-gray-500" />
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="pr-10 form-input"
                          placeholder="Re-enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute text-gray-500 right-3 top-3"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {formData.password &&
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword && (
                          <p className="mt-1 text-xs text-red-500">
                            Passwords do not match
                          </p>
                        )}
                    </div>
                  </>
                )}

                {editingUser && (
                  <div className="p-3 border border-yellow-200 rounded bg-yellow-50">
                    <p className="flex items-center text-sm text-yellow-800">
                      <FaInfoCircle className="mr-2" />
                      To reset password, use the "Reset Password" button in the
                      user list
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center justify-center flex-1 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? (
                      <>
                        <FaCheck className="mr-2" />
                        Update User
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingUser(null);
                      setFormData({
                        email: "",
                        displayName: "",
                        role: "staff",
                        password: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex items-center justify-center flex-1 py-3 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    <FaTimesCircle className="mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-hidden card">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <FaUsers className="mx-auto mb-4 text-4xl text-gray-300" />
              <p className="text-lg font-medium">No users found</p>
              <p className="mt-2 text-sm">
                {users.length === 0
                  ? "Create your first user to get started."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2" />
                        Email
                      </div>
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                      <div className="flex items-center">
                        <FaIdBadge className="mr-2" />
                        Name
                      </div>
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                      <div className="flex items-center">
                        <FaShieldAlt className="mr-2" />
                        Role
                      </div>
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                      <div className="flex items-center">
                        <FaEdit className="mr-2" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          <span className="font-medium">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FaUser className="mr-2 text-gray-400" />
                          {user.displayName || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <>
                                <FaUserShield className="mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <FaUser className="mr-1" />
                                Staff
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-4 justify-items-start">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="flex items-center px-4 py-1 pb-2 text-sm font-semibold text-blue-600 transition-all duration-300 ease-in-out border-b-2 border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-800"
                          >
                            <FaUserEdit className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleResetPassword(user.id, user.email)
                            }
                            className="flex items-center px-4 py-1 pb-2 text-sm font-semibold text-yellow-600 transition-all duration-300 ease-in-out border-b-2 border-gray-300 rounded-md hover:border-yellow-400 hover:text-yellow-800"
                          >
                            <FaLock className="mr-1" />
                            Reset PW
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex items-center px-4 py-1 pb-2 text-sm font-semibold text-red-600 transition-all duration-300 ease-in-out border-b-2 border-gray-300 rounded-md hover:border-b-red-400 hover:text-red-800"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-6 mt-8 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <FaInfoCircle className="mt-1 mr-3 text-xl text-blue-500" />
            <div>
              <h3 className="mb-3 text-lg font-semibold text-blue-900">
                User Management Guide
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center">
                  <FaCheckCircle className="mr-2 text-green-500" />
                  <span>
                    <strong>Add User:</strong> Fill in email, name, role, and
                    password to create new user accounts
                  </span>
                </li>
                <li className="flex items-center">
                  <FaUserShield className="mr-2 text-purple-500" />
                  <span>
                    <strong>Admin Role:</strong> Full system access including
                    user management
                  </span>
                </li>
                <li className="flex items-center">
                  <FaUser className="mr-2 text-blue-500" />
                  <span>
                    <strong>Staff Role:</strong> Can manage inventory and view
                    transactions only
                  </span>
                </li>
                <li className="flex items-center">
                  <FaLock className="mr-2 text-yellow-500" />
                  <span>
                    <strong>Reset Password:</strong> Send password reset email
                    to existing users
                  </span>
                </li>
                <li className="flex items-center">
                  <FaTrash className="mr-2 text-red-500" />
                  <span>
                    <strong>Delete User:</strong> Remove user accounts that are
                    no longer needed
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
