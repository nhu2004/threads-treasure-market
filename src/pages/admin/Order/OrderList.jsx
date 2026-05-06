// Client/src/pages/Admin/Order/OrderList.js
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderList.css";
import {
  Row,
  Col,
  Table,
  Modal,
  Badge,
  Button,
  Form
} from "react-bootstrap";
import moment from "moment";
import { FaEdit, FaEye } from "react-icons/fa";

import PaginationproductStore from "../../../components/PaginationproductStore";
import OrderProgress from "../../../components/OrderProgress";
import OrderDetail from "../../../components/OrderDetail";

import steps from "../../../components/OrderProgressBar/enum";
import format from "../../../helper/format";
import {
  useOrderList,
  useAdminOrderDetail,
  useUpdateOrderStatus,
} from "../../../hooks/admin/admin";

export default function OrderList() {
  const navigate = useNavigate(); 

  const { orderData, page, setPage, updateOrderInList } = useOrderList();

  // Thêm state để quản lý ảnh upload
  const [proofImage, setProofImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    showModal: showDetailModal,
    setShowModal: setShowDetailModal,
    orderDetail,
    setOrderDetail,
    fetchOrderDetail,
  } = useAdminOrderDetail();

  const handleDetailUpdate = (updatedOrder) => {
    setOrderDetail(updatedOrder);
    updateOrderInList(updatedOrder._id || updatedOrder.id, {
      orderStatus: updatedOrder.orderStatus,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
    });
    // Reset ảnh khi cập nhật thành công
    setProofImage(null);
    setImagePreview(null);
  };

  // CẬP NHẬT Ở ĐÂY: Gọi đúng các hàm mới từ useUpdateOrderStatus
  const {
    showModal: showUpdateModal,
    setShowModal: setShowUpdateModal,
    loading: loadingUpdate,
    openModal: openUpdateModal,
    handlePrintInvoiceAndDeliver, 
    handleConfirmDelivery
  } = useUpdateOrderStatus(orderDetail, handleDetailUpdate);

  const handleChangePage = useCallback(
    (page) => {
      setPage(page);
    },
    [setPage]
  );

  // Xử lý khi người dùng chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setProofImage(null);
    setImagePreview(null);
  }

  // Lấy text trạng thái hiện tại (hỗ trợ cả 2 định dạng trả về từ API)
  const currentStatusText = orderDetail?.status || orderDetail?.orderStatus?.text;

  return (
    <Row>
      {/* MODAL CẬP NHẬT TRẠNG THÁI MỚI */}
      <Modal
        dialogClassName="modal-w1100"
        size="lg"
        show={showUpdateModal}
        onHide={handleCloseUpdateModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showUpdateModal && orderDetail && (
            <div>
              <p className="mb-4 text-center" style={{ fontSize: '18px' }}>
                Trạng thái hiện tại: <b className="text-primary">{currentStatusText}</b>
              </p>
              
              <div className="mb-4">
                <OrderProgress current={orderDetail?.orderStatus?.code} />
              </div>

              {/* TRƯỜNG HỢP 1: CHỜ XÁC NHẬN */}
              {currentStatusText === "Chờ xác nhận" && (
                <div className="text-center mt-4">
                  <div className="alert alert-info">
                    Đơn hàng đủ điều kiện. Bạn có muốn in hóa đơn và chuyển cho bộ phận giao hàng?
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={loadingUpdate}
                    onClick={handlePrintInvoiceAndDeliver}
                  >
                    {loadingUpdate ? "Đang xử lý..." : "In hóa đơn & Chuyển sang Đang giao"}
                  </Button>
                </div>
              )}

              {/* TRƯỜNG HỢP 2: ĐANG GIAO */}
              {currentStatusText === "Đang giao" && (
                <div className="mt-4 p-4 border rounded bg-light">
                  <h5 className="text-warning mb-3">
                    <FaEdit /> Xác nhận giao hàng
                  </h5>
                  <p className="text-muted">Quản lý đóng vai trò Shipper. Vui lòng cung cấp hình ảnh xác nhận.</p>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Tải lên ảnh (Delivery Proof):</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                  </Form.Group>
                  
                  {imagePreview && (
                    <div className="text-center mb-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ maxHeight: '250px', borderRadius: '8px', border: '1px solid #ccc' }} 
                      />
                    </div>
                  )}
                  
                  <Button
                    variant="success"
                    size="lg"
                    className="w-100 mt-2"
                    disabled={loadingUpdate || !proofImage}
                    onClick={() => handleConfirmDelivery(proofImage)}
                  >
                    {loadingUpdate ? "Đang xử lý..." : "Xác nhận Đã giao hàng thành công"}
                  </Button>
                </div>
              )}

              {/* TRƯỜNG HỢP KHÁC */}
              {(currentStatusText !== "Chờ xác nhận" && currentStatusText !== "Đang giao") && (
                <div className="text-center mt-4 alert alert-secondary">
                  Đơn hàng ở trạng thái <b>{currentStatusText}</b> không cần cập nhật thêm thao tác này.
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* CHI TIẾT ĐƠN HÀNG */}
      {showDetailModal && orderDetail && (
        <OrderDetail 
          data={orderDetail} 
          onBack={() => setShowDetailModal(false)} 
        />
      )}

      {/* BẢNG DANH SÁCH */}
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <h2 className="text-xl font-bold text-gray-800 mb-2 border-l-4 border-emerald-500 pl-3">
            Danh sách đơn hàng
          </h2>
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
                        <td className="fw-medium text-primary">#ORD-{item._id || item.OrderID}</td> 
                        <td>{moment(item.orderDate).format("DD/MM/YYYY HH:mm")}</td>
                        <td className="text-end fw-bold text-danger">
                          {format.formatPrice(item.totalPrice || item.total)} 
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
                          <OrderProgress 
                            currentStatusText={item.orderStatus?.text || item.status} 
                            orderStatusCode={item.orderStatus?.code} 
                          />
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => fetchOrderDetail(item._id || item.OrderID)}
                            >
                              <FaEye /> Xem
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => navigate(`/admin/orders/update/${item._id || item.OrderID}`)}
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
                      totalPages={orderData.totalPage}   /* Thêm chữ 's' */
                      currentPage={page}
                      onPageChange={handleChangePage}    /* Đổi thành onPageChange */
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