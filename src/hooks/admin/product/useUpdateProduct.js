import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import productApi from "../../../api/productApi";

export const useUpdateProduct = (productId) => {
  const [loading, setLoading] = useState(false);
  const [updateImage, setUpdateImage] = useState(false); // Flag kiểm tra có đổi ảnh không
  const navigate = useNavigate();

  const updateProduct = async (formValues) => {
    const {
      name, categoryId, supplierId, description,
      price, originalPrice, colors, sizes,
      stockQuantity, image
    } = formValues;

    try {
      setLoading(true);
      let imageUrl = null;

      // 1. Nếu Admin chọn ảnh mới, tiến hành upload lại lên Cloudinary
      if (updateImage && image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "clothingstore");

        const resCloudinary = await axios.post(
          "https://api.cloudinary.com/v1_1/clothingstore/image/upload",
          formData
        );
        imageUrl = resCloudinary.data.secure_url;
      }

      // 2. Chuẩn bị object dữ liệu (Sử dụng Key viết thường để khớp Backend)
      const updateData = {
        name,
        price,
        originalPrice,
        categoryId,
        supplierId,
        description,
        // Chuyển đổi chuỗi "S,M,L" thành mảng nếu cần
        colors: Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim()),
        sizes: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()),
        stockQuantity,
        // Chỉ gửi imageUrl nếu có thay đổi ảnh mới
        ...(imageUrl && { imageUrl }) 
      };

      await productApi.update(productId, updateData);
      
      setLoading(false);
      alert("Cập nhật sản phẩm thành công!");
      navigate(`/admin/products?refresh=${Date.now()}`);
    } catch (error) {
      setLoading(false);
      console.error("Lỗi cập nhật sản phẩm:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  return { loading, updateImage, setUpdateImage, updateProduct };
};