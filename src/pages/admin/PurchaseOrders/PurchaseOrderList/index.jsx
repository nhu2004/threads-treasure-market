import React, { useState, useEffect } from 'react';
import { purchaseOrderApi } from '../../../../api/purchaseOrdersAPI';
import format from '../../../../helper/format';
import { Table, Badge, Button, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle, FaEye, FaPrint } from 'react-icons/fa';
import styles from './PurchaseOrdersList.module.css';

const PurchaseOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [poData, setPoData] = useState(null); 
    const [receiveItems, setReceiveItems] = useState([]); 

    const fetchOrders = async () => {
        setLoading(true);
        const res = await purchaseOrderApi.getAll();
        if (res.success) setOrders(res.data);
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        if (!window.confirm(`Xác nhận chuyển đơn hàng sang: ${newStatus}?`)) return;
        await purchaseOrderApi.updateStatus(id, newStatus);
        fetchOrders();
    };

    const handleOpenDetail = async (id) => {
        const res = await purchaseOrderApi.getById(id);
        if (res.success) {
            setPoData(res.order);
            const mappedItems = res.details.map(i => ({ 
                ...i, receiveQuantity: i.ReceiveQuantity > 0 ? i.ReceiveQuantity : i.OrderQuantity 
            }));
            setReceiveItems(mappedItems);
            setShowDetailModal(true);
        }
    };

    // Bước 3: Xác nhận Nhập Kho
    const handleCompletePO = async () => {
        if (!window.confirm("Hoàn thành đơn này? Tồn kho sẽ được cộng và đơn sẽ KHÓA vĩnh viễn.")) return;
        
        try {
            const res = await purchaseOrderApi.complete(poData.PurchaseOrderID, receiveItems);
            if (res.success) {
                alert("🎉 Đã lưu kho thành công và cộng dồn số lượng!");
                setShowDetailModal(false);
                fetchOrders();
            } else {
                alert("❌ Lỗi từ server: " + res.message);
            }
        } catch (error) {
            alert("❌ Đã xảy ra lỗi khi lưu kho! Vui lòng thử lại.");
            console.error(error);
        }
    };

    const handlePrint = () => {
        // Mở một Tab mới, dẫn tới đường link của trang Template In kèm theo ID của đơn hàng
        window.open(`/admin/purchase-orders/print/${poData.PurchaseOrderID}`, '_blank');
    };

    return (
        <>
            {/* ======================================================================== */}
            {/* KHU VỰC 1: CHỈ HIỂN THỊ KHI MÁY IN CHẠY (NẰM NGOÀI MODAL)                  */}
            {/* ======================================================================== */}
            <div className={styles.printArea}>
                <Row className="mb-4">
                    <Col xs={7}>
                        <div className="fw-bold text-uppercase">Cửa hàng Thời Trang MAISON</div>
                        <div>Địa chỉ: Quận 1, TP. Hồ Chí Minh</div>
                    </Col>
                    <Col xs={5} className="text-center">
                        <div className="fw-bold">Mẫu số: 01 - VT</div>
                        <div className="fst-italic small">(Ban hành theo TT số 200/2014/TT-BTC)</div>
                    </Col>
                </Row>

                <div className="text-center mb-4">
                    <h3 className="fw-bold mb-1">PHIẾU NHẬP KHO</h3>
                    <div className="fst-italic">Ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}</div>
                    <div>Số: <b>PN-{poData?.PurchaseOrderID}</b></div>
                </div>

                <div className="mb-3">
                    <p className="mb-1">- Họ tên người giao hàng: <b>{poData?.ContactPerson || poData?.SupplierName}</b></p>
                    <p className="mb-1">- Theo Đơn đặt hàng số: <b>PO-{poData?.PurchaseOrderID}</b> ngày {new Date(poData?.OrderDate || new Date()).toLocaleDateString('vi-VN')}</p>
                    <p className="mb-1">- Nhập tại kho: <b>Kho tổng MAISON</b></p>
                </div>

                <table className={styles.tablePrint}>
                    <thead className="text-center align-middle fw-bold">
                        <tr>
                            <th rowSpan="2">STT</th>
                            <th rowSpan="2">Tên, nhãn hiệu, quy cách SP</th>
                            <th rowSpan="2">Mã số</th>
                            <th rowSpan="2">ĐVT</th>
                            <th colSpan="2">Số lượng</th>
                            <th rowSpan="2">Đơn giá</th>
                            <th rowSpan="2">Thành tiền</th>
                        </tr>
                        <tr>
                            <th>C.Từ</th>
                            <th>Thực nhập</th>
                        </tr>
                    </thead>
                    <tbody className="align-middle">
                        {receiveItems.map((item, idx) => {
                            const actualQty = poData?.Status === 'Đang xử lý' ? item.receiveQuantity : item.ReceiveQuantity;
                            return (
                                <tr key={idx}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td>{item.Name} - Màu: {item.Color} - Size: {item.Size}</td>
                                    <td className="text-center">{item.SKU}</td>
                                    <td className="text-center">Cái</td>
                                    <td className="text-center">{item.OrderQuantity}</td>
                                    <td className="text-center">{actualQty}</td>
                                    <td className="text-end">{format.formatPrice(item.ImportPrice).replace('₫', '')}</td>
                                    <td className="text-end">{format.formatPrice(item.ImportPrice * actualQty).replace('₫', '')}</td>
                                </tr>
                            );
                        })}
                        <tr className="fw-bold">
                            <td colSpan="4" className="text-center">Cộng</td>
                            <td className="text-center">{receiveItems.reduce((s, i) => s + i.OrderQuantity, 0)}</td>
                            <td className="text-center">{receiveItems.reduce((s, i) => s + (poData?.Status === 'Đang xử lý' ? i.receiveQuantity : i.ReceiveQuantity), 0)}</td>
                            <td className="text-center">x</td>
                            <td className="text-end">{format.formatPrice(receiveItems.reduce((s, i) => s + (i.ImportPrice * (poData?.Status === 'Đang xử lý' ? i.receiveQuantity : i.ReceiveQuantity)), 0)).replace('₫', '')}</td>
                        </tr>
                    </tbody>
                </table>

                <Row className="text-center mt-5 pt-4">
                    <Col><b>Người lập phiếu</b><br/><i>(Ký, họ tên)</i></Col>
                    <Col><b>Người giao hàng</b><br/><i>(Ký, họ tên)</i></Col>
                    <Col><b>Thủ kho</b><br/><i>(Ký, họ tên)</i></Col>
                    <Col><b>Kế toán trưởng</b><br/><i>(Ký, họ tên)</i></Col>
                </Row>
            </div>


            {/* ======================================================================== */}
            {/* KHU VỰC 2: GIAO DIỆN WEB HIỂN THỊ BÌNH THƯỜNG TRÊN TRÌNH DUYỆT            */}
            {/* ======================================================================== */}
            <div className="p-4 bg-white rounded shadow-sm">
                <h3 className="mb-4 font-bold border-l-4 border-success pl-3">Quản Lý Đơn Nhập Hàng (PO)</h3>
                
                <Table hover responsive className="align-middle border">
                    <thead className="bg-light">
                        <tr>
                            <th>Mã PO</th>
                            <th>Nhà cung cấp</th>
                            <th>Ngày tạo</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-4"><Spinner animation="border" size="sm" /> Đang tải...</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.PurchaseOrderID}>
                                <td><b>#PO-{order.PurchaseOrderID}</b></td>
                                <td>{order.SupplierName}</td>
                                <td>{new Date(order.OrderDate).toLocaleDateString('vi-VN')}</td>
                                <td className="text-success fw-bold">{format.formatPrice(order.TotalAmount)}</td>
                                <td>
                                    <Badge bg={
                                        order.Status === 'Chờ xác nhận' ? 'warning' :
                                        order.Status === 'Đang xử lý' ? 'primary' :
                                        order.Status === 'Hoàn tất' ? 'success' : 'secondary'
                                    }>{order.Status}</Badge>
                                </td>
                                <td>
                                    <Button size="sm" variant="outline-dark" className="me-2" onClick={() => handleOpenDetail(order.PurchaseOrderID)}>
                                        <FaEye /> Chi tiết
                                    </Button>
                                    
                                    {order.Status === 'Chờ xác nhận' && (
                                        <>
                                            <Button size="sm" variant="primary" className="me-2" onClick={() => handleStatusUpdate(order.PurchaseOrderID, 'Đang xử lý')}><FaTruck/> Chốt đơn</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(order.PurchaseOrderID, 'Đã hủy')}><FaTimesCircle/> Hủy</Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* --- MODAL CHỈ CÒN ĐÓNG VAI TRÒ HIỂN THỊ VÀ KIỂM ĐẾM TRÊN WEB --- */}
                <Modal size="xl" show={showDetailModal} onHide={() => setShowDetailModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Chi Tiết / Kiểm đếm Nhập Kho</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center mb-4 pb-3 border-bottom">
                            <h2 className="font-bold uppercase">PHIẾU YÊU CẦU ĐẶT HÀNG / NHẬP KHO</h2>
                            <p className="mb-0 text-muted">Mã phiếu: <b>#PO-{poData?.PurchaseOrderID}</b></p>
                            <Badge bg={poData?.Status === 'Hoàn tất' ? 'success' : 'warning'}>{poData?.Status}</Badge>
                        </div>
                        <Row className="mb-4">
                            <Col md={6}>
                                <h6 className="fw-bold text-primary border-bottom pb-2">Đơn vị nhận: MAISON</h6>
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-bold text-success border-bottom pb-2">Nhà Cung Cấp: {poData?.SupplierName}</h6>
                            </Col>
                        </Row>
                        <Table bordered hover size="sm">
                            <thead className="table-light text-center">
                                <tr>
                                    <th>STT</th>
                                    <th>Mã SKU</th>
                                    <th>Sản phẩm & Phân loại</th>
                                    <th>SL Đặt</th>
                                    <th className="bg-warning bg-opacity-25">SL Thực nhận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receiveItems.map((item, idx) => (
                                    <tr key={item.PODetailID} className="align-middle text-center">
                                        <td>{idx + 1}</td>
                                        <td>{item.SKU}</td>
                                        <td className="text-start">
                                            <b>{item.Name}</b> <br/>
                                            <small className="text-muted">Màu: {item.Color} - Size: {item.Size}</small>
                                        </td>
                                        <td>{item.OrderQuantity}</td>
                                        <td style={{ width: '120px' }}>
                                            {poData?.Status === 'Đang xử lý' ? (
                                                <Form.Control 
                                                    type="number" size="sm" min="0" max={item.OrderQuantity} 
                                                    value={item.receiveQuantity} 
                                                    onChange={(e) => {
                                                        const newItems = [...receiveItems];
                                                        newItems[idx].receiveQuantity = parseInt(e.target.value) || 0;
                                                        setReceiveItems(newItems);
                                                    }}
                                                    className="text-center fw-bold"
                                                />
                                            ) : ( <span className="fw-bold">{item.ReceiveQuantity}</span> )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Đóng</Button>
                        {/* NÚT IN ĐƯỢC ĐẶT Ở ĐÂY, NHƯNG NÓ SẼ GỌI VÙNG ẨN (KHU VỰC 1) BÊN TRÊN */}
                        <Button variant="outline-dark" onClick={handlePrint}><FaPrint/> In Phiếu (PDF)</Button>
                        {poData?.Status === 'Đang xử lý' && (
                            <Button variant="success" onClick={handleCompletePO}><FaCheckCircle/> Hoàn tất Nhập Kho</Button>
                        )}
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
};

export default PurchaseOrderList;