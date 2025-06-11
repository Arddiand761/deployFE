import React, { useState, useEffect } from "react";
import { User, Home, Target, CreditCard, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false); // Close mobile menu on desktop
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Close mobile menu first
    setIsMobileMenuOpen(false);

    // Redirect ke halaman login
    navigate("/");

    console.log("Successfully logged out");
  };

  // const toggleMobileMenu = () => {
  //   setIsMobileMenuOpen(!isMobileMenuOpen);
  // };

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
    <>
      {/* Main Navbar */}
      <nav className="w-full bg-emerald-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg fixed top-0 left-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="SecondaryLogo.svg"
            alt="BudgetEase Logo"
            className="h-8 w-8"
            onError={(e) =>
              (e.target.src =
                "https://placehold.co/32x32/10b981/ffffff?text=BE")
            }
          />
          <span className="text-xl font-bold">BudgetEase</span>
        </div>

        {/* Desktop Menu Items */}
        <div className="hidden md:flex gap-2 lg:gap-4">
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
              <span className="font-medium hidden lg:inline">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Logout Button - BOTH DESKTOP & MOBILE */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-red-600 active:bg-red-700 bg-red-500 text-white font-medium shadow-md touch-manipulation transform active:scale-95"
        >
          <LogOut size={18} />
          <span className="font-medium hidden sm:inline">Log Out</span>
        </button>
      </nav>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-30 md:hidden shadow-lg">
          <div className="flex justify-around">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 touch-manipulation ${
                  location.pathname === item.path
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                <div className="p-1.5 rounded-lg">{item.icon}</div>
                <span className="text-xs font-medium mt-1 text-center">
                  {item.name.split(" ")[0]} {/* First word only */}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
