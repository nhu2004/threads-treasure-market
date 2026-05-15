// src/pages/admin/PurchaseOrders/PurchaseOrderList/index.jsx
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
                ...i, 
                receiveQuantity: i.ReceiveQuantity > 0 ? i.ReceiveQuantity : i.OrderQuantity 
            }));
            setReceiveItems(mappedItems);
            setShowDetailModal(true);
        }
    };

    const handleCompletePO = async () => {
        if (!window.confirm("Hoàn thành đơn này? Tồn kho sẽ được cộng và đơn sẽ KHÓA vĩnh viễn.")) return;
        await purchaseOrderApi.complete(poData.PurchaseOrderID, receiveItems);
        setShowDetailModal(false);
        fetchOrders();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 bg-white rounded shadow-sm">
            <h3 className="mb-4 font-bold border-l-4 border-success pl-3">Quản Lý Yêu Cầu Đặt Hàng / Phiếu Nhập Kho</h3>
            
            <Table hover responsive className="align-middle">
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
                    {orders.map(order => (
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
                                        <Button size="sm" variant="primary" className="me-2" onClick={() => handleStatusUpdate(order.PurchaseOrderID, 'Đang xử lý')}><FaTruck/> Đã Chốt</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(order.PurchaseOrderID, 'Đã hủy')}><FaTimesCircle/> Hủy</Button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal size="xl" show={showDetailModal} onHide={() => setShowDetailModal(false)} contentClassName={styles.printableModal}>
                <Modal.Header closeButton className="no-print">
                    <Modal.Title>Chi Tiết / Kiểm đếm Nhập Kho</Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.printArea}>
                    
                    {/* ==================================================================================== */}
                    {/* 1. GIAO DIỆN XEM VÀ THAO TÁC TRÊN WEB (SẼ BỊ ẨN ĐI KHI BẤM NÚT IN) */}
                    {/* ==================================================================================== */}
                    <div className="d-print-none">
                        <div className="text-center mb-4 pb-3 border-bottom">
                            <h2 className="font-bold uppercase">PHIẾU YÊU CẦU ĐẶT HÀNG / NHẬP KHO</h2>
                            <p className="mb-0 text-muted">Mã phiếu: <b>#PO-{poData?.PurchaseOrderID}</b> | Ngày lập: {new Date(poData?.OrderDate).toLocaleDateString('vi-VN')}</p>
                            <Badge bg={poData?.Status === 'Hoàn tất' ? 'success' : 'warning'}>{poData?.Status}</Badge>
                        </div>
                        <Row className="mb-4">
                            <Col md={6}>
                                <h6 className="fw-bold text-primary border-bottom pb-2">Thông tin Đơn vị Nhận</h6>
                                <p className="mb-1">Cửa hàng: MAISON - Địa chỉ: Quận 1, TP. HCM</p>
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-bold text-success border-bottom pb-2">Thông tin Nhà Cung Cấp</h6>
                                <p className="mb-1">Tên đơn vị: <b>{poData?.SupplierName}</b></p>
                                <p className="mb-1">Người đại diện: {poData?.ContactPerson || 'N/A'} - SĐT: {poData?.Phone || 'N/A'}</p>
                            </Col>
                        </Row>
                        <Table bordered hover>
                            <thead className="table-light text-center">
                                <tr>
                                    <th>STT</th>
                                    <th>Mã SKU</th>
                                    <th>Tên Sản phẩm</th>
                                    <th>Phân loại</th>
                                    <th>SL Chứng từ (Đặt)</th>
                                    <th className="bg-warning text-dark">SL Thực nhận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receiveItems.map((item, idx) => (
                                    <tr key={item.PODetailID} className="align-middle text-center">
                                        <td>{idx + 1}</td>
                                        <td><b>{item.SKU || 'N/A'}</b></td>
                                        <td className="text-start">{item.Name}</td>
                                        <td>{item.Color} / {item.Size}</td>
                                        <td className="text-primary fw-bold">{item.OrderQuantity}</td>
                                        <td style={{ width: '130px' }} className="bg-warning bg-opacity-10">
                                            {poData?.Status === 'Đang xử lý' ? (
                                                <Form.Control type="number" min="0" max={item.OrderQuantity} value={item.receiveQuantity} onChange={(e) => {
                                                    const newItems = [...receiveItems];
                                                    newItems[idx].receiveQuantity = parseInt(e.target.value) || 0;
                                                    setReceiveItems(newItems);
                                                }} className="text-center fw-bold" />
                                            ) : ( <span className="fw-bold">{item.ReceiveQuantity}</span> )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>


                    {/* ==================================================================================== */}
                    {/* 2. GIAO DIỆN CHỈ DÀNH CHO BẢN IN PDF (MẪU SỐ 01-VT CHUẨN KẾ TOÁN) */}
                    {/* ==================================================================================== */}
                    <div className="d-none d-print-block text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                        {/* Header Mẫu */}
                        <Row className="mb-4">
                            <Col xs={6}>
                                <div className="fw-bold">Cửa hàng Thời Trang Nam MAISON</div>
                                <div>Địa chỉ: Quận 1, TP. Hồ Chí Minh</div>
                            </Col>
                            <Col xs={6} className="text-center">
                                <div className="fw-bold">Mẫu số: 01 - VT</div>
                                <div className="fst-italic small">(Ban hành theo Thông tư số 200/2014/TT-BTC<br/>Ngày 22/12/2014 của Bộ Tài chính)</div>
                            </Col>
                        </Row>

                        {/* Tiêu đề Phiếu */}
                        <div className="text-center mb-4">
                            <h3 className="fw-bold mb-1">PHIẾU NHẬP KHO</h3>
                            <div className="fst-italic mb-1">Ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}</div>
                            <div>Số: <b>PN-{poData?.PurchaseOrderID}</b></div>
                        </div>

                        {/* Thông tin nhập */}
                        <div className="mb-3">
                            <p className="mb-1">- Họ và tên người giao hàng: <b>{poData?.ContactPerson || poData?.SupplierName}</b></p>
                            <p className="mb-1">- Theo Đơn đặt hàng số <b>PO-{poData?.PurchaseOrderID}</b> ngày {new Date(poData?.OrderDate).toLocaleDateString('vi-VN')} của cửa hàng MAISON</p>
                            <p className="mb-1">- Nhập tại kho: <b>Kho tổng MAISON</b> - Địa điểm: Quận 1, TP. HCM</p>
                        </div>

                        {/* Bảng Hàng Hóa Mẫu 01-VT */}
                        <table className="table table-print text-center align-middle mb-4">
                            <thead className="fw-bold align-middle">
                                <tr>
                                    <th rowSpan="2" style={{ width: '5%' }}>STT</th>
                                    <th rowSpan="2" style={{ width: '35%' }}>Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa</th>
                                    <th rowSpan="2" style={{ width: '10%' }}>Mã số</th>
                                    <th rowSpan="2" style={{ width: '8%' }}>ĐVT</th>
                                    <th colSpan="2">Số lượng</th>
                                    <th rowSpan="2" style={{ width: '12%' }}>Đơn giá</th>
                                    <th rowSpan="2" style={{ width: '15%' }}>Thành tiền</th>
                                </tr>
                                <tr>
                                    <th>Theo C.Từ</th>
                                    <th>Thực nhập</th>
                                </tr>
                                <tr className="fst-italic fw-normal">
                                    <td>A</td><td>B</td><td>C</td><td>D</td><td>1</td><td>2</td><td>3</td><td>4</td>
                                </tr>
                            </thead>
                            <tbody>
                                {receiveItems.map((item, idx) => {
                                    const qty = poData?.Status === 'Đang xử lý' ? item.receiveQuantity : item.ReceiveQuantity;
                                    const total = item.ImportPrice * qty;
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            {/* Ghép nối Tên Sản Phẩm với Màu và Size theo yêu cầu của bạn */}
                                            <td className="text-start">{item.Name} - Màu: {item.Color} - Size: {item.Size}</td>
                                            <td>{item.SKU || 'N/A'}</td>
                                            <td>Cái</td>
                                            <td>{item.OrderQuantity}</td>
                                            <td>{qty}</td>
                                            <td className="text-end">{format.formatPrice(item.ImportPrice).replace('₫', '')}</td>
                                            <td className="text-end">{format.formatPrice(total).replace('₫', '')}</td>
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td colSpan="4" className="fw-bold text-center">Cộng:</td>
                                    <td className="fw-bold">{receiveItems.reduce((sum, item) => sum + item.OrderQuantity, 0)}</td>
                                    <td className="fw-bold">{receiveItems.reduce((sum, item) => sum + (poData?.Status === 'Đang xử lý' ? item.receiveQuantity : item.ReceiveQuantity), 0)}</td>
                                    <td></td>
                                    <td className="fw-bold text-end">
                                        {format.formatPrice(receiveItems.reduce((sum, item) => sum + (item.ImportPrice * (poData?.Status === 'Đang xử lý' ? item.receiveQuantity : item.ReceiveQuantity)), 0)).replace('₫', '')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mb-4 mt-3">
                            <p className="mb-2">- Tổng số tiền (viết bằng chữ): ..........................................................................................................................................................</p>
                            <p className="mb-1">- Số chứng từ gốc kèm theo: 01 Đơn đặt hàng gốc.</p>
                        </div>

                        {/* Chữ ký */}
                        <Row className="text-center mt-5">
                            <Col>
                                <p className="fw-bold mb-0">NGƯỜI LẬP PHIẾU</p>
                                <p className="fst-italic">(Ký, họ tên)</p>
                            </Col>
                            <Col>
                                <p className="fw-bold mb-0">NGƯỜI GIAO HÀNG</p>
                                <p className="fst-italic">(Ký, họ tên)</p>
                            </Col>
                            <Col>
                                <p className="fw-bold mb-0">THỦ KHO</p>
                                <p className="fst-italic">(Ký, họ tên)</p>
                            </Col>
                            <Col>
                                <div className="fst-italic mb-1">Ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}</div>
                                <p className="fw-bold mb-0">KẾ TOÁN TRƯỞNG</p>
                                <p className="fst-italic">(Ký, họ tên)</p>
                            </Col>
                        </Row>
                    </div>

                </Modal.Body>

                <Modal.Footer className="no-print">
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Đóng</Button>
                    <Button variant="outline-dark" onClick={handlePrint}><FaPrint/> In Phiếu (PDF)</Button>
                    {poData?.Status === 'Đang xử lý' && (
                        <Button variant="success" onClick={handleCompletePO}><FaCheckCircle/> Xác nhận Thực Nhận & Lưu Kho</Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};
export default PurchaseOrderList;