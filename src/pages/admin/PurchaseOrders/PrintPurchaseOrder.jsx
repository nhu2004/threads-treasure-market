import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { purchaseOrderApi } from '../../../api/purchaseOrdersAPI'; 
import format from '../../../helper/format';
import { Row, Col, Spinner } from 'react-bootstrap';
import html2pdf from 'html2pdf.js'; // Nhúng thư viện xuất PDF

const PrintPurchaseOrder = () => {
    const { id } = useParams();
    const [poData, setPoData] = useState(null);
    const [receiveItems, setReceiveItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Tạo "mỏ neo" để thư viện biết cần chụp khu vực nào xuất ra PDF
    const printRef = useRef();

    useEffect(() => {
        const fetchPO = async () => {
            try {
                const res = await purchaseOrderApi.getById(id);
                if (res.success) {
                    setPoData(res.order);
                    const mappedItems = res.details.map(i => ({ 
                        ...i, receiveQuantity: i.ReceiveQuantity > 0 ? i.ReceiveQuantity : i.OrderQuantity 
                    }));
                    setReceiveItems(mappedItems);
                }
            } catch (error) {
                console.error("Lỗi tải chi tiết đơn:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPO();
    }, [id]);

    // HÀM XUẤT THẲNG RA FILE PDF (KHÔNG HIỆN POPUP CỦA TRÌNH DUYỆT)
    const handleDownloadPDF = () => {
        const element = printRef.current;
        const opt = {
            margin:       10, // Lề giấy
            filename:     `Phieu_Nhap_Kho_PN${id}.pdf`, // Tên file tự động
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true }, // Tăng độ sắc nét
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Lệnh này sẽ âm thầm tạo và tải file PDF xuống máy tính
        html2pdf().set(opt).from(element).save();
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /> <h4>Đang nạp dữ liệu...</h4></div>;

    return (
        <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '20px 0' }}>
            
            {/* KHU VỰC NÚT BẤM (Nằm ngoài printRef nên sẽ không bị in vào PDF) */}
            <div className="text-center mb-4">
                <button onClick={handleDownloadPDF} className="btn btn-success px-4 py-2 mx-2 fw-bold shadow">
                    ⬇ Tải File PDF Trực Tiếp
                </button>
                <button onClick={() => window.close()} className="btn btn-outline-danger px-4 py-2 mx-2 bg-white fw-bold">
                    ❌ Đóng Tab Này
                </button>
            </div>

            {/* ========================================================================= */}
            {/* KHU VỰC ĐƯỢC CHỤP LÀM PDF - Kích thước chuẩn A4                           */}
            {/* ========================================================================= */}
            <div 
                ref={printRef} 
                style={{ 
                    width: '210mm', 
                    minHeight: '297mm', 
                    margin: '0 auto', 
                    padding: '15mm', 
                    background: 'white', 
                    color: 'black',
                    fontFamily: '"Times New Roman", Times, serif',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}
            >
                {/* HEADER CỦA BẢN IN */}
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

                <div className="text-center mb-4 mt-2">
                    <h3 className="fw-bold mb-1">PHIẾU NHẬP KHO</h3>
                    <div className="fst-italic">Ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}</div>
                    <div className="mt-1">Số: <b>PN-{poData?.PurchaseOrderID}</b></div>
                </div>

                <div className="mb-4">
                    <p className="mb-1">- Họ tên người giao hàng: <b>{poData?.ContactPerson || poData?.SupplierName}</b></p>
                    <p className="mb-1">- Theo Đơn đặt hàng số: <b>PO-{poData?.PurchaseOrderID}</b> ngày {new Date(poData?.OrderDate || new Date()).toLocaleDateString('vi-VN')}</p>
                    <p className="mb-1">- Nhập tại kho: <b>Kho tổng MAISON</b></p>
                </div>

                {/* BẢNG SẢN PHẨM CHUẨN KẾ TOÁN */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', marginBottom: '30px' }}>
                    <thead className="text-center align-middle fw-bold">
                        <tr>
                            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px' }}>STT</th>
                            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px' }}>Tên, nhãn hiệu, quy cách SP</th>
                            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px' }}>Mã số</th>
                            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px' }}>ĐVT</th>
                            <th colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>Số lượng</th>
                            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px' }}>Đơn giá</th>
                            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px' }}>Thành tiền</th>
                        </tr>
                        <tr>
                            <th style={{ border: '1px solid black', padding: '8px' }}>C.Từ</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Thực nhập</th>
                        </tr>
                    </thead>
                    <tbody className="align-middle">
                        {receiveItems.map((item, idx) => {
                            const actualQty = poData?.Status === 'Đang xử lý' ? item.receiveQuantity : item.ReceiveQuantity;
                            return (
                                <tr key={idx}>
                                    <td className="text-center" style={{ border: '1px solid black', padding: '8px' }}>{idx + 1}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{item.Name} <br/><small>Màu: {item.Color} - Size: {item.Size}</small></td>
                                    <td className="text-center" style={{ border: '1px solid black', padding: '8px' }}>{item.SKU}</td>
                                    <td className="text-center" style={{ border: '1px solid black', padding: '8px' }}>Cái</td>
                                    <td className="text-center text-primary fw-bold" style={{ border: '1px solid black', padding: '8px' }}>{item.OrderQuantity}</td>
                                    <td className="text-center fw-bold" style={{ border: '1px solid black', padding: '8px' }}>{actualQty}</td>
                                    <td className="text-end" style={{ border: '1px solid black', padding: '8px' }}>{format.formatPrice(item.ImportPrice).replace('₫', '')}</td>
                                    <td className="text-end fw-bold" style={{ border: '1px solid black', padding: '8px' }}>{format.formatPrice(item.ImportPrice * actualQty).replace('₫', '')}</td>
                                </tr>
                            );
                        })}
                        <tr className="fw-bold">
                            <td colSpan="4" className="text-center" style={{ border: '1px solid black', padding: '8px' }}>Cộng:</td>
                            <td className="text-center text-primary" style={{ border: '1px solid black', padding: '8px' }}>{receiveItems.reduce((s, i) => s + i.OrderQuantity, 0)}</td>
                            <td className="text-center" style={{ border: '1px solid black', padding: '8px' }}>{receiveItems.reduce((s, i) => s + (poData?.Status === 'Đang xử lý' ? i.receiveQuantity : i.ReceiveQuantity), 0)}</td>
                            <td className="text-center" style={{ border: '1px solid black', padding: '8px' }}>x</td>
                            <td className="text-end" style={{ border: '1px solid black', padding: '8px' }}>{format.formatPrice(receiveItems.reduce((s, i) => s + (i.ImportPrice * (poData?.Status === 'Đang xử lý' ? i.receiveQuantity : i.ReceiveQuantity)), 0)).replace('₫', '')}</td>
                        </tr>
                    </tbody>
                </table>

                {/* CHỮ KÝ */}
                <Row className="text-center mt-5 pt-4">
                    <Col><b>Người lập phiếu</b><br/><i>(Ký, họ tên)</i></Col>
                    <Col><b>Người giao hàng</b><br/><i>(Ký, họ tên)</i></Col>
                    <Col><b>Thủ kho</b><br/><i>(Ký, họ tên)</i></Col>
                    <Col><b>Kế toán trưởng</b><br/><i>(Ký, họ tên)</i></Col>
                </Row>
            </div>
            
        </div>
    );
};

export default PrintPurchaseOrder;