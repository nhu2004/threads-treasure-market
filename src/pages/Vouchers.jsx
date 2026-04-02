import { useAuth } from "@/contexts/AuthContext";
import { Gift, Copy, Calendar, AlertCircle } from "lucide-react";

const Vouchers = () => {
  const { user } = useAuth();

  // Mock data - sẽ fetch từ API sau
  const vouchers = [
    {
      id: "VOUCHERADICCLUB10",
      code: "ADICLUB10",
      title: "voucher adiClub 10%",
      discount: "10%",
      expiryDate: "2025-04-03",
      description: "Giảm 10% cho tất cả sản phẩm",
      used: false,
    },
    {
      id: "VOUCHERSPRING20",
      code: "SPRING20",
      title: "Mùa xuân 20%",
      discount: "20%",
      expiryDate: "2025-05-01",
      description: "Giảm 20% cho đơn hàng từ 1 triệu",
      used: false,
    },
    {
      id: "VOUCHERFREESHIP",
      code: "FREESHIP",
      title: "Miễn phí vận chuyển",
      discount: "Free",
      expiryDate: "2025-04-15",
      description: "Miễn phí vận chuyển cho bất kỳ đơn hàng nào",
      used: true,
    },
  ];

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert("Đã sao chép mã: " + code);
  };

  const isExpired = (date) => new Date(date) < new Date();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">Vui lòng đăng nhập để xem voucher</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Voucher của bạn</h1>
          <p className="text-muted-foreground mt-2">
            Bạn có {vouchers.filter((v) => !v.used && !isExpired(v.expiryDate)).length} voucher khả dụng
          </p>
        </div>

        {/* Active Vouchers */}
        <div>
          <h2 className="text-lg font-bold mb-4">Voucher khả dụng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {vouchers
              .filter((v) => !v.used && !isExpired(v.expiryDate))
              .map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
                >
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift size={20} className="text-primary" />
                          <h3 className="font-bold">{voucher.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{voucher.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{voucher.discount}</p>
                      </div>
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Calendar size={14} />
                      <span>Hết hạn: {new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}</span>
                    </div>

                    {/* Code */}
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Mã code</p>
                          <p className="font-mono font-bold text-foreground">{voucher.code}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(voucher.code)}
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
        </div>

        {/* Used/Expired Vouchers */}
        {vouchers.filter((v) => v.used || isExpired(v.expiryDate)).length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Voucher không khả dụng
            </h2>
            <div className="space-y-3">
              {vouchers
                .filter((v) => v.used || isExpired(v.expiryDate))
                .map((voucher) => (
                  <div
                    key={voucher.id}
                    className="bg-gray-100 rounded-lg p-4 opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{voucher.title}</p>
                        <p className="text-sm text-gray-600">
                          {voucher.used
                            ? "Đã sử dụng"
                            : "Đã hết hạn - " +
                              new Date(voucher.expiryDate).toLocaleDateString(
                                "vi-VN"
                              )}
                        </p>
                      </div>
                      <p className="font-bold text-gray-400">{voucher.discount}</p>
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
