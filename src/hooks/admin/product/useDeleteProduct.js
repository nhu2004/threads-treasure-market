import { useState } from "react";
import { toast } from "react-toastify";
import productApi from "../../../api/productApi";

export const useDeleteBook = (onSuccess) => {
  const [showModal, setShowModal] = useState(false);
  const [bookDelete, setBookDelete] = useState({});

  const openDeleteModal = (book) => {
    setBookDelete(book);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const { data: orders } = await productApi.checkIsOrdered(bookDelete._id);
      if (orders.length > 0) {
        toast.error("Sản phẩm đã được mua, không thể xóa!", {
          autoClose: 2000,
        });
        return;
      }
      await productApi.delete(bookDelete._id);
      toast.success("Xóa thành công!", { autoClose: 2000 });
      setShowModal(false);
      if (onSuccess) {
        onSuccess(bookDelete._id);
      }
    } catch (error) {
      toast.error("Xóa thất bại!");
      setShowModal(false);
    }
  };

  return {
    showModal,
    setShowModal,
    bookDelete,
    openDeleteModal,
    handleDelete,
  };
};






