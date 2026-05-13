import { useState, useEffect } from "react";
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
  
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState("");

  const [rankDiscountAmount, setRankDiscountAmount] = useState(0);
  const [rankVoucherInfo, setRankVoucherInfo] = useState(null);

  const shippingFee = totalPrice >= 1000000 ? 0 : 30000; 
  // Tổng tiền gom gọn lại 1 biến duy nhất
  const finalTotal = totalPrice + shippingFee - rankDiscountAmount - discountAmount;

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
// Lấy danh sách Voucher khi trang vừa load
 useEffect(() => {
  const fetchRankDiscount = async () => {
    if (!user) return;
    try {
      const response = await voucherApi.getUserVouchers(user.id);
      const vouchers = Array.isArray(response) ? response : (response.vouchers || []);
      
      // TÌM ƯU ĐÃI THEO HẠNG (Phải khớp TargetRankID với RankID của User)
      const currentRankId = user.RankID || user.rankId || 1;
      const rankVoucher = vouchers.find(v => v.VoucherType === 'RankBased' && v.TargetRankID === currentRankId);
      
      if (rankVoucher) {
        let rDiscount = 0;
        if (rankVoucher.ByType === "percent") {
            // Tính theo %: (Tổng tiền đơn * % giảm) / 100
            rDiscount = (totalPrice * rankVoucher.Value) / 100;
            
            // KIỂM TRA GIẢM TỐI ĐA: Nếu tiền giảm vượt quá MaxDiscountAmount thì chỉ lấy Max
            if (rankVoucher.MaxDiscountAmount && rDiscount > rankVoucher.MaxDiscountAmount) {
                rDiscount = rankVoucher.MaxDiscountAmount;
            }
        } else {
            // Giảm theo số tiền cố định
            rDiscount = rankVoucher.Value;
        }
        setRankDiscountAmount(rDiscount);
        setRankVoucherInfo(rankVoucher);
      }
    } catch (err) { console.error("Lỗi lấy ưu đãi Rank", err); }
  };
  fetchRankDiscount();
}, [user, totalPrice]); 


  const handleApplyVoucher = async () => {
    try {
      setVoucherError("");
      if (!voucherCode.trim()) {
        return setVoucherError("Vui lòng nhập mã giảm giá.");
      }

      const response = await voucherApi.getUserVouchers(user.id);
      const vouchers = Array.isArray(response) ? response : (response.vouchers || response.data || []);
      
      // SỬA: Thêm optional chaining (?.) để chống sập trang và đổi thành x.IsUsed
      const v = vouchers.find(x => 
        x.Code && 
        x.Code.toUpperCase() === voucherCode.trim().toUpperCase() && 
        (x.IsUsed === false || x.IsUsed === 0 || !x.used)
      );

      if (!v) return setVoucherError("Mã giảm giá không hợp lệ, không tồn tại hoặc đã sử dụng.");
      if (totalPrice < v.MinOrderValue) return setVoucherError(`Đơn hàng tối thiểu ${formatPrice(v.MinOrderValue)} để áp dụng mã này.`);

      let discount = 0;
      if (v.ByType === "percent") { 
        discount = (totalPrice * v.Value) / 100;
        if (v.MaxDiscountAmount && discount > v.MaxDiscountAmount) {
          discount = v.MaxDiscountAmount;
        }
      } else {
        discount = v.Value;
      }
      setAppliedVoucher(v);
      setDiscountAmount(discount);
    } catch (error) {
      setVoucherError("Lỗi khi kiểm tra mã.");
    }
  }; 

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
        voucherId: appliedVoucher?.VoucherID || null, // Chỉ đánh dấu mã nhập tay là đã sử dụng
        status: 'pending',
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
          <Link to="/" className="inline-block bg-zinc-950 text-primary-foreground px-8 py-4 font-body text-sm font-semibold uppercase tracking-widest mt-6">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-center"><p>Vui lòng đăng nhập để thanh toán!</p></div>;
  if (items.length === 0) return <div className="min-h-screen flex items-center justify-center text-center"><p>Giỏ hàng trống</p></div>;

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-foreground mb-10">Thanh toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            {/* Các trường input form giữ nguyên như cũ của bạn */}
            <h2 className="font-display text-xl font-semibold text-foreground">Thông tin giao hàng</h2>
            <div><label className="block mb-1.5">Họ và tên *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border focus:ring-1" /></div>
            <div><label className="block mb-1.5">Số điện thoại *</label><input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 border focus:ring-1" /></div>
            <div><label className="block mb-1.5">Địa chỉ *</label><textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 border focus:ring-1" /></div>
            <button type="submit" className="w-full bg-zinc-950 text-white py-4 font-bold uppercase tracking-widest hover:opacity-90">Đặt hàng — {formatPrice(finalTotal)}</button>
          </form>

          <div className="lg:col-span-2">
            <div className="bg-gray-100 p-6 sticky top-32">
              <h2 className="font-display text-xl font-semibold mb-6">Đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <img src={item.product.image} className="w-14 h-18 object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size} / {item.color} x{item.quantity}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-300">
                <label className="text-sm font-medium block mb-2">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input type="text" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} placeholder="Nhập mã..." className="flex-1 px-3 py-2 border" disabled={!!appliedVoucher} />
                  <button type="button" onClick={appliedVoucher ? () => {setAppliedVoucher(null); setDiscountAmount(0); setVoucherCode("");} : handleApplyVoucher} className={`px-4 py-2 text-xs font-bold uppercase text-white ${appliedVoucher ? "bg-red-500" : "bg-zinc-950"}`}>
                    {appliedVoucher ? "Hủy" : "Áp dụng"}
                  </button>
                </div>
                {voucherError && <p className="text-red-500 text-xs mt-1">{voucherError}</p>}
                {appliedVoucher && <p className="text-green-600 text-xs mt-1 italic">Đã áp dụng mã: {appliedVoucher.Name}</p>}
              </div>

              <div className="border-t border-gray-300 mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Tạm tính</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Phí vận chuyển</span><span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Giảm giá mã nhập</span><span>-{formatPrice(discountAmount)}</span></div>}
                {rankDiscountAmount > 0 && <div className="flex justify-between text-sm text-amber-600 font-bold"><span>Ưu đãi hạng ({rankVoucherInfo?.Name})</span><span>-{formatPrice(rankDiscountAmount)}</span></div>}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300"><span>Tổng cộng</span><span>{formatPrice(finalTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Checkout;