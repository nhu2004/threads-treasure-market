import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdateProduct } from "./useUpdateProduct";

// TRONG FILE useUpdateProductForm.js

export const useUpdateProductForm = (id, productData, supplierList) => {
    const { loading, updateProduct } = useUpdateProduct(id);

    const formik = useFormik({
        initialValues: {
            name: productData.name || "",
            price: productData.price || "",
            originalPrice: productData.originalPrice || "",
            description: productData.description || "",
            // Chuyển mảng về chuỗi để hiển thị trong ô nhập text
            sizes: Array.isArray(productData.sizes) ? productData.sizes.join(', ') : (productData.sizes || ""),
            colors: Array.isArray(productData.colors) ? productData.colors.join(', ') : (productData.colors || ""),
            stockQuantity: productData.stockQuantity || 0,
            categoryId: productData.categoryId || "",
            supplierId: productData.supplierId || (supplierList[0]?.SupplierID || ""),
            image: productData.image || "", // Lấy link ảnh cũ đổ vào ô text
        },
        enableReinitialize: true,
        // ... (validationSchema giữ nguyên)
        onSubmit: async (values) => {
            await updateProduct(values);
        },
    });

    return { formik, loading };
}; 