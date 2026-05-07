import React from 'react';
import './InvoiceTemplate.css';
import moment from 'moment';
import Barcode from 'react-barcode'; 

const InvoiceTemplate = ({ orderDetail }) => {
  if (!orderDetail) return null;

  // Tính tổng số lượng sản phẩm
  const totalQuantity = orderDetail.products?.reduce((total, item) => total + item.quantity, 0) || 0;
  const barcodeValue = `ORD-${orderDetail.id || orderDetail.OrderID}`;

  return (
    <div className="invoice-print-container">
      {/* PHẦN HEADER CỬA HÀNG */}
      <div className="invoice-header">
        <div className="store-info">
          <h2 className="store-name">MAISON THỜI TRANG NAM</h2>
          <p>Địa chỉ: 123 Đường Fashion, Quận 1, TP. HCM</p>
          <p>Điện thoại: 0909 123 456 - Website: maison.vn</p>
        </div>
        <div className="invoice-title-block">
          <h1 className="invoice-title">HÓA ĐƠN BÁN HÀNG</h1>
          <p className="invoice-id">Mã đơn: <strong>#ORD-{orderDetail.id || orderDetail.OrderID}</strong></p>
          <p className="invoice-date">Ngày in: {moment().format('DD/MM/YYYY HH:mm')}</p>
        </div>
      </div>

      <hr className="divider" />

      {/* BỔ SUNG TIÊU ĐỀ HÓA ĐƠN BÁN LẺ TRÊN Ô KHÁCH HÀNG */}
      <div className="retail-label-container">
        <h3 className="retail-invoice-text">HÓA ĐƠN BÁN LẺ</h3>
      </div>

      {/* PHẦN THÔNG TIN KHÁCH HÀNG */}
      <div className="customer-info">
        <div className="info-row">
          <span className="label">Khách hàng:</span>
          <span className="value fw-bold">{orderDetail.delivery?.fullName}</span>
        </div>
        <div className="info-row">
          <span className="label">Điện thoại:</span>
          <span className="value">{orderDetail.delivery?.phone}</span>
        </div>
        <div className="info-row">
          <span className="label">Địa chỉ:</span>
          <span className="value">{orderDetail.delivery?.address}</span>
        </div>
        <div className="info-row">
          <span className="label">Ngày đặt:</span>
          <span className="value">{moment(orderDetail.orderDate).format('DD/MM/YYYY HH:mm')}</span>
        </div>
      </div>

      {/* BẢNG SẢN PHẨM */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th width="10%" className="text-center">STT</th>
            <th width="40%" className="text-left pl-2">Tên sản phẩm</th>
            <th width="10%" className="text-center">SL</th>
            <th width="20%" className="text-right">Đơn giá</th>
            <th width="20%" className="text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {orderDetail.products?.map((item, index) => (
            <tr key={index}>
              <td className="text-center">{index + 1}</td>
              <td className="text-left pl-2">{item.name}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">{item.price?.toLocaleString()}đ</td>
              <td className="text-right fw-bold">{(item.price * item.quantity).toLocaleString()}đ</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PHẦN TỔNG KẾT */}
      <div className="invoice-summary">
        <div className="summary-row">
          <span>Tổng số lượng:</span>
          <span>{totalQuantity} sản phẩm</span>
        </div>
        <div className="summary-row">
          <span>Tổng tiền hàng:</span>
          <span>{orderDetail.subTotal?.toLocaleString()}đ</span>
        </div>
        {orderDetail.discount > 0 && (
          <div className="summary-row discount-row">
            <span>Giảm giá (Voucher):</span>
            <span>- {orderDetail.discount?.toLocaleString()}đ</span>
          </div>
        )}
        <div className="summary-row total">
          <span>PHẢI THANH TOÁN:</span>
          <span>{orderDetail.total?.toLocaleString()}đ</span>
        </div>
      </div>

      {/* FOOTER & MÃ VẠCH */}
      <div className="invoice-footer">
        <p className="thank-you">Cảm ơn Quý khách đã mua sắm tại MAISON!</p>
        <p className="policy">Chính sách: Hỗ trợ đổi trả size trong vòng 07 ngày (yêu cầu giữ nguyên tem mác).</p>
        <div className="barcode-real">
          <Barcode 
            value={barcodeValue} 
            width={1.5} height={40} fontSize={14} 
            displayValue={true} background="#ffffff" lineColor="#000000" margin={10}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;