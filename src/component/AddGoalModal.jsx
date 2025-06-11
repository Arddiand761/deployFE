import React, { useState } from "react";
import { X, Calendar } from "lucide-react";

const BASE_URL = "https://backendhapi-production.up.railway.app"; // Railway API URL

const AddGoalModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState(""); // Tambah field target_date
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Function to create goal via Railway API
  const createGoalAPI = async (goalData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      console.log("Creating goal:", goalData);

      const response = await fetch(`${BASE_URL}/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goalData),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Gagal membuat goal baru"
        );
      }

      return data;
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validasi
    if (!name.trim()) {
      setError("Nama goal wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!target || parseFloat(target) <= 0) {
      setError("Target dana harus lebih dari 0.");
      setIsLoading(false);
      return;
    }

    if (!targetDate) {
      setError("Target tanggal wajib diisi.");
      setIsLoading(false);
      return;
    }

    // Validasi tanggal tidak boleh di masa lalu
    const today = new Date();
    const selectedDate = new Date(targetDate);
    if (selectedDate <= today) {
      setError("Target tanggal harus di masa depan.");
      setIsLoading(false);
      return;
    }

    // Prepare data sesuai format API
    const goalData = {
      goal_name: name.trim(),
      target_amount: parseFloat(target),
      target_date: targetDate, // Format: "2025-12-22"
    };

    try {
      // Create goal via API
      const newGoal = await createGoalAPI(goalData);

      // Call parent onSave dengan goal baru (optional, bisa diabaikan parent)
      if (onSave) {
        onSave(newGoal);
      }

      // Reset form
      setName("");
      setTarget("");
      setTargetDate("");
      setError("");

      // Close modal
      onClose();
    } catch (error) {
      setError(error.message || "Gagal membuat goal baru. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle amount input (hanya angka)
  const handleTargetChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setTarget(value);
    }
  };

  // Set minimum date untuk target_date (besok)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Buat Goal Baru</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Goal Name */}
          <div>
            <label
              htmlFor="goalName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nama Goal *
            </label>
            <input
              id="goalName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Membeli baju baru"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* Target Amount */}
          <div>
            <label
              htmlFor="goalTarget"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Target Dana *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">Rp</span>
              </div>
              <input
                id="goalTarget"
                type="text"
                value={target}
                onChange={handleTargetChange}
                placeholder="200000"
                className="w-full border border-gray-300 rounded-lg pl-12 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                required
                disabled={isLoading}
              />
            </div>
            {target && (
              <p className="text-xs text-gray-500 mt-1">
                {parseFloat(target || 0).toLocaleString("id-ID")} Rupiah
              </p>
            )}
          </div>

          {/* Target Date */}
          <div>
            <label
              htmlFor="goalTargetDate"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Target Tanggal *
            </label>
            <div className="relative">
              <input
                id="goalTargetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={getMinDate()}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kapan target ini ingin dicapai?
            </p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 
            ${
              isLoading
                ? "opacity-70 cursor-not-allowed"
                : "transform hover:scale-105"
            }
            `}
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
                Menyimpan...
              </div>
            ) : (
              "Simpan Goal"
            )}
          </button>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-blue-700">
                  <strong>Tips:</strong> Goal yang dibuat akan dimulai dari Rp
                  0. Anda bisa menambah dana goal melalui transaksi atau
                  transfer manual.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;
