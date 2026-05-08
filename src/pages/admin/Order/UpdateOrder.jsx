import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Spinner, Row, Col, Table, Badge, Modal } from "react-bootstrap";
import { FaUser, FaTruck, FaMoneyBillWave, FaEdit, FaBan } from "react-icons/fa";
import orderApi from "../../../api/orderApi";
import OrderProgress from "../../../components/OrderProgress"; 
import InvoiceTemplate from "../../../components/Invoice/InvoiceTemplate";  
import 'bootstrap/dist/css/bootstrap.min.css';
import "./UpdateOrder.css"; 
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
// THAY THẾ CÁC HÀM XỬ LÝ API CŨ BẰNG CÁC HÀM SAU:
  const handleConfirmAndCreateInvoice = async () => {
    try {
      setLoading(true);
      // Gọi API BỔ SUNG 1 ở trên
      await orderApi.processAndInvoice(id); 
      alert("Đã tạo hóa đơn và chuyển sang trạng thái Đang xử lý!");
      fetchOrder();
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo hóa đơn!");
    } finally { setLoading(false); }
  };

  const handleShipOrder = async () => {
    try {
      setLoading(true);
      // Gọi API BỔ SUNG 1.5 ở trên
      await orderApi.shipOrder(id); 
      alert("Đã bàn giao cho đơn vị vận chuyển!");
      fetchOrder();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái!");
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

  // BỔ SUNG: KIỂM TRA TỒN KHO CHO ĐƠN HÀNG "CHỜ XÁC NHẬN"
  const outOfStockItems = orderDetail.products?.filter(p => p.quantity > p.stockQuantity) || [];
  const isOutOfStock = outOfStockItems.length > 0;

  
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

      {/* ===== BỔ SUNG: THÔNG TIN NGƯỜI GIAO HÀNG (CHỈ HIỆN KHI ĐANG GIAO HOẶC ĐÃ GIAO) ===== */}
        {(currentStatusText === "Đang giao" || currentStatusText === "Đã giao") && (
          <Col md={12} className="mb-4">
            <Card className="shadow-sm border-0 " style={{ borderLeft: "5px solid #a47b00" }}>
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 text-warning"><FaTruck className="me-2"/>Thông tin người giao hàng (Shipper)</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}><p><strong>Họ và tên:</strong> Nguyễn Văn A </p></Col>
                  <Col md={4}><p><strong>Số điện thoại:</strong> 0987 654 321</p></Col>
                  <Col md={4}><p><strong>Biển số xe:</strong> 59-D1 123.45</p></Col>
                  <Col md={12}><p className="mb-0"><strong>Đơn vị vận chuyển:</strong> Giao hàng hỏa tốc SPX Express</p></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        )}

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
                <div className={`text-center p-4 bg-light rounded border ${isOutOfStock ? 'border-danger' : 'border-info'}`}>
                  <h6 className={`fw-bold mb-3 ${isOutOfStock ? 'text-danger' : 'text-info'}`}>
                    {isOutOfStock ? "Cảnh báo: Không đủ tồn kho" : "Xác nhận Đơn hàng"}
                  </h6>
                  
                  {isOutOfStock ? (
                    // GIAO DIỆN KHI THIẾU HÀNG TRONG KHO
                    <>
                      <p className="text-danger mb-2">Hệ thống phát hiện một số sản phẩm trong đơn không đủ số lượng để xuất kho:</p>
                      <ul className="text-start text-danger mb-3 d-inline-block" style={{textAlign: 'left'}}>
                        {outOfStockItems.map((item, idx) => (
                          <li key={idx}>
                            <strong>{item.name}</strong> (Khách đặt: {item.quantity} | Tồn kho: {item.stockQuantity})
                          </li>
                        ))}
                      </ul>
                      <p className="text-muted mb-0">Vui lòng nhập thêm hàng hoặc liên hệ khách để thỏa thuận Hủy/Đổi đơn.</p>
                      {/* Có thể thêm nút tắt báo hết hàng hoặc chặn thao tác */}
                      <div className="mt-3">
                        <Button variant="secondary" disabled>
                          Không thể duyệt đơn này
                        </Button>
                      </div>
                    </>
                  ) : (
                    // GIAO DIỆN KHI ĐỦ HÀNG (BÌNH THƯỜNG)
                    <>
                      <p className="mb-3">Kho có đủ hàng. Bạn có muốn duyệt đơn và tạo Hóa đơn cho khách hàng?</p>
                      <Button variant="primary" size="lg" disabled={loading} onClick={handleConfirmAndCreateInvoice}>
                        {loading ? "Đang xử lý..." : "Xác nhận & Tạo hóa đơn"}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {currentStatusText === "Đang xử lý" && (
                <div className="text-center p-4 bg-light rounded border border-primary">
                  <h6 className="text-primary fw-bold mb-3 ">Đơn hàng đang được đóng gói</h6>
                  <p className="text-muted mb-3">Hóa đơn đã được tạo trên hệ thống. Hãy in hóa đơn để dán lên kiện hàng.</p>
                  <div className="d-flex justify-content-center gap-3">
                    <Button variant="outline-dark" size="lg" onClick={() => window.print()}>
                       In Hóa Đơn (Bill)
                    </Button>
                    <Button variant="success" size="lg" disabled={loading} onClick={handleShipOrder}>
                      {loading ? "Đang xử lý..." : "Bàn giao Shipper (Đang giao)"}
                    </Button>
                  </div>
                </div>
              )}
              {/* THÊM MỚI BOX NÀY DÀNH CHO TRẠNG THÁI ĐANG GIAO */}
              {currentStatusText === "Đang giao" && (
                <div className="text-center p-4 bg-light rounded border border-warning">
                  <h6 className="text-warning fw-bold mb-3">Xác nhận Đã Giao Hàng Thành Công</h6>
                  <p>Vui lòng tải lên hình ảnh xác minh (chữ ký khách hàng hoặc hình gói hàng tại địa chỉ đích) để hoàn tất đơn.</p>
                  
                  <div className="d-flex flex-column align-items-center">
                    <Form.Group className="mb-3 w-50">
                      <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                    </Form.Group>
                    
                    {imagePreview && (
                      <div className="mb-3">
                        <img src={imagePreview} alt="Minh chứng" style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #ddd" }} />
                      </div>
                    )}

                    <Button variant="warning" size="lg" disabled={loading} onClick={handleConfirmDelivery}>
                      {loading ? "Đang cập nhật..." : "Xác nhận Đã giao"}
                    </Button>
                  </div>
                </div>
              )}

              {currentStatusText === "Đã giao" && (
                <div className="text-center p-3 alert alert-success mb-0">Đơn hàng đã được giao thành công. Không thể chỉnh sửa.</div>
              )}
              {currentStatusText === "Đã hủy" && (
                <div className="text-center p-3 alert alert-danger mb-0"> 
                  {/* HIỂN THỊ LÝ DO HỦY TỪ DATABASE Ở ĐÂY */}
                  {(orderDetail?.CancellationReason || orderDetail?.cancellationReason) && (
                    <p className="fw-bold mb-2 text-danger" style={{fontSize: '16px', fontWeight: '500'}}>
                      Lý do: {orderDetail.CancellationReason || orderDetail.cancellationReason}
                    </p>
                  )}
                </div>
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
              {/* {currentStatusText !== "Đã giao" && currentStatusText !== "Đã hủy" && (
                <Button variant="outline-primary" onClick={() => setShowUpdateModal(true)}>
                  <FaEdit className="me-1"/> Cập nhật chi tiết & Giảm giá
                </Button>
              )} */}
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
              <option value="Hàng lỗi">Sản phẩm bị lỗi</option> 
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
      <InvoiceTemplate orderDetail={orderDetail} />
    </div>
  );
};

export default UpdateOrder;