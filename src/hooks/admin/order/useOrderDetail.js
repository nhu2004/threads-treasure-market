import { useState } from "react";
import orderApi from "../../../api/orderApi";

export const useOrderDetail = () => {
  const [showModal, setShowModal] = useState(false);
  const [orderDetail, setOrderDetail] = useState({});

  const fetchOrderDetail = async (orderId) => {
    try {
      if (!(orderDetail._id === orderId)) {
        const { data } = await orderApi.getById(orderId, {});
        setOrderDetail(data);
      }
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    showModal,
    setShowModal,
    orderDetail,
    setOrderDetail,
    fetchOrderDetail,
  };
};






