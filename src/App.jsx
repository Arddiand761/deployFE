/* eslint-disable no-unused-vars */
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Impor komponen yang sudah ada
import Login from "./component/login";
import HomePage from "./component/home";
import Register from "./component/register";
import Introduction from "./component/introduction";
import DataDiri from "./component/DataDiri.jsx";
import Informasi from "./component/InformasiPribadi.jsx";
import Profile from "./component/profile.jsx";
import TransactionInputPage from "./component/TransactionInput.jsx";
import TransactionListPage from "./component/TransactionList.jsx";

// Impor komponen baru untuk fitur Goals
import BudgetAndGoals from "./component/BudgetAndGoals.jsx";

// Wrapper untuk animasi halaman
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

// Wrapper untuk melindungi rute yang butuh login
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    // Jika tidak login, arahkan ke halaman utama
    return <Navigate to="/" replace />;
  }
  // Jika sudah login, tampilkan halaman dengan animasi
  return <AnimatedPage>{children}</AnimatedPage>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rute Publik (tidak butuh login) */}
        <Route
          path="/"
          element={
            <AnimatedPage>
              <Login />
            </AnimatedPage>
          }
        />
        <Route
          path="/register"
          element={
            <AnimatedPage>
              <Register />
            </AnimatedPage>
          }
        />
        <Route
          path="/introduction"
          element={
            <AnimatedPage>
              <Introduction />
            </AnimatedPage>
          }
        />

        {/* Rute yang Dilindungi (butuh login) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/datadiri"
          element={
            <ProtectedRoute>
              <DataDiri />
            </ProtectedRoute>
          }
        />
        <Route
          path="/informasi"
          element={
            <ProtectedRoute>
              <Informasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactionInput"
          element={
            <ProtectedRoute>
              <TransactionInputPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactionList"
          element={
            <ProtectedRoute>
              <TransactionListPage />
            </ProtectedRoute>
          }
        />

        {/* === RUTE BARU UNTUK FITUR GOALS === */}
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <BudgetAndGoals />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
