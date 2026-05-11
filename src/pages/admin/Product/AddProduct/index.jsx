import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Row, Col, Form, Spinner, Modal, Button } from "react-bootstrap";
import Select, { components } from "react-select";
import PreviewImage from "../../../../components/PreviewImage";
import styles from "./Addproduct.module.css";
import {
  useProductOptions,
  useAddCategory,
  useAddSupplier,
  useAddProductForm,
} from "../../../../hooks/admin/admin";

function Addproduct() {
  // Lấy dữ liệu từ hook (Brand, Category, Supplier) 
  const { brandList, categoryList, supplierList } = useProductOptions();

  const {
    showModal: showAddcategoryModal,
    setShowModal: setShowAddcategoryModal,
    newcategory,
    setNewcategory,
    loading: categoryLoading,
    handleSubmit: handleSubmitAddcategory,
  } = useAddCategory();

  const {
    showModal: showAddsupplierModal,
    setShowModal: setShowAddsupplierModal,
    newsupplier,
    setNewsupplier,
    loading: supplierLoading,
    handleSubmit: handleSubmitAddsupplier,
  } = useAddSupplier();

  const { formik, loading: createLoading } = useAddProductForm(supplierList);
console.log("Formik Errors:", formik.errors); // Dòng này giúp bạn thấy Form đang bị kẹt ở đâu trong Console (F12)

  return (
    <Row>
      {/* Modal thêm Danh mục mới (Category) */}
      <Modal show={showAddcategoryModal} onHide={() => setShowAddcategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm danh mục quần áo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Tên danh mục (Ví dụ: Áo sơ mi, Quần Jean...)</Form.Label>
            <Form.Control
              type="text"
              value={newcategory?.name || ""}
              onChange={(e) => setNewcategory({ ...newcategory, name: e.target.value })}
            />
          </Form.Group>
          <Button variant="success" className="mt-3" onClick={handleSubmitAddcategory} disabled={categoryLoading}>
            Lưu danh mục
          </Button>
        </Modal.Body>
      </Modal>

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Thêm Sản Phẩm Thời Trang Mới</div>
          <div className="admin-content-body">
            <form onSubmit={formik.handleSubmit}>
              <Row> 
                <Col xl={12}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tên sản phẩm</label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Nhập tên sản phẩm..."
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={!!formik.errors.name && formik.touched.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.name}
                    </Form.Control.Feedback>
                  </div>
                </Col> 
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giá bán (VNĐ)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                    />
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Màu sắc (Các màu cách nhau bằng dấu phẩy)</label>
                    <input
                      type="text"
                      name="colors"
                      className="form-control"
                      placeholder="Ví dụ: Đen, Trắng, Đỏ"
                      value={formik.values.colors || ""}
                      onChange={(e) => formik.setFieldValue("colors", e.target.value.split(',').map(c => c.trim()))}
                    />
                  </div>
                </Col>
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Kích cỡ (Sizes)</label>
                    <input
                      type="text"
                      name="sizes"
                      className="form-control"
                      placeholder="Ví dụ: S, M, L, XL"
                      value={formik.values.sizes || ""}
                      onChange={(e) => formik.setFieldValue("sizes", e.target.value.split(',').map(s => s.trim()))}
                    />
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Số lượng tồn kho</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      className="form-control"
                      value={formik.values.stockQuantity || 0}
                      onChange={formik.handleChange}
                    />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Danh mục (Category)</label>
                    <Select
                        options={categoryList || []}
                        onChange={(opt) => formik.setFieldValue("categoryId", opt.value)}
                        placeholder="Chọn danh mục..."
                      />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Nhà cung cấp (Supplier)</label>
                    <Select
                      options={supplierList?.map((s) => ({
                        value: s.SupplierID,
                        label: s.Name,
                      })) || []}
                      onChange={(opt) => formik.setFieldValue("supplierId", opt.value)}
                      placeholder="Chọn nhà cung cấp..."
                    />
                  </div>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col xl={12}>
                  <label className={styles.formLabel}>Mô tả chi tiết sản phẩm</label>
                  {/* Thay CKEditor bằng Form.Control textarea */}
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    placeholder="Nhập mô tả chi tiết sản phẩm tại đây..."
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    className={formik.errors.description && formik.touched.description ? "is-invalid" : ""}
                  />
                  {formik.errors.description && formik.touched.description && (
                    <div className="invalid-feedback">{formik.errors.description}</div>
                  )}
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xl={12}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Link hình ảnh sản phẩm (URL)</label>
                    <Form.Control
                      type="text"
                      name="image" // Vẫn giữ name là image để khớp với formik
                      placeholder="Ví dụ: https://img.com/ao-so-mi.jpg hoặc http://localhost:5000/images/ao.jpg"
                      value={formik.values.image}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={!!formik.errors.image && formik.touched.image}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.image}
                    </Form.Control.Feedback>
                  </div>
                </Col>

                <Col xl={12} className="mt-3 text-center">
                  {/* Hiển thị ảnh xem trước trực tiếp từ link */}
                  {formik.values.image && (
                    <div className="image-preview-wrapper">
                      <p className="small text-muted">Xem trước ảnh:</p>
                      <img 
                        src={formik.values.image} 
                        alt="Preview" 
                        style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ddd' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Link+ảnh+lỗi'; }}
                      />
                    </div>
                  )}
                </Col>
              </Row>

              <div className="mt-5 text-center">
                <Button type="submit" variant="success" size="lg" disabled={createLoading}>
                  {createLoading ? <Spinner animation="border" size="sm" /> : "Đăng sản phẩm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default Addproduct;