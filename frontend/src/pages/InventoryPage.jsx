import React, { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
// Import React Icons
import {
  FaSearch,
  FaExclamationTriangle,
  FaFire,
  FaBox,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaFilter,
  FaWarehouse,
  FaTag,
  FaTruck,
  FaSortAmountUp,
  FaSortAmountDown,
} from "react-icons/fa";

const InventoryPage = ({ role }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterQuantityRange, setFilterQuantityRange] = useState({
    min: "",
    max: "",
  });
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    supplier: "",
    quantity: 0,
    unitPrice: 0,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "inventory"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "inventory", editingId), {
          ...formData,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
        });
      } else {
        await addDoc(collection(db, "inventory"), {
          ...formData,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          createdAt: new Date().toISOString(),
        });
      }
      setFormData({
        itemName: "",
        category: "",
        supplier: "",
        quantity: 0,
        unitPrice: 0,
      });
      setEditingId(null);
      setShowForm(false);
      fetchInventory();
    } catch (error) {
      console.error("Error saving inventory:", error);
      alert("Error saving item");
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "inventory", id));
      fetchInventory();
    } catch (error) {
      console.error("Error deleting inventory:", error);
      alert("Error deleting item");
    }
  };

  // Filter logic
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesSupplier = !filterSupplier || item.supplier === filterSupplier;

    const minQty =
      filterQuantityRange.min === "" ? 0 : parseInt(filterQuantityRange.min);
    const maxQty =
      filterQuantityRange.max === ""
        ? Infinity
        : parseInt(filterQuantityRange.max);
    const matchesQuantity =
      (item.quantity || 0) >= minQty && (item.quantity || 0) <= maxQty;

    return (
      matchesSearch && matchesCategory && matchesSupplier && matchesQuantity
    );
  });

  // Get unique values for filter dropdowns
  const categories = [...new Set(items.map((item) => item.category))];
  const suppliers = [...new Set(items.map((item) => item.supplier))];

  const isAdmin = role === "admin";

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <FaWarehouse className="mr-3 text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setFormData({
                itemName: "",
                category: "",
                supplier: "",
                quantity: 0,
                unitPrice: 0,
              });
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className={`flex items-center ${showForm ? "btn-danger" : "btn-primary"}`}
          >
            {showForm ? (
              <>
                <FaTimes className="mr-2" />
                Cancel
              </>
            ) : (
              <>
                <FaPlus className="mr-2" />
                Add Item
              </>
            )}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="mb-8 card">
          <h2 className="flex items-center mb-4 text-xl font-bold text-gray-900">
            <FaBox className="mr-2 text-blue-600" />
            {editingId ? "Edit Item" : "Add New Item"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="form-input"
                />
              </div>
            </div>
            <button type="submit" className="flex items-center btn-primary">
              <FaBox className="mr-2" />
              {editingId ? "Update Item" : "Add Item"}
            </button>
          </form>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6 card bg-blue-50">
        <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
          Search & Filter
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="flex items-center form-label">
              <FaSearch className="mr-1 text-gray-500" />
              Search by Name
            </label>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="flex items-center form-label">
              <FaTag className="mr-1 text-gray-500" />
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex !flex-row items-start  form-label">
              <FaTruck className="mr-1 text-gray-500" />
              <span>Supplier</span>
            </label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="form-input"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center form-label">
              <FaSortAmountDown className="mr-1 text-gray-500" />
              Min Qty
            </label>
            <input
              type="number"
              placeholder="0"
              min={0}
              value={filterQuantityRange.min}
              onChange={(e) =>
                setFilterQuantityRange({
                  ...filterQuantityRange,
                  min: e.target.value,
                })
              }
              className="form-input"
            />
          </div>
          <div>
            <label className="flex items-center form-label">
              <FaSortAmountUp className="mr-1 text-gray-500" />
              Max Qty
            </label>
            <input
              type="number"
              min={0}
              placeholder="∞"
              value={filterQuantityRange.max}
              onChange={(e) =>
                setFilterQuantityRange({
                  ...filterQuantityRange,
                  max: e.target.value,
                })
              }
              className="form-input"
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Showing <strong>{filteredItems.length}</strong> of{" "}
          <strong>{items.length}</strong> items
        </p>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="mb-8 border-2 border-yellow-300 card bg-yellow-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2 text-xl text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-800">
              Low Stock Alerts
            </h2>
          </div>
          <span className="px-3 py-1 text-sm font-semibold text-yellow-900 bg-yellow-200 rounded-full">
            {items.filter((i) => i.quantity < 20).length} items
          </span>
        </div>
        {items.filter((i) => i.quantity < 20).length === 0 ? (
          <p className="text-yellow-700">All items are in good stock levels!</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((i) => i.quantity < 20)
              .map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg ${
                    item.quantity < 5
                      ? "bg-red-100 border border-red-300"
                      : "bg-yellow-100 border border-yellow-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        {item.quantity < 5 ? (
                          <FaFire className="mr-2 text-red-500" />
                        ) : (
                          <FaExclamationTriangle className="mr-2 text-yellow-500" />
                        )}
                        <p className="font-semibold text-gray-900">
                          {item.quantity < 5 ? "Critical" : "Low"} Stock
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  Item Name
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  Category
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  Supplier
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-900">
                  Quantity
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-900">
                  Unit Price
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-sm font-semibold text-center text-gray-900">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {items.length === 0
                      ? "No items found"
                      : "No items match your filters"}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{item.itemName}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">{item.supplier || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`px-2 py-1 rounded text-sm font-semibold ${
                            item.quantity < 5
                              ? "bg-red-100 text-red-800"
                              : item.quantity < 20
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.quantity}
                        </span>
                        {item.quantity < 20 && (
                          <span>
                            {item.quantity < 5 ? (
                              <FaFire className="text-red-500" />
                            ) : (
                              <FaExclamationTriangle className="text-yellow-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      ₦{item.unitPrice?.toFixed(2) || "0.00"}
                    </td>
                    {isAdmin && (
                      <td className="flex items-start justify-start px-4 py-4 space-x-2 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1.5 mx-auto font-semibold text-blue-600 items hover:text-blue-800"
                        >
                          <FaEdit className="" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center mx-auto mt-1 font-semibold text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
