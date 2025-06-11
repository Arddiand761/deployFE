import React from "react";
import { User, Home, Target, CreditCard, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Hapus token juga

    // Redirect ke halaman login
    navigate("/");

    // Optional: Show success message
    console.log("Successfully logged out");
  };

  const menuItems = [
    { name: "Profile", icon: <User size={18} />, path: "/profile" },
    { name: "Dashboard", icon: <Home size={18} />, path: "/home" },
    { name: "Budget & Goals", icon: <Target size={18} />, path: "/goals" },
    {
      name: "Transaksi",
      icon: <CreditCard size={18} />,
      path: "/transactionList",
    },
  ];

  return (
    <nav className="w-full bg-emerald-900 text-white px-6 py-3 flex items-center justify-between shadow-lg fixed top-0 left-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src="SecondaryLogo.svg"
          alt="BudgetEase Logo"
          className="h-8 w-8"
          onError={(e) =>
            (e.target.src = "https://placehold.co/32x32/10b981/ffffff?text=BE")
          }
        />
        <span className="text-xl font-bold">BudgetEase</span>
      </div>

      {/* Menu Items */}
      <div className="flex gap-2 md:gap-4">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-emerald-800 ${
              location.pathname === item.path
                ? "bg-emerald-800 border-b-2 border-emerald-400"
                : ""
            }`}
          >
            {item.icon}
            <span className="font-medium hidden sm:inline">{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-red-600 bg-red-500"
      >
        <LogOut size={18} />
        <span className="font-medium hidden sm:inline">Log Out</span>
      </button>
    </nav>
  );
};

export default Navbar;
