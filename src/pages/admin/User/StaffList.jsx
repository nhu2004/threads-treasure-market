// Client/src/pages/Admin/User/StaffList.js
import { useCallback } from "react";
import { Row, Col, Table, Button, Badge, Modal, Spinner } from "react-bootstrap";
import PaginationproductStore from "../../../components/PaginationproductStore";
import moment from "moment";
import { FaSearch, FaLock, FaLockOpen, FaUserPlus, FaEdit, FaKey, FaTrash } from "react-icons/fa";
import { useStaffList, useStaffCRUD } from "../../../hooks/admin/admin";

export default function StaffList() {
  const { staffData, page, setPage, loading, searchInput, setSearchInput, handleSearch, refreshList } = useStaffList();

  const {
    loading: crudLoading, showAddModal, setShowAddModal, addStaff, setAddStaff, handleCreate,
    showUpdateModal, setShowUpdateModal, selectedStaff, setSelectedStaff, openUpdateModal, handleUpdate,
    handleUpdateStatus, showResetPasswordModal, setShowResetPasswordModal, staffToReset,
    openResetPasswordModal, handleResetPassword, showDeleteModal, setShowDeleteModal,
    staffToDelete, openDeleteModal, handleDelete,
  } = useStaffCRUD(refreshList);

  const handleChangePage = useCallback((page) => { setPage(page); }, [setPage]);

  // Lọc chỉ lấy Nhân viên
  const staffs = staffData?.data?.filter(u => u.role === 'admin' || u.role === 'staff') || [];

  return (
    <Row>
      {/* Modal Thêm nhân viên */}
      <Modal size="lg" show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Thêm nhân viên</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={async (e) => { e.preventDefault(); await handleCreate(e); setShowAddModal(false); }}>
            <Row>
              <Col xl={4}>
                <label>Tên nhân viên</label>
                <input required type="text" value={addStaff?.fullName || ''} className="form-control"
                  onChange={(e) => setAddStaff(prev => ({ ...prev, fullName: e.target.value }))} />
              </Col>
              <Col xl={4}>
                <label>Email</label>
                <input required type="email" value={addStaff?.email || ''} className="form-control"
                  onChange={(e) => setAddStaff(prev => ({ ...prev, email: e.target.value }))} />
              </Col>
              <Col xl={4}>
                <label>Điện thoại</label>
                {/* Đổi phoneNumber thành phone để khớp Body API[cite: 21] */}
                <input required type="text" value={addStaff?.phone || ''} className="form-control"
                  onChange={(e) => setAddStaff(prev => ({ ...prev, phone: e.target.value }))} /> 
              </Col>
            </Row>
            <Button className="mt-4" type="submit" disabled={crudLoading} variant="success">Lưu</Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal Sửa thông tin nhân viên */}
      <Modal size="lg" show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton><Modal.Title>Sửa thông tin nhân viên</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={async (e) => { e.preventDefault(); await handleUpdate(e); setShowUpdateModal(false); }}>
            <Row>
              <Col xl={6}>
                <label>Tên nhân viên</label>
                <input required type="text" value={selectedStaff?.fullName || ""} className="form-control"
                  onChange={(e) => setSelectedStaff(prev => ({ ...prev, fullName: e.target.value }))} />
              </Col>
              <Col xl={6}>
                <label>Email</label>
                <input required type="email" value={selectedStaff?.email || ""} className="form-control" disabled />
              </Col>
              <Col xl={6} className="mt-3">
                <label>Điện thoại</label>
                {/* Đổi phoneNumber thành phone[cite: 25] */}
                <input required type="text" value={selectedStaff?.phone || ""} className="form-control"
                  onChange={(e) => setSelectedStaff(prev => ({ ...prev, phone: e.target.value }))} />
              </Col>
            </Row>
            <Button className="mt-4" type="submit" disabled={crudLoading} variant="success">Cập nhật</Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal Reset mật khẩu */}
      <Modal
        show={showResetPasswordModal}
        onHide={() => setShowResetPasswordModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Reset mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn reset mật khẩu cho nhân viên{" "}
            <strong>{staffToReset?.fullName}</strong>?
          </p>
          <p className="text-muted">
            Mật khẩu mới sẽ được tạo tự động và gửi về email:{" "}
            <strong>{staffToReset?.email}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowResetPasswordModal(false)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleResetPassword}
            disabled={crudLoading}
          >
            Xác nhận Reset
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xóa nhân viên */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn xóa nhân viên{" "}
            <strong>{staffToDelete?.fullName}</strong>?
          </p>
          <p className="text-danger">
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={crudLoading}
          >
            Xác nhận Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách nhân viên</div>
          <div className="admin-content-action">
            <div className="d-flex justify-content-between">
              <div className="d-flex">
                <input
                  className="form-control search"
                  placeholder="Nhập tên, mã nhân viên..."
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
              <div>
                <Button
                  variant="success"
                  className="ms-auto d-flex align-items-center"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaUserPlus className="me-2" />
                  Thêm nhân viên
                </Button>
              </div>
            </div>
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr className="text-center">
                  <th width="5%">STT</th>
                  <th width="25%">Tên nhân viên</th>
                  <th width="20%">Email</th>
                  <th width="15%">SĐT</th>
                  <th width="15%">Ngày tạo</th>
                  <th width="10%">Trạng thái</th>
                  <th width="10%">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : staffData?.list && staffData?.list?.length > 0 ? (
                  staffData.list.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <img
                              className="avatar me-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                              }}
                              src={item?.avatar?.url}
                              alt=""
                            />
                            <div className="fw-bold">{item?.fullName}</div>
                          </div>
                        </td>

                        <td className="align-middle">{item?.email}</td>
                        <td className="text-center align-middle">
                          {item?.phoneNumber}
                        </td>
                        <td className="text-center align-middle">
                          {moment(item?.createdAt).format("DD-MM-YYYY")}
                        </td>
                        <td className="text-center align-middle">
                          <Badge
                            bg={item?.status === 1 ? "success" : "danger"}
                            className="px-3 py-2"
                          >
                            {item?.status === 1 ? "Đang hoạt động" : "Đã khóa"}
                          </Badge>
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => openUpdateModal(item)}
                              className="d-inline-flex align-items-center"
                              title="Sửa thông tin"
                              style={{ minWidth: "35px", height: "32px" }}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => openResetPasswordModal(item)}
                              className="d-inline-flex align-items-center"
                              title="Reset mật khẩu"
                              style={{ minWidth: "35px", height: "32px" }}
                            >
                              <FaKey />
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                item?.status === 1 ? "danger" : "success"
                              }
                              onClick={() => handleUpdateStatus(item)}
                              className="d-inline-flex align-items-center"
                              title={
                                item?.status === 1
                                  ? "Khóa tài khoản"
                                  : "Kích hoạt tài khoản"
                              }
                              style={{ minWidth: "35px", height: "32px" }}
                            >
                              {item?.status === 1 ? <FaLock /> : <FaLockOpen />}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => openDeleteModal(item)}
                              className="d-inline-flex align-items-center"
                              title="Xóa nhân viên"
                              style={{ minWidth: "35px", height: "32px" }}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>Không có nhân viên nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {staffData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPage={staffData.totalPage}
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






