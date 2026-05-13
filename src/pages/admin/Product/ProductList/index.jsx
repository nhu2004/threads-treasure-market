import React, { useCallback, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaginationproductStore from "../../../../components/PaginationproductStore";
import { FaEdit, FaEyeSlash, FaEye, FaSearch, FaPlus, FaBoxOpen, FaFileExcel, FaHandPointer, FaChevronDown, FaChevronUp } from "react-icons/fa"; 
import { Spinner, Modal, Button } from "react-bootstrap";
import format from "../../../../helper/format";
import { useProductList, useDeleteProduct } from "../../../../hooks/admin/admin";
import styles from "./ProductList.module.css";

function ProductList() {
  const { productData = {}, page, setPage, loading, searchInput, setSearchInput, handleSearch, removeProduct } = useProductList();
  const { showModal, setShowModal, productDelete, openDeleteModal, handleDelete } = useDeleteProduct(removeProduct);
  const navigate = useNavigate(); 
  const [showAddOptions, setShowAddOptions] = useState(false);

  // STATE: Quản lý dòng nào đang được Sổ xuống (Mở rộng)
  const [expandedRows, setExpandedRows] = useState({});

  const handleChangePage = useCallback((page) => setPage(page), [setPage]);
  const productsList = Array.isArray(productData) ? productData : (productData?.products || productData?.data || []);
  const totalPages = productData?.totalPage || 1;

  // 🔴 THUẬT TOÁN GOM NHÓM FRONTEND
  const groupedProducts = useMemo(() => {
    const groups = {};
    productsList.forEach(item => {
      // Nhóm theo Mã Nhóm, nếu không có thì nhóm theo Tên
      const key = item.productGroupId || item.name;
      if (!groups[key]) {
        groups[key] = {
          ...item,
          groupKey: key,
          totalStock: 0,
          variants: [] // Mảng chứa các phân loại con
        };
      }
      groups[key].totalStock += (item.stockQuantity ?? item.StockQuantity ?? 0);
      groups[key].variants.push(item);
    });
    return Object.values(groups);
  }, [productsList]);

  const toggleRow = (key) => {
    setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.wrapper}>
      {/* MODAL ẨN / HIỆN phân loại */}
      <Modal size="md" show={showModal} onHide={() => setShowModal(false)} centered>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {productDelete?.isActive !== false ? "Xác nhận ẩn phân loại" : "Xác nhận hiện phân loại"}
              </h5>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: '20px', fontSize: '15px', color: '#374151' }}>
              Bạn có chắc chắn muốn {productDelete?.isActive !== false ? "ẨN" : "HIỆN"} phân loại <b style={{ color: '#111827' }}>{productDelete?.name} (Màu: {productDelete?.color || 'N/A'}, Size: {productDelete?.size || 'N/A'})</b>?
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-light">Hủy</button>
              <button onClick={handleDelete} className={productDelete?.isActive !== false ? 'btn btn-danger' : 'btn btn-success'}>
                {productDelete?.isActive !== false ? "Xác nhận ẩn" : "Hiện lại"}
              </button>
            </div>
          </div>
        </div>
      )}
      </Modal>

      {/* MODAL THÊM MỚI */}
      <Modal size="lg" show={showAddOptions} onHide={() => setShowAddOptions(false)} centered>
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, fontWeight: '700', color: '#1f2937' }}>Chọn phương thức thêm</h4>
            <button onClick={() => setShowAddOptions(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className={styles.optionCard} onClick={() => { setShowAddOptions(false); navigate("/admin/product/add"); }}>
              <div className={styles.iconCircle} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><FaHandPointer size={24} /></div>
              <h5 style={{ fontWeight: '600', mt: '16px' }}>Thêm thủ công</h5>
            </div>
            <div className={styles.optionCard} onClick={() => alert("Tính năng đang phát triển!")}>
              <div className={styles.iconCircle} style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}><FaFileExcel size={24} /></div>
              <h5 style={{ fontWeight: '600', mt: '16px' }}>Nhập hàng loạt Excel</h5>
            </div>
          </div>
        </div>
      </Modal>

      <h2 className="text-xl font-bold text-gray-800 mb-2 border-l-4 border-emerald-500 pl-3">Quản lý Sản Phẩm </h2>
      
      <div className={styles.actionBar}>
        <div className={styles.actionContent}>
          <div className={styles.searchBox}>
            <input className={styles.searchInput} placeholder="Tìm tên sản phẩm, mã SKU..." value={searchInput || ""} onChange={(e) => setSearchInput(e.target.value)} />
            <button className={styles.searchBtn} onClick={handleSearch}><FaSearch /> Tìm</button>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className={styles.restockBtn} onClick={() => alert("Mở form nhập kho")}><FaBoxOpen /> Nhập kho</button>
            <button className={styles.addBtn} onClick={() => setShowAddOptions(true)}><FaPlus /> Thêm mới</button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>STT</th>
              <th className={styles.tableHeadCell}>Hình ảnh</th>
              <th className={styles.tableHeadCell}>Sản phẩm / Phân loại</th>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Danh mục</th>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Số lượng</th>
              <th className={`${styles.tableHeadCell} ${styles.tableCellCenter}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {loading ? (
              <tr><td colSpan={6} className={styles.loadingState}><Spinner animation="border" variant="success" /><p className={styles.loadingText}>Đang tải dữ liệu...</p></td></tr>
            ) : groupedProducts.length > 0 ? (
              groupedProducts.map((group, index) => (
                <React.Fragment key={group.groupKey}>
                  
                  {/* 1. DÒNG CHA (GOM NHÓM) */}
                  <tr 
                    onClick={() => toggleRow(group.groupKey)} 
                    style={{ cursor: 'pointer', backgroundColor: expandedRows[group.groupKey] ? '#f8fafc' : 'white', transition: 'background-color 0.2s', borderBottom: expandedRows[group.groupKey] ? 'none' : '1px solid #f0f1f3' }}
                  >
                    <td className={`${styles.tableCell} ${styles.tableCellCenter}`}><b>{((page || 1) - 1) * 10 + (index + 1)}</b></td>
                    <td className={`${styles.tableCell} ${styles.tableCellImage}`}>
                      <img src={group.image || 'https://via.placeholder.com/50x70'} alt={group.name} style={{ width: '45px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                    </td>
                    <td className={styles.tableCell}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#1f2937' }}>{group.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Mã nhóm: {group.groupKey}</div>
                      <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600', marginTop: '4px' }}>
                         ↳ Chứa {group.variants.length} phân loại
                      </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.tableCellCenter}`}><span className={styles.categoryBadge}>{group.category || 'Mặc định'}</span></td>
                    <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                      <span style={{ fontWeight: '700', fontSize: '16px', color: group.totalStock < 10 ? '#ef4444' : '#10b981' }}>
                         Tổng: {group.totalStock}
                      </span>
                    </td>
                    <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                      <button style={{ background: 'none', border: '1px solid #d1d5db', color: '#4b5563', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto', padding: '6px 10px', borderRadius: '6px' }}>
                        {expandedRows[group.groupKey] ? <><FaChevronUp/> Đóng</> : <><FaChevronDown/> Xem chi tiết </>}
                      </button>
                    </td>
                  </tr>

                  {/* 2. CÁC DÒNG CON (phân loại MÀU / SIZE) - Chỉ có nút Sửa/Ẩn ở đây */}
                  {expandedRows[group.groupKey] && group.variants.map((variant, vIndex) => {
                    const isActive = variant.isActive !== false && variant.isActive !== 0;
                    return (
                    <tr key={variant.id || `${group.groupKey}-${vIndex}`} style={{ backgroundColor: '#ffffff', opacity: isActive ? 1 : 0.55, borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ borderRight: '2px solid #3b82f6' }}></td>
                      <td className={`${styles.tableCell} ${styles.tableCellImage}`}>
                        <img src={variant.image || 'https://via.placeholder.com/50x70'} style={{ width: '35px', height: '45px', borderRadius: '4px', objectFit: 'cover' }} />
                      </td>
                      <td className={styles.tableCell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          {!isActive && <span className="badge bg-secondary">Đã Ẩn</span>}
                          {variant.color && <span className="badge bg-light text-dark border">Màu: {variant.color}</span>}
                          {variant.size && <span className="badge bg-dark text-white">Size: {variant.size}</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          SKU: <b className="text-primary">{variant.sku || 'N/A'}</b> | Giá: <b className="text-success">{format.formatPrice(variant.price || 0)}</b>
                        </div>
                      </td>
                      <td></td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span style={{ fontWeight: '600', color: (variant.stockQuantity ?? variant.StockQuantity) < 10 ? '#ef4444' : '#374151' }}>
                          {variant.stockQuantity ?? variant.StockQuantity ?? 0}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <div className={styles.actionsCell}>
                          {/* NÚT SỬA NẰM Ở TỪNG DÒNG CON */}
                          <Link to={`/admin/product/update/${variant.id}`} className={`${styles.actionBtn} ${styles.editBtn}`} title="Chỉnh sửa">
                            <FaEdit />
                          </Link>
                          {/* NÚT ẨN/HIỆN NẰM Ở TỪNG DÒNG CON NÀY */}
                          <button
                            className={`${styles.actionBtn} ${isActive ? styles.hideBtn : styles.showBtn}`}
                            onClick={(e) => { e.stopPropagation(); openDeleteModal(variant); }}
                            title={isActive ? "Ẩn phân loại này" : "Hiện lại lên cửa hàng"}
                          >
                            {isActive ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </React.Fragment>
              ))
            ) : (
              <tr><td colSpan={6} className={styles.emptyState}>Hiện chưa có sản phẩm nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (<div className={styles.paginationContainer}><PaginationproductStore totalPage={totalPages} currentPage={page} onChangePage={handleChangePage} /></div>)}
    </div>
  );
}

export default ProductList;