import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaChartBar,
  FaUsers,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

const Navbar = ({ user, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt size={16} />,
    },
    { path: "/inventory", label: "Inventory", icon: <FaBox size={16} /> },
    { path: "/goods", label: "Goods", icon: <FaShoppingCart size={16} /> },
    { path: "/reports", label: "Reports", icon: <FaChartBar size={16} /> },
    ...(role === "admin"
      ? [
          {
            path: "/users",
            label: "Users",
            icon: <FaUsers size={16} />,
            adminOnly: true,
          },
        ]
      : []),
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 shadow-xl"
            : "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"
        } text-white`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-10">
              <motion.div
                className="flex items-center space-x-3 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/dashboard")}
              >
                <div className="bg-white p-1.5 rounded-lg">
                  <FaBox className="text-blue-600" size={20} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">CBWIS</h1>
              </motion.div>

              {/* Desktop Menu - Increased spacing */}
              <div className="hidden space-x-4 md:flex">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() =>
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        })
                      }
                      className={`flex items-center space-x-3 px-5 py-2.5 rounded-lg transition-all ${
                        isActive(item.path)
                          ? "bg-white/20 backdrop-blur-sm shadow-md"
                          : "hover:bg-white/10"
                      } ${item.adminOnly ? "text-yellow-300 font-semibold" : ""}`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side Items - Notification removed */}
            <div className="flex items-center space-x-6">
              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-4 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-lg transition-all"
                >
                  <div className="p-2 rounded-full bg-white/20">
                    <FaUser size={16} />
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium truncate max-w-[140px]">
                      {user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs capitalize opacity-80">{role}</p>
                  </div>
                  <FaChevronDown
                    size={14}
                    className={`transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                  />
                </motion.button>

                {/* Simplified Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 z-50 w-56 py-2 mt-2 bg-white rounded-lg shadow-xl"
                    >
                      <div className="px-5 py-4 border-b">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.email}
                        </p>
                        <p className="mt-2 text-xs text-gray-500 capitalize">
                          {role} Account
                        </p>
                      </div>

                      <div className="pt-2 mt-2 border-t">
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center space-x-3 w-full px-5 py-3.5 text-red-600 hover:bg-red-50 font-medium"
                        >
                          <FaSignOutAlt size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 hover:bg-white/10 rounded-lg ml-2"
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={22} />
                ) : (
                  <FaBars size={22} />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu with increased spacing */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white shadow-xl md:hidden bg-gradient-to-b from-blue-600 to-blue-700"
          >
            <div className="px-5 py-8 space-y-3">
              {menuItems.map((item) => (
                <motion.div key={item.path} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-4 px-5 py-4 rounded-lg ${
                      isActive(item.path)
                        ? "bg-white/20 shadow-md"
                        : "hover:bg-white/10"
                    } ${item.adminOnly ? "text-yellow-300 font-semibold" : ""}`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              <div className="pt-6 mt-6 border-t border-white/20">
                <div className="px-5 py-4">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="mt-2 text-xs capitalize opacity-80">{role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full px-5 py-4 mt-6 space-x-3 font-medium transition bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <FaSignOutAlt size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
