import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import productApi from "../../../api/productApi";

export const useCreateProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createProduct = async (formValues) => {
    const {
      productId,
      name,
      brand,
      category,
      supplier,
      description,
      sizes,
      colors,
      price,
      discount,
      image,
    } = formValues;

    const categories = category.map((item) => item.value);
    const brands = brand.map((item) => item.value);

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "clothingstore");
      setLoading(true);
      const resCloudinary = await axios.post(
        "https://api.cloudinary.com/v1_1/clothingstore/image/upload",
        formData
      );
      const { secure_url, public_id } = resCloudinary.data;
      if (secure_url && public_id) {
        await productApi.create({
          productId,
          name,
          price,
          discount,
          description,
          sizes,
          colors,
          brand: brands,
          category: categories,
          supplier: supplier,
          imageUrl: secure_url,
          publicId: public_id,
        });
        setLoading(false);
        alert("Thêm sản phẩm thành công!");
        navigate(`/admin/product?refresh=${Date.now()}`);
      }
    } catch (error) {
      setLoading(false);
      alert(
        "Thất bại: " + (error.response?.data?.error?.message || error.message)
      );
      console.error("Upload error:", error.response?.data || error.message);
    }
  };

  return {
    loading,
    createProduct,
  };
};






