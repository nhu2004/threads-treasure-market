import React from 'react';
import moment from 'moment';
import Barcode from 'react-barcode';
import './InvoiceTemplate.css'; // Sẽ tạo file CSS này ở bước 3

const InvoiceTemplate = ({ orderDetail }) => {
    if (!orderDetail) return null;

    // Tính tổng số lượng sản phẩm
    const totalQuantity = orderDetail.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <div className="receipt-container" id="invoice-print-area">
            {/* Header: Thông tin cửa hàng & Thông tin hóa đơn */}
            <div className="receipt-header">
                <div className="store-info">
                    <h3 className="store-name">MAISON THỜI TRANG NAM</h3>
                    <p>Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP. HCM</p>
                    <p>Điện thoại: 0909 123 456 - Website: maison.vn</p>
                </div>
                <div className="invoice-info">
                    <h3 className="invoice-title">HÓA ĐƠN BÁN HÀNG</h3>
                    <p><strong>Mã đơn:</strong> #ORD-{orderDetail.OrderID}</p>
                    <p>Ngày in: {moment().format('DD/MM/YYYY HH:mm')}</p>
                </div>
            </div>

            <div className="receipt-divider border-top"></div>
            <h4 className="receipt-subtitle text-center">HÓA ĐƠN BÁN LẺ</h4>

            {/* Thông tin khách hàng */}
            <div className="customer-info">
                <div className="info-row"><span className="label">Khách hàng:</span> <span className="value fw-bold">{orderDetail.delivery?.fullName}</span></div>
                <div className="info-row"><span className="label">Điện thoại:</span> <span className="value">{orderDetail.delivery?.phone}</span></div>
                <div className="info-row"><span className="label">Địa chỉ:</span> <span className="value">{orderDetail.delivery?.address}</span></div>
                <div className="info-row"><span className="label">Ngày đặt:</span> <span className="value">{moment(orderDetail.orderDate).format('DD/MM/YYYY HH:mm')}</span></div>
            </div>

            {/* Bảng sản phẩm */}
            <table className="receipt-table">
                <thead>
                    <tr>
                        <th className="text-center">STT</th>
                        <th className="text-start">Tên sản phẩm</th>
                        <th className="text-center">SL</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền<br/><small>(Đã bao gồm VAT)</small></th>
                    </tr>
                </thead>
                <tbody>
                    {orderDetail.products?.map((item, index) => (
                        <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-start">{item.name}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">{item.price?.toLocaleString()}đ</td>
                            <td className="text-end fw-bold">{(item.price * item.quantity)?.toLocaleString()}đ</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Tổng kết tiền */}
            <div className="receipt-summary">
                <div className="summary-row">
                    <span>Tổng số lượng:</span>
                    <span>{totalQuantity} sản phẩm</span>
                </div>
                <div className="summary-row">
                    <span>Tổng tiền (sản phẩm):</span>
                    <span>{orderDetail.subTotal?.toLocaleString()}đ</span>
                </div>
                <div className="summary-row discount-row">
                    <span className="fst-italic">Giảm giá (Voucher):</span>
                    <span className="fst-italic">- {orderDetail.discount?.toLocaleString()}đ</span>
                </div>
                <div className="receipt-divider"></div>
                <div className="summary-row final-total">
                    <span>Phải thanh toán:</span>
                    <span>{orderDetail.total?.toLocaleString()}đ</span>
                </div>
            </div>

            {/* Footer & Barcode */}
            <div className="receipt-footer">
                <p className="fst-italic">Cảm ơn Quý khách đã mua sắm tại MAISON!</p>
                 
                <div className="barcode-container">
                    <Barcode 
                        value={`ORD-${orderDetail.OrderID}`} 
                        width={1.5} 
                        height={40} 
                        displayValue={true} 
                        fontSize={14}
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;