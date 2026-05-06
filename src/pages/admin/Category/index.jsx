// Client/src/pages/Admin/category/index.js 
import { useCallback, useState } from "react";
import PaginationproductStore from "../../../components/PaginationproductStore";
import { FaEdit, FaTrashAlt, FaSearch, FaFileExport, FaBoxOpen } from "react-icons/fa"; // Thêm FaFileExport, FaBoxOpen
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import { usecategoryList, usecategoryCRUD } from "../../../hooks/admin/admin";
import categoryApi from "../../../api/categoryApi"; // Đừng quên import categoryApi
import "./category.css";


function categoryList() {
  const {
    categoryData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    refreshList,
  } = usecategoryList();

  const {
    loading: crudLoading,
    showAddModal,
    setShowAddModal,
    addcategory,
    setAddcategory,
    handleCreate,
    showUpdateModal,
    setShowUpdateModal,
    selectedcategory,
    setSelectedcategory,
    openUpdateModal,
    handleUpdate,
    showDeleteModal,
    setShowDeleteModal,
    categoryDelete,
    openDeleteModal,
    handleDelete,
  } = usecategoryCRUD(refreshList);

  const handleChangePage = useCallback(
    (page) => {
      setPage(page);
    },
    [setPage]
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCategory, setExportCategory] = useState(null);
  const [exporting, setExporting] = useState(false);

  // HÀM TẠO FILE CSV CHUẨN ĐỂ MỞ BẰNG EXCEL KHÔNG BỊ LỖI FONT TIẾNG VIỆT
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return alert("Không có dữ liệu để xuất!");
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(',')); // Header row

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] === null ? "" : row[header];
        return `"${String(val).replace(/"/g, '""')}"`; // Thoát ký tự nháy kép
      });
      csvRows.push(values.join(','));
    }

    const BOM = '\uFEFF'; // Sửa lỗi font UTF-8 trên Excel
    const blob = new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      if (type === 'products') {
        const data = await categoryApi.exportProducts(exportCategory._id);
        downloadCSV(data, `Danh_Sach_SP_${exportCategory.name}`);
      } else if (type === 'orders') {
        const data = await categoryApi.exportOrders(exportCategory._id);
        downloadCSV(data, `Don_Hang_Ban_Duoc_${exportCategory.name}`);
      }
    } catch (error) {
      alert("Lỗi xuất file!");
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  return (
    <Row>
      {/* THÊM MODAL CHỌN LOẠI XUẤT BÁO CÁO */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xuất Báo Cáo: {exportCategory?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Vui lòng chọn loại dữ liệu bạn muốn tải xuống:</p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="outline-primary" onClick={() => handleExport('products')} disabled={exporting}>
              <FaBoxOpen className="me-2" />
              Sản phẩm trong danh mục
            </Button>
            <Button variant="outline-success" onClick={() => handleExport('orders')} disabled={exporting}>
              <FaFileExport className="me-2" />
              Đơn hàng đã bán
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        size="lg"
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật thể loại</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <Row>
              <Col xl={6}>
                <label>Tên thể loại</label>
                <input
                  required
                  type="text"
                  value={selectedcategory?.name}
                  className="form-control"
                  onChange={(e) =>
                    setSelectedcategory((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                />
              </Col>
            </Row>
            <Button
              disabled={crudLoading}
              type="submit"
              variant="danger"
              className="mt-2"
            >
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="lg"
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm thể loại</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreate}>
            <Row>
              <Col xl={6}>
                <label>Tên thể loại</label>
                <input
                  required
                  type="text"
                  value={addcategory?.name}
                  className="form-control"
                  onChange={(e) =>
                    setAddcategory((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                />
              </Col>
            </Row>
            <Button
              disabled={crudLoading}
              type="submit"
              variant="danger"
              className="mt-2"
            >
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="lg"
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xóa thể loại</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc xóa danh mục <b>{categoryDelete && (categoryDelete.name || categoryDelete.Name)}</b> này không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách thể loại</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input
                className="form-control search"
                placeholder="Tìm kiếm thể loại..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button
                type="button"
                style={{ color: "white" }}
                variant="info"
                onClick={handleSearch}
              >
                <FaSearch />
              </Button>
              <button
                type="button"
                className="btn btn-success ms-auto"
                onClick={() => setShowAddModal(true)}
              >
                Thêm Thể loại
              </button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Tên danh mục</th>
                  <th className="text-center">Số lượng SP</th> {/* CỘT MỚI */}
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    {/* Sửa colSpan thành 4 để khớp với số lượng cột trên Header */}
                    <td colSpan={4} className="text-center py-4">
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : categoryData.categorys && categoryData.categorys.length > 0 ? (
                  categoryData.categorys.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="text-center align-middle">
                          {(1 && page - 1) * 10 + (index + 1)}
                        </td>
                        <td className="align-middle fw-semibold text-primary">{item.name || item.Name}</td>
                        
                        {/* HIỂN THỊ CỘT SỐ LƯỢNG SẢN PHẨM */}
                        <td className="text-center align-middle">
                           <span className="badge bg-success rounded-pill px-3 py-2">
                             {item.productCount || 0} SP
                           </span>
                        </td>

                        <td className="text-center align-middle">
                          <div className="d-flex gap-2 justify-content-center">
                            {/* NÚT MỞ MODAL XUẤT FILE BÁO CÁO */}
                            <Button
                              variant="info"
                              title="Xuất báo cáo"
                              onClick={() => {
                                setExportCategory(item);
                                setShowExportModal(true);
                              }}
                            >
                              <FaFileExport color="white" />
                            </Button>

                            <Button
                              variant="warning"
                              title="Chỉnh sửa"
                              onClick={() => openUpdateModal(item)}
                            >
                              <FaEdit color="white" />
                            </Button>

                            <Button
                              variant="danger"
                              title="Xóa danh mục"
                              onClick={() => openDeleteModal(item)}
                            >
                              <FaTrashAlt />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      Không tìm thấy thể loại nào!
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {categoryData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPage={categoryData.totalPage}
                      currentPage={page}
                      onChangePage={handleChangePage}
                    />
                  ) : null}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default categoryList;






