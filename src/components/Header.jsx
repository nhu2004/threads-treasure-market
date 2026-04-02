import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, Heart, User, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout, setLoginModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/shop", label: "Cửa hàng" },
    { to: "/shop?category=ao", label: "Áo" },
    { to: "/shop?category=dam", label: "Đầm" },
    { to: "/shop?category=quan", label: "Quần" },
    { to: "/shop?category=phu-kien", label: "Phụ kiện" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-body tracking-widest uppercase">
        Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            MAISON
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-body font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/shop" className="p-2 text-foreground hover:text-muted-foreground transition-colors">
              <Search size={20} />
            </Link>
            <button className="p-2 text-foreground hover:text-muted-foreground transition-colors hidden md:block">
              <Heart size={20} />
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-foreground hover:text-muted-foreground transition-colors relative"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative md:block hidden">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 text-foreground hover:text-muted-foreground transition-colors"
              >
                <User size={20} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b">
                        <p className="font-medium">{currentUser.fullName || currentUser.username}</p>
                        <p className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                      </div>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => window.location.href = 'http://localhost:5173'}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          Quan lý Admin
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setLoginModalOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Đăng nhập / Đăng ký
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-background"
          >
            <nav className="flex flex-col py-4 px-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-sm font-body font-medium tracking-wide uppercase text-foreground hover:text-muted-foreground transition-colors border-b border-border last:border-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
