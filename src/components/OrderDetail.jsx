// Client/src/components/OrderDetail.jsx
import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import moment from "moment";
import format from "../helper/format";
import orderApi from "../api/orderApi";

export default function OrderDetail({ orderId }) {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getById(orderId);
        setOrderDetail(res.data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orderId]);

  if (loading) return <div className="text-center py-10"><Spinner animation="border" variant="success"/></div>;
  if (!orderDetail) return <div className="text-center py-10 text-gray-500">Không thể tải dữ liệu đơn hàng!</div>;

  return (
    <div className="bg-white p-6 rounded-lg">
      {/* Thông tin chung */}
      <div className="flex flex-col md:flex-row justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Mã đơn: #{orderDetail.id}</h2>
          <p className="text-sm text-gray-500 mt-1">Ngày đặt: {moment(orderDetail.orderDate).format("DD/MM/YYYY HH:mm")}</p>
        </div>
        <div className="text-right mt-3 md:mt-0">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mr-2">
            {orderDetail.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${orderDetail.paymentStatus === "Đã thanh toán" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
            {orderDetail.paymentStatus}
          </span>
        </div>
      </div>

      {/* Thông tin giao hàng */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase">Thông tin nhận hàng</h3>
        <p className="mb-1"><span className="font-semibold text-gray-600">Người nhận:</span> {orderDetail.delivery?.fullName}</p>
        <p className="mb-1"><span className="font-semibold text-gray-600">SĐT:</span> {orderDetail.delivery?.phone}</p>
        <p className="mb-0"><span className="font-semibold text-gray-600">Địa chỉ:</span> {orderDetail.delivery?.address}</p>
      </div>

      {/* Danh sách sản phẩm */}
      <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase">Sản phẩm đã đặt</h3>
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3 text-center">Đơn giá</th>
              <th className="p-3 text-center">SL</th>
              <th className="p-3 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orderDetail.products?.map((item) => (
              <tr key={item.id}>
                <td className="p-3 flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border" />
                  <span className="font-medium text-gray-800">{item.name}</span>
                </td>
                <td className="p-3 text-center text-gray-600">{format.formatPrice(item.price)}</td>
                <td className="p-3 text-center font-medium">{item.quantity}</td>
                <td className="p-3 text-right font-bold text-emerald-600">{format.formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tổng kết tiền */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/2 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-semibold">{format.formatPrice(orderDetail.subTotal)}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">Giảm giá:</span>
            <span className="font-semibold text-red-500">-{format.formatPrice(orderDetail.discount)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
            <span className="font-bold text-gray-800 uppercase">Tổng cộng:</span>
            <span className="font-bold text-xl text-emerald-600">{format.formatPrice(orderDetail.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}