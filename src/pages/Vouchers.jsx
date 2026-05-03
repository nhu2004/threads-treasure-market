import { useAuth } from "../contexts/AuthContext";
import { Gift, Copy, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import voucherApi from "../api/voucherApi"; // Đảm bảo đường dẫn import đúng thư mục của bạn

const Vouchers = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu từ DB thông qua API
  useEffect(() => {
    const fetchUserVouchers = async () => {
      if (user?.id) { // Đảm bảo user object của bạn có thuộc tính id
        try {
          setLoading(true);
          const data = await voucherApi.getUserVouchers(user.id);
          setVouchers(data.vouchers || []);
        } catch (error) {
          console.error("Lỗi khi tải voucher:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserVouchers();
  }, [user]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert("Đã sao chép mã: " + code);
  };

  const isExpired = (date) => new Date(date) < new Date();

  // Hàm xử lý hiển thị linh hoạt tiền mặt hay phần trăm
  const formatDiscount = (value, byType) => {
    if (byType === 'percent') return `${value}%`;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">Vui lòng đăng nhập để xem voucher</p>
        </div>
      </div>
    );
  }

  if (loading) {
     return <div className="text-center py-12">Đang tải danh sách Voucher...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Voucher của bạn</h1>
          <p className="text-muted-foreground mt-2">
            Bạn có {vouchers.filter((v) => !v.used && !isExpired(v.ExpiryDate)).length} voucher khả dụng
          </p>
        </div>

        {/* Active Vouchers */}
        <div>
          <h2 className="text-lg font-bold mb-4">Voucher khả dụng</h2>
          {vouchers.filter((v) => !v.used && !isExpired(v.ExpiryDate)).length === 0 ? (
            <p className="text-sm text-gray-500 mb-8">Bạn chưa có voucher nào khả dụng.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {vouchers
                .filter((v) => !v.used && !isExpired(v.ExpiryDate))
                .map((voucher) => (
                  <div
                    key={voucher.VoucherID}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
                  >
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift size={20} className="text-primary" />
                            <h3 className="font-bold">{voucher.Name || voucher.VoucherType}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{voucher.Description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {formatDiscount(voucher.Value, voucher.ByType)}
                          </p>
                        </div>
                      </div>

                      {/* Expiry */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <Calendar size={14} />
                        <span>Hết hạn: {new Date(voucher.ExpiryDate).toLocaleDateString("vi-VN")}</span>
                      </div>

                      {/* Code */}
                      <div className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Mã code</p>
                            <p className="font-mono font-bold text-foreground">{voucher.Code}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(voucher.Code)}
                            className="p-2 hover:bg-white rounded transition-colors"
                          >
                            <Copy size={16} className="text-primary" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Used/Expired Vouchers */}
        {vouchers.filter((v) => v.used || isExpired(v.ExpiryDate)).length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Voucher không khả dụng
            </h2>
            <div className="space-y-3">
              {vouchers
                .filter((v) => v.used || isExpired(v.ExpiryDate))
                .map((voucher) => (
                  <div
                    key={`history-${voucher.VoucherID}`}
                    className="bg-gray-100 rounded-lg p-4 opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{voucher.Name || voucher.VoucherType}</p>
                        <p className="text-sm text-gray-600">
                          {voucher.used
                            ? "Đã sử dụng"
                            : "Đã hết hạn - " +
                              new Date(voucher.ExpiryDate).toLocaleDateString(
                                "vi-VN"
                              )}
                        </p>
                      </div>
                      <p className="font-bold text-gray-400">
                        {formatDiscount(voucher.Value, voucher.ByType)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vouchers;