// Client/src/pages/Admin/category/index.js 
import { useCallback, useState } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch, FaFileExport, FaBoxOpen, FaEye, FaClipboardList } from "react-icons/fa"; 
import { Row, Col, Table, Spinner, Modal, Button, ButtonGroup } from "react-bootstrap";
import { usecategoryList, usecategoryCRUD } from "../../../hooks/admin/admin";
import categoryApi from "../../../api/categoryApi"; 
import "./category.css"; 

function categoryList() {
  const {
    categoryData, page, setPage, loading, searchInput,
    setSearchInput, handleSearch, refreshList,
  } = usecategoryList();

  const {
    loading: crudLoading, showAddModal, setShowAddModal, addcategory,
    setAddcategory, handleCreate, showUpdateModal, setShowUpdateModal,
    selectedcategory, setSelectedcategory, openUpdateModal, handleUpdate,
    showDeleteModal, setShowDeleteModal, categoryDelete, openDeleteModal, handleDelete,
  } = usecategoryCRUD(refreshList);

  const handleChangePage = useCallback((page) => { setPage(page); }, [setPage]);

  // --- STATE CHO MODAL XEM CHI TIẾT & XUẤT FILE ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);
  
  // State quản lý Tab hiển thị ('products' hoặc 'orders')
  const [activeView, setActiveView] = useState('products'); 

  // State lưu dữ liệu
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryOrders, setCategoryOrders] = useState([]);
  
  // State loading
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Mở Modal và mặc định load danh sách Sản phẩm
  const handleViewCategory = async (category) => {
    setViewingCategory(category);
    setShowDetailsModal(true);
    setActiveView('products'); // Mặc định mở tab sản phẩm
    setCategoryOrders([]);     // Reset data đơn hàng cũ
    setLoadingProducts(true);
    
    try {
      const data = await categoryApi.exportProducts(category._id);
      setCategoryProducts(data);
    } catch (error) {
      alert("Lỗi khi lấy danh sách sản phẩm!");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Hàm load danh sách Đơn hàng khi bấm chuyển Tab
  const handleSwitchToOrders = async () => {
    setActiveView('orders');
    // Chỉ gọi API nếu chưa có dữ liệu để tránh load lại nhiều lần
    if (categoryOrders.length === 0) {
      setLoadingOrders(true);
      try {
        const data = await categoryApi.exportOrders(viewingCategory._id);
        setCategoryOrders(data);
      } catch (error) {
        alert("Lỗi khi lấy danh sách đơn hàng!");
      } finally {
        setLoadingOrders(false);
      }
    }
  };

  // Hàm chuyển đổi data thành file CSV
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

  // Hàm xử lý xuất file lấy trực tiếp data đang hiển thị
  const handleExport = () => {
    setExporting(true);
    try {
      if (activeView === 'products') {
        downloadCSV(categoryProducts, `Danh_Sach_SP_${viewingCategory.name || viewingCategory.Name}`);
      } else {
        downloadCSV(categoryOrders, `Don_Hang_Ban_Duoc_${viewingCategory.name || viewingCategory.Name}`);
      }
    } catch (error) {
      alert("Lỗi xuất file!");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Row>
      {/* MODAL XEM CHI TIẾT (SẢN PHẨM / ĐƠN HÀNG) & XUẤT FILE */}
      <Modal size="xl" show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Danh mục: <span className="text-primary fw-bold">{viewingCategory?.name || viewingCategory?.Name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* THANH ĐIỀU HƯỚNG TAB & NÚT XUẤT FILE */}
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <ButtonGroup>
              <Button 
                variant={activeView === 'products' ? 'primary' : 'outline-primary'} 
                onClick={() => setActiveView('products')}
              >
                <FaBoxOpen className="me-2" />
                Danh sách Sản Phẩm
              </Button>
              <Button 
                variant={activeView === 'orders' ? 'success' : 'outline-success'} 
                onClick={handleSwitchToOrders}
              >
                <FaClipboardList className="me-2" />
                Đơn Hàng Đã Bán
              </Button>
            </ButtonGroup>

            {/* Nút Xuất File linh hoạt đổi theo Tab đang mở */}
            {activeView === 'products' ? (
              <Button variant="primary" onClick={handleExport} disabled={exporting || categoryProducts.length === 0}>
                <FaFileExport className="me-2" /> Xuất File Excel SP ({categoryProducts.length})
              </Button>
            ) : (
              <Button variant="success" onClick={handleExport} disabled={exporting || categoryOrders.length === 0}>
                <FaFileExport className="me-2" /> Xuất File Excel Đơn ({categoryOrders.length})
              </Button>
            )}
          </div>

          {/* KHU VỰC HIỂN THỊ BẢNG DỮ LIỆU */}
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            
            {/* VIEW 1: BẢNG SẢN PHẨM */}
            {activeView === 'products' && (
              loadingProducts ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
              ) : (
                <Table striped bordered hover className="mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Mã SP</th><th>Tên Sản Phẩm</th><th>Giá Bán</th>
                      <th className="text-center">Tồn Kho</th><th>Kích Cỡ</th><th>Màu Sắc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProducts.length > 0 ? categoryProducts.map((p, i) => (
                      <tr key={i}>
                        <td>{p['Mã SP']}</td><td className="fw-semibold">{p['Tên Sản Phẩm']}</td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p['Giá Bán'] || 0)}</td>
                        <td className="text-center">
                          <span className={`badge ${p['Tồn Kho'] > 0 ? 'bg-zinc-950' : 'bg-danger'}`}>{p['Tồn Kho']}</span>
                        </td>
                        <td>{p['Kích cỡ']}</td><td>{p['Màu sắc']}</td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center py-4 text-muted">Không có sản phẩm nào.</td></tr>}
                  </tbody>
                </Table>
              )
            )}

            {/* VIEW 2: BẢNG ĐƠN HÀNG */}
            {activeView === 'orders' && (
              loadingOrders ? (
                <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
              ) : (
                <Table striped bordered hover className="mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Mã Đơn</th><th>Ngày Đặt</th><th>Tên Sản Phẩm</th>
                      <th className="text-center">SL Bán</th><th>Đơn Giá</th><th>Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryOrders.length > 0 ? categoryOrders.map((o, i) => (
                      <tr key={i}>
                        <td>{o['Mã Đơn Hàng'] || o['Mã Đơn'] || o['OrderID'] || o['_id']}</td><td>{o['Ngày Đặt']}</td>
                        <td className="fw-semibold">{o['Tên Sản Phẩm']}</td>
                        <td className="text-center"><span className="badge bg-success">{o['Số Lượng Bán']}</span></td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o['Đơn Giá Lúc Bán'] || 0)}</td>
                        <td className="text-danger fw-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o['Thành Tiền'] || 0)}</td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center py-4 text-muted">Chưa có đơn hàng nào bán được sản phẩm thuộc danh mục này.</td></tr>}
                  </tbody>
                </Table>
              )
            )}
            
          </div>
        </Modal.Body>
      </Modal>

      {/* CÁC MODAL THÊM, SỬA, XÓA GIỮ NGUYÊN */}
      <Modal size="lg" show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton><Modal.Title>Cập nhật Danh mục</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <Row><Col xl={6}><label>Tên danh mục</label><input required type="text" value={selectedcategory?.name || ""} className="form-control" onChange={(e) => setSelectedcategory((prev) => ({ ...prev, name: e.target.value }))} /></Col></Row>
            <Button disabled={crudLoading} type="submit" variant="danger" className="mt-2">Lưu</Button>
          </form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Hủy</Button></Modal.Footer>
      </Modal>

      <Modal size="lg" show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Thêm danh mục</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreate}>
            <Row><Col xl={6}><label>Tên danh mục</label><input required type="text" value={addcategory?.name || ""} className="form-control" onChange={(e) => setAddcategory((prev) => ({ ...prev, name: e.target.value }))} /></Col></Row>
            <Button disabled={crudLoading} type="submit" variant="danger" className="mt-2">Lưu</Button>
          </form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button></Modal.Footer>
      </Modal>

      <Modal size="lg" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton><Modal.Title>Xóa danh mục</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc xóa danh mục <b>{categoryDelete && (categoryDelete.name || categoryDelete.Name)}</b> này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>

      {/* BẢNG MAIN DANH SÁCH THỂ LOẠI */}
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="text-xl font-bold text-gray-800 mb-2 border-l-4 border-emerald-500 pl-3">Danh sách danh mục</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input className="form-control search" placeholder="Tìm kiếm theo tên danh mục..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <Button type="button" style={{ color: "white" }} variant="info" onClick={handleSearch}><FaSearch /></Button>
              <button type="button" className="btn btn-success ms-auto" onClick={() => setShowAddModal(true)}>Thêm danh mục</button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Tên danh mục</th>
                  <th className="text-center">Số lượng SP</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-4"><Spinner animation="border" variant="success" /></td></tr>
                ) : categoryData.categorys && categoryData.categorys.length > 0 ? (
                  categoryData.categorys.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td className="align-middle fw-bold text-primary" style={{ cursor: "pointer"  }} onClick={() => handleViewCategory(item)} title="Click để xem chi tiết">
                          {item.name || item.Name}
                        </td>
                        <td className="text-center align-middle">
                          <span className="badge bg-success rounded-pill px-3 py-2">{item.productCount || 0} SP</span>
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button variant="info" title="Xem chi tiết & Xuất file" onClick={() => handleViewCategory(item)}><FaEye color="white" /></Button>
                            <Button variant="warning" title="Chỉnh sửa" onClick={() => openUpdateModal(item)}><FaEdit color="white" /></Button>
                            <Button variant="danger" title="Xóa danh mục" onClick={() => openDeleteModal(item)}><FaTrashAlt color="white" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={4} className="text-center py-4 text-muted">Không tìm thấy danh mục nào!</td></tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row><Col xl={12}>{categoryData.totalPage > 1 ? <PaginationproductStore totalPage={categoryData.totalPage} currentPage={page} onChangePage={handleChangePage} /> : null}</Col></Row>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default categoryList;