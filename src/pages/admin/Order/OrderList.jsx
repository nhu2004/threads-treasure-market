// Client/src/pages/Admin/Order/OrderList.js
import { useCallback } from "react";
import {
  Row,
  Col,
  Table,
  Spinner,
  Modal,
  Badge,
  Button,
} from "react-bootstrap";
import moment from "moment";
import { FaEdit, FaEye } from "react-icons/fa";

import PaginationproductStore from "../../../components/PaginationproductStore";
import OrderProgress from "../../../components/OrderProgress";
import OrderDetail from "../../../components/OrderDetail";

import steps from "../../../components/OrderProgress/enum";
import format from "../../../helper/format";
import {
  useOrderList,
  useAdminOrderDetail,
  useUpdateOrderStatus,
} from "../../../hooks";

export default function OrderList() {
  const { orderData, page, setPage, loading, updateOrderInList } =
    useOrderList();

  const {
    showModal: showDetailModal,
    setShowModal: setShowDetailModal,
    orderDetail,
    setOrderDetail,
    fetchOrderDetail,
  } = useAdminOrderDetail();

  const handleDetailUpdate = (updatedOrder) => {
    setOrderDetail(updatedOrder);
    updateOrderInList(updatedOrder._id, {
      orderStatus: updatedOrder.orderStatus,
      paymentStatus: updatedOrder.paymentStatus,
    });
  };

  const {
    showModal: showUpdateModal,
    setShowModal: setShowUpdateModal,
    loading: loadingUpdate,
    openModal: openUpdateModal,
    handleUpdate,
  } = useUpdateOrderStatus(orderDetail, handleDetailUpdate);

  const handleChangePage = useCallback(
    (page) => {
      setPage(page);
    },
    [setPage]
  );

  return (
    <Row>
      <Modal
        dialogClassName="modal-w1100"
        size="lg"
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Hóa đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showUpdateModal && orderDetail && orderDetail?.orderStatus?.text && (
            <div>
              <p className="mb-4">
                Trạng thái đơn hàng: <b>{orderDetail?.orderStatus?.text}</b>
              </p>
              <OrderProgress current={orderDetail?.orderStatus?.code} />
              {orderDetail?.orderStatus?.code < steps?.length - 1 && (
                <Button
                  variant="success"
                  disabled={loadingUpdate}
                  className="mt-4 d-flex"
                  style={{ margin: "0 auto" }}
                  onClick={handleUpdate}
                >
                  Chuyển sang trạng thái tiếp theo
                </Button>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        size="lg"
        dialogClassName="modal-w1100"
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Hóa đơn <Badge bg="secondary">{orderDetail?._id}</Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showDetailModal && orderDetail && <OrderDetail data={orderDetail} />}
        </Modal.Body>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách đơn hàng</div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th className="text-center">Thông tin giao hàng</th>
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
                ) : orderData.orders && orderData.orders.length > 0 ? (
                  orderData.orders.map((item, index) => {
                    return (
                      <tr key={item?._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="text-start align-middle">
                          <div>
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
                              {item?.delivery?.address}
                            </p>
                          </div>
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
                            className="badge px-3 py-2"
                            style={{
                              backgroundColor:
                                steps[item?.orderStatus?.code]?.color,
                            }}
                          >
                            {item?.orderStatus?.text}
                          </span>
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="success"
                              onClick={() => openUpdateModal(item?._id)}
                              disabled={
                                item?.method?.code !== 0 &&
                                item?.paymentStatus?.code !== 2
                              }
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => fetchOrderDetail(item?._id)}
                            >
                              <FaEye />
                            </Button>
                          </div>
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
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {orderData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPage={orderData.totalPage}
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




