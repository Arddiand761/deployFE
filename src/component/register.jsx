/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // TAMBAH state untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setShowForm(true);

    // Clear form untuk menghindari autofill
    const clearFormData = () => {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    };

    clearFormData();

    const timer = setTimeout(() => {
      clearFormData();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // TAMBAH function untuk toggle show/hide password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // TAMBAH function untuk clear form
  const clearForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    // Force clear input fields
    const inputs = [
      "username",
      "email-register",
      "password-register",
      "confirmPassword",
    ];
    inputs.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.value = "";
        input.setAttribute("value", "");
      }
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validasi frontend
    if (!username.trim()) {
      setError("Username wajib diisi.");
      setIsLoading(false);
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Format email tidak valid.");
      setIsLoading(false);
      return;
    }
    if (password.length < 7) {
      setError("Password minimal 7 karakter.");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://backendhapi-production.up.railway.app/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registrasi gagal. Silakan coba lagi.");
      } else {
        clearForm(); // Clear form sebelum navigate
        navigate("/"); // redirect ke login
      }
    } catch (err) {
      setError("Registrasi gagal. Silakan coba lagi.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 font-sans">
      {/* Left Side - Register Form */}
      <div
        className="w-full flex flex-col justify-center items-center p-6 sm:p-8 transition-all duration-1000 ease-in-out"
        style={{
          opacity: showForm ? 1 : 0,
          transform: showForm ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <div className="mb-8 text-center">
          <img
            src="SecondaryLogo.svg"
            alt="Logo Sekunder BudgetEase"
            className="h-30 md:h-24 mx-auto transition-transform duration-300 hover:scale-105"
            onError={(e) =>
              (e.target.src =
                "https://placehold.co/200x80/cccccc/000000?text=Logo+Error")
            }
          />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mt-4">
            Buat Akun Baru
          </h1>
          <p className="text-gray-600 mt-2">
            Bergabunglah dengan BudgetEase dan mulai kelola keuangan Anda.
          </p>
        </div>

        {/* ENHANCED form dengan autocomplete off */}
        <form
          className="w-full max-w-md space-y-5 bg-white p-8 rounded-xl shadow-2xl"
          onSubmit={handleRegister}
          autoComplete="off"
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

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username-new"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow duration-300"
              placeholder="john_doe"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-lpignore="true"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email-register"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Alamat Email
            </label>
            <input
              id="email-register"
              name="email-new"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow duration-300"
              placeholder="contoh@email.com"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-lpignore="true"
              required
            />
          </div>

          {/* Password Field dengan Show/Hide */}
          <div>
            <label
              htmlFor="password-register"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password-register"
                name="password-new"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow duration-300"
                placeholder="•••••••• (minimal 7 karakter)"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                required
                minLength={7}
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
            <p className="text-xs text-gray-500 mt-1">
              👁️ Klik ikon mata untuk{" "}
              {showPassword ? "menyembunyikan" : "menampilkan"} password
            </p>
          </div>

          {/* Confirm Password Field dengan Show/Hide */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirm-password-new"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow duration-300"
                placeholder="••••••••"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                required
                minLength={7}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              👁️ Klik ikon mata untuk{" "}
              {showConfirmPassword ? "menyembunyikan" : "menampilkan"}{" "}
              konfirmasi password
            </p>
          </div>

          {/* Password Match Indicator */}
          {password && confirmPassword && (
            <div
              className={`text-xs px-3 py-2 rounded-lg ${
                password === confirmPassword
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {password === confirmPassword ? (
                <span className="flex items-center">✅ Password cocok</span>
              ) : (
                <span className="flex items-center">
                  ❌ Password tidak cocok
                </span>
              )}
            </div>
          )}

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
                Mendaftar...
              </div>
            ) : (
              "Register"
            )}
          </button>

          <div className="text-center text-sm text-gray-600 mt-6">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => {
                clearForm();
                navigate("/");
              }}
              className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline transition-colors duration-300"
            >
              Masuk di sini
            </button>
          </div>

          {/* Manual Clear Button */}
          <button
            type="button"
            onClick={clearForm}
            className="w-full text-gray-400 text-xs underline mt-2 hover:text-gray-600"
          >
            🧹 Clear Form
          </button>
        </form>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-emerald-600 to-teal-400 justify-center items-center p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="smallGridRegister"
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
                id="gridRegister"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <rect width="100" height="100" fill="url(#smallGridRegister)" />
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridRegister)" />
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
            alt="Ilustrasi Selamat Datang BudgetEase"
            className="max-w-md lg:max-w-lg xl:max-w-xl mx-auto mb-6"
            onError={(e) =>
              (e.target.src =
                "https://placehold.co/400x300/cccccc/000000?text=Image+Error")
            }
          />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Mulai Perjalanan Finansial Anda
          </h2>
          <p className="text-emerald-100 text-lg lg:text-xl px-4">
            Daftar sekarang untuk mendapatkan kontrol penuh atas anggaran dan
            pengeluaran Anda dengan BudgetEase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
