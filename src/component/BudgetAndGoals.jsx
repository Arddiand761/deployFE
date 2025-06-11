/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Navbar from "./sidebar";

const BASE_URL = "https://backendhapi-production.up.railway.app";

const BudgetAndGoals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Goal Form States
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [addGoalError, setAddGoalError] = useState("");
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  // Add Funds Modal States
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [addFundsError, setAddFundsError] = useState("");
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Budget Summary States
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Delete States
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeletingGoal, setIsDeletingGoal] = useState(null);

  // Fetch goals from API
  const fetchGoalsFromAPI = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${BASE_URL}/goals`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Gagal mengambil data goals"
        );
      }

      // Handle different response formats
      let goalsList = [];
      if (Array.isArray(data)) {
        goalsList = data;
      } else if (data.goals && Array.isArray(data.goals)) {
        goalsList = data.goals;
      } else if (data.goal) {
        goalsList = [data.goal];
      }

      // Format goals data untuk UI
      const formattedGoals = goalsList.map((goal) => ({
        id: goal.id,
        name: goal.goal_name,
        currentAmount: parseFloat(goal.current_amount || 0),
        targetAmount: parseFloat(goal.target_amount || 0),
        status: goal.status,
        targetDate: goal.target_date,
        createdAt: goal.created_at,
        userId: goal.user_id,
      }));

      setGoals(formattedGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError(error.message || "Gagal mengambil data goals");
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${BASE_URL}/transactions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data transaksi");
      }

      const transactionList = Array.isArray(data)
        ? data
        : data.transactions || [];
      setTransactions(transactionList);

      calculateTotals(transactionList);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTotalIncome(0);
      setTotalExpense(0);
    }
  };

  // Calculate totals
  const calculateTotals = (transactionList) => {
    const incomes = transactionList
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = transactionList
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    setTotalIncome(incomes);
    setTotalExpense(expenses);
  };

  // Create goal via API
  const createGoalAPI = async (goalData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${BASE_URL}/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goalData),
      });

      const data = await response.json();

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

  // Add funds to goal via API
  const addFundsToGoalAPI = async (goalId, amount) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${BASE_URL}/goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount_to_add: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Gagal menambah dana goal"
        );
      }

      return data;
    } catch (error) {
      console.error("Error adding funds to goal:", error);
      throw error;
    }
  };

  // Delete goal via API
  const deleteGoal = async (goalId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${BASE_URL}/goals/${goalId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const textResponse = await response.text();
        data = { message: textResponse || "Goal deleted successfully" };
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Remove goal from state
      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
      setDeleteMessage("✅ Goal berhasil dihapus!");

      setTimeout(() => {
        setDeleteMessage("");
      }, 3000);

      return data;
    } catch (error) {
      console.error("Delete goal error:", error);
      setDeleteMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setDeleteMessage(""), 5000);
      throw error;
    }
  };

  // Handle bulk delete berdasarkan index
  const handleBulkDelete = async () => {
    if (goals.length === 0) {
      alert("Tidak ada goals yang tersedia untuk dihapus.");
      return;
    }

    // Tampilkan daftar goals dengan index
    let goalsList = "DAFTAR GOALS:\n\n";
    goals.forEach((goal, index) => {
      goalsList += `${index + 1}. ${goal.name}\n`;
      goalsList += `   💰 ${formatRupiah(goal.currentAmount)} / ${formatRupiah(
        goal.targetAmount
      )}\n`;
      goalsList += `   📅 Target: ${formatDate(goal.targetDate)}\n\n`;
    });

    const indexInput = window.prompt(
      `${goalsList}` +
        `Masukkan nomor goal yang ingin dihapus (1-${goals.length}):\n\n` +
        `⚠️ PERINGATAN: Goal akan dihapus permanen!`
    );

    if (indexInput === null) return;

    const goalIndex = parseInt(indexInput) - 1;

    // Validasi input
    if (isNaN(goalIndex) || goalIndex < 0 || goalIndex >= goals.length) {
      alert(`❌ Input tidak valid! Masukkan angka 1-${goals.length}`);
      return;
    }

    const selectedGoal = goals[goalIndex];

    // Konfirmasi final
    const confirmed = window.confirm(
      `🗑️ KONFIRMASI HAPUS GOAL\n\n` +
        `Nomor: ${goalIndex + 1}\n` +
        `Nama: ${selectedGoal.name}\n` +
        `Current: ${formatRupiah(selectedGoal.currentAmount)}\n` +
        `Target: ${formatRupiah(selectedGoal.targetAmount)}\n\n` +
        `⚠️ Tindakan ini tidak dapat dibatalkan!\n` +
        `Yakin ingin menghapus goal ini?`
    );

    if (confirmed) {
      setIsDeletingGoal(selectedGoal.id);

      try {
        await deleteGoal(selectedGoal.id);
      } catch (error) {
        console.error("Gagal menghapus goal:", error);
      } finally {
        setIsDeletingGoal(null);
      }
    }
  };

  // Handle Add Goal Form Submit
  const handleAddGoal = async (e) => {
    e.preventDefault();
    setIsCreatingGoal(true);
    setAddGoalError("");

    // Validasi
    if (!newGoalName.trim()) {
      setAddGoalError("Nama goal wajib diisi.");
      setIsCreatingGoal(false);
      return;
    }

    if (!newGoalTarget || parseFloat(newGoalTarget) <= 0) {
      setAddGoalError("Target dana harus lebih dari 0.");
      setIsCreatingGoal(false);
      return;
    }

    if (!newGoalDate) {
      setAddGoalError("Target tanggal wajib diisi.");
      setIsCreatingGoal(false);
      return;
    }

    // Validasi tanggal tidak boleh di masa lalu
    const today = new Date();
    const selectedDate = new Date(newGoalDate);
    if (selectedDate <= today) {
      setAddGoalError("Target tanggal harus di masa depan.");
      setIsCreatingGoal(false);
      return;
    }

    const goalData = {
      goal_name: newGoalName.trim(),
      target_amount: parseFloat(newGoalTarget),
      target_date: newGoalDate,
    };

    try {
      await createGoalAPI(goalData);

      // Reset form
      setNewGoalName("");
      setNewGoalTarget("");
      setNewGoalDate("");
      setAddGoalError("");
      setIsAddingGoal(false);

      fetchGoalsFromAPI();
    } catch (error) {
      setAddGoalError(
        error.message || "Gagal membuat goal baru. Silakan coba lagi."
      );
    } finally {
      setIsCreatingGoal(false);
    }
  };

  // Handle Add Funds
  const handleAddFunds = async (e) => {
    e.preventDefault();
    setIsAddingFunds(true);
    setAddFundsError("");

    // Validasi
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
      setAddFundsError("Jumlah dana harus lebih dari 0.");
      setIsAddingFunds(false);
      return;
    }

    // Validasi tidak melebihi target
    const amount = parseFloat(addFundsAmount);
    if (selectedGoal.currentAmount + amount > selectedGoal.targetAmount) {
      setAddFundsError("Jumlah dana tidak boleh melebihi target goal.");
      setIsAddingFunds(false);
      return;
    }

    try {
      await addFundsToGoalAPI(selectedGoal.id, amount);

      // Reset form dan close modal
      setAddFundsAmount("");
      setAddFundsError("");
      setIsAddFundsModalOpen(false);
      setSelectedGoal(null);

      fetchGoalsFromAPI();
    } catch (error) {
      setAddFundsError(
        error.message || "Gagal menambah dana goal. Silakan coba lagi."
      );
    } finally {
      setIsAddingFunds(false);
    }
  };

  // Handle amount input (hanya angka)
  const handleTargetChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setNewGoalTarget(value);
    }
  };

  const handleAddFundsAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAddFundsAmount(value);
    }
  };

  // Set minimum date untuk target_date (besok)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Open/Close Add Funds Modal
  const openAddFundsModal = (goal) => {
    setSelectedGoal(goal);
    setIsAddFundsModalOpen(true);
    setAddFundsAmount("");
    setAddFundsError("");
  };

  const closeAddFundsModal = () => {
    setIsAddFundsModalOpen(false);
    setSelectedGoal(null);
    setAddFundsAmount("");
    setAddFundsError("");
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchGoalsFromAPI(), fetchTransactions()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-100 min-h-screen pt-24 px-4 md:px-10 pb-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-100 min-h-screen pt-24 px-4 md:px-10 pb-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <button
                    onClick={() => {
                      fetchGoalsFromAPI();
                      fetchTransactions();
                    }}
                    className="mt-2 text-red-800 underline hover:text-red-900"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* MAIN CONTAINER - FIXED MOBILE PADDING */}
      <div className="bg-gray-100 min-h-screen pt-16 pb-24 sm:pt-20 sm:pb-8 lg:pt-24 px-3 sm:px-6 lg:px-10">
        {/* HEADER - MOBILE OPTIMIZED */}
        <header className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
            Budget & Goals
          </h1>
        </header>

        {/* Delete Message Display - MOBILE RESPONSIVE */}
        {deleteMessage && (
          <div
            className={`mb-4 p-3 sm:p-4 rounded-lg border mx-1 sm:mx-0 ${
              deleteMessage.includes("Error")
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {deleteMessage.includes("Error") ? (
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium break-words">
                  {deleteMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Budget Summary Section - MOBILE RESPONSIVE */}
        <section className="mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mx-1 sm:mx-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 border-b pb-3 sm:pb-4 mb-4">
              Ringkasan Budget Bulan Ini
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div className="p-3 sm:p-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Pemasukan
                </p>
                <span className="text-xl sm:text-2xl font-semibold text-green-600 break-all">
                  {formatRupiah(totalIncome)}
                </span>
              </div>
              <div className="p-3 sm:p-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Pengeluaran
                </p>
                <span className="text-xl sm:text-2xl font-semibold text-red-600 break-all">
                  {formatRupiah(totalExpense)}
                </span>
              </div>
              <div className="p-3 sm:p-0 sm:border-l sm:pl-6">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Sisa Dana Bisa Dipakai
                </p>
                <span className="text-xl sm:text-2xl font-bold text-teal-600 break-all">
                  {formatRupiah(totalIncome - totalExpense)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Goals Section - MOBILE OPTIMIZED */}
        <section>
          {/* HEADER WITH BUTTONS - MOBILE RESPONSIVE */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
              My Goals
            </h2>

            {/* Buttons Group - MOBILE STACKED */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              {/* Delete Button - MOBILE FULL WIDTH */}
              <button
                onClick={handleBulkDelete}
                disabled={goals.length === 0 || isDeletingGoal !== null}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg font-semibold transition-all duration-200 touch-manipulation text-sm ${
                  goals.length === 0 || isDeletingGoal !== null
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md transform active:scale-95"
                }`}
                title={
                  goals.length === 0
                    ? "Tidak ada goals untuk dihapus"
                    : "Hapus goal berdasarkan nomor"
                }
              >
                {isDeletingGoal !== null ? (
                  <svg
                    className="animate-spin h-4 w-4"
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                )}
                <span className="hidden xs:inline">
                  {isDeletingGoal !== null
                    ? "Menghapus..."
                    : `Hapus Goal (${goals.length})`}
                </span>
                <span className="xs:hidden">
                  {isDeletingGoal !== null ? "Menghapus..." : "Hapus"}
                </span>
              </button>

              {/* Add Goal Button - MOBILE FULL WIDTH */}
              <button
                onClick={() => setIsAddingGoal(!isAddingGoal)}
                className="w-full sm:w-auto bg-emerald-600 text-white font-semibold px-4 py-3 sm:py-2 rounded-lg shadow-md hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation text-sm transform active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                {isAddingGoal ? "Batal" : "Buat Goal Baru"}
              </button>
            </div>
          </div>

          {/* Goals Counter - MOBILE RESPONSIVE */}
          {goals.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg mx-1 sm:mx-0">
              <p className="text-blue-800 text-xs sm:text-sm text-center sm:text-left">
                📊 Total Goals: <strong>{goals.length}</strong> goals aktif
              </p>
            </div>
          )}

          {/* Add Goal Form - MOBILE RESPONSIVE */}
          {isAddingGoal && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6 mx-1 sm:mx-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Buat Goal Baru
              </h3>

              {addGoalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4">
                  <p className="text-xs sm:text-sm font-medium break-words">
                    {addGoalError}
                  </p>
                </div>
              )}

              <form onSubmit={handleAddGoal} className="space-y-4">
                {/* MOBILE STACKED FORM */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Nama Goal *
                  </label>
                  <input
                    type="text"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    placeholder="Contoh: Membeli baju baru"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 touch-manipulation"
                    required
                    disabled={isCreatingGoal}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Target Dana *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">Rp</span>
                    </div>
                    <input
                      type="text"
                      value={newGoalTarget}
                      onChange={handleTargetChange}
                      placeholder="200000"
                      className="w-full border border-gray-300 rounded-lg pl-12 pr-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 touch-manipulation"
                      required
                      disabled={isCreatingGoal}
                    />
                  </div>
                  {newGoalTarget && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      {parseFloat(newGoalTarget || 0).toLocaleString("id-ID")}{" "}
                      Rupiah
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Target Tanggal *
                  </label>
                  <input
                    type="date"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 touch-manipulation"
                    required
                    disabled={isCreatingGoal}
                  />
                </div>

                <div className="flex justify-center sm:justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isCreatingGoal}
                    className={`w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 sm:py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 touch-manipulation ${
                      isCreatingGoal
                        ? "opacity-70 cursor-not-allowed"
                        : "transform active:scale-95"
                    }`}
                  >
                    {isCreatingGoal ? (
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
                        Menyimpan...
                      </div>
                    ) : (
                      "Simpan Goal"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Goals List - MOBILE RESPONSIVE */}
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal, index) => (
                <div
                  key={goal.id}
                  className="bg-white p-4 sm:p-6 rounded-xl shadow-lg relative mx-1 sm:mx-0"
                >
                  {/* Index Badge - MOBILE ADJUSTED */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-xs font-bold text-white bg-emerald-600 rounded-full">
                      {index + 1}
                    </span>
                  </div>

                  {/* GOAL CONTENT - MOBILE RESPONSIVE */}
                  <div className="pl-10 sm:pl-12">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-semibold text-gray-800 break-words">
                          {goal.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                          Target: {formatDate(goal.targetDate)} • Status:{" "}
                          {goal.status}
                        </p>
                      </div>

                      <div className="text-center sm:text-right flex-shrink-0">
                        <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                          {Math.min(
                            Math.round(
                              (goal.currentAmount / goal.targetAmount) * 100
                            ) || 0,
                            100
                          )}
                          %
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 break-all">
                          {formatRupiah(goal.currentAmount)} /{" "}
                          {formatRupiah(goal.targetAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar - MOBILE RESPONSIVE */}
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-4">
                      <div
                        className="bg-emerald-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (goal.currentAmount / goal.targetAmount) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    {/* Goal Status Messages - MOBILE RESPONSIVE */}
                    {goal.currentAmount >= goal.targetAmount ? (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-xs sm:text-sm font-medium">
                          🎉 Goal tercapai! Selamat atas pencapaian Anda!
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-xs sm:text-sm">
                          💡 <strong>Tips:</strong> Tambahkan dana goal melalui
                          tombol di bawah ini!
                        </p>
                      </div>
                    )}

                    {/* Add Funds Button - MOBILE FULL WIDTH */}
                    <div className="mt-4 flex justify-center sm:justify-end">
                      <button
                        onClick={() => openAddFundsModal(goal)}
                        className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-4 py-3 sm:py-2 rounded-lg shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation text-sm transform active:scale-95"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Tambah Dana
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-10 px-4 sm:px-6 bg-white rounded-lg shadow-md mx-1 sm:mx-0">
                <div className="text-4xl sm:text-6xl mb-4">🎯</div>
                <p className="text-gray-500 text-base sm:text-lg mb-2">
                  Anda belum memiliki goal
                </p>
                <p className="text-gray-400 text-sm">
                  Ayo buat goal pertama Anda untuk mulai menabung!
                </p>
                <button
                  onClick={() => setIsAddingGoal(true)}
                  className="mt-4 bg-emerald-600 text-white px-6 py-3 sm:py-2 rounded-lg font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 touch-manipulation transform active:scale-95"
                >
                  Buat Goal Pertama
                </button>
              </div>
            )}
          </div>

          {/* Refresh Button - MOBILE RESPONSIVE */}
          <div className="text-center mt-6">
            <button
              onClick={fetchGoalsFromAPI}
              className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-medium py-3 sm:py-2 px-4 rounded-lg transition-all duration-200 touch-manipulation transform active:scale-95"
            >
              🔄 Refresh Data
            </button>
          </div>
        </section>

        {/* Add Funds Modal - MOBILE RESPONSIVE */}
        {isAddFundsModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Tambah Dana ke Goal
              </h3>

              {addFundsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4">
                  <p className="text-xs sm:text-sm font-medium break-words">
                    {addFundsError}
                  </p>
                </div>
              )}

              <form onSubmit={handleAddFunds}>
                {/* Goal Info - MOBILE RESPONSIVE */}
                <div className="mb-4 space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Goal:{" "}
                    <span className="font-semibold text-gray-800 break-words">
                      {selectedGoal?.name}
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Target:{" "}
                    <span className="font-semibold text-gray-800 break-all">
                      {formatRupiah(selectedGoal?.targetAmount)}
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Saat Ini:{" "}
                    <span className="font-semibold text-gray-800 break-all">
                      {formatRupiah(selectedGoal?.currentAmount)}
                    </span>
                  </p>
                </div>

                {/* Amount Input - MOBILE RESPONSIVE */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Jumlah Dana *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">Rp</span>
                    </div>
                    <input
                      type="text"
                      value={addFundsAmount}
                      onChange={handleAddFundsAmountChange}
                      placeholder="100000"
                      className="w-full border border-gray-300 rounded-lg pl-12 pr-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 touch-manipulation"
                      required
                    />
                  </div>
                  {addFundsAmount && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      {parseFloat(addFundsAmount || 0).toLocaleString("id-ID")}{" "}
                      Rupiah
                    </p>
                  )}
                </div>

                {/* Buttons - MOBILE RESPONSIVE */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                  <button
                    type="button"
                    onClick={closeAddFundsModal}
                    className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold px-4 py-3 sm:py-2 rounded-lg transition-all duration-200 touch-manipulation transform active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingFunds}
                    className={`w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 sm:py-2 px-4 rounded-lg shadow-md transition-all duration-200 touch-manipulation transform active:scale-95 ${
                      isAddingFunds ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isAddingFunds ? (
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
                        Menyimpan...
                      </div>
                    ) : (
                      "Tambah Dana"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Spacing untuk Mobile */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </>
  );
};

export default BudgetAndGoals;
