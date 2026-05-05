// Client/src/pages/Admin/Order/OrderList.js
import { useCallback } from "react";
import "./OrderList.css";
import {
  Row,
  Col,
  Table,
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
  const { orderData, page, setPage, updateOrderInList } = useOrderList();

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
      {/* MODAL CẬP NHẬT TRẠNG THÁI (Giữ nguyên) */}
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

      {/* SỬA LỖI Ở ĐÂY: GỌI THẲNG POPUP ORDER DETAIL, BỎ THẺ <Modal> BAO BỌC */}
      {showDetailModal && orderDetail && (
        <OrderDetail 
          data={orderDetail} 
          onBack={() => setShowDetailModal(false)} 
        />
      )}

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách đơn hàng</div>
          <div className="admin-content-body">
            <Table responsive hover className="custom-order-table border-0">
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt hàng</th>
                  <th className="text-end">Tổng tiền</th> 
                  <th className="text-center">Trạng thái thanh toán</th> 
                  <th className="text-center">Tiến độ giao hàng</th> 
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orderData.orders && orderData.orders.length > 0 ? (
                  orderData.orders.map((item, index) => {
                    return (
                      <tr key={item._id || item.OrderID}> 
                        <td className="text-center fw-bold">{index + 1}</td>
                        <td className="fw-medium text-primary">#ORD-{item._id}</td> 
                        <td>{moment(item.orderDate).format("DD/MM/YYYY HH:mm")}</td>
                        <td className="text-end fw-bold text-danger">
                          {format.formatPrice(item.totalPrice)} 
                        </td>
                        <td className="text-center">
                          <Badge 
                            className="custom-badge"
                            bg={item.paymentStatus?.code === 2 ? "success" : "warning"}
                          >
                            {item.paymentStatus?.text || (item.paymentStatus === "Chưa hỗ trợ DB" ? "Thanh toán khi nhận hàng" : item.paymentStatus)}
                          </Badge>
                        </td>
                        <td className="progress-cell">
                          <OrderProgress currentStep={item.orderStatus?.code} />
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => fetchOrderDetail(item._id)}
                            >
                              <FaEye /> Xem
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => openUpdateModal(item._id)}
                            >
                              <FaEdit /> Cập nhật
                            </Button> 
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Không có đơn hàng nào!
                    </td>
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