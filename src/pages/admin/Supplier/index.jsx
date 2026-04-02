//Client/src/pages/Admin/supplier/index.js
import { useCallback } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import { usesupplierList, usesupplierCRUD } from "../../../hooks";

function supplierList() {
  const {
    supplierData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    refreshList,
  } = usesupplierList();

  const {
    loading: crudLoading,
    showAddModal,
    setShowAddModal,
    addsupplier,
    setAddsupplier,
    handleCreate,
    showUpdateModal,
    setShowUpdateModal,
    selectedsupplier,
    setSelectedsupplier,
    openUpdateModal,
    handleUpdate,
    showDeleteModal,
    setShowDeleteModal,
    supplierDelete,
    openDeleteModal,
    handleDelete,
  } = usesupplierCRUD(refreshList);

  const handleChangePage = useCallback(
    (page) => {
      setPage(page);
    },
    [setPage]
  );

  return (
    <Row>
      <Modal
        size="lg"
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật nhà xuất bản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <Row>
              <Col xl={6}>
                <label>Tên nhà xuất bản</label>
                <input
                  required
                  type="text"
                  value={selectedsupplier?.name}
                  className="form-control"
                  onChange={(e) =>
                    setSelectedsupplier((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                />
              </Col>
            </Row>
            <Button
              disabled={crudLoading}
              type="submit"
              variant="danger"
              className="mt-2"
            >
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="lg"
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm nhà xuất bản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreate}>
            <Row>
              <Col xl={6}>
                <label>Tên nhà xuất bản</label>
                <input
                  required
                  type="text"
                  value={addsupplier?.name}
                  className="form-control"
                  onChange={(e) =>
                    setAddsupplier((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                />
              </Col>
            </Row>
            <Button
              disabled={crudLoading}
              type="submit"
              variant="danger"
              className="mt-2"
            >
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="lg"
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xóa nhà xuất bản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc xóa nhà xuất bản{" "}
          <b>{supplierDelete && supplierDelete.name}</b> này không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách nhà xuất bản</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input
                className="form-control search"
                placeholder="Tìm kiếm nhà xuất bản..."
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
              <Button
                variant="success"
                className="ms-auto d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <FaEdit className="me-1" /> Thêm nhà xuất bản
              </Button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Nhà xuất bản</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3}>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : supplierData.suppliers &&
                  supplierData.suppliers.length > 0 ? (
                  supplierData.suppliers.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="align-middle">
                          <span>{item.name}</span>
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="warning"
                              onClick={() => openUpdateModal(item)}
                            >
                              <FaEdit />
                            </Button>
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
                    <td colSpan={4}>Không tìm thấy nhà xuất bản!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {supplierData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPage={supplierData.totalPage}
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

export default supplierList;




