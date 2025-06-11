import React, { useState, useEffect } from "react";
import Navbar from "./sidebar";

const BASE_URL = "https://backendhapi-production.up.railway.app"; // Railway API URL

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

  // Function to fetch goals from Railway API
  const fetchGoalsFromAPI = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      console.log("Fetching goals from Railway API...");
      const response = await fetch(`${BASE_URL}/goals`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Goals API Response:", data);

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

      console.log("Formatted goals:", formattedGoals);
      setGoals(formattedGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError(error.message || "Gagal mengambil data goals");
    }
  };

  // Function to fetch transactions
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      console.log("Fetching transactions from Railway API...");
      const response = await fetch(`${BASE_URL}/transactions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Transactions API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data transaksi");
      }

      const transactionList = Array.isArray(data)
        ? data
        : data.transactions || [];
      setTransactions(transactionList);

      // Hitung total income dan expense
      calculateTotals(transactionList);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTotalIncome(0);
      setTotalExpense(0);
    }
  };

  // Function to calculate totals
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
      console.log("Create Goal API Response:", data);

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

  // UPDATE Function to add funds to goal via API (menggunakan PUT method)
  const addFundsToGoalAPI = async (goalId, amount) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      console.log(`Adding funds to goal ${goalId}:`, amount);

      // PUT request ke Railway API dengan format yang benar
      const response = await fetch(`${BASE_URL}/goals/${goalId}`, {
        method: "PUT", // Menggunakan PUT method
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Bearer token auth
        },
        body: JSON.stringify({
          amount_to_add: parseFloat(amount), // Format input sesuai backend
        }),
      });

      const data = await response.json();
      console.log("Add Funds API Response:", data);

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

    // Prepare data sesuai format API
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

      // Refresh goals
      fetchGoalsFromAPI();
    } catch (error) {
      setAddGoalError(
        error.message || "Gagal membuat goal baru. Silakan coba lagi."
      );
    } finally {
      setIsCreatingGoal(false);
    }
  };

  // TAMBAH Handle Add Funds
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

      // Refresh goals
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

  // Handle add funds amount input (hanya angka)
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

  // Open Add Funds Modal
  const openAddFundsModal = (goal) => {
    setSelectedGoal(goal);
    setIsAddFundsModalOpen(true);
    setAddFundsAmount("");
    setAddFundsError("");
  };

  // Close Add Funds Modal
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
      <div className="bg-gray-100 min-h-screen pt-24 px-4 md:px-10 pb-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-800">Budget & Goals</h1>
        </header>

        {/* Budget Summary Section */}
        <section className="mt-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-4">
              Ringkasan Budget Bulan Ini
            </h3>
            <div className="mt-4 grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-500">Pemasukan</p>
                <span className="text-2xl font-semibold text-gray-800">
                  {formatRupiah(totalIncome)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pengeluaran</p>
                <span className="text-2xl font-semibold text-gray-800">
                  {formatRupiah(totalExpense)}
                </span>
              </div>
              <div className="md:border-l md:pl-6">
                <p className="text-sm text-gray-500">Sisa Dana Bisa Dipakai</p>
                <span className="text-2xl font-bold text-teal-600">
                  {formatRupiah(totalIncome - totalExpense)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">My Goals</h2>
            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="bg-emerald-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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

          {/* Add Goal Form */}
          {isAddingGoal && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Buat Goal Baru
              </h3>

              {/* Error Message */}
              {addGoalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm font-medium">{addGoalError}</p>
                </div>
              )}

              <form
                onSubmit={handleAddGoal}
                className="grid md:grid-cols-3 gap-4"
              >
                {/* Goal Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Goal *
                  </label>
                  <input
                    type="text"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    placeholder="Contoh: Membeli baju baru"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    disabled={isCreatingGoal}
                  />
                </div>

                {/* Target Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full border border-gray-300 rounded-lg pl-12 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                      disabled={isCreatingGoal}
                    />
                  </div>
                  {newGoalTarget && (
                    <p className="text-xs text-gray-500 mt-1">
                      {parseFloat(newGoalTarget || 0).toLocaleString("id-ID")}{" "}
                      Rupiah
                    </p>
                  )}
                </div>

                {/* Target Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Tanggal *
                  </label>
                  <input
                    type="date"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    disabled={isCreatingGoal}
                  />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-3 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isCreatingGoal}
                    className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 ${
                      isCreatingGoal
                        ? "opacity-70 cursor-not-allowed"
                        : "transform hover:scale-105"
                    }`}
                  >
                    {isCreatingGoal ? (
                      <div className="flex items-center">
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

          {/* Goals List */}
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Target: {formatDate(goal.targetDate)} • Status:{" "}
                        {goal.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {Math.min(
                          Math.round(
                            (goal.currentAmount / goal.targetAmount) * 100
                          ) || 0,
                          100
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatRupiah(goal.currentAmount)} /{" "}
                        {formatRupiah(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (goal.currentAmount / goal.targetAmount) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {/* Goal Completed */}
                  {goal.currentAmount >= goal.targetAmount && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm font-medium">
                        🎉 Goal tercapai! Selamat atas pencapaian Anda!
                      </p>
                    </div>
                  )}

                  {/* Goal Info */}
                  {goal.currentAmount < goal.targetAmount && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        💡 <strong>Tips:</strong> Tambahkan dana goal melalui
                        transaksi pemasukan untuk mencapai target Anda!
                      </p>
                    </div>
                  )}

                  {/* Add Funds Button - TAMBAH TOMBOL UNTUK MENAMBAH DANA KE GOAL */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => openAddFundsModal(goal)}
                      className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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
              ))
            ) : (
              <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-500 text-lg mb-2">
                  Anda belum memiliki goal
                </p>
                <p className="text-gray-400 text-sm">
                  Ayo buat goal pertama Anda untuk mulai menabung!
                </p>
                <button
                  onClick={() => setIsAddingGoal(true)}
                  className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Buat Goal Pertama
                </button>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div className="text-center mt-6">
            <button
              onClick={fetchGoalsFromAPI}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              🔄 Refresh Data
            </button>
          </div>
        </section>

        {/* Add Funds Modal - TAMBAH MODAL UNTUK MENAMBAH DANA KE GOAL */}
        {isAddFundsModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Tambah Dana ke Goal
              </h3>

              {/* Error Message */}
              {addFundsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm font-medium">{addFundsError}</p>
                </div>
              )}

              <form onSubmit={handleAddFunds}>
                {/* Goal Info */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Goal:{" "}
                    <span className="font-semibold text-gray-800">
                      {selectedGoal?.name}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Target:{" "}
                    <span className="font-semibold text-gray-800">
                      {formatRupiah(selectedGoal?.targetAmount)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Saat Ini:{" "}
                    <span className="font-semibold text-gray-800">
                      {formatRupiah(selectedGoal?.currentAmount)}
                    </span>
                  </p>
                </div>

                {/* Add Funds Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full border border-gray-300 rounded-lg pl-12 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  {addFundsAmount && (
                    <p className="text-xs text-gray-500 mt-1">
                      {parseFloat(addFundsAmount || 0).toLocaleString("id-ID")}{" "}
                      Rupiah
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingFunds}
                    className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                      isAddingFunds
                        ? "opacity-70 cursor-not-allowed"
                        : "transform hover:scale-105"
                    }`}
                  >
                    {isAddingFunds ? (
                      <div className="flex items-center">
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

              {/* Close Button */}
              <div className="mt-4">
                <button
                  onClick={closeAddFundsModal}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BudgetAndGoals;
