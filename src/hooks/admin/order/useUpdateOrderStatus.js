import { useState } from "react";
import orderApi from "../../../api/orderApi";

export const useUpdateOrderStatus = (orderDetail, onSuccess) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const openModal = async (orderId) => {
    try {
      if (!(orderDetail._id === orderId)) {
        const { data } = await orderApi.getById(orderId, {});
        if (onSuccess) onSuccess(data);
      }
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data } = await orderApi.updateOrderStatus(orderDetail?._id, {
        orderStatusCode: +orderDetail?.orderStatus?.code + 1,
      });
      setLoading(false);
      const { orderStatus, paymentStatus } = data;
      alert("Cập nhật thành công!");
      if (onSuccess) {
        onSuccess({ ...orderDetail, orderStatus, paymentStatus });
      }
    } catch (error) {
      alert("Cập nhật thất bại!");
      setLoading(false);
      console.log(error);
    }
  };

  return {
    showModal,
    setShowModal,
    loading,
    openModal,
    handleUpdate,
  };
};






