import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    // Update AuthContext
    login(userData, localStorage.getItem('token'));
    
    // Đóng modal
    setLoginModalOpen(false);
    
    // Auto redirect admin sang trang admin
    if (userData.role === 'admin') {
      window.location.href = 'http://localhost:5173';
    }
  };

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartProvider>
            <Header />
            <CartDrawer />
            <LoginRegisterModal
              isOpen={loginModalOpen}
              onClose={() => setLoginModalOpen(false)}
              onLoginSuccess={handleLoginSuccess}
            />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <ChatBot />
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
