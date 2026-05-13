import { useState } from "react";
import categoryApi from "../../../api/categoryApi";

export const useCategoryCRUD = (onSuccess) => {
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
      setLoading(true);
      const res = await categoryApi.delete(categoryDelete._id);
      
      // KIỂM TRA PHẢN HỒI TỪ BACKEND
      if (res.success || res.message === 'Xóa thành công!') {
          // Chỉ hiện thông báo thành công khi backend thực sự xóa được
          alert(res.message); 
          // Hoặc dùng toast.success(res.message) nếu bạn đang dùng thư viện toast
          
          setShowDeleteModal(false);
          refreshList(); // Gọi lại danh sách
      } else {
          // Nếu backend trả về báo lỗi (ví dụ: có sản phẩm bên trong)
          alert(res.message); 
          // Hoặc dùng toast.error(res.message)
      }
    } catch (error) {
      // Bắt lỗi nếu API trả về status 400 hoặc 500
      // Thông thường axios hoặc fetch sẽ ném lỗi vào đây nếu status không phải 2xx
      const errorMessage = error.response?.data?.message || "Xóa thất bại! Do danh mục này đang chứa sản phẩm.";
      alert(errorMessage);
    } finally {
      setLoading(false);
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








