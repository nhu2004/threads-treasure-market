import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdateProduct } from "./useUpdateProduct";

export const useUpdateProductForm = (id, productData, supplierList) => {
    const { loading, updateImage, setUpdateImage, updateProduct } = useUpdateProduct(id);

    const formik = useFormik({
        initialValues: {
            productId: id,
            name: productData.Name || "",
            price: productData.Price || "",
            originalPrice: productData.OriginalPrice || "",
            discount: productData.Discount || 0,
            description: productData.Description || "",
            sizes: productData.Sizes || "",
            colors: productData.Colors || "",
            stockQuantity: productData.StockQuantity || 0,
            categoryId: productData.CategoryID || "",
            supplierId: productData.SupplierID || "",
            image: "",
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