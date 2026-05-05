// Client/src/components/HistoryOrder.jsx
import { useState, useEffect } from "react";
import { Spinner, Modal } from "react-bootstrap";
import moment from "moment";
import { FaEye } from "react-icons/fa";
import format from "../helper/format";
import orderApi from "../api/orderApi";
import OrderDetail from "./OrderDetail";

export default function HistoryOrder({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Modal Chi tiết
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getUserOrders(userId);
        setOrders(res.orders || []);
      } catch (error) {
        console.error("Lỗi lấy lịch sử", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  const handleViewDetail = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDetail(true);
  };

  return (
    <div>
      {/* BẢNG LỊCH SỬ ĐƠN HÀNG */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-center">STT</th>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3 text-center">Ngày đặt</th>
              <th className="px-4 py-3 text-center">Tổng tiền</th>
              <th className="px-4 py-3 text-center">Tình trạng</th>
              <th className="px-4 py-3 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8"><Spinner animation="border" variant="success"/></td></tr>
            ) : orders.length > 0 ? (
              orders.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">#{item.id}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{moment(item.orderDate).format("DD/MM/YYYY HH:mm")}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-600">{format.formatPrice(item.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                      {item.status || "Chờ xử lý"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleViewDetail(item.id)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Khách hàng này chưa mua gì!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG LỒNG BÊN TRONG */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered dialogClassName="modal-w1100">
        <Modal.Body className="p-0">
          {/* Nhúng Component OrderDetail vào đây, truyền ID sang */}
          {selectedOrderId && <OrderDetail orderId={selectedOrderId} />}
        </Modal.Body>
        <Modal.Footer className="bg-gray-50">
          <button onClick={() => setShowDetail(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg">Đóng</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}