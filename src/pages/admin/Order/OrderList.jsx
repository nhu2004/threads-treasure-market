// Client/src/pages/Admin/Order/OrderList.js
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderList.css";
import {
  Row,
  Col,
  Table,
  Badge,
  Button,
  Form,
  Card,
  Modal
} from "react-bootstrap";
import moment from "moment";
import { FaEdit, FaEye, FaSearch, FaFilter, FaShoppingCart, FaClipboardList, FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import PaginationproductStore from "../../../components/PaginationproductStore";
import OrderProgress from "../../../components/OrderProgress";
import OrderDetail from "../../../components/OrderDetail";
import format from "../../../helper/format";
import {
  useOrderList,
  useAdminOrderDetail,
  useUpdateOrderStatus,
} from "../../../hooks/admin/admin";

export default function OrderList() {
  const navigate = useNavigate(); 

  // 1. BIẾN LƯU TRỮ GIÁ TRỊ LỌC
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

   // 2. GỌI HOOK Ở ĐÂY (Trong file Component, không phải file Hook)
  const { orderData, page, setPage, updateOrderInList } = useOrderList({
    search: searchId,
    status: statusFilter,
    startDate: startDate,
    endDate: endDate
  });

  // 3. KHAI BÁO BIẾN STATS Ở ĐÂY
  const stats = orderData?.stats || { total: 0, pending: 0, shipping: 0, delivered: 0, cancelled: 0 };
  
  // Hàm xử lý khi bấm nút "Lọc"
  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1); // Trở về trang 1 khi lọc
  }; 

  const { showModal: showDetailModal, setShowModal: setShowDetailModal, orderDetail, fetchOrderDetail } = useAdminOrderDetail();

  const handleChangePage = useCallback((page) => { setPage(page); }, [setPage]);

  return (
    <Row>
      {/* CHI TIẾT ĐƠN HÀNG (Nếu vẫn dùng Modal xem nhanh) */}
      {showDetailModal && orderDetail && (
        <OrderDetail data={orderDetail} onBack={() => setShowDetailModal(false)} />
      )}

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-emerald-500 pl-3">
            Tổng quan Đơn hàng
          </h2>

          {/* === PHẦN 1: THỐNG KÊ (CARDS) === */}
          {/* === PHẦN 1: THỐNG KÊ (CARDS MỚI) === */}
          <Row className="mb-4 g-4">
            {/* Thẻ Tổng đơn */}
            <Col md={3}>
              <Card className="stat-card p-3 border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 fw-semibold fs-6">Tổng đơn</p>
                    <h3 className="mb-0 fw-bold text-dark fs-2">{stats.total}</h3>
                  </div>
                  <div className="stat-icon-box bg-blue-soft">
                    <FaShoppingCart />
                  </div>
                </div>
              </Card>
            </Col>

            {/* Thẻ Chờ xác nhận */}
            <Col md={3}>
              <Card className="stat-card p-3 border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 fw-semibold fs-6">Chờ xác nhận</p>
                    <h3 className="mb-0 fw-bold text-dark fs-2">{stats.pending}</h3>
                  </div>
                  <div className="stat-icon-box bg-orange-soft">
                    <FaHourglassHalf />
                  </div>
                </div>
              </Card>
            </Col>
            {/* Thẻ Đang xử lý */}
            <Col md={3}>
              <Card className="stat-card p-3 border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 fw-semibold fs-6">Đang xử lý</p>
                                <h3 className="mb-0 fw-bold text-dark fs-2">{stats.processing}</h3>
                              </div>
                              <div className="stat-icon-box bg-blue-soft">
                                <FaBoxOpen />
                              </div>
                            </div>
                          </Card>
                        </Col>
                        {/* Thẻ Đang giao */}
            <Col md={3}>
              <Card className="stat-card p-3 border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 fw-semibold fs-6">Đang giao</p>
                                <h3 className="mb-0 fw-bold text-dark fs-2">{stats.shipping}</h3>
                              </div>
                              <div className="stat-icon-box bg-green-soft">
                                <FaTruck />
                              </div>
                            </div>
                          </Card>
                        </Col>
            {/* Thẻ Đã giao */}
            <Col md={3}>
              <Card className="stat-card p-3 border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 fw-semibold fs-6">Đã giao</p>
                    <h3 className="mb-0 fw-bold text-dark fs-2">{stats.delivered}</h3>
                  </div>
                  <div className="stat-icon-box bg-green-soft">
                    <FaCheckCircle />
                  </div>
                </div>
              </Card>
            </Col>

            {/* Thẻ Đã hủy */}
            <Col md={3}>
              <Card className="stat-card p-3 border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 fw-semibold fs-6">Đã hủy</p>
                    <h3 className="mb-0 fw-bold text-dark fs-2">{stats.cancelled}</h3>
                  </div>
                  <div className="stat-icon-box bg-red-soft">
                    <FaTimesCircle />
                  </div>
                </div>
              </Card>
            </Col>
          </Row> 

          {/* === PHẦN 3: BỘ LỌC TÌM KIẾM === */}
          <Form className="filter-bar d-flex gap-3 align-items-end flex-wrap" onSubmit={handleFilter}>
              {/* Thêm flex-grow-1 vào đây */}
              <Form.Group className="flex-grow-1">
                <Form.Label className="fw-bold fs-6 mb-1">Mã đơn hàng</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><FaSearch className="text-muted"/></span>
                  <Form.Control type="text" placeholder="#ORD-..." value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                </div>
              </Form.Group>
              
              {/* Thêm flex-grow-1 vào đây */}
              <Form.Group className="flex-grow-1">
                <Form.Label className="fw-bold fs-6 mb-1">Trạng thái</Form.Label>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Tất cả trạng thái</option>
                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                  <option value="Đang xử lý">Đang xử lý</option> {/* THÊM DÒNG NÀY */}
                  <option value="Đang giao">Đang giao</option>
                  <option value="Đã giao">Đã giao</option>
                  <option value="Đã hủy">Đã hủy</option>
                </Form.Select>
              </Form.Group>

              {/* Thêm flex-grow-1 vào đây */}
              <Form.Group className="flex-grow-1">
                <Form.Label className="fw-bold fs-6 mb-1">Từ ngày</Form.Label>
                <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Form.Group>

              {/* Thêm flex-grow-1 vào đây */}
              <Form.Group className="flex-grow-1">
                <Form.Label className="fw-bold fs-6 mb-1">Đến ngày</Form.Label>
                <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </Form.Group>

              </Form>

          {/* === PHẦN 4: BẢNG DANH SÁCH === */}
          <div className="admin-content-body">
            <Table responsive hover className="custom-order-table border-0">
              <thead>
                <tr>
                  <th className="text-center">STT</th>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt hàng</th>
                  <th className="text-end">Tổng tiền</th> 
                  {/* ĐỔI TÊN CỘT Ở ĐÂY */}
                  <th className="text-start">Thông tin giao hàng</th> 
                  <th className="text-center">Tiến độ giao hàng</th> 
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orderData.orders && orderData.orders.length > 0 ? (
                  orderData.orders.map((item, index) => {
                    const statusText = item.orderStatus?.text || item.status;
                    return (
                      <tr key={item._id || item.OrderID}> 
                        <td className="text-center fw-bold">{(page - 1) * 10 + index + 1}</td>
                        <td className="fw-medium text-primary">#ORD-{item._id || item.OrderID}</td> 
                        <td>{moment(item.orderDate).format("DD/MM/YYYY HH:mm")}</td>
                        <td className="text-end fw-bold text-danger">
                          {format.formatPrice(item.totalPrice || item.total)} 
                        </td>
                        
                        {/* THAY THẾ CỘT THANH TOÁN BẰNG THÔNG TIN GIAO HÀNG */}
                        <td className="text-start">
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-dark">{item.delivery?.fullName}</span>
                            <span className="text-muted" style={{fontSize: "13px"}}>{item.delivery?.phone}</span>
                            <span className="text-muted text-truncate" style={{maxWidth: "150px", fontSize: "12px"}} title={item.delivery?.address}>
                              {item.delivery?.address}
                            </span>
                          </div>
                        </td>

                        {/* CỘT TIẾN ĐỘ */}
                        <td className="progress-cell">
                          <OrderProgress 
                            currentStatusText={statusText} 
                            orderStatusCode={item.orderStatus?.code} 
                            compact={true} 
                          />
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => fetchOrderDetail(item._id || item.OrderID)}
                            >
                              <FaEye />  
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => navigate(`/admin/orders/update/${item._id || item.OrderID}`)}
                            >
                              <FaEdit />  
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Không tìm thấy đơn hàng phù hợp!
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {orderData.totalPage > 1 ? (
                    <PaginationproductStore
                      totalPages={orderData.totalPage}   
                      currentPage={page}
                      onPageChange={handleChangePage}    
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