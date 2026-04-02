import { useState } from "react";
import userApi from "../../../api/userApi";

export const useStaffCRUD = (refreshList) => {
  const [loading, setLoading] = useState(false);

  // Create
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStaff, setAddStaff] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userApi.createStaff(addStaff);
      setLoading(false);
      alert(
        "Tạo nhân viên thành công! Mật khẩu đã được gửi về email của nhân viên."
      );
      setShowAddModal(false);
      setAddStaff({
        email: "",
        fullName: "",
        phoneNumber: "",
      });
      refreshList();
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Update
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState({});

  const openUpdateModal = (staff) => {
    setSelectedStaff({
      _id: staff._id,
      fullName: staff.fullName,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
    });
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userApi.updateProfile(selectedStaff._id, {
        fullName: selectedStaff.fullName,
        phoneNumber: selectedStaff.phoneNumber,
      });
      setLoading(false);
      alert("Cập nhật thông tin nhân viên thành công!");
      setShowUpdateModal(false);
      refreshList();
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Update Status
  const handleUpdateStatus = async (staff) => {
    const newStatus = staff.status === 1 ? 0 : 1;
    try {
      await userApi.updateStatus(staff._id, { status: newStatus });
      alert("Cập nhật trạng thái thành công!");
      refreshList();
    } catch (error) {
      console.log(error);
    }
  };

  // Reset Password
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [staffToReset, setStaffToReset] = useState({});

  const openResetPasswordModal = (staff) => {
    setStaffToReset(staff);
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await userApi.resetStaffPassword(staffToReset._id);
      setLoading(false);
      alert(
        "Reset mật khẩu thành công! Mật khẩu mới đã được gửi về email của nhân viên."
      );
      setShowResetPasswordModal(false);
      refreshList();
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState({});

  const openDeleteModal = (staff) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await userApi.deleteById(staffToDelete._id);
      setLoading(false);
      alert("Xóa nhân viên thành công!");
      setShowDeleteModal(false);
      refreshList();
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return {
    loading,
    // Create
    showAddModal,
    setShowAddModal,
    addStaff,
    setAddStaff,
    handleCreate,
    // Update
    showUpdateModal,
    setShowUpdateModal,
    selectedStaff,
    setSelectedStaff,
    openUpdateModal,
    handleUpdate,
    // Update Status
    handleUpdateStatus,
    // Reset Password
    showResetPasswordModal,
    setShowResetPasswordModal,
    staffToReset,
    openResetPasswordModal,
    handleResetPassword,
    // Delete
    showDeleteModal,
    setShowDeleteModal,
    staffToDelete,
    openDeleteModal,
    handleDelete,
  };
};






