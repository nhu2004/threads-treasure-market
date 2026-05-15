// src/pages/admin/PurchaseOrders/CreatePurchaseOrder/index.jsx
import React, { useState } from 'react';
import { Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { purchaseOrderApi } from '../../../../api/purchaseOrdersAPI';
import productApi from '../../../../api/productApi';
import { useProductOptions } from '../../../../hooks/admin/admin';
import format from '../../../../helper/format';
import { FaPlus, FaTrash } from 'react-icons/fa';
import styles from './CreatePurchaseOrder.module.css';

const CreatePurchaseOrder = () => {
    const { supplierList, categoryList } = useProductOptions();
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [items, setItems] = useState([]);
    
    // Autocomplete Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    // Quick Add Modal
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newProd, setNewProd] = useState({ name: '', sku: '', categoryId: '', color: '', size: '' });

    // Tìm kiếm SP
    const searchProduct = async (query) => {
        setSearchQuery(query);
        if (query.length > 1) {
            const res = await productApi.getAll({ search: query, admin: true });
            setSearchResults(res.products || []);
        } else {
            setSearchResults([]);
        }
    };

    // Đưa SP vào rỏ chờ đặt
    const addItem = (product) => {
        if (!items.find(i => i.productId === product.id)) {
            setItems([...items, { productId: product.id, name: product.name, sku: product.sku, color: product.color, size: product.size, importPrice: 0, orderQuantity: 1 }]);
        }
        setSearchQuery(''); setSearchResults([]);
    };

    // Tạo nhanh SP (Tồn kho = 0)
    const handleQuickAdd = async () => {
        if(!newProd.name || !newProd.categoryId) return alert("Nhập Tên và Danh mục!");
        const payload = { ...newProd, supplierId: selectedSupplier || supplierList[0]?.SupplierID, price: 0, originalPrice: 0, stockQuantity: 0 };
        const res = await productApi.create(payload);
        if(res.success) { 
            setShowQuickAdd(false); 
            alert("Đã tạo! Bạn hãy gõ tên sản phẩm vừa tạo vào ô tìm kiếm để thêm vào đơn."); 
            setSearchQuery(newProd.name); // Tự động điền lại tên để tìm
            searchProduct(newProd.name);
        }
    };

    const handleCreatePO = async () => {
        if (!selectedSupplier || items.length === 0) return alert("Chọn NCC và Sản phẩm!");
        const total = items.reduce((sum, i) => sum + (i.importPrice * i.orderQuantity), 0);
        const res = await purchaseOrderApi.create({ supplierId: selectedSupplier, items, totalAmount: total });
        if (res.success) window.location.href = "/admin/purchase-orders";
    };

    return (
        <div className="p-4 bg-white rounded shadow-sm pb-5">
            <h3 className="mb-4 font-bold border-l-4 border-primary pl-3">Tạo Yêu Cầu Nhập Hàng</h3>
            <Row className="mb-4">
                <Col md={4}>
                    <Form.Label className="fw-bold text-primary">1. Chọn Nhà cung cấp</Form.Label>
                    <Form.Select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                        <option value="">-- Chọn NCC --</option>
                        {supplierList.map(s => <option key={s.SupplierID} value={s.SupplierID}>{s.Name}</option>)}
                    </Form.Select>
                </Col>
                <Col md={8}>
                    <Form.Label className="fw-bold text-primary">2. Tìm Sản phẩm</Form.Label>
                    <div className="position-relative">
                        <Form.Control placeholder="Gõ tên hoặc SKU để tìm..." value={searchQuery} onChange={e => searchProduct(e.target.value)} />
                        
                        {/* Dropdown kết quả */}
                        {searchResults.length > 0 && (
                            <div className="position-absolute w-100 bg-white border rounded shadow-sm z-index-10" style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 10 }}>
                                {searchResults.map(p => (
                                    <div key={p.id} className="p-2 border-bottom" style={{cursor: 'pointer'}} onClick={() => addItem(p)} onMouseEnter={(e) => e.target.style.backgroundColor='#f8f9fa'} onMouseLeave={(e) => e.target.style.backgroundColor='white'}>
                                        <b>{p.name}</b> <small className="text-muted">({p.color} - {p.size})</small>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Nút Tạo Nhanh khi không tìm thấy */}
                        {searchQuery.length > 1 && searchResults.length === 0 && (
                            <div className="mt-2 text-danger small">
                                Không tìm thấy sản phẩm này trong kho. 
                                <Button size="sm" variant="outline-success" className="ms-2" onClick={() => setShowQuickAdd(true)}>+ Tạo mới nhanh</Button>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>

            <Table bordered hover>
                <thead className="bg-light">
                    <tr><th>Sản phẩm</th><th>Màu/Size</th><th>Giá nhập (VNĐ)</th><th>SL Đặt</th><th>Thành tiền</th><th></th></tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx} className="align-middle">
                            <td>{item.name} <br/><small>{item.sku}</small></td>
                            <td>{item.color} / {item.size}</td>
                            <td><Form.Control type="number" value={item.importPrice} onChange={e => {
                                const newItems = [...items]; newItems[idx].importPrice = e.target.value; setItems(newItems);
                            }} /></td>
                            <td><Form.Control type="number" value={item.orderQuantity} onChange={e => {
                                const newItems = [...items]; newItems[idx].orderQuantity = e.target.value; setItems(newItems);
                            }} /></td>
                            <td className="fw-bold">{format.formatPrice(item.importPrice * item.orderQuantity)}</td>
                            <td><Button variant="danger" size="sm" onClick={() => setItems(items.filter((_, i) => i !== idx))}><FaTrash/></Button></td>
                        </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">Chưa có sản phẩm nào được chọn</td></tr>}
                </tbody>
            </Table>
            <Button variant="primary" size="lg" className="float-end px-5 mt-3" onClick={handleCreatePO}>Tạo Yêu Cầu Đặt Hàng</Button>

            {/* MODAL TẠO NHANH SẢN PHẨM */}
            <Modal show={showQuickAdd} onHide={() => setShowQuickAdd(false)} centered>
                <Modal.Header closeButton><Modal.Title>Tạo sản phẩm mới nhanh</Modal.Title></Modal.Header>
                <Modal.Body>
                    <div className="alert alert-info py-2"><small>Tồn kho mặc định sẽ bằng 0. Khi hàng về bạn có thể bổ sung ảnh sau.</small></div>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Tên SP</Form.Label>
                        <Form.Control value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Danh mục</Form.Label>
                        <Form.Select onChange={e => setNewProd({...newProd, categoryId: e.target.value})}>
                            <option value="">-- Chọn danh mục --</option>
                            {categoryList.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Row>
                        <Col><Form.Group className="mb-3"><Form.Label>Mã SKU</Form.Label><Form.Control onChange={e => setNewProd({...newProd, sku: e.target.value})} /></Form.Group></Col>
                        <Col><Form.Group className="mb-3"><Form.Label>Màu sắc</Form.Label><Form.Control onChange={e => setNewProd({...newProd, color: e.target.value})} /></Form.Group></Col>
                        <Col><Form.Group className="mb-3"><Form.Label>Size</Form.Label><Form.Control onChange={e => setNewProd({...newProd, size: e.target.value})} /></Form.Group></Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowQuickAdd(false)}>Hủy</Button>
                    <Button variant="success" onClick={handleQuickAdd}><FaPlus/> Lưu Sản Phẩm</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CreatePurchaseOrder;