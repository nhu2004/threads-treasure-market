// Client/src/pages/Admin/supplier/index.jsx
import { useCallback, useState } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch, FaFileExport, FaBoxOpen, FaEye, FaClipboardList } from "react-icons/fa";
import { Row, Col, Table, Spinner, Modal, Button, ButtonGroup } from "react-bootstrap";
import { usesupplierList, usesupplierCRUD } from "../../../hooks/admin/admin";
import supplierApi from "../../../api/supplierApi";

function SupplierList() {
  const {
    supplierData, page, setPage, loading, searchInput,
    setSearchInput, handleSearch, refreshList,
  } = usesupplierList();

  const {
    loading: crudLoading, showAddModal, setShowAddModal, addsupplier,
    setAddsupplier, handleCreate, showUpdateModal, setShowUpdateModal,
    selectedsupplier, setSelectedsupplier, openUpdateModal, handleUpdate,
    showDeleteModal, setShowDeleteModal, supplierDelete, openDeleteModal, handleDelete,
  } = usesupplierCRUD(refreshList);

  const handleChangePage = useCallback((page) => { setPage(page); }, [setPage]);

  // --- STATE CHO MODAL XEM CHI TIẾT & XUẤT FILE ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [activeView, setActiveView] = useState('products'); 
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Mở Modal xem chi tiết
  const handleViewSupplier = async (supplier) => {
    setViewingSupplier(supplier);
    setShowDetailsModal(true);
    setActiveView('products'); 
    setSupplierOrders([]);     
    setLoadingProducts(true);
    try {
      const data = await supplierApi.exportProducts(supplier._id);
      setSupplierProducts(data);
    } catch (error) { alert("Lỗi khi lấy danh sách sản phẩm!"); } 
    finally { setLoadingProducts(false); }
  };

  // Chuyển sang Tab xem Đơn hàng
  const handleSwitchToOrders = async () => {
    setActiveView('orders');
    if (supplierOrders.length === 0) {
      setLoadingOrders(true);
      try {
        const data = await supplierApi.exportOrders(viewingSupplier._id);
        setSupplierOrders(data);
      } catch (error) { alert("Lỗi khi lấy danh sách đơn hàng!"); } 
      finally { setLoadingOrders(false); }
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
      if (activeView === 'products') {
        downloadCSV(supplierProducts, `Danh_Sach_SP_NCC_${viewingSupplier.name}`);
      } else {
        downloadCSV(supplierOrders, `Don_Hang_Ban_Duoc_NCC_${viewingSupplier.name}`);
      }
    } catch (error) { alert("Lỗi xuất file!"); } 
    finally { setExporting(false); }
  };

  return (
    <Row>
      {/* 1. MODAL CHI TIẾT (SẢN PHẨM & ĐƠN HÀNG) */}
      <Modal size="xl" show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Nhà cung cấp: <span className="text-primary fw-bold">{viewingSupplier?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <ButtonGroup>
              <Button variant={activeView === 'products' ? 'primary' : 'outline-primary'} onClick={() => setActiveView('products')}>
                <FaBoxOpen className="me-2" /> Danh sách Sản Phẩm
              </Button>
              <Button variant={activeView === 'orders' ? 'success' : 'outline-success'} onClick={handleSwitchToOrders}>
                <FaClipboardList className="me-2" /> Đơn Hàng Đã Bán
              </Button>
            </ButtonGroup>
            {activeView === 'products' ? (
              <Button variant="primary" onClick={handleExport} disabled={exporting || supplierProducts.length === 0}>
                <FaFileExport className="me-2" /> Xuất File Excel SP ({supplierProducts.length})
              </Button>
            ) : (
              <Button variant="success" onClick={handleExport} disabled={exporting || supplierOrders.length === 0}>
                <FaFileExport className="me-2" /> Xuất File Excel Đơn ({supplierOrders.length})
              </Button>
            )}
          </div>

          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {activeView === 'products' && (
              loadingProducts ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                <Table striped bordered hover className="mb-0">
                  <thead className="table-light sticky-top">
                    <tr><th>Mã SP</th><th>Tên Sản Phẩm</th><th>Giá Bán</th><th className="text-center">Tồn Kho</th><th>Kích Cỡ</th><th>Màu Sắc</th></tr>
                  </thead>
                  <tbody>
                    {supplierProducts.length > 0 ? supplierProducts.map((p, i) => (
                      <tr key={i}>
                        <td>{p['Mã SP']}</td><td className="fw-semibold">{p['Tên Sản Phẩm']}</td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p['Giá Bán'] || 0)}</td>
                        <td className="text-center"><span className={`badge ${p['Tồn Kho'] > 0 ? 'bg-primary' : 'bg-danger'}`}>{p['Tồn Kho']}</span></td>
                        <td>{p['Kích cỡ']}</td><td>{p['Màu sắc']}</td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center py-4 text-muted">Nhà cung cấp này chưa có sản phẩm nào.</td></tr>}
                  </tbody>
                </Table>
              )
            )}
            {activeView === 'orders' && (
              loadingOrders ? <div className="text-center py-5"><Spinner animation="border" variant="success" /></div> : (
                <Table striped bordered hover className="mb-0">
                  <thead className="table-light sticky-top">
                    <tr><th>Mã Đơn</th><th>Ngày Đặt</th><th>Tên Sản Phẩm</th><th className="text-center">SL Bán</th><th>Đơn Giá</th><th>Thành Tiền</th></tr>
                  </thead>
                  <tbody>
                    {supplierOrders.length > 0 ? supplierOrders.map((o, i) => (
                      <tr key={i}>
                        <td>{o['Mã Đơn']}</td><td>{o['Ngày Đặt']}</td><td className="fw-semibold">{o['Tên Sản Phẩm']}</td>
                        <td className="text-center"><span className="badge bg-success">{o['Số Lượng Bán']}</span></td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o['Đơn Giá Lúc Bán'] || 0)}</td>
                        <td className="text-danger fw-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o['Thành Tiền'] || 0)}</td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center py-4 text-muted">Chưa có đơn hàng nào bán được từ nhà cung cấp này.</td></tr>}
                  </tbody>
                </Table>
              )
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* 2. MODAL CẬP NHẬT NHÀ CUNG CẤP */}
      <Modal size="lg" show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton><Modal.Title>Cập nhật nhà cung cấp</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <Row>
              <Col xl={12}>
                <label className="fw-semibold mb-1">Tên nhà cung cấp <span className="text-danger">*</span></label>
                <input required type="text" value={selectedsupplier?.name || ""} className="form-control mb-3" 
                  onChange={(e) => setSelectedsupplier((prev) => ({ ...prev, name: e.target.value }))} 
                />
              </Col>
              <Col xl={12}>
                <label className="fw-semibold mb-1">Mô tả chi tiết</label>
                <textarea 
                  className="form-control" rows="4" 
                  placeholder="Nhập mô tả về nhà cung cấp..."
                  value={selectedsupplier?.Description || selectedsupplier?.description || ""} 
                  onChange={(e) => setSelectedsupplier((prev) => ({ ...prev, description: e.target.value }))} 
                />
              </Col>
            </Row>
            <Button disabled={crudLoading} type="submit" variant="danger" className="mt-3">Lưu thay đổi</Button>
          </form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Hủy</Button></Modal.Footer>
      </Modal>

      {/* 3. MODAL THÊM MỚI NHÀ CUNG CẤP */}
      <Modal size="lg" show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Thêm nhà cung cấp</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreate}>
            <Row>
              <Col xl={12}>
                <label className="fw-semibold mb-1">Tên nhà cung cấp <span className="text-danger">*</span></label>
                <input required type="text" value={addsupplier?.name || ""} className="form-control mb-3" 
                  onChange={(e) => setAddsupplier((prev) => ({ ...prev, name: e.target.value }))} 
                />
              </Col>
              <Col xl={12}>
                <label className="fw-semibold mb-1">Mô tả chi tiết</label>
                <textarea 
                  className="form-control" rows="4" 
                  placeholder="Nhập mô tả về nhà cung cấp..."
                  value={addsupplier?.description || ""} 
                  onChange={(e) => setAddsupplier((prev) => ({ ...prev, description: e.target.value }))} 
                />
              </Col>
            </Row>
            <Button disabled={crudLoading} type="submit" variant="success" className="mt-3">Lưu nhà cung cấp</Button>
          </form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button></Modal.Footer>
      </Modal>

      {/* 4. MODAL XÓA NHÀ CUNG CẤP */}
      <Modal size="lg" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton><Modal.Title>Xóa nhà cung cấp</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa nhà cung cấp <b className="text-danger">{supplierDelete && supplierDelete.name}</b> này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>

      {/* BẢNG MAIN DANH SÁCH NCC */}
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách nhà cung cấp</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input className="form-control search" placeholder="Tìm kiếm nhà cung cấp..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <Button type="button" style={{ color: "white" }} variant="info" onClick={handleSearch}><FaSearch /></Button>
              <Button variant="success" className="ms-auto d-flex align-items-center gap-2" onClick={() => setShowAddModal(true)}>
                 Thêm nhà cung cấp
              </Button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Nhà cung cấp</th>
                  <th className="text-center">Số lượng SP</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-4"><Spinner animation="border" variant="success" /></td></tr>
                ) : supplierData.suppliers && supplierData.suppliers.length > 0 ? (
                  supplierData.suppliers.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td className="align-middle fw-bold text-primary" style={{ cursor: "pointer" }} onClick={() => handleViewSupplier(item)} title="Click để xem chi tiết">
                          {item.name}
                        </td>
                        <td className="text-center align-middle">
                           <span className="badge bg-success rounded-pill px-3 py-2">{item.productCount || 0} SP</span>
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button variant="info" title="Xem chi tiết & Xuất file" onClick={() => handleViewSupplier(item)}><FaEye color="white" /></Button>
                            <Button variant="warning" title="Chỉnh sửa" onClick={() => openUpdateModal(item)}><FaEdit color="white" /></Button>
                            <Button variant="danger" title="Xóa nhà cung cấp" onClick={() => openDeleteModal(item)}><FaTrashAlt color="white" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={4} className="text-center py-4 text-muted">Không tìm thấy nhà cung cấp!</td></tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {supplierData.totalPage > 1 ? <PaginationproductStore totalPage={supplierData.totalPage} currentPage={page} onChangePage={handleChangePage} /> : null}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default SupplierList;