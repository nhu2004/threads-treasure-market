 // Client/src/pages/admin/Invoices/index.jsx
import React, { useState } from 'react';
import { Table, Button, Spinner, Modal } from 'react-bootstrap';
import { FaEye, FaPrint, FaSearch } from 'react-icons/fa';
import { useInvoiceList } from '../../../hooks/admin/invoice/useInvoiceList';
import invoiceApi from '../../../api/invoicesApi';
import InvoiceTemplate from '../../../components/Invoice/InvoiceTemplate'; 
import moment from 'moment';
import './Invoices.css'; // <-- ĐÃ THÊM IMPORT CSS Ở ĐÂY

const Invoices = () => {
  const { invoices, loading, search, setSearch } = useInvoiceList();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewInvoice = async (id) => {
    const detail = await invoiceApi.getDetail(id);
    setSelectedInvoice(detail);
    setShowModal(true);
  };

  const handlePrint = () => {
    window.print(); 
  };

  return (
    <div className="admin-content-wrapper">
      <div className="admin-content-header">Quản lý hóa đơn</div>
      
      {/* Ô tìm kiếm được nhóm lại gọn gàng hơn */}
      <div className="admin-content-action d-flex mb-4">
        <input 
          className="form-control" 
          placeholder="Tìm mã đơn hàng hoặc tên khách hàng..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <Button variant="info" style={{color: 'white'}}>
          <FaSearch />
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Mã Hóa Đơn</th>
            <th>Ngày In</th>
            <th>Khách Hàng</th>
            <th>Tổng Tiền</th>
            <th className="text-center">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" className="text-center py-4"><Spinner animation="border" variant="info"/></td></tr>
          ) : invoices.length > 0 ? (
            invoices.map((inv) => (
              <tr key={inv.InvoiceID}>
                <td className="fw-semibold text-primary">#ORD-{inv.InvoiceID}</td>
                <td>{moment(inv.InvoiceDate).format('DD/MM/YYYY')}</td>
                <td>{inv.CustomerName}</td>
                <td className="fw-bold text-danger">{inv.TotalAmount?.toLocaleString()}đ</td>
                <td className="text-center">
                  <Button variant="info" title="Xem chi tiết" className="me-2" onClick={() => handleViewInvoice(inv.InvoiceID)}>
                    <FaEye color="white" />
                  </Button>
                  <Button variant="success" title="In hóa đơn" onClick={() => handleViewInvoice(inv.InvoiceID)}>
                    <FaPrint />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" className="text-center py-4 text-muted">Không tìm thấy hóa đơn nào!</td></tr>
          )}
        </tbody>
      </Table>

      {/* Modal Xem trước & In Hóa đơn */}
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Xem trước hóa đơn</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedInvoice && <InvoiceTemplate orderDetail={selectedInvoice} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
          <Button variant="primary" onClick={handlePrint}><FaPrint className="me-2"/>In Hóa Đơn</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Invoices;