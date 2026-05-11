import { useCallback, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import PaginationproductStore from "../../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch, FaPlus, FaBoxOpen, FaFileExcel, FaHandPointer } from "react-icons/fa"; // Bổ sung icon
import { Spinner, Modal, Button } from "react-bootstrap";
import format from "../../../../helper/format";
import { useProductList, useDeleteProduct } from "../../../../hooks/admin/admin";
import styles from "./ProductList.module.css";

function ProductList() {
  const {
    productData = {}, 
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    removeProduct,
  } = useProductList();

  const { showModal, setShowModal, productDelete, openDeleteModal, handleDelete } =
    useDeleteProduct(removeProduct);
  
    const navigate = useNavigate(); // Dùng để chuyển trang
  // 1. Thêm state quản lý Modal chọn cách thêm sản phẩm
  const [showAddOptions, setShowAddOptions] = useState(false);

  const handleChangePage = useCallback(
    (page) => setPage(page),
    [setPage]
  );

  const productsList = Array.isArray(productData) 
    ? productData 
    : (productData?.products || productData?.data || []);
    
  const totalPages = productData?.totalPage || 1;

  return (
    <div className={styles.wrapper}>
      <Modal size="md" show={showModal} onHide={() => setShowModal(false)} centered>
         {/* Cửa sổ Popup Xác nhận xóa (Giao diện Window + Nút X) */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', overflow: 'hidden' }}>
            
            {/* Header có nút X */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Xác nhận xóa</h5>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}
                title="Đóng cửa sổ"
              >
                &times;
              </button>
            </div>
            
            {/* Nội dung cảnh báo */}
            <div style={{ padding: '20px', fontSize: '15px', color: '#374151' }}>
              Bạn có chắc chắn muốn xóa sản phẩm <b style={{ color: '#111827' }}>{productDelete?.name}</b> này không?
              <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>* Hành động này không thể hoàn tác.</div>
            </div>
            
            {/* Thanh công cụ chứa nút bấm */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
              >
                Hủy
              </button>
              <button 
                onClick={handleDelete} 
                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
              >
                Xác nhận xóa
              </button>
            </div>

          </div>
        </div>
      )}
      </Modal>
      
      {/* 2. THÊM MODAL CHỌN CÁCH THÊM SẢN PHẨM MỚI */}
      <Modal size="lg" show={showAddOptions} onHide={() => setShowAddOptions(false)} centered>
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, fontWeight: '700', color: '#1f2937' }}>Chọn phương thức thêm sản phẩm</h4>
            <button onClick={() => setShowAddOptions(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Lựa chọn 1: Thêm thủ công */}
            <div 
              className={styles.optionCard}
              onClick={() => {
                setShowAddOptions(false);
                navigate("/admin/product/add");
              }}
            >
              <div className={styles.iconCircle} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                <FaHandPointer size={24} />
              </div>
              <h5 style={{ fontWeight: '600', marginTop: '16px' }}>Thêm thủ công 1 sản phẩm</h5>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Điền form thông tin chi tiết cho một sản phẩm mới hoàn toàn.</p>
            </div>

            {/* Lựa chọn 2: Import Excel */}
            <div 
              className={styles.optionCard}
              onClick={() => {
                // Xử lý mở form upload Excel ở đây
                alert("Tính năng upload file Excel đang được phát triển!");
              }}
            >
              <div className={styles.iconCircle} style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}>
                <FaFileExcel size={24} />
              </div>
              <h5 style={{ fontWeight: '600', marginTop: '16px' }}>Nhập hàng loạt qua file</h5>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Tải lên file mẫu (.xlsx, .csv) để thêm nhiều sản phẩm cùng lúc.</p>
            </div>
          </div>
        </div>
      </Modal>

        <h2 className="text-xl font-bold text-gray-800 mb-2 border-l-4 border-emerald-500 pl-3">Quản lý Sản Phẩm</h2>
     

      <div className={styles.actionBar}>
        <div className={styles.actionContent}>
          <div className={styles.searchBox}>
            <input
              className={styles.searchInput}
              placeholder="Tìm tên sản phẩm, danh mục..."
              value={searchInput || ""}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className={styles.searchBtn} onClick={handleSearch}>
              <FaSearch /> Tìm kiếm
            </button>
          </div>
          {/* Nhóm nút bấm mới */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className={styles.restockBtn}
              onClick={() => alert("Mở form chọn sản phẩm cũ để cộng thêm số lượng")}
            >
              <FaBoxOpen /> Cập nhật tồn kho
            </button>
            <button 
              className={styles.addBtn} 
              onClick={() => setShowAddOptions(true)}
            >
              <FaPlus /> Thêm sản phẩm mới
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>STT</th>
              <th className={styles.tableHeadCell}>Hình ảnh</th>
              <th className={styles.tableHeadCell}>Thông tin sản phẩm</th>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Danh mục</th>
              {/* THÊM TIÊU ĐỀ CỘT SỐ LƯỢNG TẠI ĐÂY */}
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Số lượng</th>
              {/* ĐÃ XÓA CỘT THƯƠNG HIỆU Ở ĐÂY */}
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Giá bán</th>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {loading ? (
              <tr>
                <td colSpan={7} className={styles.loadingState}>
                  <Spinner animation="border" variant="success" />
                  <p className={styles.loadingText}>Đang tải dữ liệu...</p>
                </td>
              </tr>
            ) : productsList.length > 0 ? (
              productsList.map((item, index) => (
                <tr key={item.id || index}>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    {((page || 1) - 1) * 10 + (index + 1)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellImage}`}>
                    <img 
                      src={item.image || 'https://via.placeholder.com/50x70'} 
                      alt={item.name}
                      className={styles.productImage}
                      style={{ width: '50px', height: '65px' }}
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>
                        {item.badge && <span className="badge bg-danger me-2">{item.badge}</span>}
                        {item.name}
                      </div>
                      <div className={styles.productId}>ID: {item.id}</div>
                      {/* Hiển thị size trực tiếp trên Admin nếu muốn */}
                      {item.sizes && item.sizes.length > 0 && (
                        <div className="text-dark small mt-1">Size: {item.sizes.join(', ')}</div>
                      )}
                    </div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <span className={styles.categoryBadge}>{item.category || 'Mặc định'}</span>
                  </td>
                  {/* THÊM DỮ LIỆU SỐ LƯỢNG TẠI ĐÂY */} 
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: (item.StockQuantity || item.stockQuantity || item.stock_quantity) < 10 ? '#ef4444' : '#374151' 
                    }}> 
                     {/* Kiểm tra tất cả các biến thể tên có thể có từ SQL hoặc API */}
                      {item.StockQuantity !== undefined ? item.StockQuantity : 
                      item.stockQuantity !== undefined ? item.stockQuantity : 
                      item.stock_quantity !== undefined ? item.stock_quantity : 0}
                    </span>
                  </td>

                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <span className={styles.priceValue}>{format.formatPrice(item.price || 0)}</span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <div className={styles.actionsCell}>
                      <Link
                        to={`/admin/product/update/${item.id}`}
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => openDeleteModal(item)}
                        title="Xóa"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  Hiện chưa có sản phẩm nào trong kho.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <PaginationproductStore
            totalPage={totalPages}
            currentPage={page}
            onChangePage={handleChangePage}
          />
        </div>
      )}
    </div>
  );
}

export default ProductList;