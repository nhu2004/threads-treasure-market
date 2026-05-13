import { useState } from "react";
import { useNavigate } from "react-router-dom";
import productApi from "../../../api/productApi";

export const useUpdateProduct = (productId) => {
  const [loading, setLoading] = useState(false);
  const [updateImage, setUpdateImage] = useState("");
  const navigate = useNavigate();

  const updateProduct = async (formValues) => {
    // Đổi colors, sizes thành color, size
    const {
      name, price, originalPrice, categoryId, supplierId, 
      description, image, color, size, productGroupId, sku, stockQuantity 
    } = formValues;

    try {
      setLoading(true);

      // Gửi dữ liệu trực tiếp, biến 'image' lúc này là link URL nhập từ ô text
      await productApi.update(productId, {
        name,
        price,
        originalPrice,
        categoryId,
        supplierId,
        description,
        imageUrl: image, // Backend đang nhận imageUrl
        color,           // Gửi thẳng chuỗi
        size,            // Gửi thẳng chuỗi
        productGroupId,
        sku,
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