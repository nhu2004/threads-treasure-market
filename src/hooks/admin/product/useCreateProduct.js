import { useState } from "react";
import { useNavigate } from "react-router-dom";
import productApi from "../../../api/productApi";

export const useCreateProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createProduct = async (formValues) => {
    // Đã thay đổi các tham số giải nén
    const {  
      name, price, originalPrice, description, 
      size, color, productGroupId, sku, stockQuantity,
      categoryId, supplierId, image, badge
    } = formValues;

    try {
      setLoading(true);
      
      await productApi.create({ 
        name,
        price,
        originalPrice: originalPrice || price,
        description,
        size,              // Gửi thẳng chuỗi
        color,             // Gửi thẳng chuỗi
        productGroupId,    // Gửi mã nhóm
        sku,               // Gửi SKU
        stockQuantity,
        categoryId,
        supplierId,
        imageUrl: image,  
        badge: badge || "MỚI",
        createdBy: 1 
      });

      setLoading(false);
      alert("Thêm sản phẩm thành công!");
      navigate(`/admin/product?refresh=${Date.now()}`);

    } catch (error) {
      setLoading(false);
      console.error("Lỗi khi tạo sản phẩm:", error);
      alert(error.message || "Đăng sản phẩm thất bại. Vui lòng kiểm tra lại!");
    }
  };

  return { loading, createProduct };
};