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
      const productId = productDelete.ProductID || productDelete.id;
      
      // 🔴 SỬA Ở ĐÂY: Gọi API toggleStatus thay vì API delete
      await productApi.toggleStatus(productId);
      
      // Xác định câu thông báo dựa vào trạng thái hiện tại
      const isCurrentlyActive = productDelete.isActive !== false && productDelete.isActive !== 0;
      const actionName = isCurrentlyActive ? "Ẩn" : "Hiện lại";
      
      toast.success(`${actionName} phân loại thành công!`, { autoClose: 2000 });
      setShowModal(false);

      if (onSuccess) {
        onSuccess(); // Gọi hàm tải lại danh sách
      }
    } catch (error) {
      toast.error("Lỗi khi thay đổi trạng thái hiển thị!");
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