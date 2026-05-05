import { useState } from "react";
import { toast } from "react-toastify";
import productApi from "../../../api/productApi";

export const useDeleteProduct = (onSuccess) => {
  const [showModal, setShowModal] = useState(false);
  const [productDelete, setProductDelete] = useState({});

  const openDeleteModal = (product) => {
    setProductDelete(product);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      // Kiểm tra xem sản phẩm đã từng được đặt hàng chưa[cite: 22]
      const { data: orders } = await productApi.checkIsOrdered(productDelete.ProductID || productDelete.id);
      
      if (orders.length > 0) {
        toast.error("Sản phẩm đã có trong đơn hàng, không thể xóa!", {
          autoClose: 2000,
        });
        return;
      }

      await productApi.delete(productDelete.ProductID || productDelete.id);
      toast.success("Xóa sản phẩm thành công!", { autoClose: 2000 });
      setShowModal(false);

      if (onSuccess) {
        onSuccess(productDelete.ProductID || productDelete.id);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm!");
      setShowModal(false);
    }
  };

  return {
    showModal,
    setShowModal,
    productDelete,
    openDeleteModal,
    handleDelete,
  };
};