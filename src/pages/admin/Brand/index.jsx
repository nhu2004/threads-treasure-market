// Client/src/pages/Admin/brand/index.js
import { useCallback } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch, FaUserPlus } from "react-icons/fa";
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import { usebrandList, usebrandCRUD } from "../../../hooks/admin/admin";

function brandList() {
  const {
    brandData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    refreshList,
  } = usebrandList();

  const {
    loading: crudLoading,
    showAddModal,
    setShowAddModal,
    addbrand,
    setAddbrand,
    handleCreate,
    showUpdateModal,
    setShowUpdateModal,
    selectedbrand,
    setSelectedbrand,
    openUpdateModal,
    handleUpdate,
    showDeleteModal,
    setShowDeleteModal,
    brandDelete,
    openDeleteModal,
    handleDelete,
  } = usebrandCRUD(refreshList);

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
          <Modal.Title>Cập nhật tác giả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <Row>
              <Col xl={4}>
                <label>Tên tác giả</label>
                <input
                  required
                  type="text"
                  value={selectedbrand?.name}
                  className="form-control"
                  onChange={(e) =>
                    setSelectedbrand((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                />
              </Col>
              <Col xl={4}>
                <label>Năm sinh</label>
                <input
                  required
                  type="number"
                  value={selectedbrand?.year}
                  className="form-control"
                  onChange={(e) =>
                    setSelectedbrand((prev) => {
                      return { ...prev, year: +e.target.value };
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
          <Modal.Title>Thêm tác giả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreate}>
            <Row>
              <Col xl={4}>
                <label>Tên tác giả</label>
                <input
                  required
                  type="text"
                  value={addbrand?.name}
                  className="form-control"
                  onChange={(e) =>
                    setAddbrand((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                />
              </Col>
              <Col xl={4}>
                <label>Năm sinh</label>
                <input
                  required
                  type="number"
                  value={addbrand?.year}
                  className="form-control"
                  onChange={(e) =>
                    setAddbrand((prev) => {
                      return { ...prev, year: +e.target.value };
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
          <Modal.Title>Xóa tác giả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc xóa tác giả <b>{brandDelete && brandDelete.name}</b> này
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
          <div className="admin-content-header">Danh sách tác giả</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input
                className="form-control search"
                placeholder="Tìm kiếm tác giả..."
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
                <FaUserPlus /> Thêm tác giả mới
              </Button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Tác giả</th>
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
                ) : brandData.brands && brandData.brands.length > 0 ? (
                  brandData.brands.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="align-middle">
                          <div>
                            <span className="fw-bold">{item.name}</span>
                            {item.year && (
                              <span className="text-muted">
                                {" "}
                                - {item?.year}
                              </span>
                            )}
                          </div>
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
                    <td colSpan={4}>Không tìm thấy tác giả!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {brandData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPage={brandData.totalPage}
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

export default brandList;






