import React, { useState, useEffect } from "react";
import Navbar from "./sidebar";

const BASE_URL = "https://backendhapi-production.up.railway.app"; // Update API URL

const TransactionListPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'INCOME', 'EXPENSE'

  // TAMBAH state untuk refresh button
  const [isRefreshing, setIsRefreshing] = useState(false);

  // PERBAIKI Fetch transactions dari API Railway
  const fetchTransactions = async (isRefresh = false) => {
    try {
      // Set loading state yang tepat
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Clear error state
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        return;
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
      console.log("Railway API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data transaksi");
      }

      // Railway API langsung return array transactions
      const transactionList = Array.isArray(data)
        ? data
        : data.transactions || [];
      console.log("Transaction List:", transactionList);

      setTransactions(transactionList);
      setFilteredTransactions(transactionList); // Set initial filtered data

      // Success feedback untuk refresh
      if (isRefresh && transactionList.length > 0) {
        console.log(
          `✅ Data berhasil diperbarui: ${transactionList.length} transaksi`
        );
      }
    } catch (err) {
      setError(err.message || "Gagal mengambil data transaksi");
      console.error("Error fetching transactions:", err);
    } finally {
      // Clear loading states
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // TAMBAH handle refresh function
  const handleRefresh = async () => {
    await fetchTransactions(true); // Pass true untuk indicate refresh
  };

  // Filter dan search transactions
  const applyFilters = () => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === filterType
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  // Effect untuk fetch data saat component mount
  useEffect(() => {
    fetchTransactions(false); // Initial load
    setIsMounted(true);
  }, []);

  // Effect untuk apply filters ketika filterType atau searchTerm berubah
  useEffect(() => {
    if (transactions.length > 0) {
      applyFilters();
    }
  }, [transactions, filterType, searchTerm]);

  // Fungsi untuk memformat mata uang
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fungsi untuk memformat tanggal - Handle Railway API date format
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Handle filter type change
  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  // Loading state (initial load)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16 pb-24 sm:pt-20 sm:pb-8 lg:pt-24 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data transaksi...</p>
            </div>
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
        <main className="pt-16 pb-24 sm:pt-20 sm:pb-8 lg:pt-24 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-1 sm:mx-0">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <button
                    onClick={() => fetchTransactions(false)}
                    className="mt-2 text-red-800 underline hover:text-red-900"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main
        className={`pt-16 pb-24 sm:pt-20 sm:pb-8 lg:pt-24 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 transition-opacity duration-700 ease-in-out ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* HEADER - MOBILE RESPONSIVE */}
        <header className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Riwayat Transaksi
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Lihat semua pemasukan dan pengeluaran Anda.
              </p>
            </div>

            {/* Refresh Button - MOBILE RESPONSIVE */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg font-medium transition-all duration-200 touch-manipulation transform active:scale-95
                ${
                  isRefreshing
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
            >
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
                className={isRefreshing ? "animate-spin" : ""}
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <span className="text-sm">
                {isRefreshing ? "Memperbarui..." : "Refresh"}
              </span>
            </button>
          </div>

          {/* Summary Info - MOBILE RESPONSIVE */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mx-1 sm:mx-0">
              <p className="text-xs sm:text-sm text-gray-500">
                Total Transaksi
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {transactions.length}
              </p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mx-1 sm:mx-0">
              <p className="text-xs sm:text-sm text-green-600">
                Total Pemasukan
              </p>
              <p className="text-lg sm:text-xl font-bold text-green-600">
                {transactions.filter((t) => t.type === "INCOME").length}
              </p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mx-1 sm:mx-0">
              <p className="text-xs sm:text-sm text-red-600">
                Total Pengeluaran
              </p>
              <p className="text-lg sm:text-xl font-bold text-red-600">
                {transactions.filter((t) => t.type === "EXPENSE").length}
              </p>
            </div>
          </div>
        </header>

        {/* Filter dan Search Bar - MOBILE RESPONSIVE */}
        <div
          className={`bg-white rounded-xl shadow-md p-4 mb-4 sm:mb-6 mx-1 sm:mx-0 transition-all duration-500 ease-in-out ${
            isMounted
              ? "transform scale-100 opacity-100"
              : "transform scale-95 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4">
            {/* Search Bar - MOBILE RESPONSIVE */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari judul, kategori, atau deskripsi..."
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm touch-manipulation"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
            </div>

            {/* Filter Buttons - MOBILE RESPONSIVE */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium border transition-colors duration-200 touch-manipulation transform active:scale-95 ${
                  filterType === "all"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                Semua ({transactions.length})
              </button>
              <button
                onClick={() => handleFilterChange("INCOME")}
                className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium border transition-colors duration-200 touch-manipulation transform active:scale-95 ${
                  filterType === "INCOME"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                Pemasukan (
                {transactions.filter((t) => t.type === "INCOME").length})
              </button>
              <button
                onClick={() => handleFilterChange("EXPENSE")}
                className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium border transition-colors duration-200 touch-manipulation transform active:scale-95 ${
                  filterType === "EXPENSE"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                Pengeluaran (
                {transactions.filter((t) => t.type === "EXPENSE").length})
              </button>
            </div>
          </div>
        </div>

        {/* Results Info - MOBILE RESPONSIVE */}
        {searchTerm && (
          <div className="text-xs sm:text-sm text-gray-600 mb-4 mx-1 sm:mx-0">
            Menampilkan {filteredTransactions.length} dari {transactions.length}{" "}
            transaksi untuk pencarian "{searchTerm}"
          </div>
        )}

        {/* Refresh Loading Overlay - MOBILE RESPONSIVE */}
        <div className="relative">
          {isRefreshing && (
            <div className="absolute top-0 left-0 right-0 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 z-10 mx-1 sm:mx-0">
              <div className="flex items-center text-emerald-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-3"></div>
                <span className="text-xs sm:text-sm font-medium">
                  Sedang memperbarui data transaksi...
                </span>
              </div>
            </div>
          )}

          {/* MOBILE CARD VIEW + DESKTOP TABLE VIEW */}
          <div
            className={`bg-white rounded-xl shadow-xl transition-all duration-500 ease-in-out delay-100 mx-1 sm:mx-0
              ${isRefreshing ? "opacity-75" : "opacity-100"}
              ${
                isMounted
                  ? "transform scale-100"
                  : "transform scale-95 opacity-0"
              }
            `}
          >
            {/* MOBILE CARD VIEW - HIDDEN ON DESKTOP */}
            <div className="block sm:hidden">
              {filteredTransactions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredTransactions
                    .sort(
                      (a, b) =>
                        new Date(b.transaction_date) -
                        new Date(a.transaction_date)
                    )
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-4 hover:bg-emerald-50/50 transition-colors duration-150"
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 break-words">
                              {transaction.title || "Tanpa Judul"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(transaction.transaction_date)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p
                              className={`text-sm font-bold break-all ${
                                transaction.type === "INCOME"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "EXPENSE" && "- "}
                              {formatCurrency(parseFloat(transaction.amount))}
                            </p>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span
                            className={`px-2 py-1 inline-flex leading-4 font-medium rounded-full 
                            ${
                              transaction.type === "INCOME"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.category || "Lainnya"}
                          </span>
                          <span
                            className={`px-2 py-1 inline-flex leading-4 font-medium rounded-full ${
                              transaction.type === "INCOME"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {transaction.type === "INCOME"
                              ? "Pemasukan"
                              : "Pengeluaran"}
                          </span>
                          <span
                            className={`px-2 py-1 inline-flex leading-4 font-medium rounded-full ${
                              transaction.anomaly_status === "Normal"
                                ? "bg-green-100 text-green-800"
                                : transaction.anomaly_status === "Anomaly"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {transaction.anomaly_status || "Normal"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 italic">
                  <div className="text-4xl mb-2">📊</div>
                  {transactions.length === 0
                    ? "Belum ada data transaksi. Tambahkan transaksi pertama Anda!"
                    : `Tidak ada transaksi yang cocok dengan ${
                        searchTerm ? 'pencarian "' + searchTerm + '"' : "filter"
                      } Anda.`}
                </div>
              )}
            </div>

            {/* DESKTOP TABLE VIEW - HIDDEN ON MOBILE */}
            <div className="hidden sm:block overflow-x-auto rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status Anomali
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions
                      .sort(
                        (a, b) =>
                          new Date(b.transaction_date) -
                          new Date(a.transaction_date)
                      )
                      .map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-emerald-50/50 transition-colors duration-150 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 group-hover:text-gray-900">
                            {formatDate(transaction.transaction_date)}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-gray-900 max-w-xs truncate"
                            title={transaction.title}
                          >
                            {transaction.title || "Tanpa Judul"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              transaction.type === "INCOME"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                            >
                              {transaction.category || "Lainnya"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-medium ${
                                transaction.type === "INCOME"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "INCOME"
                                ? "Pemasukan"
                                : "Pengeluaran"}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                              transaction.type === "INCOME"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "EXPENSE" && "- "}
                            {formatCurrency(parseFloat(transaction.amount))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.anomaly_status === "Normal"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.anomaly_status === "Anomaly"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {transaction.anomaly_status || "Normal"}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-10 text-center text-gray-500 italic"
                      >
                        {transactions.length === 0
                          ? "Belum ada data transaksi. Tambahkan transaksi pertama Anda!"
                          : `Tidak ada transaksi yang cocok dengan ${
                              searchTerm
                                ? 'pencarian "' + searchTerm + '"'
                                : "filter"
                            } Anda.`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Refresh Button - MOBILE RESPONSIVE */}
        <div className="text-center mt-4 sm:mt-6">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 touch-manipulation transform active:scale-95
              ${
                isRefreshing
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRefreshing ? "animate-spin" : ""}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            {isRefreshing ? "Memperbarui Data..." : "🔄 Refresh Data"}
          </button>
        </div>

        {/* Bottom Spacing untuk Mobile */}
        <div className="h-4 sm:h-0"></div>
      </main>
    </div>
  );
};

export default TransactionListPage;
