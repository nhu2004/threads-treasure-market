// src/hooks/admin/product/useAddProductForm.js

import { useFormik } from "formik";
import * as Yup from "yup";
import productApi from "../../../api/productApi";
import { useCreateProduct } from "./useCreateProduct";

export const useAddProductForm = (supplierList = []) => {
    const { loading, createProduct } = useCreateProduct();

    const formik = useFormik({
        // QUAN TRỌNG:
        // Khi supplierList load xong, Formik sẽ tự cập nhật lại initialValues
        enableReinitialize: true,

        initialValues: {
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

            // FIX LỖI TRẮNG TRANG:
            // supplierList có thể chưa load xong ở lần render đầu tiên
            supplierId:
                Array.isArray(supplierList) && supplierList.length > 0
                    ? supplierList[0].SupplierID
                    : "",
        },

        validationSchema: Yup.object({
            name: Yup.string().required("Tên sản phẩm là bắt buộc"),

            price: Yup.number()
                .typeError("Giá bán phải là số")
                .required("Giá bán là bắt buộc"),

            // THÊM VALIDATE CHO SỐ LƯỢNG
            stockQuantity: Yup.number()
                .typeError("Số lượng phải là số")
                .required("Số lượng tồn kho là bắt buộc")
                .min(0, "Số lượng không hợp lệ"),

            categoryId: Yup.string().required("Vui lòng chọn danh mục"),
            supplierId: Yup.string().required("Vui lòng chọn nhà cung cấp"),

            image: Yup.string()
                .url("Vui lòng nhập đúng định dạng link (http/https)")
                .required("Vui lòng nhập link ảnh"),
        }),

        onSubmit: async (values) => {
            // Chỉ chuẩn hóa dữ liệu cần thiết, giữ nguyên logic cũ
            const payload = {
                ...values,
                stockQuantity: Number(values.stockQuantity) || 0,
            };

            await createProduct(payload);
        },
    });

    return { formik, loading };
};