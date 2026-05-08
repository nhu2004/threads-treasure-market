// Client/src/pages/Admin/Product/Updateproduct/index.js
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Select from "react-select";
import { Row, Col, Form, Modal, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";

import styles from "./Updateproduct.module.css";
// IMPORT CHUẨN XÁC TỪ FILE ADMIN.JS (ĐÃ KIỂM TRA)
import {
  useAdminProductDetail, 
  useProductOptions,
  useAddCategory,
  useAddSupplier,
  useUpdateProductForm,
} from "../../../../hooks/admin/admin";

function Updateproduct() {
  const params = useParams();
  const { id } = params;

  // SỬA LỖI ĐÁNH MÁY 1: Chữ 'P' ở ProductDetail phải viết hoa
  const { productData } = useAdminProductDetail(id);
  
  // SỬA LỖI ĐÁNH MÁY 2: Chữ 'P' ở ProductOptions phải viết hoa
  const { categoryList, supplierList } = useProductOptions(); 

  const {
    showModal: showAddcategoryModal,
    setShowModal: setShowAddcategoryModal,
    newcategory,
    setNewcategory,
    loading: categoryLoading,
    handleSubmit: handleSubmitAddcategory,
  } = useAddCategory(); // SỬA LỖI ĐÁNH MÁY 3: Chữ 'C' phải viết hoa

  const {
    showModal: showAddsupplierModal,
    setShowModal: setShowAddsupplierModal,
    newsupplier,
    setNewsupplier,
    loading: supplierLoading,
    handleSubmit: handleSubmitAddsupplier,
  } = useAddSupplier(); // SỬA LỖI ĐÁNH MÁY 4: Chữ 'S' phải viết hoa

  const {
    formik,
    loading: updateLoading,
  } = useUpdateProductForm(id, productData, supplierList);

  return (
    <Row>
      {/* Modal thêm Danh mục */}
      <Modal size="lg" show={showAddcategoryModal} onHide={() => setShowAddcategoryModal(false)}>
        <Modal.Header closeButton><Modal.Title>Thêm danh mục mới</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitAddcategory}>
            <Row>
              <Col xl={12}>
                <label>Tên danh mục</label>
                <input required type="text" value={newcategory?.name || ""} className="form-control" onChange={(e) => setNewcategory((prev) => ({ ...prev, name: e.target.value }))} />
              </Col>
            </Row>
            <Button disabled={categoryLoading} type="submit" variant="success" className="mt-3">Lưu</Button>
          </form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowAddcategoryModal(false)}>Hủy</Button></Modal.Footer>
      </Modal>

      {/* Modal thêm Nhà cung cấp */}
      <Modal size="lg" show={showAddsupplierModal} onHide={() => setShowAddsupplierModal(false)}>
        <Modal.Header closeButton><Modal.Title>Thêm nhà cung cấp mới</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => handleSubmitAddsupplier(e, formik)}>
            <Row>
              <Col xl={12}>
                <label>Tên nhà cung cấp</label>
                <input required type="text" value={newsupplier?.name || ""} className="form-control" onChange={(e) => setNewsupplier((prev) => ({ ...prev, name: e.target.value }))} />
              </Col>
            </Row>
            <Button disabled={supplierLoading} type="submit" variant="success" className="mt-3">Lưu</Button>
          </form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowAddsupplierModal(false)}>Hủy</Button></Modal.Footer>
      </Modal>

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Cập nhật thông tin sản phẩm</div>
          <div className="admin-content-body">
            <form onSubmit={formik.handleSubmit}>
              <Row>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Mã sản phẩm (ID)</label>
                    <input type="text" name="productId" className="form-control" value={formik.values.productId || ""} readOnly />
                    <Form.Text className="text-muted">Mã do hệ thống tự cấp</Form.Text>
                  </div>
                </Col>
                <Col xl={9}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tên sản phẩm</label>
                    <input
                      type="text" name="name"
                      className={`form-control ${formik.errors.name ? "is-invalid" : formik.values.name && "is-valid"}`}
                      placeholder="Nhập tên sản phẩm..."
                      value={formik.values.name || ""} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    />
                    {formik.errors.name && <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>}
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Danh mục</label>
                    <Select
                      value={categoryList?.find(c => c.value === formik.values.categoryId) || null}
                      onChange={(option) => formik.setFieldValue("categoryId", option ? option.value : "")}
                      options={categoryList}
                      placeholder="Chọn danh mục..."
                    />
                  </div>
                </Col>
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Nhà cung cấp</label>
                    <Select
                      value={supplierList?.map(s => ({ value: s._id || s.SupplierID, label: s.name || s.Name })).find(s => s.value === formik.values.supplierId) || null}
                      onChange={(option) => formik.setFieldValue("supplierId", option ? option.value : "")}
                      options={supplierList?.map(s => ({ value: s._id || s.SupplierID, label: s.name || s.Name }))}
                      placeholder="Chọn nhà cung cấp..."
                    />
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Màu sắc (Ví dụ: Đen, Trắng)</label>
                    <input
                      type="text" name="colors" className="form-control"
                      placeholder="Cách nhau bằng dấu phẩy"
                      value={formik.values.colors || ""} onChange={formik.handleChange}
                    />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Kích cỡ (Ví dụ: S, M, L)</label>
                    <input
                      type="text" name="sizes" className="form-control"
                      placeholder="Cách nhau bằng dấu phẩy"
                      value={formik.values.sizes || ""} onChange={formik.handleChange}
                    />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Số lượng tồn kho</label>
                    <input
                      type="number" name="stockQuantity" className="form-control" min="0"
                      value={formik.values.stockQuantity || 0} onChange={formik.handleChange}
                    />
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giá bán (VNĐ)</label>
                    <input
                      type="number" min="0" name="price"
                      className={`form-control ${formik.errors.price ? "is-invalid" : formik.values.price && "is-valid"}`}
                      value={formik.values.price || ""} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    />
                    {formik.errors.price && <Form.Control.Feedback type="invalid">{formik.errors.price}</Form.Control.Feedback>}
                  </div>
                </Col>
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giá gốc (VNĐ) - Tùy chọn</label>
                    <input
                      type="number" min="0" name="originalPrice" className="form-control"
                      value={formik.values.originalPrice || ""} onChange={formik.handleChange}
                    />
                  </div>
                </Col>
                
                <Col xl={12} className="mt-4">
                  <label className={styles.formLabel}>Mô tả chi tiết</label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={formik.values.description || ""}
                    onChange={(event, editor) => formik.setFieldValue("description", editor.getData())}
                  />
                </Col>
              </Row>

              <Row className="mt-4">
                <Col xl={12}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Link hình ảnh sản phẩm (URL)</label>
                    <Form.Control
                      type="text" name="image"
                      placeholder="Dán link ảnh tại đây (http... hoặc /images/...)"
                      value={formik.values.image || ""} onChange={formik.handleChange}
                      isInvalid={!!formik.errors.image && formik.touched.image}
                    />
                    {formik.errors.image && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.image}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                
                <Col xl={12} className="mt-3 text-center">
                  {formik.values.image && (
                    <div>
                      <p className="small text-muted">Ảnh hiện tại/mới:</p>
                      <img 
                        src={formik.values.image} 
                        alt="Preview" 
                        style={{ maxWidth: '180px', borderRadius: '8px', border: '1px solid #ddd' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Lỗi+link+ảnh'; }}
                      />
                    </div>
                  )}
                </Col>
              </Row>

              <div className="mt-4">
                <button type="submit" className={`productstore-btn ${styles.submitBtn}`} disabled={updateLoading}>
                  {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default Updateproduct;