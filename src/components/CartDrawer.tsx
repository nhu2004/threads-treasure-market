import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Giỏ hàng ({totalItems})
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 text-foreground hover:text-muted-foreground">
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-muted-foreground mb-4" />
                  <p className="font-body text-muted-foreground">Giỏ hàng trống</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 font-body text-sm underline text-foreground"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover bg-secondary flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body text-sm font-medium text-foreground truncate">{item.product.name}</h3>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">
                          {item.size} / {item.color}
                        </p>
                        <p className="font-body text-sm font-semibold text-foreground mt-1">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                            }
                            className="p-1 border border-border text-foreground hover:bg-secondary"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-body text-sm w-6 text-center text-foreground">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                            }
                            className="p-1 border border-border text-foreground hover:bg-secondary"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="ml-auto font-body text-xs text-muted-foreground hover:text-destructive underline"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-muted-foreground">Tạm tính</span>
                  <span className="font-body text-lg font-semibold text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full bg-primary text-primary-foreground text-center py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Thanh toán
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
