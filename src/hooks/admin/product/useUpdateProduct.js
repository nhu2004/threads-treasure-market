// TRONG FILE useUpdateProduct.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import productApi from "../../../api/productApi";

export const useUpdateProduct = (productId) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateProduct = async (formValues) => {
    const {
      name, price, originalPrice, categoryId, supplierId, 
      description, image, colors, sizes, stockQuantity 
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
        imageUrl: image, // Link ảnh
        // Xử lý chuỗi thành mảng nếu cần trước khi gửi
        colors: typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(c => c !== "") : colors,
        sizes: typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(s => s !== "") : sizes,
        stockQuantity
      });
      
      setLoading(false);
      alert("Cập nhật sản phẩm thành công!");
      navigate(`/admin/products?refresh=${Date.now()}`);
    } catch (error) {
      setLoading(false);
      console.error("Lỗi cập nhật sản phẩm:", error);
      alert(error.message || "Cập nhật thất bại!");
    }
  };

  return { loading, updateProduct };
};