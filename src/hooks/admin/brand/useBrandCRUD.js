import { useState } from "react";
import brandApi from "../../../api/brandApi";

export const usebrandCRUD = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  // Create
  const [showAddModal, setShowAddModal] = useState(false);
  const [addbrand, setAddbrand] = useState({ name: "", year: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await brandApi.create(addbrand);
      setLoading(false);
      alert("Thêm tác giả thành công!");
      setShowAddModal(false);
      setAddbrand({ name: "", year: "" });
      if (onSuccess) onSuccess();
    } catch (error) {
      setLoading(false);
      alert("Thất bại! " + error);
      console.log(error);
    }
  };

  // Update
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedbrand, setSelectedbrand] = useState({});

  const openUpdateModal = (brand) => {
    setSelectedbrand(brand);
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await brandApi.update(selectedbrand?._id, selectedbrand);
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
  const [brandDelete, setbrandDelete] = useState({});

  const openDeleteModal = (brand) => {
    setbrandDelete({ _id: brand._id, name: brand.name });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await brandApi.delete(brandDelete._id);
      setShowDeleteModal(false);
      alert("Xóa thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      // Lỗi đã được hiển thị qua toast trong axiosClient
      // Chỉ cần đóng modal và không cần hiển thị alert nữa
      setShowDeleteModal(false);
      console.log("Delete error:", error);
    }
  };

  return {
    loading,
    // Create
    showAddModal,
    setShowAddModal,
    addbrand,
    setAddbrand,
    handleCreate,
    // Update
    showUpdateModal,
    setShowUpdateModal,
    selectedbrand,
    setSelectedbrand,
    openUpdateModal,
    handleUpdate,
    // Delete
    showDeleteModal,
    setShowDeleteModal,
    brandDelete,
    openDeleteModal,
    handleDelete,
  };
};








