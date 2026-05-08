import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdateProduct } from "./useUpdateProduct";

export const useUpdateProductForm = (id, productData, supplierList) => {
    const { loading, updateImage, setUpdateImage, updateProduct } = useUpdateProduct(id);

    const formik = useFormik({
        initialValues: {
            productId: id,
            name: productData?.name || "",
            price: productData?.price || "",
            originalPrice: productData?.originalPrice || "",
            discount: productData?.discount || 0,
            description: productData?.description || "",
            sizes: Array.isArray(productData?.sizes) ? productData.sizes.join(', ') : (productData?.sizes || ""),
            colors: Array.isArray(productData?.colors) ? productData.colors.join(', ') : (productData?.colors || ""),
            stockQuantity: productData?.stockQuantity || 0,
            categoryId: productData?.categoryId || "",
            supplierId: productData?.supplierId || (supplierList?.[0]?.SupplierID || ""),
            image: productData?.image || "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required("Tên không được để trống"),
            price: Yup.number().required("Giá không được để trống"),
            categoryId: Yup.string().required("Danh mục không được để trống"),
        }),
        onSubmit: async (values) => {
            await updateProduct(values);
        },
    });

    return { formik, loading, updateImage, setUpdateImage };
};