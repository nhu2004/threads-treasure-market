import { useState } from "react";
import supplierApi from "../../../api/supplierApi";

export const usesupplierCRUD = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  // Create
  const [showAddModal, setShowAddModal] = useState(false);
  // Đã sửa: Bổ sung thêm description vào state mặc định
  const [addsupplier, setAddsupplier] = useState({ name: "", description: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await supplierApi.create(addsupplier);
      setLoading(false);
      alert("Thêm nhà cung cấp thành công!"); // Đã sửa tên thông báo
      setShowAddModal(false);
      setAddsupplier({ name: "", description: "" }); // Reset form đầy đủ
      if (onSuccess) onSuccess();
    } catch (error) {
      setLoading(false);
      alert("Thất bại! " + error);
      console.log(error);
    }
  };

  // Update
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedsupplier, setSelectedsupplier] = useState({});

  const openUpdateModal = (supplier) => {
    setSelectedsupplier(supplier);
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await supplierApi.update(selectedsupplier?._id, selectedsupplier);
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
  const [supplierDelete, setsupplierDelete] = useState({});

  const openDeleteModal = (supplier) => {
    setsupplierDelete({ _id: supplier._id, name: supplier.name });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await supplierApi.delete(supplierDelete._id);
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
    addsupplier,
    setAddsupplier,
    handleCreate,
    // Update
    showUpdateModal,
    setShowUpdateModal,
    selectedsupplier,
    setSelectedsupplier,
    openUpdateModal,
    handleUpdate,
    // Delete
    showDeleteModal,
    setShowDeleteModal,
    supplierDelete,
    openDeleteModal,
    handleDelete,
  };
};