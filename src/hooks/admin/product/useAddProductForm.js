import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateProduct } from "./useCreateProduct";

export const useAddProductForm = (supplierList) => {
    const { loading, createProduct } = useCreateProduct();

    const formik = useFormik({
        initialValues: { 
            name: "",
            price: "",
            originalPrice: "",
            discount: 0,
            image: "",
            description: "",
            size: "",           // Đổi thành số ít
            color: "",          // Đổi thành số ít
            productGroupId: "", // Thêm mã nhóm
            sku: "",            // Thêm mã SKU
            stockQuantity: 0,
            categoryId: "",
            supplierId: supplierList[0] ? supplierList[0].SupplierID : "",
        },
        validationSchema: Yup.object({ 
            name: Yup.string().required("Tên sản phẩm là bắt buộc"),
            price: Yup.number().required("Giá bán là bắt buộc"),
            categoryId: Yup.string().required("Vui lòng chọn danh mục"),
            supplierId: Yup.string().required("Vui lòng chọn nhà cung cấp"),
            image: Yup.string().url("Vui lòng nhập đúng định dạng link (http/https)").required("Vui lòng nhập link ảnh"),
        }), 
        onSubmit: async (values) => {
            await createProduct(values);
        },
    });

    return { formik, loading };
};