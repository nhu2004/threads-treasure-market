import { useState } from "react";
import categoryApi from "../../../api/categoryApi";

export const useAddCategory = (onSuccess) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await categoryApi.create(newCategory);
      setLoading(false);
      alert("Thêm danh mục thành công!");
      setShowModal(false);
      setNewCategory({ name: "", description: "" });
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      setLoading(false);
      alert("Thất bại! " + error);
      console.log(error);
    }
  };

  return {
    showModal,
    setShowModal,
    loading,
    newCategory,
    setNewCategory,
    handleSubmit,
  };
};






