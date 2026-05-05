import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import productApi from "../../../api/productApi";

export const useCreateProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createProduct = async (formValues) => {
    const {
      productId, name, price, originalPrice, discount,
      description, sizes, colors, stockQuantity,
      categoryId, supplierId, image
    } = formValues;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "clothingstore"); //[cite: 23]

      // Upload ảnh lên Cloudinary
      const resCloudinary = await axios.post(
        "https://api.cloudinary.com/v1_1/clothingstore/image/upload",
        formData
      );

      const { secure_url, public_id } = resCloudinary.data;

      if (secure_url) {
        await productApi.create({
          ProductID: productId,
          Name: name,
          Price: price,
          OriginalPrice: originalPrice || price,
          Discount: discount,
          Description: description,
          Sizes: Array.isArray(sizes) ? sizes.join(',') : sizes,
          Colors: JSON.stringify(colors),
          StockQuantity: stockQuantity,
          CategoryID: categoryId,
          SupplierID: supplierId,
          ImageUrl: secure_url,
          PublicId: public_id,
        });

        setLoading(false);
        alert("Thêm sản phẩm thời trang thành công!");
        navigate(`/admin/product?refresh=${Date.now()}`);
      }
    } catch (error) {
      setLoading(false);
      alert("Thất bại: " + (error.response?.data?.message || error.message));
    }
  };

  return { loading, createProduct };
};