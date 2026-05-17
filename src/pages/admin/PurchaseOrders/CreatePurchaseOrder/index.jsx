// src/pages/admin/PurchaseOrders/CreatePurchaseOrder/index.jsx
import React, { useState } from 'react';
import { Row, Col, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';
import { purchaseOrderApi } from '../../../../api/purchaseOrdersAPI';
import productApi from '../../../../api/productApi';
import { useProductOptions } from '../../../../hooks/admin/admin';
import format from '../../../../helper/format';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import styles from './CreatePurchaseOrder.module.css';

const CreatePurchaseOrder = () => {
    const { supplierList, categoryList } = useProductOptions();
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [items, setItems] = useState([]);
    
    // Tìm kiếm
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Modal Tạo Nhanh
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newProd, setNewProd] = useState({ 
        productGroupId: '', sku: '', name: '', price: '', 
        color: '', size: '', categoryId: '', description: '', image: '' 
    });

    // 1. TÌM KIẾM & LỌC THEO NHÀ CUNG CẤP
    const searchProduct = async (query) => {
        setSearchQuery(query);
        
        // Bắt buộc chọn NCC trước
        if (!selectedSupplier) {
            setSearchResults([]);
            return;
        }

        if (query.length > 1) {
            setIsSearching(true);
            try {
                const res = await productApi.getAll({ search: query, admin: true });
                // LỌC: Chỉ lấy các sản phẩm thuộc Nhà Cung Cấp đang được chọn
                const filteredProducts = (res.products || []).filter(
                    p => p.supplierId == selectedSupplier || p.SupplierID == selectedSupplier
                );
                setSearchResults(filteredProducts);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSupplierChange = (e) => {
        const supId = e.target.value;
        setSelectedSupplier(supId);
        setItems([]); // Đổi NCC thì xóa giỏ hàng cũ
        setSearchQuery('');
        setSearchResults([]);
    };

    const addItem = (product) => {
        if (!items.find(i => i.productId === product.id)) {
            setItems([...items, { 
                productId: product.id, name: product.name, sku: product.sku, 
                color: product.color, size: product.size, importPrice: 0, orderQuantity: 1 
            }]);
        }
        setSearchQuery(''); 
        setSearchResults([]);
    };

    // 2. TẠO SẢN PHẨM MỚI (TỒN KHO = 0)
    const handleQuickAdd = async () => {
        if(!newProd.name || !newProd.categoryId || !newProd.sku) {
            return alert("Vui lòng nhập Tên, Mã SKU và Chọn Danh mục!");
        }

        setIsCreating(true);
        try {
            const payload = { 
                ...newProd, 
                supplierId: selectedSupplier, // Gắn cứng NCC đang chọn
                price: Number(newProd.price) || 0,
                originalPrice: Number(newProd.price) || 0, 
                stockQuantity: 0, // Mặc định tồn kho 0
                isActive: 1
            };
            
            const res = await productApi.create(payload);
            if(res.success) { 
                setShowQuickAdd(false); 
                alert("Đã tạo sản phẩm! Bạn có thể thêm ngay vào đơn hàng."); 
                // Reset form
                setNewProd({ productGroupId: '', sku: '', name: '', price: '', color: '', size: '', categoryId: '', description: '', image: '' });
                // Tự động tìm lại
                searchProduct(payload.name);
            } else {
                alert("Lỗi tạo sản phẩm: " + res.message);
            }
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi tạo sản phẩm!");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreatePO = async () => {
        if (!selectedSupplier) return alert("Vui lòng chọn Nhà cung cấp!");
        if (items.length === 0) return alert("Vui lòng chọn ít nhất 1 sản phẩm!");
        
        const total = items.reduce((sum, i) => sum + (i.importPrice * i.orderQuantity), 0);
        const res = await purchaseOrderApi.create({ supplierId: selectedSupplier, items, totalAmount: total });
        
        if (res.success) {
            alert("Tạo đơn đặt hàng thành công!");
            window.location.href = "/admin/purchase-orders";
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow-sm pb-5">
            <h3 className="mb-4 font-bold border-l-4 border-primary pl-3">Tạo Yêu Cầu Nhập Hàng</h3>
            <Row className="mb-4">
                <Col md={4}>
                    <Form.Label className="fw-bold text-primary">1. Chọn Nhà cung cấp</Form.Label>
                    <Form.Select value={selectedSupplier} onChange={handleSupplierChange}>
                        <option value="">-- Chọn NCC --</option>
                        {supplierList.map(s => <option key={s.SupplierID} value={s.SupplierID}>{s.Name}</option>)}
                    </Form.Select>
                </Col>
                <Col md={8}>
                    <Form.Label className="fw-bold text-primary">2. Tìm Sản phẩm của NCC này</Form.Label>
                    <div className="position-relative">
                        <Form.Control 
                            placeholder={selectedSupplier ? "Gõ tên hoặc SKU để tìm..." : "Vui lòng chọn Nhà cung cấp trước..."}
                            value={searchQuery} 
                            onChange={e => searchProduct(e.target.value)} 
                            disabled={!selectedSupplier}
                        />
                        {isSearching && <div className="position-absolute end-0 top-0 mt-2 me-3"><Spinner size="sm" animation="border" /></div>}
                        
                        {/* Dropdown kết quả */}
                        {searchResults.length > 0 && (
                            <div className="position-absolute w-100 bg-white border rounded shadow-sm z-index-10" style={{ maxHeight: '250px', overflowY: 'auto', zIndex: 10 }}>
                                {searchResults.map(p => (
                                    <div key={p.id} className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{cursor: 'pointer'}} onClick={() => addItem(p)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor='#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor='white'}>
                                        <div>
                                            <b>{p.name}</b> <br/>
                                            <small className="text-muted">SKU: {p.sku} | Màu: {p.color} - Size: {p.size}</small>
                                        </div>
                                        <Badge bg="success"><FaPlus/> Thêm</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Nút Tạo Nhanh */}
                        {searchQuery.length > 1 && searchResults.length === 0 && !isSearching && selectedSupplier && (
                            <div className="mt-2 text-danger small bg-light p-2 rounded border border-danger">
                                <span>NCC này hiện chưa có sản phẩm: <b>"{searchQuery}"</b>.</span> 
                                <Button size="sm" variant="danger" className="ms-3 fw-bold" onClick={() => {
                                    setNewProd(prev => ({...prev, name: searchQuery})); // Gán sẵn tên vừa tìm
                                    setShowQuickAdd(true);
                                }}>+ Tạo mới sản phẩm</Button>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>

            <Table bordered hover className="align-middle">
                <thead className="bg-light text-center">
                    <tr><th>Sản phẩm</th><th>Màu/Size</th><th>Giá nhập (VNĐ)</th><th>SL Đặt</th><th>Thành tiền</th><th>Xóa</th></tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx}>
                            <td><b>{item.name}</b> <br/><small className="text-muted">{item.sku}</small></td>
                            <td className="text-center">{item.color} / {item.size}</td>
                            <td><Form.Control type="number" min="0" value={item.importPrice} onChange={e => {
                                const newItems = [...items]; newItems[idx].importPrice = Number(e.target.value); setItems(newItems);
                            }} /></td>
                            <td style={{width: '100px'}}><Form.Control type="number" min="1" className="text-center fw-bold text-primary" value={item.orderQuantity} onChange={e => {
                                const newItems = [...items]; newItems[idx].orderQuantity = Number(e.target.value); setItems(newItems);
                            }} /></td>
                            <td className="text-end fw-bold text-success">{format.formatPrice(item.importPrice * item.orderQuantity)}</td>
                            <td className="text-center"><Button variant="outline-danger" size="sm" onClick={() => setItems(items.filter((_, i) => i !== idx))}><FaTrash/></Button></td>
                        </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan="6" className="text-center py-5 text-muted">Chưa có sản phẩm nào được chọn vào đơn.</td></tr>}
                </tbody>
            </Table>
            
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h4 className="mb-0">Tổng tiền dự kiến: <b className="text-danger">{format.formatPrice(items.reduce((sum, i) => sum + (i.importPrice * i.orderQuantity), 0))}</b></h4>
                <Button variant="primary" size="lg" className="px-5 fw-bold" onClick={handleCreatePO}>Gửi Yêu Cầu Đặt Hàng</Button>
            </div>

            {/* ========================================================================= */}
            {/* MODAL TẠO NHANH SẢN PHẨM (NÂNG CẤP GIỐNG ADDPRODUCT.JSX)                  */}
            {/* ========================================================================= */}
            <Modal size="lg" show={showQuickAdd} onHide={() => setShowQuickAdd(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold text-primary">Thêm Sản Phẩm Mới (Cho NCC đang chọn)</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="alert alert-warning py-2 mb-4">
                        <small><b>Lưu ý:</b> Hệ thống sẽ tự động gán sản phẩm này cho Nhà cung cấp bạn đang chọn. Tồn kho mặc định là <b>0</b>.</small>
                    </div>
                    
                    <Row className="mb-3"> 
                        <Col xl={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Mã nhóm SP (Ví dụ: BLAZER-OVS)</Form.Label>
                                <Form.Control placeholder="Nhóm các size/màu chung..." value={newProd.productGroupId} onChange={e => setNewProd({...newProd, productGroupId: e.target.value})} />
                            </Form.Group>
                        </Col> 
                        <Col xl={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-danger">Mã kho SKU (*)</Form.Label>
                                <Form.Control placeholder="Mã định danh duy nhất..." value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3"> 
                        <Col xl={8}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-danger">Tên sản phẩm (*)</Form.Label>
                                <Form.Control placeholder="Nhập tên sản phẩm..." value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
                            </Form.Group>
                        </Col> 
                        <Col xl={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Giá bán dự kiến (VNĐ)</Form.Label>
                                <Form.Control type="number" placeholder="Ví dụ: 500000" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col xl={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Màu sắc</Form.Label>
                                <Form.Control placeholder="Ví dụ: Đen" value={newProd.color} onChange={e => setNewProd({...newProd, color: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col xl={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Kích cỡ (Size)</Form.Label>
                                <Form.Control placeholder="Ví dụ: XL, 32" value={newProd.size} onChange={e => setNewProd({...newProd, size: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col xl={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-danger">Danh mục (*)</Form.Label>
                                <Form.Select value={newProd.categoryId} onChange={e => setNewProd({...newProd, categoryId: e.target.value})}>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categoryList.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Mô tả sản phẩm..." value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Link hình ảnh sản phẩm</Form.Label>
                        <Form.Control placeholder="https://..." value={newProd.image} onChange={e => setNewProd({...newProd, image: e.target.value})} />
                        {newProd.image && (
                            <div className="mt-2 text-center">
                                <img src={newProd.image} alt="Preview" style={{ height: '100px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }} />
                            </div>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setShowQuickAdd(false)}>Hủy bỏ</Button>
                    <Button variant="success" className="px-4 fw-bold" onClick={handleQuickAdd} disabled={isCreating}>
                        {isCreating ? <Spinner size="sm" animation="border"/> : <><FaPlus/> Lưu Sản Phẩm Mới</>}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CreatePurchaseOrder;