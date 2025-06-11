/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Komponen SVG untuk ikon Google sebagai pengganti FcGoogle
const GoogleIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

// TAMBAH Eye Icons untuk show/hide password
const EyeIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
);

const BASE_URL = "https://backendhapi-production.up.railway.app";

const Login = () => {
  // UPDATE state: ganti email menjadi usernameOrEmail
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // TAMBAH state untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setShowForm(true);
  }, []);

  // UPDATE handleLogin untuk mendukung username atau email
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameOrEmail, // Backend akan handle username atau email
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }

      // Selalu simpan isLoggedIn = true, terlepas dari ada token atau tidak
      localStorage.setItem("isLoggedIn", "true");

      // Jika ada token, simpan juga tokennya
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Jika ada user data, simpan juga
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/home");
    } catch (err) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    // Simulasi login Google
    localStorage.setItem("isLoggedIn", "true");
    setIsExiting(true);
    setTimeout(() => {
      navigate("/home");
    }, 800);
  };

  const handleForgotPassword = () => {
    // Logika untuk lupa password
    alert("Fitur lupa password akan segera tersedia!");
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  // TAMBAH function untuk toggle show/hide password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Contoh PrivateRoute
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token"); // atau "isLoggedIn"
    if (!token) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            rotateY: 90,
            transition: { duration: 0.8, ease: "easeInOut" },
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 font-sans"
        >
          {/* Left Side - Login Form */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8"
          >
            <div className="mb-8 text-center">
              <img
                src="SecondaryLogo.svg"
                alt="Logo Sekunder BudgetEase"
                className="h-20 md:h-24 mx-auto transition-transform duration-300 hover:scale-105"
                onError={(e) =>
                  (e.target.src =
                    "https://placehold.co/200x80/cccccc/000000?text=Logo+Error")
                }
              />
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mt-4">
                Selamat Datang Kembali!
              </h1>
              <p className="text-gray-600 mt-2">
                Masuk untuk melanjutkan ke BudgetEase.
              </p>
            </div>

            <form
              className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-2xl"
              onSubmit={handleLogin}
            >
              {error && (
                <div
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md transition-all duration-300 ease-in-out"
                  role="alert"
                >
                  <p className="font-semibold">Oops! Terjadi Kesalahan</p>
                  <p>{error}</p>
                </div>
              )}

              {/* UPDATE input untuk username atau email */}
              <div>
                <label
                  htmlFor="usernameOrEmail"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Username atau Email
                </label>
                <input
                  id="usernameOrEmail"
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow duration-300"
                  placeholder="username atau contoh@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Anda dapat login menggunakan username atau alamat email
                </p>
              </div>

              {/* UPDATE password input dengan show/hide functionality */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    👁️ Klik ikon mata untuk{" "}
                    {showPassword ? "menyembunyikan" : "menampilkan"} password
                  </p>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline transition-colors duration-300"
                  >
                    Lupa Password?
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="keepSignedIn"
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={() => setKeepSignedIn(!keepSignedIn)}
                    className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 transition-colors duration-300"
                  />
                  <label
                    htmlFor="keepSignedIn"
                    className="ml-2 block text-sm text-gray-800"
                  >
                    Biarkan saya tetap masuk
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </div>
                ) : (
                  "Login"
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    atau lanjutkan dengan
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <GoogleIcon className="w-6 h-6 mr-3" />
                <span className="text-sm font-medium text-gray-700">
                  Lanjutkan dengan Google
                </span>
              </button>

              <div className="text-center text-sm text-gray-600 mt-8">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline transition-colors duration-300"
                >
                  Buat Akun Sekarang
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right Side - Image/Branding */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-emerald-600 to-teal-400 justify-center items-center p-8 lg:p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="smallGrid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                  <pattern
                    id="grid"
                    width="100"
                    height="100"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="100" height="100" fill="url(#smallGrid)" />
                    <path
                      d="M 100 0 L 0 0 0 100"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div
              className="text-center z-10 transition-all duration-1000 ease-in-out"
              style={{
                opacity: showForm ? 1 : 0,
                transform: showForm ? "scale(1)" : "scale(0.95)",
              }}
            >
              <img
                src="MainLogo.svg"
                alt="Ilustrasi BudgetEase"
                className="max-w-md lg:max-w-lg xl:max-w-xl mx-auto mb-6"
                onError={(e) =>
                  (e.target.src =
                    "https://placehold.co/400x300/cccccc/000000?text=Image+Error")
                }
              />
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Kelola Keuangan dengan Mudah
              </h2>
              <p className="text-emerald-100 text-lg lg:text-xl px-4">
                BudgetEase membantu Anda mencatat, menganalisis, dan
                merencanakan keuangan pribadi Anda secara efektif.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Login;
