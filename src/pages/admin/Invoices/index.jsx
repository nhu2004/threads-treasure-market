// Client/src/pages/admin/Invoices/index.jsx
import React, { useState, useCallback } from 'react';
import { Table, Button, Spinner, Modal, Row, Col, Form } from 'react-bootstrap';
import { FaEye, FaPrint, FaSearch, FaFilter, FaFilePdf } from 'react-icons/fa';
import { useInvoiceList } from '../../../hooks/admin/invoice/useInvoiceList';
import invoiceApi from '../../../api/invoicesAPI';
import InvoiceTemplate from '../../../components/Invoice/InvoiceTemplate'; 
import PaginationproductStore from "../../../components/PaginationproductStore";
import moment from 'moment';
import html2pdf from 'html2pdf.js';
import './Invoices.css'; 

const Invoices = () => {
  // 1. KHAI BÁO BIẾN STATE LƯU TRỮ GIÁ TRỊ LỌC TẠI COMPONENT (Giống OrderList)
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 2. TRUYỀN PARAM VÀO HOOK (Hook sẽ tự động bắt sự thay đổi)
  const { invoiceData, page, setPage, loading } = useInvoiceList({
    search: searchId,
    status: statusFilter,
    startDate: startDate,
    endDate: endDate
  });
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 3. HÀM XỬ LÝ SUBMIT LỌC
  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1); // Trở về trang 1 mỗi khi đổi tiêu chí lọc
  };

  const handleViewInvoice = async (id) => {
    const detail = await invoiceApi.getDetail(id);
    if (detail) {
      setSelectedInvoice(detail);
      setShowModal(true);
    }
  };
const handleDownloadPDF = async (id) => {
    // 1. Lấy dữ liệu hóa đơn
    const detail = await invoiceApi.getDetail(id);
    if (!detail) return;

    // 2. Set dữ liệu để render ra template ẩn (hoặc hiện trong Modal)
    setSelectedInvoice(detail);

    // 3. Đợi DOM cập nhật rồi gọi html2pdf chụp lại màn hình
    setTimeout(() => {
        const element = document.getElementById('invoice-print-area');
        if (!element) return;

        const opt = {
            margin:       0.5,
            filename:     `Hoa_Don_${id}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    }, 200); 
};
  return (
    <div>
    <div className="admin-content-wrapper">
      <div className="admin-content-header">Hệ thống Quản lý Hóa đơn</div>
      
      {/* 4. BAO BỌC BỘ LỌC BẰNG <Form> VÀ GẮN onSubmit */}
      <Form className="filter-section mb-4 p-3 bg-light rounded border" onSubmit={handleFilter}>
        <Row className="g-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-bold"><FaSearch className="me-1"/> Tìm kiếm</Form.Label>
              <Form.Control 
                placeholder="Mã hóa đơn, Đơn hàng, Tên, SĐT..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label className="fw-bold">Trạng thái</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Paid">Đã thanh toán</option>
                <option value="Unpaid">Chờ thanh toán</option> 
                <option value="Cancelled">Đã hủy</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label className="fw-bold">Từ ngày</Form.Label>
              <Form.Control 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label className="fw-bold">Đến ngày</Form.Label>
              <Form.Control 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            {/* THÊM type="submit" ĐỂ TRIGGER SỰ KIỆN CỦA FORM */}
            <Button variant="primary" type="submit" className="w-100">
              <FaFilter className="me-2"/> Lọc dữ liệu
            </Button>
          </Col>
        </Row>
      </Form>

      {/* BẢNG DANH SÁCH HÓA ĐƠN */}
      <Table striped bordered hover responsive className="shadow-sm">
        {/* ... (Phần nội dung Thead và Tbody giữ nguyên code của bạn) ... */}
        <thead className="table-dark">
          <tr>
            <th>Mã Hóa Đơn</th>
            <th>Ngày Xuất</th> 
            <th>Khách Hàng</th>
            <th>Tham Chiếu</th>
            <th>Tổng Tiền</th>
            <th className="text-center">Trạng Thái</th>
            <th className="text-center">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="8" className="text-center py-5"><Spinner animation="border" variant="primary"/></td></tr>
          ) : invoiceData?.invoices?.length > 0 ? (
            invoiceData.invoices.map((inv) => (
              <tr key={inv.InvoiceID}>
                <td className="fw-bold text-primary">
                  INV-{moment(inv.InvoiceDate).year()}-{String(inv.InvoiceID).padStart(3, '0')}
                </td>
                <td>{moment(inv.InvoiceDate).format('DD/MM/YYYY')}</td> 
                <td>
                  <div className="fw-semibold">{inv.CustomerName}</div>
                  <small className="text-muted">{inv.Phone}</small>
                </td>
                <td><span className="badge bg-secondary">#ORD-{inv.OrderID}</span></td>
                <td className="fw-bold text-danger">{inv.TotalAmount?.toLocaleString()}đ</td>
                <td className="text-center">
                  <span className={`badge ${inv.Status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                    {inv.Status === 'Paid' ? 'Đã thanh toán' : 'Chờ xử lý'}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="outline-info" size="sm" onClick={() => handleViewInvoice(inv.InvoiceID)} title="Xem chi tiết"><FaEye /></Button>
                     
                    <Button variant="outline-success" size="sm" onClick={() => handleViewInvoice(inv.InvoiceID)} title="In hóa đơn"><FaPrint /></Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
             <tr><td colSpan="8" className="text-center py-4 text-muted">Không tìm thấy hóa đơn phù hợp!</td></tr>
          )}
        </tbody>
      </Table>

      {/* PHÂN TRANG: Đã sửa lại tên props cho khớp với OrderList */}
      {invoiceData?.totalPage > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <PaginationproductStore 
            totalPages={invoiceData.totalPage} 
            currentPage={page} 
            onPageChange={(p) => setPage(p)} 
          />
        </div>
      )}

      {/* MODAL IN HÓA ĐƠN (Giữ nguyên) */}
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Xem trước & In hóa đơn</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedInvoice && <InvoiceTemplate orderDetail={selectedInvoice} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
          <Button variant="primary" onClick={() => window.print()}><FaPrint className="me-2"/> In ngay</Button>
        </Modal.Footer>
      </Modal>
    </div>
    </div>
  );
};

export default Invoices;