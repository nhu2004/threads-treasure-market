import { useCallback } from "react";
import { Link } from "react-router-dom";
import PaginationproductStore from "../../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch, FaPlus } from "react-icons/fa";
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

      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Quản lý Sản Phẩm</h1>
      </div>

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
          <Link to="/admin/product/add" className={styles.addBtn}>
            <FaPlus /> Thêm sản phẩm
          </Link>
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
              {/* ĐÃ XÓA CỘT THƯƠNG HIỆU Ở ĐÂY */}
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Giá bán</th>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.loadingState}>
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
                <td colSpan={6} className={styles.emptyState}>
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