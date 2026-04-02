// Client/src/pages/Admin/category/index.js
import { useCallback } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import { usecategoryList, usecategoryCRUD } from "../../../hooks";

function categoryList() {
  const {
    categoryData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    refreshList,
  } = usecategoryList();

  const {
    loading: crudLoading,
    showAddModal,
    setShowAddModal,
    addcategory,
    setAddcategory,
    handleCreate,
    showUpdateModal,
    setShowUpdateModal,
    selectedcategory,
    setSelectedcategory,
    openUpdateModal,
    handleUpdate,
    showDeleteModal,
    setShowDeleteModal,
    categoryDelete,
    openDeleteModal,
    handleDelete,
  } = usecategoryCRUD(refreshList);

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
          <Modal.Title>Cập nhật thể loại</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <Row>
              <Col xl={6}>
                <label>Tên thể loại</label>
                <input
                  required
                  type="text"
                  value={selectedcategory?.name}
                  className="form-control"
                  onChange={(e) =>
                    setSelectedcategory((prev) => {
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
          <Modal.Title>Thêm thể loại</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreate}>
            <Row>
              <Col xl={6}>
                <label>Tên thể loại</label>
                <input
                  required
                  type="text"
                  value={addcategory?.name}
                  className="form-control"
                  onChange={(e) =>
                    setAddcategory((prev) => {
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
          <Modal.Title>Xóa thể loại</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc xóa thể loại <b>{categoryDelete && categoryDelete.name}</b> này
          không?
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
          <div className="admin-content-header">Danh sách thể loại</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input
                className="form-control search"
                placeholder="Tìm kiếm thể loại..."
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
              <button
                type="button"
                className="btn btn-success ms-auto"
                onClick={() => setShowAddModal(true)}
              >
                Thêm Thể loại
              </button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Thể loại</th>
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
                ) : categoryData.categorys && categoryData.categorys.length > 0 ? (
                  categoryData.categorys.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="align-middle">{item.name}</td>
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
                    <td colSpan={4}>Không tìm thấy thể loại!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {categoryData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPage={categoryData.totalPage}
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

export default categoryList;




