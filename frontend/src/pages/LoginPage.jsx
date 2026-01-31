import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaBuilding,
  FaUsers,
  FaShieldAlt,
  FaKey,
  FaCheck,
  FaWarehouse,
} from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRole = localStorage.getItem("rememberedRole");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedRole", role);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedRole");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const demoLogin = (demoEmail, demoPassword, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setRole(demoRole);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-0 overflow-hidden shadow-lg lg:grid-cols-5 rounded-2xl">
          {/* Left Side - Minimal Branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center p-8 text-white lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 lg:p-10"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center mb-6 space-x-3"
              >
                <div className="p-2 rounded-lg bg-white/10">
                  <FaWarehouse size={28} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">CBWIS</h1>
              </motion.div>

              <h2 className="mb-4 text-xl font-semibold text-blue-100">
                Warehouse Intelligence
              </h2>

              <p className="mb-8 text-sm leading-relaxed text-blue-200">
                Streamlined inventory management with precision tracking and
                real-time insights.
              </p>
            </div>

            {/* Minimal Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-white/10">
                  <FaShieldAlt size={14} />
                </div>
                <span className="text-sm">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-white/10">
                  <FaUsers size={14} />
                </div>
                <span className="text-sm">Role-based Access</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-white/10">
                  <FaBuilding size={14} />
                </div>
                <span className="text-sm">Multi-warehouse</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Compact Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 bg-white lg:col-span-3 lg:p-10"
          >
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-blue-50"
                >
                  <FaKey className="text-blue-600" size={20} />
                </motion.div>
                <h2 className="mb-2 text-2xl font-semibold text-gray-800">
                  Sign In
                </h2>
                <p className="text-sm text-gray-500">
                  Access your warehouse management account
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="px-4 py-3 border border-red-100 rounded-lg bg-red-50">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Role Selection - Compact */}
                <div>
                  <label className="block mb-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
                    Account Type
                  </label>
                  <div className="flex space-x-3">
                    {[
                      { value: "staff", label: "Staff", icon: FaUsers },
                      { value: "admin", label: "Admin", icon: FaShieldAlt },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = role === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setRole(option.value)}
                          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <Icon size={14} />
                          <span className="text-sm font-medium">
                            {option.label}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <FaCheck size={12} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaEnvelope className="text-gray-400" size={14} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full py-3 pl-10 pr-4 text-sm transition border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400" size={14} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full py-3 pl-10 pr-10 text-sm transition border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your password"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button - Simple */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt size={14} />
                      <span>Sign In</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Demo Credentials - Compact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-6 mt-8 border-t border-gray-100"
              >
                <h3 className="mb-4 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Quick Access
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      role: "Admin",
                      email: "admin@example.com",
                      password: "admin123456",
                      color: "bg-purple-50 border-purple-100",
                    },
                    {
                      role: "Staff",
                      email: "staff@example.com",
                      password: "staff123456",
                      color: "bg-blue-50 border-blue-100",
                    },
                  ].map((account) => (
                    <motion.button
                      key={account.role}
                      type="button"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        demoLogin(
                          account.email,
                          account.password,
                          account.role.toLowerCase(),
                        )
                      }
                      className={`w-full text-left p-3 rounded-lg border ${account.color} hover:opacity-90 transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-md ${account.role === "Admin" ? "bg-purple-100" : "bg-blue-100"}`}
                          >
                            {account.role === "Admin" ? (
                              <FaShieldAlt
                                size={12}
                                className="text-purple-600"
                              />
                            ) : (
                              <FaUsers size={12} className="text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {account.role} Account
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">
                              {account.email}
                            </p>
                          </div>
                        </div>
                        <FaSignInAlt size={12} className="text-gray-400" />
                      </div>
                    </motion.button>
                  ))}
                </div>

                <p className="mt-4 text-xs text-center text-gray-400">
                  Use demo accounts for testing
                </p>
              </motion.div>

              {/* Footer */}
              <div className="pt-6 mt-8 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400">
                  Secure access • v2.1.0
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
