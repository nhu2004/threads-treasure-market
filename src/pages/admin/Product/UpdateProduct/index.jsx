import React from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Form, Modal, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import styles from "./Updateproduct.module.css";
import {
  useAdminProductDetail,
  useProductOptions,
  useAddCategory,
  useAddSupplier,
  useUpdateProductForm,
} from "../../../../hooks/admin/admin";

function Updateproduct() {
  const { id } = useParams();
  const { productData, loading: productLoading } = useAdminProductDetail(id);
  const { categoryList, supplierList } = useProductOptions();

  const {
    showModal: showAddCategoryModal, setShowModal: setShowAddCategoryModal,
    newcategory, setNewcategory, loading: categoryLoading, handleSubmit: handleSubmitAddCategory,
  } = useAddCategory();

  const {
    showModal: showAddSupplierModal, setShowModal: setShowAddSupplierModal,
    newsupplier, setNewsupplier, loading: supplierLoading, handleSubmit: handleSubmitAddSupplier,
  } = useAddSupplier();

  // Hook quản lý form
  const { formik, loading: updateLoading } = useUpdateProductForm(id, productData, supplierList);

  // Chặn lỗi render khi dữ liệu chưa về
  if (productLoading || !productData) {
    return (
      <div className="text-center p-5"><Spinner animation="border" variant="primary" /> <p>Đang tải dữ liệu...</p></div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Thêm danh mục</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitAddCategory}>
            <Form.Control required value={newcategory?.name || ""} onChange={(e) => setNewcategory({name: e.target.value})} />
            <Button type="submit" className="mt-3" disabled={categoryLoading}>Lưu</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Row className="justify-content-center">
        <Col xl={11}>
          <div className="admin-content-wrapper p-4 bg-white shadow-sm">
            <Form onSubmit={formik.handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Tên sản phẩm</Form.Label>
                <Form.Control name="name" {...formik.getFieldProps("name")} isInvalid={!!formik.errors.name} />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Label className="fw-bold">Danh mục</Form.Label>
                  <Select options={categoryList} value={categoryList?.find(c => c.value === formik.values.categoryId)} onChange={(opt) => formik.setFieldValue("categoryId", opt?.value)} />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-bold">Nhà cung cấp</Form.Label>
                  <Select options={supplierList?.map(s => ({ value: s.SupplierID, label: s.Name }))} value={supplierList?.map(s => ({ value: s.SupplierID, label: s.Name })).find(s => s.value === formik.values.supplierId)} onChange={(opt) => formik.setFieldValue("supplierId", opt?.value)} />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={4}><Form.Label>Màu sắc</Form.Label><Form.Control name="colors" {...formik.getFieldProps("colors")} /></Col>
                <Col md={4}><Form.Label>Kích cỡ</Form.Label><Form.Control name="sizes" {...formik.getFieldProps("sizes")} /></Col>
                <Col md={4}><Form.Label>Tồn kho</Form.Label><Form.Control type="number" name="stockQuantity" {...formik.getFieldProps("stockQuantity")} /></Col>
              </Row>

              <Row className="mt-3">
                <Col md={6}><Form.Label>Giá bán</Form.Label><Form.Control type="number" name="price" {...formik.getFieldProps("price")} /></Col>
                <Col md={6}><Form.Label>Giá gốc</Form.Label><Form.Control type="number" name="originalPrice" {...formik.getFieldProps("originalPrice")} /></Col>
              </Row>

              <Form.Group className="mt-4">
                <Form.Label className="fw-bold">Mô tả</Form.Label>
                <CKEditor editor={ClassicEditor} data={formik.values.description} onChange={(e, editor) => formik.setFieldValue("description", editor.getData())} />
              </Form.Group>

              <Form.Group className="mt-4">
                <Form.Label className="fw-bold">Link ảnh</Form.Label>
                <Form.Control name="image" {...formik.getFieldProps("image")} />
              </Form.Group>

              <Button type="submit" className="mt-4 w-100" disabled={updateLoading}>Lưu thay đổi</Button>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}
export default Updateproduct;