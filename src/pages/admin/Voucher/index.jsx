import { useCallback } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore"; 
import styles from "./Voucher.module.css";
import { Row, Col, Table, Spinner, Modal, Button, Form } from "react-bootstrap";
import format from "../../../helper/format";
import moment from "moment";
import { useVoucherList, useVoucherCRUD } from "../../../hooks/admin/admin";
import { Tag, Plus, Edit, Trash2, X } from "lucide-react";
function Voucher() {
  const { voucherData, page, setPage, loading, refreshList } = useVoucherList();

  const {
    loading: crudLoading,
    showAddModal, setShowAddModal,
    addVoucher, setAddVoucher, handleCreate,
    showUpdateModal, setShowUpdateModal,
    selectedVoucher, setSelectedVoucher, openUpdateModal, handleUpdate,
    showDeleteModal, setShowDeleteModal,
    voucherDelete, openDeleteModal, handleDelete,
  } = useVoucherCRUD(refreshList);

  const handleChangePage = useCallback((page) => { setPage(page); }, [setPage]);

  // Hàm định dạng tiền tệ
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Tag className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Mã giảm giá</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          <span>Thêm mã mới</span>
        </button>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Tên chương trình</th>
                <th className="px-6 py-4">Mã ưu đãi</th>
                <th className="px-6 py-4">Giá trị giảm</th>
                <th className="px-6 py-4">Đơn tối thiểu</th>
                <th className="px-6 py-4">Ngày hết hạn</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : voucherData.vouchers && voucherData.vouchers.length > 0 ? (
                voucherData.vouchers.map((item, index) => (
                  <tr key={item.VoucherID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{(page - 1) * 10 + (index + 1)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.Name || "Chưa đặt tên"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-200 border-dashed rounded font-mono font-bold text-xs">
                        {item.Code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-600">
                      {item.ByType === 'percent' ? `Giảm ${item.Value}%` : `Giảm ${formatPrice(item.Value)}`}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatPrice(item.MinimumAmount)}</td>
                    <td className="px-6 py-4 text-gray-600">{moment(item.ExpiryDate).format("DD/MM/YYYY")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openUpdateModal(item)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Không có mã giảm giá nào được tìm thấy.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Phân trang */}
        {voucherData.totalPage > 1 && (
          <div className="p-4 border-t border-border flex justify-center">
            <PaginationproductStore
              totalPage={voucherData.totalPage}
              currentPage={page}
              onChangePage={handleChangePage}
            />
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL THÊM MỚI (Dùng Tailwind Thuần) */}
      {/* ========================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold">Thêm mã giảm giá mới</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Tên chương trình</label>
                  <input
                    required type="text" placeholder="Nhập tên chương trình..."
                    value={addVoucher?.name || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Mã Code (Viết liền)</label>
                  <input
                    required type="text" placeholder="Ví dụ: SALE2026"
                    value={addVoucher?.code || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Loại giảm</label>
                  <select
                    value={addVoucher?.by || "percent"}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, by: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="amount">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Mức giảm</label>
                  <input
                    required type="number"
                    value={addVoucher?.value || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Đơn tối thiểu</label>
                  <input
                    required type="number"
                    value={addVoucher?.minimum || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, minimum: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <input
                    required type="date"
                    value={addVoucher?.start || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <input
                    required type="date"
                    value={addVoucher?.end || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={crudLoading} className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  {crudLoading ? "Đang lưu..." : "Lưu mã giảm giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL CẬP NHẬT */}
      {/* ========================================== */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold">Cập nhật mã giảm giá</h2>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Tên chương trình</label>
                  <input
                    required type="text"
                    value={selectedVoucher?.Name || ""}
                    onChange={(e) => setSelectedVoucher(prev => ({ ...prev, Name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <input
                    required type="date"
                    value={selectedVoucher?.start || ""}
                    onChange={(e) => setSelectedVoucher(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <input
                    required type="date"
                    value={selectedVoucher?.end || ""}
                    onChange={(e) => setSelectedVoucher(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={crudLoading} className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium">
                  {crudLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL XÓA */}
      {/* ========================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Xác nhận xóa</h2>
              <p className="text-gray-600">
                Bạn có chắc muốn xóa mã giảm giá <strong className="text-red-600">{voucherDelete?.Code}</strong> này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center gap-3 border-t border-border">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium w-full">
                Hủy
              </button>
              <button 
                onClick={async () => {
                  await handleDelete();         // Chờ gọi API xóa xong
                  setShowDeleteModal(false);    // Đóng popup
                }} 
                disabled={crudLoading} 
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium w-full"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Voucher;




