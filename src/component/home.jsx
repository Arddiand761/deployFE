/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Navbar from "./sidebar"; // Pastikan sudah rename Sidebar menjadi Navbar

const BASE_URL = "https://backendhapi-production.up.railway.app";

const HomePage = () => {
  // Tambah state untuk prediction
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [realCashIn, setRealCashIn] = useState([]);
  const [realCashOut, setRealCashOut] = useState([]);
  const [dailyCompareData, setDailyCompareData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [weeklyExpenseData, setWeeklyExpenseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // TAMBAH state untuk prediction
  const [predictionData, setPredictionData] = useState(null);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  // TAMBAH function untuk get prediction
  const getPrediction = async () => {
    try {
      setIsPredictionLoading(true);
      setPredictionError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      console.log("Getting prediction from Railway API...");

      // Call Railway Prediction API dengan GET method
      const response = await fetch(`${BASE_URL}/transactions/prediction`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Prediction API Response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Gagal mendapatkan prediksi"
        );
      }

      // Format response data untuk UI
      const formattedPrediction = {
        predicted_expense: data.prediksi_keuangan || 0,
        confidence: 0.85, // Default confidence level (bisa disesuaikan)
        input_data: {
          // Backend sudah handle 3 hari terakhir, jadi kita tidak perlu kirim data
          previous_expenses: [], // Empty array karena backend sudah process
        },
      };

      setPredictionData(formattedPrediction);
    } catch (error) {
      console.error("Error getting prediction:", error);
      setPredictionError(
        error.message || "Gagal mendapatkan prediksi keuangan"
      );
    } finally {
      setIsPredictionLoading(false);
    }
  };

  // UPDATE fetchTransactions untuk call prediction tanpa parameter
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        return;
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

      setTransactions(data.transactions || []);
      processWeeklyExpenseData(data.transactions || []);
      processDailyCompareData(data.transactions || []);
      processCashInOut(data.transactions || []);
      calculateTotals(data.transactions || []);

      // TAMBAH: Get prediction setelah process transactions (tanpa parameter)
      await getPrediction();

      // Fetch goals juga
      await fetchGoals();
    } catch (err) {
      setError(err.message || "Gagal mengambil data transaksi");
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch goals dari API
  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token tidak ditemukan untuk fetch goals");
        return;
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
        throw new Error(data.error || "Gagal mengambil data goals");
      }

      // Format data goals untuk tampilan - PERBAIKAN MAPPING
      const formattedGoals = (data.goals || data || []).map((goal) => ({
        name: goal.goal_name || "Goal Tanpa Nama", // Pakai goal_name dari API
        percent: Math.round(
          (parseFloat(goal.current_amount || 0) /
            parseFloat(goal.target_amount || 1)) *
            100
        ),
        current: parseFloat(goal.current_amount || 0),
        target: parseFloat(goal.target_amount || 0),
        id: goal.id,
        status: goal.status,
        target_date: goal.target_date,
      }));

      console.log("Formatted goals:", formattedGoals); // Debug log
      setGoals(formattedGoals);
    } catch (err) {
      console.error("Error fetching goals:", err);
      // Jika error, gunakan dummy data sebagai fallback
      setGoals([
        { name: "Emergency Fund", percent: 75 },
        { name: "Vacation Fund", percent: 45 },
        { name: "New Car", percent: 30 },
      ]);
    }
  };

  // Fungsi untuk menghitung total income dan expense
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

  // Proses data menjadi format perminggu (hanya EXPENSE)
  const processWeeklyExpenseData = (transactionList) => {
    // Filter hanya transaksi EXPENSE
    const expenses = transactionList.filter((t) => t.type === "EXPENSE");

    // Group berdasarkan minggu
    const weeklyData = {};

    expenses.forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      const weekStart = getWeekStart(date);
      const weekKey = formatWeekKey(weekStart);

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }

      weeklyData[weekKey] += parseFloat(transaction.amount);
    });

    // Convert ke format array untuk grafik
    const chartData = Object.entries(weeklyData)
      .map(([week, amount]) => ({
        name: formatWeekLabel(week), // Format untuk grafik line chart
        value: amount,
        week,
        formattedAmount: formatCurrency(amount),
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-6); // Ambil 6 minggu terakhir untuk grafik

    setWeeklyExpenseData(chartData);
  };

  // Proses data untuk grafik pembanding harian (Pengeluaran vs Pemasukan)
  const processDailyCompareData = (transactionList) => {
    console.log("Processing daily compare data...", transactionList.length); // Debug

    // Pisahkan transaksi berdasarkan type
    const expenses = transactionList.filter((t) => t.type === "EXPENSE");
    const incomes = transactionList.filter((t) => t.type === "INCOME");

    console.log("Expenses:", expenses.length, "Incomes:", incomes.length); // Debug

    // Group pengeluaran berdasarkan hari
    const dailyExpenses = {};
    expenses.forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dailyExpenses[dayKey]) {
        dailyExpenses[dayKey] = 0;
      }
      dailyExpenses[dayKey] += parseFloat(transaction.amount);
    });

    // Group pemasukan berdasarkan hari
    const dailyIncomes = {};
    incomes.forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dailyIncomes[dayKey]) {
        dailyIncomes[dayKey] = 0;
      }
      dailyIncomes[dayKey] += parseFloat(transaction.amount);
    });

    console.log("Daily Expenses:", dailyExpenses); // Debug
    console.log("Daily Incomes:", dailyIncomes); // Debug

    // Gabungkan semua tanggal yang ada (dari pengeluaran dan pemasukan)
    const allDates = new Set([
      ...Object.keys(dailyExpenses),
      ...Object.keys(dailyIncomes),
    ]);

    // Convert ke format array dan ambil 7 hari terakhir
    const sortedDays = Array.from(allDates)
      .map((date) => ({
        date,
        expense: dailyExpenses[date] || 0, // EXPENSE amount
        income: dailyIncomes[date] || 0, // INCOME amount
        dayName: formatDayName(date),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // 7 hari terakhir

    console.log("Sorted days before mapping:", sortedDays); // Debug

    // Format untuk grafik - PASTIKAN MAPPING BENAR
    const compareData = sortedDays.map((day) => ({
      name: day.dayName,
      expense: day.expense, // Data EXPENSE -> expense (garis merah, tinggi)
      income: day.income, // Data INCOME -> income (garis hijau, rendah)
      date: day.date,
    }));

    console.log("Final compare data:", compareData); // Debug

    setDailyCompareData(compareData);
  };

  // Fungsi untuk memproses data Cash In dan Cash Out
  const processCashInOut = (transactionList) => {
    // Filter transaksi INCOME untuk Cash In (3 terbaru)
    const incomes = transactionList
      .filter((t) => t.type === "INCOME")
      .sort(
        (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
      )
      .slice(0, 3)
      .map((transaction) => ({
        date: formatTransactionDate(transaction.transaction_date),
        category: transaction.category,
        amount: formatCurrency(parseFloat(transaction.amount)),
        desc: transaction.title.replace("Pemasukan untuk: ", ""), // Bersihkan prefix jika ada
      }));

    // Filter transaksi EXPENSE untuk Cash Out (3 terbaru)
    const expenses = transactionList
      .filter((t) => t.type === "EXPENSE")
      .sort(
        (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
      )
      .slice(0, 3)
      .map((transaction) => ({
        date: formatTransactionDate(transaction.transaction_date),
        category: transaction.category,
        amount: formatCurrency(parseFloat(transaction.amount)),
        desc: transaction.title
          .replace("Menabung untuk: ", "")
          .replace("Pengeluaran untuk: ", ""), // Bersihkan prefix
      }));

    setRealCashIn(incomes);
    setRealCashOut(expenses);
  };

  // Helper function: Format tanggal transaksi
  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  // Helper function: Dapatkan awal minggu (Senin)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Senin sebagai awal minggu
    return new Date(d.setDate(diff));
  };

  // Helper function: Format minggu untuk key
  const formatWeekKey = (date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // Helper function: Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function: Format label minggu untuk display
  const formatWeekLabel = (weekStart) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.getDate()}/${start.getMonth() + 1}`;
  };

  // Helper function: Format nama hari
  const formatDayName = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Cek apakah hari ini atau kemarin
    if (date.toDateString() === today.toDateString()) {
      return "Hari Ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      // Format: Sen, Sel, Rab, dll
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      return days[date.getDay()];
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []); // Ini hanya load sekali saat mount

  // Tambahkan useEffect untuk refresh saat window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchTransactions(); // Ini akan fetch transactions + goals
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Selamat datang kembali! Berikut ringkasan keuangan Anda.
            </p>
          </div>
          <a
            href="/transactionInput"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200"
          >
            + Input Transaksi
          </a>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📈</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Total semua pemasukan
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Expense
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">📉</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Total semua pengeluaran
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Saldo Bersih</p>
              <p
                className={`text-3xl font-bold ${
                  totalIncome - totalExpense >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">💰</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Selisih pemasukan dan pengeluaran
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grafik Mingguan - sama seperti sebelumnya */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Pengeluaran Mingguan (6 Minggu Terakhir)
            </h2>
            {weeklyExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyExpenseData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  />
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [
                      formatCurrency(value),
                      "Pengeluaran",
                    ]}
                    labelFormatter={(label) => `Minggu ${label}`}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">📊</p>
                  <p>Belum ada data pengeluaran mingguan</p>
                  <p className="text-sm">
                    Tambahkan transaksi untuk melihat grafik
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Grafik Pengeluaran vs Pemasukan Harian - PERBAIKI LEGEND */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Expense vs Income Harian (7 Hari Terakhir)
            </h2>
            {dailyCompareData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyCompareData}>
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Expense"
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Income"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => {
                      // Debug what we're getting
                      console.log("Tooltip value:", value, "name:", name);

                      // Explicit mapping
                      if (name === "expense") {
                        return [formatCurrency(value), "Expense"];
                      } else if (name === "income") {
                        return [formatCurrency(value), "Income"];
                      } else {
                        // Fallback
                        return [formatCurrency(value), name];
                      }
                    }}
                    labelFormatter={(label) => `${label}`}
                  />
                  {/* PERBAIKI LEGEND - Tambah payload manual */}
                  <Legend
                    payload={[
                      { value: "Expense", type: "line", color: "#ef4444" },
                      { value: "Income", type: "line", color: "#10b981" },
                    ]}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">📊</p>
                  <p>Belum ada data transaksi harian</p>
                  <p className="text-sm">
                    Tambahkan transaksi untuk melihat grafik
                  </p>
                </div>
              </div>
            )}

            {/* Summary section tetap sama */}
            {dailyCompareData.length > 0 && (
              <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-red-600">Total Expense 7 hari:</span>
                    <br />
                    <span className="font-semibold">
                      {formatCurrency(
                        dailyCompareData.reduce(
                          (sum, day) => sum + day.expense,
                          0
                        ) // Update key
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-600">Total Income 7 hari:</span>
                    <br />
                    <span className="font-semibold">
                      {formatCurrency(
                        dailyCompareData.reduce(
                          (sum, day) => sum + day.income,
                          0
                        ) // Update key
                      )}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-700">Net (Income - Expense):</span>
                  <br />
                  <span className="font-semibold">
                    {(() => {
                      const totalIncome = dailyCompareData.reduce(
                        (sum, day) => sum + day.income,
                        0
                      ); // Update key
                      const totalExpense = dailyCompareData.reduce(
                        (sum, day) => sum + day.expense,
                        0
                      ); // Update key
                      const difference = totalIncome - totalExpense;
                      return (
                        <span
                          className={
                            difference >= 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {formatCurrency(difference)}
                        </span>
                      );
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals Section - REAL DATA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Goals</h2>
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal, idx) => (
                <div key={goal.id || idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">
                      {goal.name}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-emerald-600">
                        {Math.min(goal.percent, 100)}%
                      </span>
                      {goal.current !== undefined &&
                        goal.target !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(goal.current)} /{" "}
                            {formatCurrency(goal.target)}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(goal.percent, 100)}%` }}
                    />
                  </div>
                  {goal.percent >= 100 && (
                    <div className="mt-2 text-xs text-emerald-600 font-medium">
                      🎉 Goal tercapai!
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">🎯</p>
                <p>Belum ada goals yang ditetapkan</p>
                <p className="text-sm">
                  Buat goal pertama Anda untuk mulai menabung
                </p>
              </div>
            )}
          </div>

          {/* Tambah Goal Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-3 px-4 rounded-lg border-2 border-dashed border-emerald-300 transition-all duration-200">
              + Tambah Goal Baru
            </button>
          </div>
        </div>

        {/* Cash In & Cash Out - REAL DATA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Cash In (3 Terbaru)
            </h2>
            <div className="overflow-x-auto">
              {realCashIn.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-600">
                        Tanggal
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">
                        Kategori
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">
                        Rupiah
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {realCashIn.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-2 text-gray-900">{item.date}</td>
                        <td className="py-3 px-2">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-semibold text-green-600">
                          {item.amount}
                        </td>
                        <td className="py-3 px-2 text-gray-600">{item.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">💰</p>
                  <p>Belum ada data pemasukan</p>
                  <p className="text-sm">Tambahkan transaksi pemasukan</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Cash Out (3 Terbaru)
            </h2>
            <div className="overflow-x-auto">
              {realCashOut.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-600">
                        Tanggal
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">
                        Kategori
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">
                        Rupiah
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {realCashOut.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-2 text-gray-900">{item.date}</td>
                        <td className="py-3 px-2">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-semibold text-red-600">
                          {item.amount}
                        </td>
                        <td className="py-3 px-2 text-gray-600">{item.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">💸</p>
                  <p>Belum ada data pengeluaran</p>
                  <p className="text-sm">Tambahkan transaksi pengeluaran</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GANTI Grafik Bar dengan Prediction Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🔮 Prediksi Pengeluaran Keuangan
          </h2>

          {isPredictionLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">
                  Menganalisis pola pengeluaran...
                </p>
              </div>
            </div>
          ) : predictionError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">⚠️</span>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error Prediksi
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{predictionError}</p>
                  <button
                    onClick={() => getPrediction()}
                    className="mt-2 text-red-800 underline hover:text-red-900 text-sm"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          ) : predictionData ? (
            <div className="space-y-6">
              {/* Prediction Result */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Prediksi Pengeluaran Hari Berikutnya
                    </h3>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">
                      {formatCurrency(predictionData.predicted_expense || 0)}
                    </p>
                  </div>
                  <div className="text-5xl">🎯</div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Confidence Level</span>
                    <span>{Math.round(predictionData.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${predictionData.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Algorithm Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  🤖 AI Prediction Algorithm
                </h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    • Menggunakan Machine Learning untuk analisis pola
                    pengeluaran
                  </p>
                  <p>• Berdasarkan data transaksi 3 hari terakhir Anda</p>
                  <p>
                    • Algorithm telah dilatih dengan data keuangan yang
                    komprehensif
                  </p>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  💡 Insights & Rekomendasi
                </h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>
                    • Prediksi pengeluaran Anda besok adalah{" "}
                    <strong>
                      {formatCurrency(predictionData.predicted_expense || 0)}
                    </strong>
                  </p>
                  <p>
                    • Sistem AI telah menganalisis pola pengeluaran harian Anda
                  </p>
                  <p>
                    •{" "}
                    {predictionData.predicted_expense > totalExpense / 30
                      ? "⚠️ Prediksi cukup tinggi. Pertimbangkan untuk lebih hemat."
                      : "✅ Prediksi dalam batas wajar. Pola pengeluaran Anda terkendali."}
                  </p>
                  <p>
                    • 💡 <strong>Tips:</strong> Gunakan prediksi ini untuk
                    merencanakan budget harian Anda
                  </p>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="text-center">
                <button
                  onClick={() => getPrediction()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  🔄 Refresh Prediksi
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">🤖</p>
              <p>Prediksi belum tersedia</p>
              <p className="text-sm">
                Tambahkan lebih banyak transaksi untuk analisis yang akurat
              </p>
              <button
                onClick={() => getPrediction()}
                className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Dapatkan Prediksi
              </button>
            </div>
          )}
        </div>

        {/* Konten lainnya */}
        {/* ... existing content ... */}
      </main>
    </div>
  );
};

export default HomePage;
