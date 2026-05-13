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
  useUpdateProductForm,
} from "../../../../hooks/admin/admin";

function Updateproduct() {
  const { id } = useParams();
  const { productData, loading: productLoading } = useAdminProductDetail(id);
  const { categoryList, supplierList } = useProductOptions();
  const { formik, loading: updateLoading } = useUpdateProductForm(id, productData, supplierList);

  if (productLoading || !productData) {
    return <div className="text-center p-5"><Spinner animation="border" variant="primary" /> <p>Đang tải dữ liệu...</p></div>;
  }

  return (
    <div className={styles.wrapper}>
      <Row className="justify-content-center">
        <Col xl={11}>
          <div className="admin-content-wrapper p-4 bg-white shadow-sm">
            <h4 className="mb-4 fw-bold text-primary">Cập nhật Sản Phẩm</h4>
            <Form onSubmit={formik.handleSubmit}>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label className="fw-bold">Mã nhóm SP (ProductGroupID)</Form.Label>
                  <Form.Control name="productGroupId" {...formik.getFieldProps("productGroupId")} />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-bold">Mã kho (SKU)</Form.Label>
                  <Form.Control name="sku" {...formik.getFieldProps("sku")} />
                </Col>
              </Row>

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
                <Col md={4}><Form.Label className="fw-bold">Màu sắc (1 Màu)</Form.Label><Form.Control name="color" {...formik.getFieldProps("color")} /></Col>
                <Col md={4}><Form.Label className="fw-bold">Kích cỡ (1 Size)</Form.Label><Form.Control name="size" {...formik.getFieldProps("size")} /></Col>
                <Col md={4}><Form.Label className="fw-bold">Tồn kho</Form.Label><Form.Control type="number" name="stockQuantity" {...formik.getFieldProps("stockQuantity")} /></Col>
              </Row>

              <Row className="mt-3">
                <Col md={6}><Form.Label className="fw-bold">Giá bán</Form.Label><Form.Control type="number" name="price" {...formik.getFieldProps("price")} /></Col>
                <Col md={6}><Form.Label className="fw-bold">Giá gốc</Form.Label><Form.Control type="number" name="originalPrice" {...formik.getFieldProps("originalPrice")} /></Col>
              </Row>

              <Form.Group className="mt-4">
                <Form.Label className="fw-bold">Mô tả</Form.Label>
                <CKEditor editor={ClassicEditor} data={formik.values.description || ""} onChange={(e, editor) => formik.setFieldValue("description", editor.getData())} />
              </Form.Group>

              <Form.Group className="mt-4">
                <Form.Label className="fw-bold">Link ảnh</Form.Label>
                <Form.Control name="image" {...formik.getFieldProps("image")} />
              </Form.Group>

              <Button type="submit" className="mt-4 w-100" variant="warning" disabled={updateLoading}>Lưu thay đổi</Button>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}
export default Updateproduct;