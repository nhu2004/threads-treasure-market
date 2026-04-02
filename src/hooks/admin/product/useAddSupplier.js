import { useState } from "react";
import supplierApi from "../../../api/supplierApi";

export const useAddSupplier = (onSuccess) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await supplierApi.create(newSupplier);
      setLoading(false);
      alert("Thêm nhà cung cấp thành công!");
      setShowModal(false);
      setNewSupplier({ name: "", description: "" });
      if (onSuccess) {
        await onSuccess(res.data._id);
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
    newSupplier,
    setNewSupplier,
    handleSubmit,
  };
};






