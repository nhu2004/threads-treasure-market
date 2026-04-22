import { useCallback } from "react";
import { Link } from "react-router-dom";
import PaginationproductStore from "../../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch, FaPlus } from "react-icons/fa";
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import format from "../../../../helper/format";
import { useProductList, useDeleteProduct } from "../../../../hooks/admin/admin";
import styles from "./ProductList.module.css";

function ProductList() {
  const {
    productData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    removeProduct, // Sửa tên hàm cho đúng chuẩn camelCase
  } = useProductList();

  const { showModal, setShowModal, productDelete, openDeleteModal, handleDelete } =
    useDeleteProduct(removeProduct);

  const handleChangePage = useCallback(
    (page) => {
      setPage(page);
    },
    [setPage]
  );

  return (
    <div className={styles.wrapper}>
      {/* Modal xác nhận xóa sản phẩm */}
      <Modal size="md" show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa sản phẩm <b>{productDelete?.Name || productDelete?.name}</b> này không? 
          <br /><span className="text-danger small">* Hành động này không thể hoàn tác.</span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xác nhận xóa</Button>
        </Modal.Footer>
      </Modal>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Quản lý Sản Phẩm</h1>
      </div>

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionContent}>
          <div className={styles.searchBox}>
            <input
              className={styles.searchInput}
              placeholder="Tìm tên sản phẩm, thương hiệu..."
              value={searchInput}
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

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>STT</th>
              <th className={styles.tableHeadCell}>Hình ảnh</th>
              <th className={styles.tableHeadCell}>Thông tin sản phẩm</th>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Danh mục</th>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Thương hiệu</th>
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
            ) : productData.products && productData.products.length > 0 ? (
              productData.products.map((item, index) => (
                <tr key={item.ProductID || item._id}>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    {(page - 1) * 10 + (index + 1)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellImage}`}>
                    <img 
                      src={item.ImageUrl || 'https://via.placeholder.com/50x70'} 
                      alt={item.Name}
                      className={styles.productImage}
                      style={{ width: '50px', height: '65px' }}
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{item.Name || item.name}</div>
                      <div className={styles.productId}>ID: {item.ProductID}</div>
                    </div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <span className={styles.categoryBadge}>
                      {item.CategoryName || (Array.isArray(item.category) ? item.category[0] : item.category)}
                    </span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <span className={styles.brandName}>
                      {item.BrandName || item.brand}
                    </span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <span className={styles.priceValue}>
                      {format.formatPrice(item.Price || item.price)}
                    </span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <div className={styles.actionsCell}>
                      <Link
                        to={`/admin/product/update/${item.ProductID || item._id}`}
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

      {/* Pagination */}
      {!loading && productData.totalPage > 1 && (
        <div className={styles.paginationContainer}>
          <PaginationproductStore
            totalPage={productData.totalPage}
            currentPage={page}
            onChangePage={handleChangePage}
          />
        </div>
      )}
    </div>
  );
}

export default ProductList;