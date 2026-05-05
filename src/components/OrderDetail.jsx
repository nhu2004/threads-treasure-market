// Client/src/components/OrderDetail.jsx
import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import moment from "moment";
import { FaArrowLeft } from "react-icons/fa";
import format from "../helper/format";
import orderApi from "../api/orderApi";

export default function OrderDetail({ orderId, data, onBack }) {
  const [orderDetail, setOrderDetail] = useState(data || null);
  const [loading, setLoading] = useState(!data);

  // BIẾN THÔNG MINH: Nếu file cha có truyền 'onBack', nó tự hiểu là dạng Popup nổi.
  // Nếu không truyền (như ở trang Lịch sử), nó sẽ chỉ hiện nội dung bình thường.
  const isOverlay = Boolean(onBack);

  useEffect(() => {
    if (data) {
      setOrderDetail(data);
      setLoading(false);
      return;
    }

    if (!orderId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getById(orderId);
        setOrderDetail(res.data || res);
      } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orderId, data]);

  if (loading) return (
    isOverlay ? (
      <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
        <Spinner animation="border" variant="light"/>
      </div>
    ) : (
      <div className="text-center py-10"><Spinner animation="border" variant="success"/></div>
    )
  );
  
  if (!orderDetail) return (
    isOverlay ? (
      <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl">Không thể tải dữ liệu đơn hàng!</div>
      </div>
    ) : (
      <div className="text-center py-10 text-gray-500">Không thể tải dữ liệu đơn hàng!</div>
    )
  );

  const id = orderDetail.id || orderDetail._id || orderDetail.OrderID;
  const orderDate = orderDetail.orderDate || orderDetail.createdAt;
  
  const statusText = typeof orderDetail.orderStatus === 'object' ? orderDetail.orderStatus?.text : orderDetail.status || "Chờ xử lý";
  
  let paymentText = typeof orderDetail.paymentStatus === 'object' ? orderDetail.paymentStatus?.text : orderDetail.paymentStatus;
  if (!paymentText || paymentText === "Chưa hỗ trợ DB") {
      paymentText = "Thanh toán khi nhận hàng";
  }
  
  const fullName = orderDetail.delivery?.fullName || orderDetail.fullName;
  const phone = orderDetail.delivery?.phoneNumber || orderDetail.delivery?.phone || orderDetail.phone;
  const address = orderDetail.delivery?.address || orderDetail.address;

  const subTotal = orderDetail.cost?.subTotal || orderDetail.subTotal || orderDetail.totalPrice || orderDetail.Total;
  const discount = orderDetail.cost?.discount || orderDetail.discountAmount || orderDetail.discount || 0;
  const total = orderDetail.cost?.total || orderDetail.total || orderDetail.totalPrice || orderDetail.Total;

  const products = orderDetail.products || orderDetail.orderItems || [];

  // GÓI TOÀN BỘ PHẦN RUỘT VÀO MỘT BIẾN
  const innerContent = (
    <div className={`bg-white w-full font-sans ${isOverlay ? 'max-w-5xl rounded-xl shadow-2xl p-6 relative animate-fade-in my-auto border border-gray-200' : 'p-2'}`}>
      
      {/* CHỈ HIỆN NÚT ĐÓNG NẾU LÀ DẠNG POPUP OVERLAY */}
      {isOverlay && (
        <div className="mb-4 border-b border-gray-100 pb-4">
          <button 
            onClick={() => onBack()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:text-white hover:bg-red-500 rounded-lg font-semibold transition-colors w-fit"
          >
            <FaArrowLeft /> Đóng chi tiết
          </button>
        </div>
      )}

      {/* Thông tin chung */}
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Mã đơn: <span className="text-gray-500 font-normal">#{id}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Ngày đặt: {moment(orderDate).format("DD/MM/YYYY HH:mm")}</p>
        </div>
        <div className="text-left md:text-right mt-3 md:mt-0 flex gap-2">
          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium h-fit">
            {statusText}
          </span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium h-fit ${paymentText === "Đã thanh toán" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
            {paymentText}
          </span>
        </div>
      </div>

      {/* Thông tin giao hàng */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">
          Thông tin nhận hàng
        </h3>
        <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <p className="text-sm mb-2"><span className="text-gray-600 inline-block w-28">Người nhận:</span> <span className="text-gray-900 font-medium">{fullName || 'N/A'}</span></p>
            <p className="text-sm mb-2"><span className="text-gray-600 inline-block w-28">Điện thoại:</span> <span className="text-gray-900 font-medium">{phone || 'N/A'}</span></p>
            <p className="text-sm"><span className="text-gray-600 inline-block w-28">Địa chỉ:</span> <span className="text-gray-900">{address || 'N/A'}</span></p>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">
          Sản phẩm đã đặt
        </h3>
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-medium">Sản phẩm</th>
                  <th className="p-4 text-center font-medium whitespace-nowrap">Đơn giá</th>
                  <th className="p-4 text-center font-medium">SL</th>
                  <th className="p-4 text-right font-medium whitespace-nowrap">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {products?.length > 0 ? products.map((item, index) => {
                  const productName = item.name || item.product?.name || item.ProductName || "Sản phẩm";
                  const productImage = item.image || item.product?.image || item.ProductImage || "https://via.placeholder.com/50";
                  
                  return (
                    <tr key={item.id || item._id || index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 flex items-center gap-4 min-w-[250px]">
                        <img src={productImage} alt={productName} className="w-12 h-12 rounded border border-gray-200 object-cover" />
                        <span className="font-medium text-gray-800">{productName}</span>
                      </td>
                      <td className="p-4 text-center text-gray-600">{format.formatPrice(item.price)}</td>
                      <td className="p-4 text-center text-gray-700">{item.quantity}</td>
                      <td className="p-4 text-right font-bold text-emerald-600">{format.formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Chưa có thông tin sản phẩm chi tiết</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tổng kết tiền */}
      <div className="flex justify-end mt-4">
        <div className="w-full md:w-80 p-2 text-sm">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-medium text-gray-800">{format.formatPrice(subTotal)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Giảm giá:</span>
            <span className="font-medium text-red-500">-{format.formatPrice(discount)}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <span className="font-bold text-gray-800 uppercase tracking-wide">Tổng cộng:</span>
            <span className="font-bold text-xl text-emerald-600">{format.formatPrice(total)}</span>
          </div>
        </div>
      </div>

    </div>
  );

  // KẾT QUẢ ĐẦU RA DỰA TRÊN NGỮ CẢNH:
  
  // 1. Nếu đang ở trang Quản lý đơn hàng (Có onBack) -> Bọc màn đen làm Popup
  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 flex items-start justify-center overflow-y-auto py-10 px-4">
        {innerContent}
      </div>
    );
  }

  // 2. Nếu đang ở Lịch sử giao dịch -> Chỉ ném ra cái ruột để nhét vừa vào Modal hiện tại
  return innerContent;
}