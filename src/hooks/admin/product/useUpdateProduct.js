// useUpdateProduct.js
export const useUpdateProduct = (productId) => {
  const [loading, setLoading] = useState(false);
  const [updateImage, setUpdateImage] = useState(false);
  const navigate = useNavigate();

  const updateProduct = async (formValues) => {
    const {
      name,
      categoryId,
      supplierId,
      description,
      price,
      originalPrice,
      colors,
      sizes,
      stockQuantity,
      image,
    } = formValues;

    try {
      setLoading(true);
      let imageUrl = null;

      // Upload ảnh mới lên Cloudinary (Dùng chung preset clothingstore)
      if (updateImage && image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "clothingstore"); // Đổi từ bookstore thành clothingstore

        const resCloudinary = await axios.post(
          "https://api.cloudinary.com/v1_1/clothingstore/image/upload",
          formData
        );
        imageUrl = resCloudinary.data.secure_url;
      }

      const updateData = {
        name,
        price,
        originalPrice,
        categoryId,
        supplierId,
        description,
        colors: Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim()),
        sizes: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()),
        stockQuantity,
        imageUrl: imageUrl || undefined,
      };

      await productApi.update(productId, updateData);
      setLoading(false);
      alert("Cập nhật sản phẩm thành công!");
      navigate(`/admin/product?refresh=${Date.now()}`); // Chuyển hướng đúng trang product[cite: 20]
    } catch (error) {
      setLoading(false);
      alert("Thất bại: " + error.message);
    }
  };

  return { loading, updateImage, setUpdateImage, updateProduct };
};