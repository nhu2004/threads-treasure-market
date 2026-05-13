import { Row, Col, Form, Spinner, Modal, Button } from "react-bootstrap";
import Select from "react-select";
import styles from "./Addproduct.module.css";
import {
  useProductOptions,
  useAddCategory,
  useAddSupplier,
  useAddProductForm,
} from "../../../../hooks/admin/admin";

function Addproduct() {
  const { categoryList, supplierList } = useProductOptions();

  const {
    showModal: showAddcategoryModal,
    setShowModal: setShowAddcategoryModal,
    newcategory,
    setNewcategory,
    loading: categoryLoading,
    handleSubmit: handleSubmitAddcategory,
  } = useAddCategory();

  const { formik, loading: createLoading } = useAddProductForm(supplierList);

  return (
    <Row>
      <Modal show={showAddcategoryModal} onHide={() => setShowAddcategoryModal(false)}>
        {/* Modal thêm danh mục giữ nguyên */}
        <Modal.Header closeButton><Modal.Title>Thêm danh mục quần áo</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Tên danh mục</Form.Label>
            <Form.Control type="text" value={newcategory?.name || ""} onChange={(e) => setNewcategory({ ...newcategory, name: e.target.value })} />
          </Form.Group>
          <Button variant="success" className="mt-3" onClick={handleSubmitAddcategory} disabled={categoryLoading}>Lưu danh mục</Button>
        </Modal.Body>
      </Modal>

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Thêm Sản Phẩm Mới (1 Phân loại)</div>
          <div className="admin-content-body">
            <form onSubmit={formik.handleSubmit}>
              
              {/* Hàng 1: Mã Nhóm và SKU */}
              <Row className="mb-3"> 
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Mã nhóm SP (Ví dụ: BLAZER-OVS)</label>
                    <Form.Control type="text" name="productGroupId" placeholder="Các size/màu cùng loại phải nhập chung mã này..." value={formik.values.productGroupId || ''} onChange={formik.handleChange} />
                  </div>
                </Col> 
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Mã kho SKU (Ví dụ: BLAZ-DEN-XL)</label>
                    <Form.Control type="text" name="sku" placeholder="Mã định danh duy nhất..." value={formik.values.sku || ''} onChange={formik.handleChange} />
                  </div>
                </Col>
              </Row>

              {/* Hàng 2: Tên và Giá */}
              <Row className="mb-3"> 
                <Col xl={8}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tên sản phẩm</label>
                    <Form.Control type="text" name="name" placeholder="Nhập tên sản phẩm..." value={formik.values.name} onChange={formik.handleChange} isInvalid={!!formik.errors.name && formik.touched.name} />
                  </div>
                </Col> 
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giá bán (VNĐ)</label>
                    <input type="number" name="price" className="form-control" value={formik.values.price} onChange={formik.handleChange} />
                  </div>
                </Col>
              </Row>

              {/* Hàng 3: Màu, Size, Tồn kho */}
              <Row className="mb-3">
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Màu sắc (1 Màu)</label>
                    <input type="text" name="color" className="form-control" placeholder="Ví dụ: Đen" value={formik.values.color || ""} onChange={formik.handleChange} />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Kích cỡ (1 Size)</label>
                    <input type="text" name="size" className="form-control" placeholder="Ví dụ: XL" value={formik.values.size || ""} onChange={formik.handleChange} />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Số lượng ban đầu</label>
                    <input type="number" name="stockQuantity" className="form-control" value={formik.values.stockQuantity || 0} onChange={formik.handleChange} />
                  </div>
                </Col>
              </Row>

              {/* Hàng 4: Phân loại */}
              <Row className="mb-3">
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Danh mục (Category)</label>
                    <Select options={categoryList || []} onChange={(opt) => formik.setFieldValue("categoryId", opt.value)} placeholder="Chọn danh mục..." />
                  </div>
                </Col>
                <Col xl={6}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Nhà cung cấp (Supplier)</label>
                    <Select options={supplierList?.map((s) => ({ value: s.SupplierID, label: s.Name })) || []} onChange={(opt) => formik.setFieldValue("supplierId", opt.value)} placeholder="Chọn nhà cung cấp..." />
                  </div>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col xl={12}>
                  <label className={styles.formLabel}>Mô tả chi tiết sản phẩm</label>
                  <Form.Control as="textarea" rows={5} name="description" value={formik.values.description} onChange={formik.handleChange} />
                </Col>
              </Row>

              <Row className="mt-4">
                <Col xl={12}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Link hình ảnh sản phẩm</label>
                    <Form.Control type="text" name="image" value={formik.values.image} onChange={formik.handleChange} />
                  </div>
                </Col>
                <Col xl={12} className="mt-3 text-center">
                  {formik.values.image && (
                    <img src={formik.values.image} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; }} />
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