import { useState } from "react";
import voucherApi from "../../../api/voucherApi";
import date from "../../../helper/date";

const initialVoucherState = {
  code: "",
  name: "",
  by: "percent",
  value: 0,
  start: "",
  end: "",
  minimum: 0,
};

export const useVoucherCRUD = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  // Create
  const [showAddModal, setShowAddModal] = useState(false);
  const [addVoucher, setAddVoucher] = useState(initialVoucherState);

  const validateVoucher = (voucher) => {
    const { by, value, start, end } = voucher;

    // Validate dates
    if (!start || !end || new Date(start) > new Date(end)) {
      alert("Ngày kết thúc phải lớn hơn ngày bắt đầu!");
      return false;
    }

    // Validate discount value
    if (by === "percent") {
      if (value <= 0 || value >= 100) {
        alert("Mức giảm theo phần trăm không hợp lệ!");
        return false;
      }
    } else {
      if (value <= 0) {
        alert("Mức giảm phải lớn hơn 0!");
        return false;
      }
    }

    return true;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!validateVoucher(addVoucher)) return;

      await voucherApi.createVoucher({
        ...addVoucher,
        start: new Date(addVoucher.start),
        end: new Date(addVoucher.end),
      });
      alert("Thêm thành công!");
      setShowAddModal(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error);
      alert("Thêm thất bại!");
    }
  };

  // Update
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState({});

  const openUpdateModal = (voucher) => {
    const formattedVoucher = {
      ...voucher,
      start: date.toDateInputValue(voucher.start),
      end: date.toDateInputValue(voucher.end),
    };
    setSelectedVoucher(formattedVoucher);
    setShowUpdateModal(true);
  };

  const setShowAddModalAndReset = (show) => {
    setShowAddModal(show);
    if (show) {
      setAddVoucher(initialVoucherState);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!validateVoucher(selectedVoucher)) return;

      await voucherApi.updateVoucher(selectedVoucher._id, {
        ...selectedVoucher,
        start: new Date(selectedVoucher.start),
        end: new Date(selectedVoucher.end),
      });
      alert("Thành công!");
      setShowUpdateModal(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error);
      alert("Cập nhật thất bại!");
    }
  };

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voucherDelete, setVoucherDelete] = useState({});

  const openDeleteModal = (voucher) => {
    setVoucherDelete(voucher);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await voucherApi.deleteVoucher(voucherDelete._id);
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
    setShowAddModal: setShowAddModalAndReset, // Replace with new function
    addVoucher,
    setAddVoucher,
    handleCreate,
    // Update
    showUpdateModal,
    setShowUpdateModal,
    selectedVoucher,
    setSelectedVoucher,
    openUpdateModal,
    handleUpdate,
    // Delete
    showDeleteModal,
    setShowDeleteModal,
    voucherDelete,
    openDeleteModal,
    handleDelete,
  };
};






