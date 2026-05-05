// Client/src/pages/Admin/User/CustomerList.jsx
import { useCallback, useState } from "react";
import { Badge, Spinner } from "react-bootstrap";
import { FaEye, FaSearch, FaTimes } from "react-icons/fa"; // Thêm FaTimes để làm nút tắt
import format from "../../../helper/format";
import PaginationproductStore from "../../../components/PaginationproductStore"; 
import { useCustomerList, useCustomerOrders } from "../../../hooks/admin/admin";
import OrderDetail from "../../../components/OrderDetail"; 
import HistoryOrder from "../../../components/HistoryOrder";

export default function CustomerList() {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const {
    customerData, page, setPage, loading, searchInput, setSearchInput, handleSearch,
  } = useCustomerList();

  const {
    showModal, setShowModal, showDetailModal, setShowDetailModal,
    orderDetail, fetchOrderDetail,
  } = useCustomerOrders(); 

  const handleChangePage = useCallback((page) => { setPage(page); }, [setPage]);

  const customers = customerData?.list || [];

  return (
    <div className="relative">
      {/* ========================================================= */}
      {/* 1. POPUP CHI TIẾT HÓA ĐƠN (TAILWIND CSS) */}
      {/* ========================================================= */}
      {showDetailModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header Popup */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                Hóa đơn <Badge bg="secondary" className="ml-2">{orderDetail?.id || orderDetail?._id}</Badge>
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>
            {/* Body Popup */}
            <div className="p-6 overflow-y-auto flex-1">
              {orderDetail && <OrderDetail data={orderDetail}/>}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. POPUP LỊCH SỬ GIAO DỊCH (TAILWIND CSS) */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
             {/* Header Popup */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold text-gray-800">Lịch sử giao dịch</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>
            {/* Body Popup (Chứa HistoryOrder) */}
            <div className="p-6 overflow-y-auto flex-1">
              {selectedUserId && <HistoryOrder userId={selectedUserId} />}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GIAO DIỆN CHÍNH: DANH SÁCH KHÁCH HÀNG */}
      {/* ========================================================= */}
      <div className="w-full">
        <div className="items-center bg-white p-6 rounded-lg shadow-sm border border-border mt-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2 border-l-4 border-emerald-500 pl-3">Danh sách khách hàng</h2>
                      
          {/* Thanh tìm kiếm */}
          <div className="flex mb-6">
            <div className="flex w-full md:w-1/2">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Tìm kiếm bằng tên, email, SĐT..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-r-lg transition-colors flex items-center" onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>
          </div>
          
          {/* Bảng Dữ liệu */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="px-6 py-4 text-center font-semibold w-16">STT</th>
                  <th className="px-6 py-4 font-semibold">Thông tin Khách hàng</th>
                  <th className="px-6 py-4 text-center font-semibold">Hạng Thẻ</th>
                  <th className="px-6 py-4 text-center font-semibold">Tổng Chi Tiêu</th>
                  <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-center font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <Spinner animation="border" variant="success"/>
                    </td>
                  </tr>
                ) : customers.length > 0 ? (
                  customers.map((item, index) => (
                    <tr key={item.id || item._id} className="hover:bg-gray-50 transition-colors"> 
                      <td className="px-6 py-4 text-center text-gray-500">
                        {(page - 1) * 10 + (index + 1)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
                            src={item.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName || 'User')}&background=random`}
                            alt="avatar"
                          />
                          <div>
                            <p className="mb-0 font-bold text-gray-900">{item.fullName}</p>
                            <p className="mb-0 text-gray-500 text-xs">{item.email}</p>
                            <p className="mb-0 text-gray-500 text-xs">{item.phone}</p> 
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                        {item.rankName || "Thành viên"}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-gray-700 font-bold">
                        {item.totalSpent ? format.formatPrice(item.totalSpent) : "0 đ"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'Active' || item.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status === 'Active' || item.status === 1 ? "Đang hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* Nhấn nút này sẽ gán ID khách hàng và bật cái Modal Tailwind ở trên */}
                        <button 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors text-sm font-medium shadow-sm" 
                          onClick={() => {
                            setSelectedUserId(item.id || item._id);
                            setShowModal(true);
                          }}
                        >
                          <FaEye /> Lịch sử
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      <p className="text-lg font-medium mb-1">Không tìm thấy khách hàng nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {customerData?.totalPage > 1 && (
            <div className="mt-6 flex justify-center">
               <PaginationproductStore currentPage={page} onChangePage={handleChangePage} totalPage={customerData.totalPage}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}