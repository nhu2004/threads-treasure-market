import { useState } from "react";
import { useCart } from "@/contexts/CartContext"; 
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import orderApi from "../api/orderApi";
import voucherApi from "../api/voucherApi";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  // --- BỔ SUNG STATE CHO VOUCHER ---
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState("");

  // FIX: Chỉ khai báo phí ship 1 lần duy nhất theo yêu cầu của bạn
  const shippingFee = totalPrice >= 1000000 ? 0 : 30000; 

  const [form, setForm] = useState({
    name: user?.fullName || "", 
    phone: user?.phone || "",     
    email: user?.email || "",   
    address: user?.address || "", 
    note: "",
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleApplyVoucher = async () => {
    try {
      setVoucherError("");
      const response = await voucherApi.getUserVouchers(user.id);
      const vouchers = response.vouchers || [];
      
      const v = vouchers.find(x => x.Code.toUpperCase() === voucherCode.toUpperCase() && !x.used);

      if (!v) {
        setVoucherError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        return;
      }

      if (totalPrice < v.MinOrderValue) {
        setVoucherError(`Đơn hàng tối thiểu ${formatPrice(v.MinOrderValue)} để áp dụng mã này.`);
        return;
      }

      let discount = 0;
      // SỬA TẠI ĐÂY: Dùng "percent" thay vì "Percentage" để khớp với DB
      if (v.ByType === "percent") { 
        discount = (totalPrice * v.Value) / 100;
        
        // Kiểm tra mức giảm tối đa (MaxDiscountAmount)
        if (v.MaxDiscountAmount && discount > v.MaxDiscountAmount) {
          discount = v.MaxDiscountAmount;
        }
      } else {
        // Trường hợp "amount" - giảm theo số tiền cố định
        discount = v.Value;
      }

      setAppliedVoucher(v);
      setDiscountAmount(discount);
    } catch (error) {
      setVoucherError("Lỗi khi kiểm tra mã.");
    }
  };

  // Tổng tiền cuối cùng = Tạm tính + Phí ship - Giảm giá
  const finalTotal = totalPrice + shippingFee - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        userId: user?.id || null,
        customer: form,
        items: items,
        totalPrice: finalTotal, 
        subTotal: totalPrice,
        discountAmount: discountAmount,
        voucherId: appliedVoucher?.VoucherID || null,
        status: 'pending',
        createdAt: new Date()
      };
      
      await orderApi.create(orderData);
      setSubmitted(true);
      clearCart();
    } catch (error) {
      alert("Có lỗi khi đặt hàng, vui lòng thử lại!");
    }
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
            className="inline-block bg-zinc-950 text-primary-foreground px-8 py-4 font-body text-sm font-semibold uppercase tracking-widest"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }
// --- ĐOẠN NÀY ĐỂ BẢO VỆ TRANG CHECKOUT ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-muted-foreground mb-4">Vui lòng đăng nhập để tiến hành thanh toán!</p>
          <Link to="/shop" className="font-body text-sm underline text-foreground">
            Quay lại cửa hàng
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
              className="w-full bg-zinc-950 text-primary-foreground py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Đặt hàng — {formatPrice(finalTotal)}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 text-gray-900 p-6 sticky top-32">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">Đơn hàng</h2>
              
              {/* List sản phẩm */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-18 object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-foreground truncate">{item.product.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{item.size} / {item.color} x{item.quantity}</p>
                      <p className="font-body text-sm font-semibold text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ô NHẬP VOUCHER */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <label className="text-sm font-medium block mb-2">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã..."
                    className="flex-1 px-3 py-2 border border-border bg-white text-sm focus:outline-none"
                    disabled={!!appliedVoucher}
                  />
                  <button
                    type="button"
                    onClick={appliedVoucher ? () => {setAppliedVoucher(null); setDiscountAmount(0); setVoucherCode("");} : handleApplyVoucher}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                      appliedVoucher ? "bg-red-500 text-white" : "bg-zinc-950 text-white"
                    }`}
                  >
                    {appliedVoucher ? "Hủy" : "Áp dụng"}
                  </button>
                </div>
                {voucherError && <p className="text-red-500 text-xs mt-1">{voucherError}</p>}
                {appliedVoucher && <p className="text-green-600 text-xs mt-1 italic">Đã áp dụng mã: {appliedVoucher.Name}</p>}
              </div>

              {/* Tính toán tổng tiền */}
              <div className="border-t border-gray-300 mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(finalTotal)}</span>
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