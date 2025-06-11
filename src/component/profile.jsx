/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Navbar from "./sidebar"; // Pastikan sudah rename Sidebar menjadi Navbar

// Placeholder untuk ikon edit
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4 text-white"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
    />
  </svg>
);

const BASE_URL = "https://backendhapi-production.up.railway.app";

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("editProfile");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // TAMBAH states untuk password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // TAMBAH states untuk delete account
  const [deleteAccountData, setDeleteAccountData] = useState({
    username: "",
    password: "",
  });
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileData, setProfileData] = useState({
    yourName: "",
    userName: "",
    email: "",
    dateOfBirth: "1990-01-12",
    permanentAddress: "sewon, bantul, yogyakarta",
    city: "Bantul",
    postalCode: "45962",
    country: "Indonesia",
    profilePicture:
      "https://placehold.co/128x128/E0E0E0/757575?text=AZ&font=raleway",
  });

  // Fungsi untuk fetch profile dari API
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      const response = await fetch(`${BASE_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data profile");
      }

      // Ambil data tambahan dari localStorage
      const savedProfileData = JSON.parse(
        localStorage.getItem("profileData") || "{}"
      );

      // Gabungkan data dari API dengan data lokal
      setProfileData((prev) => ({
        ...prev,
        ...savedProfileData, // data lokal (foto, alamat, dll)
        // Data dari API selalu menimpa data lokal untuk field yang sama
        yourName: data.user.username,
        userName: data.user.username,
        email: data.user.email,
      }));
    } catch (err) {
      setError(err.message || "Gagal mengambil data profile");
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, profilePicture: reader.result }));

        // Simpan foto ke localStorage langsung
        const savedData = JSON.parse(
          localStorage.getItem("profileData") || "{}"
        );
        savedData.profilePicture = reader.result;
        localStorage.setItem("profileData", JSON.stringify(savedData));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simpan data yang tidak ada di API ke localStorage
    const dataToSave = {
      dateOfBirth: profileData.dateOfBirth,
      permanentAddress: profileData.permanentAddress,
      city: profileData.city,
      postalCode: profileData.postalCode,
      country: profileData.country,
      profilePicture: profileData.profilePicture,
    };

    localStorage.setItem("profileData", JSON.stringify(dataToSave));

    console.log("Data profil disimpan:", profileData);
    alert("Data profil disimpan!");
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    if (year && month && day) {
      return `${parseInt(day, 10)} ${
        monthNames[parseInt(month, 10) - 1]
      } ${year}`;
    }
    return dateString;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 max-w-2xl mx-auto px-4 sm:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 max-w-2xl mx-auto px-4 sm:px-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // TAMBAH function untuk update password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    // Validasi
    if (!passwordData.currentPassword.trim()) {
      setPasswordError("Password saat ini wajib diisi.");
      setIsPasswordLoading(false);
      return;
    }

    if (!passwordData.newPassword.trim()) {
      setPasswordError("Password baru wajib diisi.");
      setIsPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password baru minimal 6 karakter.");
      setIsPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok.");
      setIsPasswordLoading(false);
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("Password baru harus berbeda dari password lama.");
      setIsPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${BASE_URL}/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: profileData.userName,
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Gagal mengupdate password"
        );
      }

      // Success
      setPasswordSuccess("✅ Password berhasil diupdate!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setPasswordSuccess("");
      }, 5000);
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(
        error.message || "Terjadi kesalahan saat mengupdate password"
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // TAMBAH function untuk delete account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDeleteLoading(true);
    setDeleteAccountError("");

    // Validasi
    if (!deleteAccountData.username.trim()) {
      setDeleteAccountError("Username wajib diisi.");
      setIsDeleteLoading(false);
      return;
    }

    if (!deleteAccountData.password.trim()) {
      setDeleteAccountError("Password wajib diisi.");
      setIsDeleteLoading(false);
      return;
    }

    // Validasi username harus sama dengan username saat ini
    if (deleteAccountData.username !== profileData.userName) {
      setDeleteAccountError("Username tidak cocok dengan akun Anda.");
      setIsDeleteLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${BASE_URL}/delete-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: deleteAccountData.username,
          password: deleteAccountData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Gagal menghapus akun");
      }

      // Success - Clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("profileData");
      localStorage.clear();

      alert("✅ Akun berhasil dihapus. Anda akan diarahkan ke halaman login.");

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error deleting account:", error);
      setDeleteAccountError(
        error.message || "Terjadi kesalahan saat menghapus akun"
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // TAMBAH function untuk handle input password
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  // TAMBAH function untuk handle input delete account
  const handleDeleteInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteAccountData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (deleteAccountError) {
      setDeleteAccountError("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content - FIXED MOBILE SPACING */}
      <main className="pt-20 lg:pt-24 pb-20 lg:pb-8 max-w-2xl mx-auto px-3 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-8 text-center sm:text-left">
          Pengaturan Profile
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 lg:p-8 mx-1 sm:mx-0">
          {/* Tabs - MOBILE OPTIMIZED */}
          <div className="flex border-b border-gray-200 mb-4 sm:mb-6 lg:mb-8 -mx-1 sm:mx-0">
            <button
              onClick={() => setActiveTab("editProfile")}
              className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 lg:px-6 text-xs sm:text-sm lg:text-base font-medium transition-colors duration-300 touch-manipulation
                ${
                  activeTab === "editProfile"
                    ? "border-b-2 border-emerald-600 text-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 lg:px-6 text-xs sm:text-sm lg:text-base font-medium transition-colors duration-300 touch-manipulation
                ${
                  activeTab === "security"
                    ? "border-b-2 border-emerald-600 text-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Security
            </button>
          </div>

          {/* Konten Tab */}
          {activeTab === "editProfile" && (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Profile Picture Section - MOBILE OPTIMIZED */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-6 sm:mb-8">
                <div className="relative">
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm mx-auto"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/128x128/E0E0E0/FF0000?text=Error&font=raleway";
                    }}
                  />
                  <label
                    htmlFor="profilePictureInput"
                    className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 p-1.5 sm:p-2 rounded-full cursor-pointer shadow-md transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
                    title="Ubah foto profil"
                  >
                    <EditIcon />
                    <input
                      type="file"
                      id="profilePictureInput"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 break-words">
                    {profileData.yourName || "Loading..."}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 break-all">
                    @{profileData.userName || "Loading..."}
                  </p>
                </div>
              </div>

              {/* Form Fields Grid - MOBILE RESPONSIVE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-6">
                <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-x-6">
                  <div>
                    <label
                      htmlFor="yourName"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="yourName"
                      id="yourName"
                      value={profileData.yourName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                    />
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <label
                      htmlFor="userName"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      User Name
                    </label>
                    <input
                      type="text"
                      name="userName"
                      id="userName"
                      value={profileData.userName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-x-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                    />
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="dateOfBirthDisplay"
                        id="dateOfBirthDisplay"
                        value={getFormattedDate(profileData.dateOfBirth)}
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm appearance-none pr-8 cursor-pointer touch-manipulation"
                        onClick={() =>
                          document.getElementById("dateOfBirth").click()
                        }
                      />
                      <input
                        type="date"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleInputChange}
                        className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer touch-manipulation"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="permanentAddress"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Permanent Address
                  </label>
                  <input
                    type="text"
                    name="permanentAddress"
                    id="permanentAddress"
                    value={profileData.permanentAddress}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      value={profileData.postalCode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="country"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={profileData.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                  />
                </div>
              </div>

              {/* Save Button - MOBILE OPTIMIZED */}
              <div className="flex justify-center sm:justify-end pt-4 sm:pt-6">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 sm:py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 touch-manipulation"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Security Tab - MOBILE OPTIMIZED */}
          {activeTab === "security" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Pengaturan Keamanan
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Kelola password dan pengaturan keamanan akun Anda.
                </p>
              </div>

              {/* PASSWORD SECTION - MOBILE OPTIMIZED */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-sm sm:text-md font-medium text-gray-900 mb-4">
                  Ubah Password
                </h4>

                {/* Success Message */}
                {passwordSuccess && (
                  <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium break-words">
                      {passwordSuccess}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {passwordError && (
                  <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium break-words">
                      {passwordError}
                    </p>
                  </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Password Saat Ini *
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                      placeholder="Masukkan password saat ini"
                      required
                      disabled={isPasswordLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Password Baru *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                      placeholder="Masukkan password baru (min. 6 karakter)"
                      required
                      disabled={isPasswordLoading}
                      minLength="6"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Konfirmasi Password Baru *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-sm touch-manipulation"
                      placeholder="Konfirmasi password baru"
                      required
                      disabled={isPasswordLoading}
                    />
                  </div>

                  <div className="flex justify-center sm:justify-start pt-2">
                    <button
                      type="submit"
                      disabled={isPasswordLoading}
                      className={`w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 sm:py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 touch-manipulation ${
                        isPasswordLoading
                          ? "opacity-70 cursor-not-allowed"
                          : "transform hover:scale-105 active:scale-95"
                      }`}
                    >
                      {isPasswordLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Mengupdate...
                        </div>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* DANGER ZONE - MOBILE OPTIMIZED */}
              <div className="border border-red-200 rounded-lg p-4 sm:p-6 bg-red-50">
                <h4 className="text-sm sm:text-md font-medium text-red-900 mb-2">
                  ⚠️ Danger Zone
                </h4>
                <p className="text-xs sm:text-sm text-red-700 mb-4 break-words">
                  Tindakan ini akan menghapus akun Anda secara permanen dan
                  tidak dapat dibatalkan.
                </p>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 sm:py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 touch-manipulation transform active:scale-95"
                >
                  Hapus Akun
                </button>
              </div>

              {/* Two-Factor Authentication - MOBILE OPTIMIZED */}
              <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                <h4 className="text-sm sm:text-md font-medium text-gray-900 mb-3">
                  Autentikasi Dua Faktor
                </h4>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      Aktifkan 2FA
                    </p>
                    <p className="text-xs text-gray-500 break-words">
                      Tingkatkan keamanan akun dengan autentikasi dua faktor
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 touch-manipulation"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DELETE MODAL - MOBILE OPTIMIZED */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                  Konfirmasi Hapus Akun
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs sm:text-sm text-gray-700 mb-4 break-words">
                <strong>PERINGATAN:</strong> Tindakan ini akan menghapus akun
                Anda secara permanen beserta semua data yang terkait. Proses ini
                tidak dapat dibatalkan.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Untuk melanjutkan, masukkan username dan password Anda:
              </p>
            </div>

            {/* Error Message */}
            {deleteAccountError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="text-xs sm:text-sm font-medium break-words">
                  {deleteAccountError}
                </p>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={deleteAccountData.username}
                  onChange={handleDeleteInputChange}
                  placeholder={`Ketik "${profileData.userName}" untuk konfirmasi`}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm touch-manipulation"
                  required
                  disabled={isDeleteLoading}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={deleteAccountData.password}
                  onChange={handleDeleteInputChange}
                  placeholder="Masukkan password Anda"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm touch-manipulation"
                  required
                  disabled={isDeleteLoading}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteAccountData({ username: "", password: "" });
                    setDeleteAccountError("");
                  }}
                  className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold px-4 py-3 sm:py-2 rounded-lg transition-all duration-200 touch-manipulation transform active:scale-95"
                  disabled={isDeleteLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isDeleteLoading}
                  className={`w-full sm:flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 sm:py-2 px-4 rounded-lg shadow-md transition-all duration-200 touch-manipulation transform active:scale-95 ${
                    isDeleteLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isDeleteLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Menghapus...
                    </div>
                  ) : (
                    "🗑️ Hapus Akun"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
