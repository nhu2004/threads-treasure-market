// Client/src/pages/Admin/supplier/index.jsx
import { useCallback, useState } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore";
import { FaEdit, FaSearch, FaFileExport, FaBoxOpen, FaEye, FaClipboardList, FaPlus, FaBan, FaCheckCircle, FaFileInvoiceDollar } from "react-icons/fa";
import { Row, Col, Table, Spinner, Modal, Button, ButtonGroup, Badge } from "react-bootstrap";
import { useSupplierList, useSupplierCRUD } from "../../../hooks/admin/admin";
import supplierApi from "../../../api/supplierApi"; 


import "./SupplierList.css"; 

function SupplierList() {
  const {
    supplierData, page, setPage, loading, searchInput,
    setSearchInput, handleSearch, refreshList,
  } = useSupplierList();

  const {
    loading: crudLoading, showAddModal, setShowAddModal, addsupplier,
    setAddsupplier, handleCreate, showUpdateModal, setShowUpdateModal,
    selectedsupplier, setSelectedsupplier, openUpdateModal, handleUpdate,
    // Ta tái sử dụng các state Delete cũ cho nghiệp vụ Khóa/Mở khóa (Toggle Status)
    showDeleteModal: showToggleModal, setShowDeleteModal: setShowToggleModal, 
    supplierDelete: targetSupplier, openDeleteModal: openToggleModal, handleDelete: executeToggleStatus,
  } = useSupplierCRUD(refreshList);

  const handleChangePage = useCallback((page) => { setPage(page); }, [setPage]);

  // --- STATE CHO MODAL XEM CHI TIẾT & XUẤT FILE ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [activeView, setActiveView] = useState('products'); // products | orders | purchases
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [supplierPurchases, setSupplierPurchases] = useState([]); // Lịch sử nhập hàng
  
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Mở Modal xem chi tiết
  const handleViewSupplier = async (supplier) => {
    setViewingSupplier(supplier);
    setShowDetailsModal(true);
    setActiveView('products'); 
    setSupplierOrders([]);     
    setSupplierPurchases([]);
    setLoadingProducts(true);
    try {
      const data = await supplierApi.exportProducts(supplier.SupplierID || supplier._id);
      setSupplierProducts(data);
    } catch (error) { console.error("Lỗi khi lấy danh sách sản phẩm!"); } 
    finally { setLoadingProducts(false); }
  };

  // Chuyển sang Tab xem Đơn hàng khách mua
  const handleSwitchToOrders = async () => {
    setActiveView('orders');
    if (supplierOrders.length === 0) {
      setLoadingOrders(true);
      try {
        const data = await supplierApi.exportOrders(viewingSupplier.SupplierID || viewingSupplier._id);
        setSupplierOrders(data);
      } catch (error) { console.error("Lỗi khi lấy danh sách đơn hàng!"); } 
      finally { setLoadingOrders(false); }
    }
  };

  // Chuyển sang Tab xem Lịch sử nhập hàng (Purchase Orders)
  const handleSwitchToPurchases = async () => {
    setActiveView('purchases');
    if (supplierPurchases.length === 0) {
      setLoadingPurchases(true);
      try {
        // Cần viết thêm API này ở Backend (SELECT * FROM PurchaseOrders WHERE SupplierID = ?)
        const data = await supplierApi.getPurchaseOrders(viewingSupplier.SupplierID || viewingSupplier._id);
        setSupplierPurchases(data || []);
      } catch (error) { console.error("Lỗi khi lấy lịch sử nhập hàng!"); } 
      finally { setLoadingPurchases(false); }
    }
  };

  // Hàm xuất file CSV
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return alert("Không có dữ liệu để xuất!");
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(',')); 
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] === null ? "" : row[header];
        return `"${String(val).replace(/"/g, '""')}"`; 
      });
      csvRows.push(values.join(','));
    }
    const BOM = '\uFEFF'; 
    const blob = new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    setExporting(true);
    try {
      if (activeView === 'products') downloadCSV(supplierProducts, `SP_NCC_${viewingSupplier.Name || viewingSupplier.name}`);
      else if (activeView === 'orders') downloadCSV(supplierOrders, `DonBan_NCC_${viewingSupplier.Name || viewingSupplier.name}`);
      else downloadCSV(supplierPurchases, `LichSuNhap_NCC_${viewingSupplier.Name || viewingSupplier.name}`);
    } catch (error) { alert("Lỗi xuất file!"); } 
    finally { setExporting(false); }
  };

  return (
    <Row>
      {/* 1. MODAL CHI TIẾT (SẢN PHẨM, ĐƠN BÁN, LỊCH SỬ NHẬP) */}
      <Modal size="xl" show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Nhà cung cấp: <span className="text-primary fw-bold">{viewingSupplier?.Name || viewingSupplier?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Box thông tin liên hệ nhanh */}
          <div className="bg-light p-3 rounded mb-3 text-sm">
            <Row>
              <Col md={4}><b>Người LH:</b> {viewingSupplier?.ContactPerson || 'Chưa cập nhật'}</Col>
              <Col md={4}><b>SĐT:</b> {viewingSupplier?.Phone || 'Chưa cập nhật'}</Col>
              <Col md={4}><b>Email:</b> {viewingSupplier?.Email || 'Chưa cập nhật'}</Col>
              <Col md={12} className="mt-2"><b>Địa chỉ:</b> {viewingSupplier?.Address || 'Chưa cập nhật'}</Col>
            </Row>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom flex-wrap gap-2">
            <ButtonGroup>
              <Button variant={activeView === 'products' ? 'primary' : 'outline-primary'} onClick={() => setActiveView('products')}>
                <FaBoxOpen className="me-2" /> Sản Phẩm
              </Button>
              <Button variant={activeView === 'purchases' ? 'warning' : 'outline-warning'} onClick={handleSwitchToPurchases}>
                <FaFileInvoiceDollar className="me-2" /> Lịch Sử Nhập
              </Button>
              <Button variant={activeView === 'orders' ? 'success' : 'outline-success'} onClick={handleSwitchToOrders}>
                <FaClipboardList className="me-2" /> Đơn Đã Bán
              </Button>
            </ButtonGroup>
            <Button variant="dark" onClick={handleExport} disabled={exporting}>
              <FaFileExport className="me-2" /> Xuất Excel
            </Button>
          </div>

          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {activeView === 'products' && (
              loadingProducts ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                <Table striped bordered hover className="mb-0">
                  <thead className="table-light sticky-top">
                    <tr><th>Mã SP</th><th>Tên Sản Phẩm</th><th>Giá Bán</th><th className="text-center">Tồn Kho</th></tr>
                  </thead>
                  <tbody>
                    {supplierProducts.length > 0 ? supplierProducts.map((p, i) => (
                      <tr key={i}>
                        <td>{p['Mã SP'] || p.ProductID}</td><td className="fw-semibold">{p['Tên Sản Phẩm'] || p.Name}</td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p['Giá Bán'] || p.Price || 0)}</td>
                        <td className="text-center"><span className={`badge ${p['Tồn Kho'] > 0 ? 'bg-primary' : 'bg-danger'}`}>{p['Tồn Kho'] || p.StockQuantity}</span></td>
                      </tr>
                    )) : <tr><td colSpan="4" className="text-center py-4 text-muted">NCC này chưa có sản phẩm nào.</td></tr>}
                  </tbody>
                </Table>
              )
            )}
            
            {activeView === 'purchases' && (
              loadingPurchases ? <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div> : (
                <Table striped bordered hover className="mb-0">
                  <thead className="table-light sticky-top">
                    <tr><th>Mã PO</th><th>Ngày Đặt</th><th>Tổng Tiền</th><th>Đã Thanh Toán</th><th>Công Nợ</th><th>Trạng Thái</th></tr>
                  </thead>
                  <tbody>
                    {supplierPurchases.length > 0 ? supplierPurchases.map((po, i) => (
                      <tr key={i}>
                        <td>#{po.PurchaseOrderID}</td>
                        <td>{new Date(po.OrderDate).toLocaleDateString('vi-VN')}</td>
                        <td className="fw-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(po.TotalAmount || 0)}</td>
                        <td className="text-success">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(po.AmountPaid || 0)}</td>
                        <td className="text-danger">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(po.DebtAmount || 0)}</td>
                        <td><Badge bg={po.Status === 'Hoàn tất' ? 'success' : 'warning'}>{po.Status}</Badge></td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center py-4 text-muted">Chưa có lịch sử nhập hàng nào.</td></tr>}
                  </tbody>
                </Table>
              )
            )}

            {activeView === 'orders' && (
              loadingOrders ? <div className="text-center py-5"><Spinner animation="border" variant="success" /></div> : (
                <Table striped bordered hover className="mb-0">
                  {/* Cấu trúc bảng Đơn Bán giữ nguyên như cũ */}
                  <thead className="table-light sticky-top">
                    <tr><th>Mã Đơn</th><th>Ngày Đặt</th><th>Tên Sản Phẩm</th><th className="text-center">SL</th><th>Thành Tiền</th></tr>
                  </thead>
                  <tbody>
                    {supplierOrders.length > 0 ? supplierOrders.map((o, i) => (
                      <tr key={i}>
                        <td>{o['Mã Đơn']}</td><td>{o['Ngày Đặt']}</td><td className="fw-semibold">{o['Tên Sản Phẩm']}</td>
                        <td className="text-center"><span className="badge bg-success">{o['Số Lượng Bán']}</span></td>
                        <td className="text-danger fw-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o['Thành Tiền'] || 0)}</td>
                      </tr>
                    )) : <tr><td colSpan="5" className="text-center py-4 text-muted">Chưa có đơn hàng nào bán được.</td></tr>}
                  </tbody>
                </Table>
              )
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* 2. MODAL CẬP NHẬT NHÀ CUNG CẤP (Layout 2 cột) */}
      <Modal size="xl" show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton><Modal.Title>Cập nhật nhà cung cấp</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <Row>
              <Col md={6}>
                <label className="fw-semibold mb-1">Tên nhà cung cấp <span className="text-danger">*</span></label>
                <input required type="text" value={selectedsupplier?.Name || selectedsupplier?.name || ""} className="form-control mb-3" 
                  onChange={(e) => setSelectedsupplier({ ...selectedsupplier, Name: e.target.value, name: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Người liên hệ</label>
                <input type="text" value={selectedsupplier?.ContactPerson || ""} className="form-control mb-3" 
                  onChange={(e) => setSelectedsupplier({ ...selectedsupplier, ContactPerson: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Số điện thoại</label>
                <input type="text" value={selectedsupplier?.Phone || ""} className="form-control mb-3" 
                  onChange={(e) => setSelectedsupplier({ ...selectedsupplier, Phone: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Email</label>
                <input type="email" value={selectedsupplier?.Email || ""} className="form-control mb-3" 
                  onChange={(e) => setSelectedsupplier({ ...selectedsupplier, Email: e.target.value })} />
              </Col>
              <Col md={12}>
                <label className="fw-semibold mb-1">Địa chỉ</label>
                <input type="text" value={selectedsupplier?.Address || ""} className="form-control mb-3" 
                  onChange={(e) => setSelectedsupplier({ ...selectedsupplier, Address: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Tên Ngân hàng</label>
                <input type="text" value={selectedsupplier?.BankName || ""} className="form-control mb-3" 
                  onChange={(e) => setSelectedsupplier({ ...selectedsupplier, BankName: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Số tài khoản</label>
                <input type="text" value={selectedsupplier?.BankAccount || ""} className="form-control mb-3" 
                  onChange={(e) => setSelectedsupplier({ ...selectedsupplier, BankAccount: e.target.value })} />
              </Col>
              <Col md={12}>
                <label className="fw-semibold mb-1">Mô tả chi tiết</label>
                <textarea className="form-control" rows="3" value={selectedsupplier?.Description || selectedsupplier?.description || ""} 
                  onChange={(e) => setSelectedsupplier({ ...selectedsupplier, Description: e.target.value, description: e.target.value })} />
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button disabled={crudLoading} type="submit" variant="primary">Lưu thay đổi</Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* 3. MODAL THÊM MỚI NHÀ CUNG CẤP (Layout 2 cột) */}
      <Modal size="xl" show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Thêm nhà cung cấp mới</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreate}>
            {/* Tương tự form Cập nhật ở trên, mapping vào addsupplier */}
            <Row>
              <Col md={6}>
                <label className="fw-semibold mb-1">Tên nhà cung cấp <span className="text-danger">*</span></label>
                <input required type="text" className="form-control mb-3" onChange={(e) => setAddsupplier({ ...addsupplier, Name: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Người liên hệ</label>
                <input type="text" className="form-control mb-3" onChange={(e) => setAddsupplier({ ...addsupplier, ContactPerson: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Số điện thoại</label>
                <input type="text" className="form-control mb-3" onChange={(e) => setAddsupplier({ ...addsupplier, Phone: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Email</label>
                <input type="email" className="form-control mb-3" onChange={(e) => setAddsupplier({ ...addsupplier, Email: e.target.value })} />
              </Col>
              <Col md={12}>
                <label className="fw-semibold mb-1">Địa chỉ</label>
                <input type="text" className="form-control mb-3" onChange={(e) => setAddsupplier({ ...addsupplier, Address: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Tên Ngân hàng</label>
                <input type="text" className="form-control mb-3" onChange={(e) => setAddsupplier({ ...addsupplier, BankName: e.target.value })} />
              </Col>
              <Col md={6}>
                <label className="fw-semibold mb-1">Số tài khoản</label>
                <input type="text" className="form-control mb-3" onChange={(e) => setAddsupplier({ ...addsupplier, BankAccount: e.target.value })} />
              </Col>
              <Col md={12}>
                <label className="fw-semibold mb-1">Mô tả</label>
                <textarea className="form-control" rows="3" onChange={(e) => setAddsupplier({ ...addsupplier, Description: e.target.value })} />
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button disabled={crudLoading} type="submit" variant="success">Tạo nhà cung cấp</Button>
            </div>
          </form>
        </Modal.Body>
      </Modal> 

      {/* 4. MODAL XÁC NHẬN KHÓA/MỞ KHÓA (Thay thế Xóa) */}
      <Modal size="md" show={showToggleModal} onHide={() => setShowToggleModal(false)}>
        <Modal.Header closeButton><Modal.Title>Xác nhận thay đổi trạng thái</Modal.Title></Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn 
          <b className={targetSupplier?.IsActive ? "text-danger mx-1" : "text-success mx-1"}>
            {targetSupplier?.IsActive ? "Ngừng hợp tác" : "Hợp tác lại"}
          </b> 
          với nhà cung cấp <b>{targetSupplier?.Name || targetSupplier?.name}</b> không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowToggleModal(false)}>Hủy</Button>
          <Button variant={targetSupplier?.IsActive ? "danger" : "success"} onClick={executeToggleStatus}>
             Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- GIAO DIỆN CHÍNH BẢNG DATA --- */}
      <Col xl={12}>
        <div className="supplier-wrapper">
          <h2 className="supplier-header-title">Quản lý Nhà Cung Cấp & Nhập Hàng</h2>
          
          <div className="supplier-action-bar">
            <div className="supplier-search">
              <input type="text" placeholder="Tìm tên, SĐT, Người liên hệ..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <button type="button" onClick={handleSearch}><FaSearch /> Tìm kiếm</button>
            </div>
            <button className="supplier-btn-add" onClick={() => setShowAddModal(true)}><FaPlus /> Thêm NCC mới</button>
          </div>

          <div className="supplier-table-container">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '60px' }}>STT</th>
                  <th>Tên & Liên Hệ</th>
                  <th>Thông tin thanh toán</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center" style={{ width: '150px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="success" /></td></tr>
                ) : supplierData.suppliers && supplierData.suppliers.length > 0 ? (
                  supplierData.suppliers.map((item, index) => {
                    const isActive = item.IsActive === 1 || item.IsActive === true; // Tùy SQL trả về bit hay boolean
                    return (
                      <tr key={item.SupplierID || item._id}>
                        <td className="text-center">{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td>
                          <div className="fw-bold" style={{ color: "#1f2937", cursor: "pointer", fontSize: '15px' }} onClick={() => handleViewSupplier(item)}>
                            {item.Name || item.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
                            <i className="me-2">👤 {item.ContactPerson || 'N/A'}</i>
                            <i>📞 {item.Phone || 'N/A'}</i>
                          </div>
                        </td>
                        <td>
                           <div style={{ fontSize: '14px' }}><b>NH:</b> {item.BankName || 'N/A'}</div>
                           <div className="text-muted" style={{ fontSize: '13px' }}><b>STK:</b> {item.BankAccount || 'N/A'}</div>
                        </td>
                        <td className="text-center">
                          <Badge bg={isActive ? 'success' : 'secondary'} className="px-3 py-2">
                            {isActive ? 'Đang hợp tác' : 'Ngừng hợp tác'}
                          </Badge>
                        </td>
                        <td>
                          <div className="supplier-action-group">
                            <button className="supplier-action-btn view" title="Xem & Lịch sử nhập" onClick={() => handleViewSupplier(item)}><FaEye /></button>
                            <button className="supplier-action-btn edit" title="Chỉnh sửa" onClick={() => openUpdateModal(item)}><FaEdit /></button>
                            {/* Nút Đổi trạng thái thay vì Xóa */}
                            <button className="supplier-action-btn delete" style={{ borderColor: isActive ? '#ef4444' : '#10b981', color: isActive ? '#ef4444' : '#10b981'}} 
                                    title={isActive ? "Ngừng hợp tác" : "Mở khóa"} 
                                    onClick={() => openToggleModal(item)}>
                              {isActive ? <FaBan /> : <FaCheckCircle />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">Không tìm thấy nhà cung cấp!</td></tr>
                )}
              </tbody>
            </table>
            
            <div className="supplier-pagination">
              {supplierData.totalPage > 1 ? <PaginationproductStore totalPage={supplierData.totalPage} currentPage={page} onChangePage={handleChangePage} /> : null}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default SupplierList;