import { useState } from "react";
import { useNavigate } from "react-router-dom";
import productApi from "../../../api/productApi";

export const useCreateProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createProduct = async (formValues) => {
    const {  name, price, originalPrice,
      description, sizes, colors, stockQuantity,
      categoryId, supplierId, image, badge
    } = formValues;

    try {
      setLoading(true);
      
      // KHÔNG CÒN AXIOS / CLOUDINARY NỮA
      // Gửi trực tiếp link ảnh (biến image) về Backend
      await productApi.create({ 
        name: name,
        price: price,
        originalPrice: originalPrice || price,
        description: description,
        // Chuyển đổi chuỗi thành mảng để Backend dễ xử lý
        sizes: typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(s => s !== "") : sizes,
        colors: typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(c => c !== "") : colors,
        stockQuantity: stockQuantity,
        categoryId: categoryId,
        supplierId: supplierId,
        imageUrl: image,  
        badge: badge || "MỚI",
        createdBy: 1 
      });

      setLoading(false);
      alert("Thêm sản phẩm thành công!");
      navigate(`/admin/products?refresh=${Date.now()}`);

    } catch (error) {
      setLoading(false);
      console.error("Lỗi khi tạo sản phẩm:", error);
      // Hiển thị lỗi từ Backend (ví dụ: lỗi trùng mã sản phẩm)
      alert(error.message || "Đăng sản phẩm thất bại. Vui lòng kiểm tra lại!");
    }
  };

  return { loading, createProduct };
};