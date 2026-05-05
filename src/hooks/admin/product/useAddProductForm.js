import { useFormik } from "formik";
import * as Yup from "yup";
import productApi from "../../../api/productApi";
import { useCreateProduct } from "./useCreateProduct";

export const useAddProductForm = (supplierList) => {
    const { loading, createProduct } = useCreateProduct();

    const formik = useFormik({
        initialValues: {
            productId: "",
            name: "",
            price: "",
            originalPrice: "",
            discount: 0,
            image: "",
            description: "",
            sizes: "", // Ví dụ: S, M, L, XL
            colors: "", // Ví dụ: Đen, Trắng, Xanh
            stockQuantity: 0,
            categoryId: "",
            supplierId: supplierList[0] ? supplierList[0].SupplierID : "",
        },
        validationSchema: Yup.object({
            productId: Yup.string().required("Mã sản phẩm là bắt buộc"),
            name: Yup.string().required("Tên sản phẩm là bắt buộc"),
            price: Yup.number().required("Giá bán là bắt buộc"),
            categoryId: Yup.string().required("Vui lòng chọn danh mục"),
            supplierId: Yup.string().required("Vui lòng chọn nhà cung cấp"),
            image: Yup.mixed().required("Vui lòng chọn hình ảnh sản phẩm"),
        }),
        onSubmit: async (values) => {
            await createProduct(values);
        },
    });

    return { formik, loading };
};