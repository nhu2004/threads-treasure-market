//Client/src/pages/Admin/Product/productList/index.js
import { useCallback } from "react";
import { Link } from "react-router-dom";
import PaginationproductStore from "../../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import format from "../../../../helper/format";
import { useProductList, useDeleteProduct } from "../../../../hooks/admin/admin";

function productList() {
  const {
    productData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    removeproduct,
  } = useproductList();

  const { showModal, setShowModal, productDelete, openDeleteModal, handleDelete } =
    useDeleteproduct(removeproduct);

  const handleChangePage = useCallback(
    (page) => {
      setPage(page);
    },
    [setPage]
  );

  return (
    <Row>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa sách</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc xóa sách <b>{productDelete && productDelete?.name}</b> này
          không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách sản phẩm</div>
          <div className="admin-content-action">
            <div className="d-flex justify-content-between">
              <div className="d-flex">
                <input
                  className="form-control search"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button
                  type="button"
                  style={{ color: "white" }}
                  variant="info"
                  onClick={handleSearch}
                >
                  <FaSearch />
                </Button>
              </div>
              <Link
                to="/admin/product/add"
                className="btn btn-success ms-auto d-flex align-items-center gap-2"
              >
                <FaEdit className="me-2" /> Thêm sách mới
              </Link>
            </div>
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th className="text-center">Tên sách</th>
                  <th className="text-center">Thể loại</th>
                  <th className="text-center">Xuất bản</th>
                  <th className="text-center">Giá</th>
                  <th className="text-center">Giảm giá</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : productData.products && productData.products.length > 0 ? (
                  productData.products.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="text-start align-middle">
                          <div>
                            <p className="mb-1 fw-bold">{item.name}</p>
                            <p className="mb-0 text-muted">
                              Tác giả: {format.arrayToString(item.brand || [])}
                            </p>
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          {format.arrayToString(item.category || [])}
                        </td>
                        <td className="text-center align-middle">
                          <div>
                            <p className="mb-1">{item.supplier?.name}</p>
                            <p className="mb-0 text-muted">{item.year}</p>
                          </div>
                        </td>
                        <td className="text-center align-middle fw-bold">
                          {format.formatPrice(item.price)}
                        </td>
                        <td className="text-center align-middle">
                          {item.discount}%
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex gap-2 justify-content-center">
                            <Link
                              to={`/admin/product/update/${item._id}`}
                              className="btn btn-warning"
                              data-id={item._id}
                            >
                              <FaEdit />
                            </Link>
                            <Button
                              variant="danger"
                              onClick={() => openDeleteModal(item)}
                            >
                              <FaTrashAlt />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7}>Không có sản phẩm nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {productData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPage={productData.totalPage}
                      currentPage={page}
                      onChangePage={handleChangePage}
                    />
                  ) : null}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default productList;






