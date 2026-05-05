import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";

import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { LoginRegisterModal } from "@/components/LoginRegisterModal";
import ChatBot from "@/components/ChatBot";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Vouchers from "./pages/Vouchers";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

function AppContent() {
  const { loginModalOpen, setLoginModalOpen, user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith("/admin");

  const handleLoginSuccess = (userData) => {
    login(userData, localStorage.getItem("token"));
    setLoginModalOpen(false);

    if (userData.role === "admin") {
      navigate("/admin");
    }
  };

  // 🔒 Protect admin route
  useEffect(() => {
    if (isAdminPage && user && user.role !== "admin") {
      navigate("/");
    }
  }, [isAdminPage, user, navigate]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* HEADER + CART */}
      {!isAdminPage && (
        <>
          <Header />
          <CartDrawer />
        </>
      )}

      {/* LOGIN MODAL */}
      <LoginRegisterModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* ROUTES */}
      <main className={!isAdminPage ? "min-h-screen" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* FOOTER */}
      {!isAdminPage && (
        <>
          <Footer />
          <ChatBot />
        </>
      )}
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {/* 🔥 QUAN TRỌNG: bọc toàn bộ app */}
          <CartProvider>
            <AppContent />
          </CartProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}