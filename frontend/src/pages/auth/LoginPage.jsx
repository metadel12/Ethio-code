import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiGithub, FiLinkedin } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function LoginPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.password.length < 1) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        const error = await response.json();
        setErrors({ general: error.detail || "Login failed" });
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Redirect to OAuth provider
    window.location.href = `/api/v1/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Left Panel - Hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-12 flex-col justify-between">
        <div>
          <Link to="/" className="text-3xl font-black text-white">
            EthioCode
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome Back
            </h1>
            <p className="text-emerald-100 text-lg">
              Empowering Ethiopian developers for global success
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <FiArrowRight className="text-white" />
              </div>
              <span>10,000+ active developers</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <FiArrowRight className="text-white" />
              </div>
              <span>500+ companies hiring</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <FiArrowRight className="text-white" />
              </div>
              <span>50,000+ problems solved</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-white italic mb-2">
              "EthioCode helped me land my dream job at Google while working from Addis Ababa."
            </p>
            <p className="text-emerald-200 font-semibold">— Biruk Alemu, Software Engineer</p>
          </div>

          <div className="text-emerald-100 text-sm">
            <p>Join the community of Ethiopian developers</p>
            <p className="mt-1">building the future of tech.</p>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          © 2024 EthioCode. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              EthioCode
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Sign in to continue your coding journey
            </p>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
            >
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Login successful! Redirecting...</span>
              </div>
            </motion.div>
          )}

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <p className="text-red-800 dark:text-red-200 text-sm">{errors.general}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-xl
                    ${isDark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}
                    placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.email ? "border-red-500" : "border"}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`block w-full pl-10 pr-10 py-2.5 rounded-xl
                    ${isDark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}
                    placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.password ? "border-red-500" : "border"}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  ) : (
                    <FiEye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600
                text-white font-semibold rounded-xl
                hover:from-emerald-600 hover:to-emerald-700
                transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-2 py-2.5 px-4 
                  border border-slate-300 dark:border-slate-600 
                  rounded-xl bg-white dark:bg-slate-800 
                  text-slate-700 dark:text-slate-300 font-medium
                  hover:bg-slate-50 dark:hover:bg-slate-700
                  transform hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-200"
              >
                <FaGoogle className="text-red-500" />
                <span className="text-sm">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("github")}
                className="flex items-center justify-center gap-2 py-2.5 px-4 
                  border border-slate-300 dark:border-slate-600 
                  rounded-xl bg-white dark:bg-slate-800 
                  text-slate-700 dark:text-slate-300 font-medium
                  hover:bg-slate-50 dark:hover:bg-slate-700
                  transform hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-200"
              >
                <FiGithub className="text-black dark:text-white" />
                <span className="text-sm">GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("linkedin")}
                className="flex items-center justify-center gap-2 py-2.5 px-4 
                  border border-slate-300 dark:border-slate-600 
                  rounded-xl bg-white dark:bg-slate-800 
                  text-slate-700 dark:text-slate-300 font-medium
                  hover:bg-slate-50 dark:hover:bg-slate-700
                  transform hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-200"
              >
                <FiLinkedin className="text-blue-600" />
                <span className="text-sm">LinkedIn</span>
              </button>
            </div>

            {/* Footer Links */}
            <div className="text-center pt-4">
              <p className="text-slate-600 dark:text-slate-300">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Create account
                </Link>
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Need help? <a href="/contact" className="hover:underline">Contact support</a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
