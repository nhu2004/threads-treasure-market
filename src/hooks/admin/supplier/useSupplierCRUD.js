import { useState } from "react";
import supplierApi from "../../../api/supplierApi";

export const useSupplierCRUD = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  // --- Create ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [addsupplier, setAddsupplier] = useState({ name: "", description: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await supplierApi.create(addsupplier);
      setLoading(false);
      alert("Thêm nhà cung cấp thành công!"); 
      setShowAddModal(false);
      setAddsupplier({ name: "", description: "" }); 
      if (onSuccess) onSuccess();
    } catch (error) {
      setLoading(false);
      alert("Thất bại! " + error);
      console.log(error);
    }
  };

  // --- Update ---
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedsupplier, setSelectedsupplier] = useState({});

  const openUpdateModal = (supplier) => {
    setSelectedsupplier({
        ...supplier,
        description: supplier.Description || supplier.description || "",
        Description: undefined 
    });
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

  // --- Toggle Status (Thay thế chức năng Xóa) ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierDelete, setsupplierDelete] = useState({});

  const openDeleteModal = (supplier) => {
    // Map thêm IsActive để hiển thị đúng dữ liệu
    setsupplierDelete({ 
      _id: supplier._id || supplier.SupplierID, 
      name: supplier.name || supplier.Name,
      IsActive: supplier.IsActive 
    });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      // SỬA TẠI ĐÂY: Gọi thẳng hàm toggleStatus thay vì delete
      await supplierApi.toggleStatus(supplierDelete._id); 
      setShowDeleteModal(false);
      
      // SỬA TẠI ĐÂY: Thay đổi câu chữ thông báo
      alert("Cập nhật trạng thái hợp tác thành công!"); 
      
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Cập nhật trạng thái thất bại!");
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
    // Toggle Status (Sử dụng lại state cũ để không phải sửa UI component)
    showDeleteModal,
    setShowDeleteModal,
    supplierDelete,
    openDeleteModal,
    handleDelete,
  };
};