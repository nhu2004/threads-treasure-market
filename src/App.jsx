import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { LoginRegisterModal } from "@/components/LoginRegisterModal";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import ChatBot from "@/components/ChatBot";

const queryClient = new QueryClient();

function AppContent() {
  const { loginModalOpen, setLoginModalOpen, user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLoginSuccess = (userData) => {
    // Update AuthContext
    login(userData, localStorage.getItem('token'));
    
    // Đóng modal
    setLoginModalOpen(false);
    
    // Auto redirect admin sang trang admin
    if (userData.role === 'admin') {
      navigate('/admin');
    }
  };

  // Protect admin route
  useEffect(() => {
    if (isAdminPage && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAdminPage, user, navigate]);

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!isAdminPage && <CartProvider>
          <Header />
          <CartDrawer />
        </CartProvider>}
        <LoginRegisterModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <main className={!isAdminPage ? "min-h-screen" : ""}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminPage && (
          <>
            <Footer />
            <ChatBot />
          </>
        )}
      </TooltipProvider>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
