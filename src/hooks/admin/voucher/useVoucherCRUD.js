import { useState } from "react";
import voucherApi from "../../../api/voucherApi";
import date from "../../../helper/date"; // Vẫn giữ helper của bạn

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

  // --- CREATE ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [addVoucher, setAddVoucher] = useState(initialVoucherState);

  const validateVoucher = (voucher) => {
    const { by, value, start, end } = voucher;
    if (!start || !end || new Date(start) > new Date(end)) {
      alert("Ngày kết thúc phải lớn hơn ngày bắt đầu!");
      return false;
    }
    if (by === "percent") {
      if (value <= 0 || value >= 100) {
        alert("Mức giảm phần trăm không hợp lệ!");
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
      setLoading(true);

      // Mapping đúng với params Backend Controller đang đợi
      await voucherApi.create({
        code: addVoucher.code,
        value: addVoucher.value,
        byType: addVoucher.by,
        name: addVoucher.name,
        startDate: addVoucher.start,
        expiryDate: addVoucher.end,
        minimumAmount: addVoucher.minimum,
        voucherType: "General", // Giá trị mặc định chống lỗi
        minOrderValue: addVoucher.minimum,
        maxDiscountAmount: addVoucher.by === 'percent' ? 100000 : addVoucher.value,
        description: `Giảm giá ưu đãi ${addVoucher.code}`
      });
      
      alert("Thêm thành công!");
      setShowAddModal(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error);
      alert("Thêm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState({});

  const openUpdateModal = (voucher) => {
    const formattedVoucher = {
      ...voucher,
      // SQL trả về StartDate/ExpiryDate, ta map sang dạng chuỗi YYYY-MM-DD cho thẻ <input type="date">
      start: voucher.StartDate ? new Date(voucher.StartDate).toISOString().split('T')[0] : "",
      end: voucher.ExpiryDate ? new Date(voucher.ExpiryDate).toISOString().split('T')[0] : "",
    };
    setSelectedVoucher(formattedVoucher);
    setShowUpdateModal(true);
  };

  const setShowAddModalAndReset = (show) => {
    setShowAddModal(show);
    if (show) setAddVoucher(initialVoucherState);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!validateVoucher(selectedVoucher)) return;
      setLoading(true);

      // Chú ý: Backend hiện tại chưa viết API Update. 
      // Sau khi bạn viết xong, hãy mở comment dòng dưới và đổi _id thành VoucherID
      await voucherApi.update(selectedVoucher.VoucherID, {
      Name: selectedVoucher.Name,
      start: new Date(selectedVoucher.start),
      end: new Date(selectedVoucher.end),
  });
  alert("Cập nhật mã giảm giá thành công!");

      setShowUpdateModal(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error);
      alert("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voucherDelete, setVoucherDelete] = useState({});

  const openDeleteModal = (voucher) => {
    setVoucherDelete(voucher);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      // Chú ý: Backend hiện tại chưa viết API Delete. 
      // Sau khi bạn viết xong, hãy mở comment dòng dưới
      await voucherApi.delete(voucherDelete.VoucherID);
      alert("Xóa mã giảm giá thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Xóa thất bại!");
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    showAddModal, setShowAddModal: setShowAddModalAndReset,
    addVoucher, setAddVoucher, handleCreate,
    showUpdateModal, setShowUpdateModal,
    selectedVoucher, setSelectedVoucher, openUpdateModal, handleUpdate,
    showDeleteModal, setShowDeleteModal,
    voucherDelete, openDeleteModal, handleDelete,
  };
};