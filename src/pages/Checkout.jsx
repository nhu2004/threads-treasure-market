import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import orderApi from "../api/orderApi";

// format price (FIX CRASH)
const formatPrice = (price) =>
  (price ?? 0).toLocaleString("vi-VN") + " đ";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const safeItems = Array.isArray(items) ? items : [];

  const shippingFee = totalPrice >= 1000000 ? 0 : 30000;

  // CHECKOUT API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (safeItems.length === 0) return;

    try {
      setLoading(true);

      const orderData = {
        customer: form,
        items: safeItems.map((item) => ({
          productId: item.product?.id,
          name: item.product?.name,
          price: item.product?.price,
          image: item.product?.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        totalPrice: totalPrice + shippingFee,
        shippingFee,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await orderApi.create(orderData);

      clearCart();
      setSubmitted(true);
    } catch (error) {
      console.error("Order error:", error);
      alert("Có lỗi khi đặt hàng, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <CheckCircle size={64} className="mx-auto text-green-600 mb-6" />
          <h1 className="text-3xl font-bold mb-3">
            Đặt hàng thành công!
          </h1>
          <p className="text-muted-foreground mb-8">
            Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.
          </p>

          <Link
            to="/"
            className="inline-block bg-black text-white px-8 py-4"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // EMPTY CART (SAFE)
  if (!safeItems || safeItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Giỏ hàng trống</p>
          <Link to="/shop" className="underline">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-10">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* FORM */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">

            <input
              placeholder="Họ tên"
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border p-3"
            />

            <input
              placeholder="Số điện thoại"
              required
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="w-full border p-3"
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border p-3"
            />

            <textarea
              placeholder="Địa chỉ"
              required
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              className="w-full border p-3"
            />

            <textarea
              placeholder="Ghi chú"
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
              className="w-full border p-3"
            />

            <button
              disabled={loading}
              className="w-full bg-black text-white py-4"
            >
              {loading
                ? "Đang xử lý..."
                : `Đặt hàng — ${formatPrice(
                    totalPrice + shippingFee
                  )}`}
            </button>
          </form>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-2 border p-5">
            <h2 className="text-xl font-bold mb-5">
              Đơn hàng
            </h2>

            <div className="space-y-4">
              {safeItems.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img
                    src={item.product?.image}
                    className="w-14 h-16 object-cover"
                  />

                  <div>
                    <p className="text-sm">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.size} / {item.color} x
                      {item.quantity}
                    </p>
                    <p className="font-bold">
                      {formatPrice(
                        (item.product?.price || 0) *
                          item.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <div className="flex justify-between">
              <span>Phí ship</span>
              <span>
                {shippingFee === 0
                  ? "Free"
                  : formatPrice(shippingFee)}
              </span>
            </div>

            <div className="flex justify-between font-bold mt-2">
              <span>Tổng</span>
              <span>
                {formatPrice(
                  totalPrice + shippingFee
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;