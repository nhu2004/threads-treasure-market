import { useState } from "react";
import { useNavigate } from "react-router-dom";
import productApi from "../../../api/productApi";

export const useUpdateProduct = (productId) => {
  const [loading, setLoading] = useState(false);
  const [updateImage, setUpdateImage] = useState("");
  const navigate = useNavigate();

  const updateProduct = async (formValues) => {
    // Đã cập nhật tham số
    const {
      name, price, originalPrice, categoryId, supplierId, 
      description, image, size, color, productGroupId, sku, stockQuantity 
    } = formValues;

    try {
      setLoading(true);

      await productApi.update(productId, {
        name,
        price,
        originalPrice,
        categoryId,
        supplierId,
        description,
        imageUrl: image, 
        size,           // Truyền thẳng chuỗi
        color,          // Truyền thẳng chuỗi
        productGroupId, // Mã nhóm
        sku,            // SKU
        stockQuantity
      });
      
      setLoading(false);
      alert("Cập nhật sản phẩm thành công!");
      navigate(`/admin/product?refresh=${Date.now()}`);
    } catch (error) {
      setLoading(false);
      console.error("Lỗi cập nhật sản phẩm:", error);
      alert(error.message || "Cập nhật thất bại!");
    }
  };

  return { loading, updateProduct, updateImage, setUpdateImage };
};