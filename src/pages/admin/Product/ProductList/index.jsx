import { useCallback } from "react";
import { Link } from "react-router-dom";
import PaginationproductStore from "../../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch, FaPlus } from "react-icons/fa";
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import format from "../../../../helper/format";
import { useProductList, useDeleteProduct } from "../../../../hooks/admin/admin";

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
    <Row>
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

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Quản lý Kho Hàng (Quần áo)</div>
          
          <div className="admin-content-action mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <input
                  className="form-control search"
                  style={{ width: '300px' }}
                  placeholder="Tìm tên sản phẩm, thương hiệu..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button variant="info" className="text-white" onClick={handleSearch}>
                  <FaSearch />
                </Button>
              </div>
              <Link to="/admin/product/add" className="btn btn-success d-flex align-items-center gap-2">
                <FaPlus /> Thêm sản phẩm mới
              </Link>
            </div>
          </div>

          <div className="admin-content-body">
            <Table hover responsive striped bordered className="align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center">STT</th>
                  <th>Hình ảnh</th>
                  <th>Thông tin sản phẩm</th>
                  <th className="text-center">Danh mục</th>
                  <th className="text-center">Thương hiệu</th>
                  <th className="text-center">Giá bán</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Spinner animation="border" variant="success" />
                      <p className="mt-2 text-muted">Đang tải dữ liệu từ SQL Server...</p>
                    </td>
                  </tr>
                ) : productData.products && productData.products.length > 0 ? (
                  productData.products.map((item, index) => (
                    <tr key={item.ProductID || item._id}>
                      <td className="text-center">
                        {(page - 1) * 10 + (index + 1)}
                      </td>
                      <td className="text-center">
                        <img 
                          src={item.ImageUrl || 'https://via.placeholder.com/50x70'} 
                          alt={item.Name} 
                          style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{item.Name || item.name}</div>
                        <div className="small text-muted">ID: {item.ProductID}</div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border">
                          {item.CategoryName || (Array.isArray(item.category) ? item.category[0] : item.category)}
                        </span>
                      </td>
                      <td className="text-center">
                        {item.BrandName || item.brand}
                      </td>
                      <td className="text-center fw-bold text-success">
                        {format.formatPrice(item.Price || item.price)}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Link
                            to={`/admin/product/update/${item.ProductID || item._id}`}
                            className="btn btn-sm btn-outline-warning"
                          >
                            <FaEdit />
                          </Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(item)}
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">Hiện chưa có sản phẩm nào trong kho.</td>
                  </tr>
                )}
              </tbody>
            </Table>

            <div className="admin-content-pagination mt-4">
              <Row>
                <Col xl={12} className="d-flex justify-content-center">
                  {productData.totalPage > 1 && (
                    <PaginationproductStore
                      totalPage={productData.totalPage}
                      currentPage={page}
                      onChangePage={handleChangePage}
                    />
                  )}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default ProductList;