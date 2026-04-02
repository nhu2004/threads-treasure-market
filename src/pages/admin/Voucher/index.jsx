import { useCallback } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import styles from "./Voucher.module.css";
import { Row, Col, Table, Spinner, Modal, Button, Form } from "react-bootstrap";
import format from "../../../helper/format";
import moment from "moment";
import { useVoucherList, useVoucherCRUD } from "../../../hooks/admin/admin";

function Voucher() {
  const { voucherData, page, setPage, loading, refreshList } = useVoucherList();

  const {
    loading: crudLoading,
    showAddModal,
    setShowAddModal,
    addVoucher,
    setAddVoucher,
    handleCreate,
    showUpdateModal,
    setShowUpdateModal,
    selectedVoucher,
    setSelectedVoucher,
    openUpdateModal,
    handleUpdate,
    showDeleteModal,
    setShowDeleteModal,
    voucherDelete,
    openDeleteModal,
    handleDelete,
  } = useVoucherCRUD(refreshList);

  const handleChangePage = useCallback(
    (page) => {
      setPage(page);
    },
    [setPage]
  );

  return (
    <Row>
      <Col xl={12}>
        <div className={styles.adminContentWrapper}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className={styles.adminContentHeader}>Quản lý Mã giảm giá</div>
            <Button 
                className={styles.btnSuccessCustom} 
                onClick={() => setShowAddModal(true)}
            >
                <FaPlus className="me-2" /> Thêm mã giảm giá mới
            </Button>
          </div>

          <div className="admin-content-body">
            <Table responsive hover className={styles.voucherTable}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên chương trình</th>
                  <th>Mã ưu đãi</th>
                  <th>Giá trị giảm</th>
                  <th>Đơn tối thiểu</th>
                  <th>Ngày hết hạn</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={7} className="text-center py-4">
                            <Spinner animation="border" variant="success" />
                        </td>
                    </tr>
                ) : voucherData.vouchers && voucherData.vouchers.length > 0 ? (
                    voucherData.vouchers.map((item, index) => (
                        <tr key={item.VoucherID}>
                          <td>{(page - 1) * 10 + (index + 1)}</td>
                          <td><span className="fw-bold">{item.Name || "Chưa đặt tên"}</span></td>
                          <td><span className={styles.promoCode}>{item.Code}</span></td>
                          <td>
                            {item.ByType === 'percent' 
                              ? `Giảm ${item.Value}%` 
                              : `Giảm ${format.formatPrice(item.Value)}`}
                          </td>
                          <td>{format.formatPrice(item.MinimumAmount)}</td>
                          <td>{moment(item.ExpiryDate).format("DD/MM/YYYY")}</td>
                          <td className="text-center">
                            <Button variant="outline-warning" size="sm" className="me-2" onClick={() => openUpdateModal(item)}>
                              <FaEdit />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(item)}>
                              <FaTrashAlt />
                            </Button>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7} className="text-center py-4">Không có mã giảm giá nào được tìm thấy.</td>
                    </tr>
                )}
              </tbody>
            </Table>

            {voucherData.totalPage > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <PaginationproductStore
                        totalPage={voucherData.totalPage}
                        currentPage={page}
                        onChangePage={handleChangePage}
                    />
                </div>
            )}
          </div>
        </div>
      </Col>

      {/* MODAL THÊM MỚI */}
      <Modal size="lg" show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Thêm mã giảm giá mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Tên mã giảm giá</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Nhập tên chương trình..."
                    value={addVoucher?.name || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Mã Code (Viết liền)</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Ví dụ: SALE2026"
                    value={addVoucher?.code || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, code: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Loại giảm</Form.Label>
                  <Form.Select
                    value={addVoucher?.by || "percent"}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, by: e.target.value }))}
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="amount">Số tiền cố định (đ)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Mức giảm</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    value={addVoucher?.value || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, value: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Đơn tối thiểu</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    value={addVoucher?.minimum || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, minimum: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Ngày bắt đầu</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={addVoucher?.start || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, start: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Ngày kết thúc</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={addVoucher?.end || ""}
                    onChange={(e) => setAddVoucher(prev => ({ ...prev, end: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="text-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>Hủy</Button>
              <Button type="submit" variant="success" className={styles.btnSuccessCustom} disabled={crudLoading}>
                {crudLoading ? "Đang lưu..." : "Lưu mã giảm giá"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL CẬP NHẬT */}
      <Modal size="lg" show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Cập nhật mã giảm giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Tên chương trình</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={selectedVoucher?.Name || ""}
                    onChange={(e) => setSelectedVoucher(prev => ({ ...prev, Name: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Ngày bắt đầu</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={selectedVoucher?.start || ""}
                    onChange={(e) => setSelectedVoucher(prev => ({ ...prev, start: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Ngày kết thúc</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={selectedVoucher?.end || ""}
                    onChange={(e) => setSelectedVoucher(prev => ({ ...prev, end: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="text-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => setShowUpdateModal(false)}>Hủy</Button>
              <Button type="submit" variant="warning" className="fw-bold" disabled={crudLoading}>
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL XÓA */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xóa mã giảm giá <b className="text-danger">{voucherDelete?.Code}</b> này không? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete} disabled={crudLoading}>
            Đồng ý xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
}

export default Voucher;






