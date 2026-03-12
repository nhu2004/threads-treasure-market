import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const shippingFee = totalPrice >= 1000000 ? 0 : 30000;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <CheckCircle size={64} className="mx-auto text-green-600 mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Đặt hàng thành công!</h1>
          <p className="font-body text-muted-foreground mb-8">
            Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
          </p>
          <Link
            to="/"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 font-body text-sm font-semibold uppercase tracking-widest"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-muted-foreground mb-4">Giỏ hàng trống</p>
          <Link to="/shop" className="font-body text-sm underline text-foreground">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-foreground mb-10">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Thông tin giao hàng</h2>

            {[
              { label: "Họ và tên", key: "name", type: "text", required: true },
              { label: "Số điện thoại", key: "phone", type: "tel", required: true },
              { label: "Email", key: "email", type: "email", required: false },
            ].map((field) => (
              <div key={field.key}>
                <label className="font-body text-sm text-foreground block mb-1.5">
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </label>
                <input
                  type={field.type}
                  required={field.required}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-4 py-3 border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            ))}

            <div>
              <label className="font-body text-sm text-foreground block mb-1.5">
                Địa chỉ giao hàng <span className="text-destructive">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="font-body text-sm text-foreground block mb-1.5">Ghi chú</label>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Đặt hàng — {formatPrice(totalPrice + shippingFee)}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-secondary p-6 sticky top-32">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">Đơn hàng</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-18 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-foreground truncate">{item.product.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{item.size} / {item.color} x{item.quantity}</p>
                      <p className="font-body text-sm font-semibold text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-foreground">{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-body text-base font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Tổng cộng</span>
                  <span className="text-foreground">{formatPrice(totalPrice + shippingFee)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
