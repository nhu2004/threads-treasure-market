import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Spinner, Row, Col, Table, Badge, Modal } from "react-bootstrap";
import { FaUser, FaTruck, FaMoneyBillWave, FaEdit, FaBan } from "react-icons/fa";
import orderApi from "../../../api/orderApi";
import OrderProgress from "../../../components/OrderProgress";
import "./UpdateOrder.css";
import 'bootstrap/dist/css/bootstrap.min.css';
const UpdateOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // State upload ảnh giao hàng
  const [proofImage, setProofImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // State Modal Hủy đơn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // State Modal Cập nhật chi tiết
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editNote, setEditNote] = useState("");

  // Admin tạm thời giả định ID là 1 (trong thực tế lấy từ context/localStorage)
  const currentAdminId = 1; 

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getById(id);
      setOrderDetail(res.data);
      setEditDiscount(res.data.discount || 0);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- CÁC HÀM XỬ LÝ API ---
  const handlePrintInvoiceAndDeliver = async () => {
    try {
      setLoading(true);
      await orderApi.printInvoiceAndShip(id); 
      alert("Đã in hóa đơn và chuyển sang trạng thái Đang giao!");
      fetchOrder(); // Load lại data
    } catch (error) {
      alert("Có lỗi xảy ra!");
    } finally { setLoading(false); }
  };

  const handleConfirmDelivery = async () => {
    if (!proofImage) return alert("Vui lòng tải ảnh lên!");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("deliveryProofImage", proofImage);
      formData.append("updatedBy", currentAdminId); // Ghi nhận người cập nhật
      
      await orderApi.confirmDelivery(id, formData);
      alert("Xác nhận giao hàng thành công!");
      fetchOrder();
    } catch (error) {
      alert("Cập nhật thất bại!");
    } finally { setLoading(false); }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return alert("Vui lòng nhập lý do hủy đơn!");
    try {
      setLoading(true);
      await orderApi.cancelOrder(id, { reason: cancelReason, updatedBy: currentAdminId });
      alert("Hủy đơn hàng thành công!");
      setShowCancelModal(false);
      fetchOrder();
    } catch (error) {
      alert("Lỗi khi hủy đơn!");
    } finally { setLoading(false); }
  };

  const handleUpdateDetails = async () => {
    try {
      setLoading(true);
      await orderApi.updateOrderDetails(id, { discount: editDiscount, note: editNote, updatedBy: currentAdminId });
      alert("Cập nhật chi tiết thành công!");
      setShowUpdateModal(false);
      fetchOrder();
    } catch (error) {
      alert("Lỗi khi cập nhật!");
    } finally { setLoading(false); }
  };

  if (loadingData) return <div className="p-5 text-center"><Spinner animation="border" /> Đang tải...</div>;
  if (!orderDetail) return <div className="p-5 text-center">Không tìm thấy đơn hàng!</div>;

  const currentStatusText = orderDetail.status || orderDetail?.orderStatus?.text;
  const canCancel = currentStatusText === "Chờ xác nhận" || currentStatusText === "Đang giao";

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 fw-bold">Chi tiết đơn hàng #{id}</h3>
        <Button variant="outline-secondary" onClick={() => navigate("/admin/orders")}>
          &larr; Quay lại danh sách
        </Button>
      </div>

      <Row>
        {/* PHẦN 1: THÔNG TIN KHÁCH HÀNG */}
        <Col md={12} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 text-primary"><FaUser className="me-2"/>Thông tin khách hàng</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}><p><strong>Họ và tên:</strong> {orderDetail.delivery?.fullName || "Chưa cập nhật"}</p></Col>
                <Col md={4}><p><strong>Số điện thoại:</strong> {orderDetail.delivery?.phone || "Chưa cập nhật"}</p></Col>
                <Col md={4}><p><strong>Ngày đặt:</strong> {new Date(orderDetail.orderDate).toLocaleString()}</p></Col>
                <Col md={12}><p className="mb-0"><strong>Địa chỉ giao hàng:</strong> {orderDetail.delivery?.address || "Chưa cập nhật"}</p></Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* PHẦN 2: TRẠNG THÁI & HÀNH ĐỘNG */}
        <Col md={12} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 text-success"><FaTruck className="me-2"/>Trạng thái & Tiến độ</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <OrderProgress currentStatusText={currentStatusText} orderStatusCode={orderDetail?.orderStatus?.code} />
              </div>
              <hr />
              
              {/* Box xử lý tương ứng trạng thái */}
              {currentStatusText === "Chờ xác nhận" && (
                <div className="text-center p-4 bg-light rounded border border-info">
                  <h6 className="text-info fw-bold mb-3">Đơn hàng đủ điều kiện kho.</h6>
                  <p>Bạn có muốn xuất hóa đơn và bắt đầu giao hàng?</p>
                  <Button variant="primary" size="lg" disabled={loading} onClick={handlePrintInvoiceAndDeliver}>
                    {loading ? "Đang xử lý..." : "In hóa đơn & Chuyển sang Đang giao"}
                  </Button>
                </div>
              )}

              {currentStatusText === "Đang giao" && (
                <div className="p-4 border border-warning rounded bg-light mx-auto" style={{ maxWidth: '600px' }}>
                  <h6 className="text-warning fw-bold mb-3">Xác nhận giao hàng (Shipper Mode)</h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Cung cấp hình ảnh xác nhận (Delivery Proof):</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                  </Form.Group>
                  {imagePreview && (
                    <div className="text-center mb-3">
                      <img src={imagePreview} alt="Proof" style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                  )}
                  <Button variant="success" className="w-100" disabled={loading || !proofImage} onClick={handleConfirmDelivery}>
                    {loading ? "Đang xử lý..." : "Xác nhận Đã giao hàng thành công"}
                  </Button>
                </div>
              )}

              {currentStatusText === "Đã giao" && (
                <div className="text-center p-3 alert alert-success mb-0">Đơn hàng đã được giao thành công. Không thể chỉnh sửa.</div>
              )}
              {currentStatusText === "Đã hủy" && (
                <div className="text-center p-3 alert alert-danger mb-0">Đơn hàng đã bị hủy.</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* PHẦN 3: THÔNG TIN SẢN PHẨM & THANH TOÁN */}
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark"><FaMoneyBillWave className="me-2"/>Chi tiết thanh toán</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered hover responsive className="align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>STT</th>
                    <th className="text-start">Tên sản phẩm</th>
                    <th>Hình ảnh</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetail.products?.map((prod, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td className="text-start fw-semibold">{prod.name}</td>
                      <td><img src={prod.image} alt={prod.name} style={{ width: "50px", height: "50px", objectFit: "cover" }} /></td>
                      <td>{prod.quantity}</td>
                      <td>{prod.price?.toLocaleString()} đ</td>
                      <td className="text-danger fw-bold">{(prod.price * prod.quantity).toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-end mt-4">
                <div style={{ width: "350px" }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tạm tính (SubTotal):</span>
                    <strong>{orderDetail.subTotal?.toLocaleString()} đ</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Giảm giá (Discount):</span>
                    <strong>- {orderDetail.discount?.toLocaleString()} đ</strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between text-danger fs-5 fw-bold">
                    <span>Tổng cộng:</span>
                    <span>{orderDetail.total?.toLocaleString()} đ</span>
                  </div>
                </div>
              </div>
            </Card.Body>
            
            {/* THAO TÁC CẬP NHẬT/HỦY */}
            <Card.Footer className="bg-white d-flex gap-2 justify-content-end p-3">
              {currentStatusText !== "Đã giao" && currentStatusText !== "Đã hủy" && (
                <Button variant="outline-primary" onClick={() => setShowUpdateModal(true)}>
                  <FaEdit className="me-1"/> Cập nhật chi tiết & Giảm giá
                </Button>
              )}
              {canCancel && (
                <Button variant="outline-danger" onClick={() => setShowCancelModal(true)}>
                  <FaBan className="me-1"/> Hủy đơn hàng
                </Button>
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* MODAL HỦY ĐƠN HÀNG */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Hủy đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">Lý do hủy đơn (Bắt buộc):</Form.Label>
            <Form.Control 
              as="select" 
              value={cancelReason} 
              onChange={(e) => setCancelReason(e.target.value)}
              className="mb-3"
            >
              <option value="">-- Chọn lý do --</option>
              <option value="Hết hàng">Shop hết hàng</option>
              <option value="Khách đổi ý">Khách hàng liên lạc lại không muốn mua</option>
              <option value="Không liên lạc được">Gọi khách hàng không bắt máy</option>
              <option value="Lý do khác">Lý do khác...</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Đóng</Button>
          <Button variant="danger" disabled={loading} onClick={handleCancelOrder}>
            {loading ? "Đang xử lý..." : "Xác nhận Hủy"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL CẬP NHẬT CHI TIẾT */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Số tiền giảm giá (Discount):</Form.Label>
            <Form.Control type="number" value={editDiscount} onChange={(e) => setEditDiscount(Number(e.target.value))} />
            <Form.Text className="text-muted">Tổng tiền (Total) sẽ tự động được tính lại.</Form.Text>
          </Form.Group>
          <Form.Group>
            <Form.Label>Ghi chú đơn hàng:</Form.Label>
            <Form.Control as="textarea" rows={3} value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Nhập ghi chú cập nhật..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Đóng</Button>
          <Button variant="primary" disabled={loading} onClick={handleUpdateDetails}>Lưu thay đổi</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UpdateOrder;