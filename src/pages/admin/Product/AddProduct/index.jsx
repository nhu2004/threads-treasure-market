// Client/src/pages/Admin/Product/Addproduct/index.js
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Row, Col, Form, Spinner, Modal, Button } from "react-bootstrap";
import Select, { components } from "react-select";
import PreviewImage from "../../../../components/PreviewImage";
import styles from "./Addproduct.module.css";
import {
  useproductOptions,
  useAddcategory,
  useAddsupplier,
  useAddproductForm,
} from "../../../../hooks";

function Addproduct() {
  const { brandList, categoryList, supplierList } = useproductOptions();

  const {
    showModal: showAddcategoryModal,
    setShowModal: setShowAddcategoryModal,
    newcategory,
    setNewcategory,
    loading: categoryLoading,
    handleSubmit: handleSubmitAddcategory,
  } = useAddcategory();

  const {
    showModal: showAddsupplierModal,
    setShowModal: setShowAddsupplierModal,
    newsupplier,
    setNewsupplier,
    loading: supplierLoading,
    handleSubmit: handleSubmitAddsupplier,
  } = useAddsupplier();

  // Use refactored form hook
  const { formik, loading: createLoading } = useAddproductForm(supplierList);

  return (
    <Row>
      {/* Modal thêm thể loại */}
      <Modal
        size="lg"
        show={showAddcategoryModal}
        onHide={() => setShowAddcategoryModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm thể loại mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitAddcategory}>
            <Row>
              <Col xl={12}>
                <label>Tên thể loại</label>
                <input
                  required
                  type="text"
                  value={newcategory?.name}
                  className="form-control"
                  onChange={(e) =>
                    setNewcategory((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </Col>
            </Row>
            <Button
              disabled={categoryLoading}
              type="submit"
              variant="success"
              className="mt-3"
            >
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddcategoryModal(false)}
          >
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal thêm nhà xuất bản */}
      <Modal
        size="lg"
        show={showAddsupplierModal}
        onHide={() => setShowAddsupplierModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm nhà xuất bản mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => handleSubmitAddsupplier(e, formik)}>
            <Row>
              <Col xl={12}>
                <label>Tên nhà xuất bản</label>
                <input
                  required
                  type="text"
                  value={newsupplier?.name}
                  className="form-control"
                  onChange={(e) =>
                    setNewsupplier((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </Col>
            </Row>
            <Button
              disabled={supplierLoading}
              type="submit"
              variant="success"
              className="mt-3"
            >
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddsupplierModal(false)}
          >
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Thêm sách mới</div>
          <div className="admin-content-body">
            <form onSubmit={formik.handleSubmit}>
              <Row>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Mã sách</label>
                    <input
                      type="text"
                      name="productId"
                      className={`form-control ${formik.errors.productId && formik.touched.productId
                          ? "is-invalid"
                          : formik.values.productId && "is-valid"
                        }`}
                      placeholder="Mã sách"
                      value={formik.values.productId}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.productId && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.productId}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={9}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tên sách</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${formik.errors.name && formik.touched.name
                          ? "is-invalid"
                          : formik.values.name && "is-valid"
                        }`}
                      placeholder="Tên sách"
                      value={formik.values.name}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.name && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.name}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
              </Row>

              <Row>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tác giả</label>
                    <Select
                      isMulti={true}
                      name="brand"
                      required={true}
                      maxMenuHeight={200}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                      onChange={(option) =>
                        formik.setFieldValue("brand", option)
                      }
                      options={brandList}
                    />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Thể loại</label>
                    <Select
                      isMulti={true}
                      name="category"
                      required={true}
                      maxMenuHeight={200}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                      onChange={(option) =>
                        formik.setFieldValue("category", option)
                      }
                      options={categoryList}
                      components={{
                        Menu: (props) => (
                          <components.Menu {...props}>
                            {props.children}
                            <div
                              onClick={() => setShowAddcategoryModal(true)}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontStyle: "italic",
                                borderTop: "1px solid #ccc",
                                backgroundColor: "#f8f9fa",
                                color: "#6c757d",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#e9ecef")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#f8f9fa")
                              }
                            >
                              + Thêm thể loại mới...
                            </div>
                          </components.Menu>
                        ),
                      }}
                    />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Nhà xuất bản</label>
                    <Select
                      name="supplier"
                      required={true}
                      maxMenuHeight={200}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                      value={
                        supplierList.find(
                          (p) => p._id === formik.values.supplier
                        )
                          ? {
                            value: formik.values.supplier,
                            label: supplierList.find(
                              (p) => p._id === formik.values.supplier
                            ).name,
                          }
                          : null
                      }
                      onChange={(option) =>
                        formik.setFieldValue("supplier", option.value)
                      }
                      options={supplierList.map((supplier) => ({
                        value: supplier._id,
                        label: supplier.name,
                      }))}
                      components={{
                        Menu: (props) => (
                          <components.Menu {...props}>
                            {props.children}
                            <div
                              onClick={() => setShowAddsupplierModal(true)}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontStyle: "italic",
                                borderTop: "1px solid #ccc",
                                backgroundColor: "#f8f9fa",
                                color: "#6c757d",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#e9ecef")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#f8f9fa")
                              }
                            >
                              + Thêm nhà xuất bản mới...
                            </div>
                          </components.Menu>
                        ),
                      }}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Năm xuất bản</label>
                    <input
                      type="text"
                      name="year"
                      className={`form-control ${formik.errors.year && formik.touched.year
                          ? "is-invalid"
                          : formik.values.year && "is-valid"
                        }`}
                      placeholder="Năm xuất bản"
                      value={formik.values.year}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.year && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.year}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Số trang</label>
                    <input
                      type="text"
                      name="pages"
                      className={`form-control ${formik.errors.pages && formik.touched.pages
                          ? "is-invalid"
                          : formik.values.pages && "is-valid"
                        }`}
                      placeholder="Số trang"
                      value={formik.values.pages}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.pages && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.pages}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Kích thước</label>
                    <input
                      type="text"
                      name="size"
                      className={`form-control ${formik.errors.size && formik.touched.size
                          ? "is-invalid"
                          : formik.values.size && "is-valid"
                        }`}
                      placeholder="Kích thước"
                      value={formik.values.size}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.size && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.size}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giá bán</label>
                    <input
                      type="number"
                      min="0"
                      name="price"
                      className={`form-control ${formik.errors.price && formik.touched.price
                          ? "is-invalid"
                          : formik.values.price && "is-valid"
                        }`}
                      placeholder="Giá bán"
                      value={formik.values.price}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.price && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.price}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giảm giá</label>
                    <input
                      type="number"
                      name="discount"
                      min="0"
                      max="100"
                      className={`form-control ${formik.errors.discount && formik.touched.discount
                          ? "is-invalid"
                          : formik.values.discount && "is-valid"
                        }`}
                      placeholder="Giảm giá"
                      value={formik.values.discount}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.discount && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.discount}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xl={12}>
                  <label className={styles.formLabel}>Mô tả</label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={formik.values.description}
                    onReady={(editor) => {
                      // You can store the "editor" and use when it is needed.
                      console.log("Editor is ready to use!", editor);
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      formik.setFieldValue("description", data);
                    }}
                    onBlur={(event, editor) => {
                      console.log("Blur.", editor);
                    }}
                    onFocus={(event, editor) => {
                      console.log("Focus.", editor);
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Hình ảnh</label>
                    <input
                      type="file"
                      name="image"
                      className={`form-control ${formik.errors.image && formik.touched.image
                          ? "is-invalid"
                          : formik.values.image && "is-valid"
                        }`}
                      placeholder="Hình ảnh"
                      accept="image/png, image/gif, image/jpeg"
                      // value={formik.values.image[0]}
                      onBlur={(e) =>
                        formik.setFieldValue("image", e.target.files[0])
                      }
                      onChange={(e) =>
                        formik.setFieldValue("image", e.target.files[0])
                      }
                    />
                    {formik.errors.image && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.image}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={3}>
                  {formik.values.image && (
                    <PreviewImage file={formik.values.image} />
                  )}
                </Col>
              </Row>

              <div className="d-flex-center">
                <button
                  type="submit"
                  className={`productstore-btn ${styles.submitBtn}`}
                  disabled={createLoading}
                >
                  Thêm sách
                </button>
                {createLoading && (
                  <Spinner
                    style={{ marginLeft: "20px" }}
                    animation="border"
                    variant="success"
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default Addproduct;




