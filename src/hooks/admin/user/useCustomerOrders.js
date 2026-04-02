import { useState } from "react";
import orderApi from "../../../api/orderApi";

export const useCustomerOrders = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [orderDetail, setOrderDetail] = useState({});

  const fetchOrders = async (userId) => {
    try {
      const { data } = await orderApi.getAll({
        userId,
        limit: 10,
      });
      setOrderList(data);
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const { data } = await orderApi.getById(orderId, {});
      setOrderDetail(data);
      setShowDetailModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    showModal,
    setShowModal,
    showDetailModal,
    setShowDetailModal,
    orderList,
    orderDetail,
    fetchOrders,
    fetchOrderDetail,
  };
};






