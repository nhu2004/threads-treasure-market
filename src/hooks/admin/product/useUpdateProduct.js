import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import productApi from "../../../api/productApi";

export const useUpdateBook = (productId) => {
  const [loading, setLoading] = useState(false);
  const [updateImage, setUpdateImage] = useState(false);
  const navigate = useNavigate();

  const updateBook = async (formValues) => {
    const {
      productId: productIdValue,
      name,
      brand,
      category,
      supplier,
      description,
      year,
      pages,
      size,
      price,
      discount,
      image,
    } = formValues;

    const categorys = category.map((item) => item.value);
    const brands = brand.map((item) => item.value);

    try {
      setLoading(true);

      let imageUrl = null;
      let publicId = null;

      // Upload new image if updateImage is true
      if (updateImage && image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "bookstore");

        const resCloudinary = await axios.post(
          "https://api.cloudinary.com/v1_1/bookstore2/image/upload",
          formData
        );

        const { secure_url, public_id } = resCloudinary.data;
        imageUrl = secure_url;
        publicId = public_id;
      }

      const updateData = {
        productId: productIdValue,
        name,
        year,
        pages,
        size,
        price,
        discount,
        description,
        brand: brands,
        category: categorys,
        supplier: supplier,
      };

      // Add image data if new image was uploaded
      if (imageUrl && publicId) {
        updateData.imageUrl = imageUrl;
        updateData.publicId = publicId;
      }

      await productApi.update(productId, updateData);

      setLoading(false);
      alert("Cập nhật sách thành công!");
      navigate(`/admin/book?refresh=${Date.now()}`);
    } catch (error) {
      setLoading(false);
      alert(
        "Thất bại: " + (error.response?.data?.error?.message || error.message)
      );
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  return {
    loading,
    updateImage,
    setUpdateImage,
    updateBook,
  };
};






