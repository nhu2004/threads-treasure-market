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
} from "../../../hooks/admin/admin";

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
                {orderData.orders && orderData.orders.length > 0 ? (
                  orderData.orders.map((item, index) => {
                    return (
                      <tr key={item._id || item.OrderID}> 
                        <td>{index + 1}</td>
                        {/* Hiển thị OrderID từ SQL Server */}
                        <td>#ORD-{item._id}</td> 
                        <td>{moment(item.orderDate).format("DD/MM/YYYY HH:mm")}</td>
                        <td>{format.price(item.totalPrice)} VNĐ</td>
                        <td>
                          <Badge bg={item.paymentStatus?.code === 2 ? "success" : "warning"}>
                            {item.paymentStatus?.text}
                          </Badge>
                        </td>
                        <td>
                          {/* Sử dụng component tiến độ dựa trên code từ SQL */}
                          <OrderProgress currentStep={item.orderStatus?.code} />
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => fetchOrderDetail(item._id)}
                            >
                              <FaEye /> Xem
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">Không có đơn hàng nào!</td>
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






