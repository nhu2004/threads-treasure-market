import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

import orderApi from "../api/orderApi";
import voucherApi from "../api/voucherApi";

const formatPrice = (price) =>
  (price ?? 0).toLocaleString("vi-VN") + " đ";

const Checkout = () => {
  const { user } = useAuth();
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

  const [voucherList, setVoucherList] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);

  const safeItems = Array.isArray(items) ? items : [];

  const shippingFee = totalPrice >= 1000000 ? 0 : 30000;
  const finalTotal = totalPrice + shippingFee - discount;

  // ===== LOAD VOUCHER =====
  useEffect(() => {
    const fetchVouchers = async () => {
      if (!user?.id) return;

      try {
        const res = await voucherApi.getUserVouchers(user.id);
        setVoucherList(res.vouchers || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVouchers();
  }, [user]);

  const availableVouchers = voucherList.filter(
    (v) => !v.Used && new Date(v.ExpiryDate) > new Date()
  );

  // ===== APPLY VOUCHER =====
  const applyVoucher = (v) => {
    setSelectedVoucher(v);

    let discountAmount = 0;

    if (v.ByType === "percent") {
      discountAmount = (totalPrice * v.Value) / 100;
    } else {
      discountAmount = v.Value;
    }

    setDiscount(Math.min(discountAmount, totalPrice));
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!safeItems.length) return;

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
        totalPrice: finalTotal,
        shippingFee,
        discount,
        voucherId: selectedVoucher?.VoucherID || null,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await orderApi.create(orderData);

      clearCart();
      setSubmitted(true);
    } catch (err) {
      alert("Đặt hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // ===== SUCCESS =====
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle size={60} className="mx-auto text-green-600 mb-4" />
          <h1 className="text-2xl font-bold">Đặt hàng thành công!</h1>
          <Link to="/" className="underline mt-4 block">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // ===== EMPTY =====
  if (!safeItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link to="/shop" className="underline">
          Giỏ hàng trống - tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ===== LEFT FORM ===== */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">

            <input
              placeholder="Họ tên"
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border p-2 rounded text-sm"
            />

            <input
              placeholder="Số điện thoại"
              required
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="w-full border p-2 rounded text-sm"
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border p-2 rounded text-sm"
            />

            <textarea
              placeholder="Địa chỉ"
              required
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              className="w-full border p-2 rounded text-sm"
            />

            <textarea
              placeholder="Ghi chú"
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
              className="w-full border p-2 rounded text-sm"
            />

            {/* ===== VOUCHER ===== */}
            <div className="bg-white border rounded p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold">Voucher giảm giá</p>

                {selectedVoucher && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVoucher(null);
                      setDiscount(0);
                    }}
                    className="text-xs text-red-500"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>

              {availableVouchers.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Không có voucher khả dụng
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {availableVouchers.map((v) => {
                    const isSelected =
                      selectedVoucher?.VoucherID === v.VoucherID;

                    return (
                      <div
                        key={v.VoucherID}
                        onClick={() => applyVoucher(v)}
                        className={`p-3 rounded border cursor-pointer flex justify-between items-center transition
                          ${
                            isSelected
                              ? "bg-orange-100 border-orange-500 text-orange-700 shadow-md"
                              : "bg-white hover:bg-orange-50 border-gray-200"
                          }`}
                      >
                        <div>
                          <p className="font-medium">
                            {v.Name} {isSelected && "✔"}
                          </p>
                          <p className="text-xs opacity-70">{v.Code}</p>
                        </div>

                        <div className="font-bold">
                          {v.ByType === "percent"
                            ? `${v.Value}%`
                            : formatPrice(v.Value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded"
            >
              {loading
                ? "Đang xử lý..."
                : `Đặt hàng — ${formatPrice(finalTotal)}`}
            </button>
          </form>

          {/* ===== RIGHT SUMMARY ===== */}
          <div className="lg:col-span-2 bg-white border p-4 rounded">
            <h2 className="font-bold mb-4">Đơn hàng</h2>

            {safeItems.map((item, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <img
                  src={item.product?.image}
                  className="w-12 h-14 object-cover rounded"
                />
                <div className="text-sm">
                  <p>{item.product?.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.size} / {item.color} x {item.quantity}
                  </p>
                </div>
              </div>
            ))}

            {/* ===== TOTAL SECTION UPGRADED ===== */}
            <div className="my-4 border-t border-dashed border-gray-300"></div>

            <div className="bg-gray-50 p-3 rounded">

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Phí ship</span>
                <span>
                  {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Tổng thanh toán</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;