//Client/src/pages/Admin/User/CustomerList.js
import { useCallback } from "react";
import {
  Badge,
  Button,
  Col,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { FaEye, FaSearch } from "react-icons/fa";

import moment from "moment";
import format from "../../../helper/format";

import PaginationproductStore from "../../../components/PaginationproductStore";
import OrderDetail from "../../../components/OrderDetail";
import steps from "../../../components/OrderProgress/enum";
import { useCustomerList, useCustomerOrders } from "../../../hooks/admin/admin";

export default function CustomerList() {
  const {
    customerData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
  } = useCustomerList();

  const {
    showModal,
    setShowModal,
    orderList,
    showDetailModal: showOrderDetailModal,
    setShowDetailModal: setShowOrderDetailModal,
    orderDetail,
    fetchOrders,
    fetchOrderDetail: handleGetOrderDetail,
  } = useCustomerOrders();

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
        dialogClassName="modal-w1100"
        show={showOrderDetailModal}
        onHide={() => setShowOrderDetailModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Hóa đơn <Badge bg="secondary">{orderDetail?._id}</Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModal && orderDetail && <OrderDetail data={orderDetail} />}
        </Modal.Body>
      </Modal>
      <Modal
        size="lg"
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName="modal-w1100"
      >
        <Modal.Header closeButton>
          <Modal.Title>Lịch sử giao dịch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: "500px", overflowY: "scroll" }}>
            <Table hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Thông tin giao hàng</th>
                  <th className="text-center">Ngày đặt hàng</th>
                  <th className="text-center">Tổng tiền</th>
                  <th className="text-center">Tình trạng</th>
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
                ) : orderList && orderList.length > 0 ? (
                  orderList.map((item, index) => {
                    return (
                      <tr key={item?._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="text-start align-middle">
                          <p className="mb-1">
                            <span className="fw-bold">Người nhận:</span>{" "}
                            {item?.delivery?.fullName}
                          </p>
                          <p className="mb-1">
                            <span className="fw-bold">Email:</span>{" "}
                            {item?.delivery?.email}
                          </p>
                          <p className="mb-1">
                            <span className="fw-bold">Điện thoại:</span>{" "}
                            {item?.delivery?.phoneNumber}
                          </p>
                          <p className="mb-0">
                            <span className="fw-bold">Địa chỉ:</span>{" "}
                            {item?.delivery?.address}{" "}
                          </p>
                        </td>
                        <td className="text-center align-middle">
                          <p className="mb-1">
                            {moment(item?.createdAt).format(
                              "DD-MM-yyyy HH:mm:ss"
                            )}
                          </p>
                          {moment(item.createdAt).isSame(moment(), "day") && (
                            <span
                              style={{ backgroundColor: "#ff709e" }}
                              className="badge"
                            >
                              {moment(item?.createdAt).fromNow()}
                            </span>
                          )}
                        </td>
                        <td className="text-center align-middle fw-bold">
                          {format.formatPrice(item?.cost?.total)}
                        </td>
                        <td className="text-center align-middle">
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                steps?.[item?.orderStatus?.code]?.color,
                            }}
                          >
                            {item?.orderStatus?.text}
                          </span>
                        </td>
                        <td className="text-center align-middle">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleGetOrderDetail(item?._id)}
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>Không có đơn hàng nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách khách hàng</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input
                className="form-control search"
                placeholder="Tìm kiếm bằng tên, email, SĐT"
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
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th className="text-center">Khách hàng</th>
                  <th className="text-center">Tài khoản</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : customerData?.list && customerData?.list?.length > 0 ? (
                  customerData.list.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="text-start align-middle">
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
                            <div>
                              <p className="mb-1">
                                <span className="fw-bold">Họ tên:</span>{" "}
                                {item?.fullName}
                              </p>
                              <p className="mb-1">
                                <span className="fw-bold">Email:</span>{" "}
                                {item?.email}
                              </p>
                              <p className="mb-0">
                                <span className="fw-bold">Điện thoại:</span>{" "}
                                {item?.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          {item?.serviceId
                            ? item?.service
                            : "Tài khoản productStore"}
                        </td>
                        <td className="text-center align-middle">
                          <Badge
                            bg={item?.status === 1 ? "success" : "danger"}
                            className="px-3 py-2"
                          >
                            {item?.status === 1
                              ? "Đã xác minh"
                              : "Chưa xác minh"}
                          </Badge>
                        </td>
                        <td className="text-center align-middle">
                          <Button
                            variant="warning"
                            onClick={() => fetchOrders(item?._id)}
                          >
                            <FaEye /> Lịch sử mua hàng
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>Không có khách hàng nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {customerData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPage={customerData.totalPage}
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






