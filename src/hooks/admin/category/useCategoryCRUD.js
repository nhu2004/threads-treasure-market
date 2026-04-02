import { useState } from "react";
import categoryApi from "../../../api/categoryApi";

export const usecategoryCRUD = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  // Create
  const [showAddModal, setShowAddModal] = useState(false);
  const [addcategory, setAddcategory] = useState({ name: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await categoryApi.create(addcategory);
      setLoading(false);
      alert("Thêm thể loại thành công!");
      setShowAddModal(false);
      setAddcategory({ name: "" });
      if (onSuccess) onSuccess();
    } catch (error) {
      setLoading(false);
      alert("Thất bại! " + error);
      console.log(error);
    }
  };

  // Update
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedcategory, setSelectedcategory] = useState({});

  const openUpdateModal = (category) => {
    setSelectedcategory(category);
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await categoryApi.update(selectedcategory?._id, selectedcategory);
      setLoading(false);
      alert("Cập nhật thành công!");
      setShowUpdateModal(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      setLoading(false);
      alert("Thất bại! " + error);
      console.log(error);
    }
  };

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryDelete, setcategoryDelete] = useState({});

  const openDeleteModal = (category) => {
    setcategoryDelete({ _id: category._id, name: category.name });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await categoryApi.delete(categoryDelete._id);
      setShowDeleteModal(false);
      alert("Xóa thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Xóa thất bại!");
      setShowDeleteModal(false);
    }
  };

  return {
    loading,
    // Create
    showAddModal,
    setShowAddModal,
    addcategory,
    setAddcategory,
    handleCreate,
    // Update
    showUpdateModal,
    setShowUpdateModal,
    selectedcategory,
    setSelectedcategory,
    openUpdateModal,
    handleUpdate,
    // Delete
    showDeleteModal,
    setShowDeleteModal,
    categoryDelete,
    openDeleteModal,
    handleDelete,
  };
};








