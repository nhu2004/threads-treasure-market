import { useFormik } from "formik";
import * as Yup from "yup";
import productApi from "../../../api/productApi";
import { useCreateProduct } from "./useCreateProduct";

/**
 * Custom hook để xử lý form thêm sản phẩm mới với validation
 * @param {Array} supplierList - Danh sách nhà cung cấp
 * @returns {Object} { formik, loading }
 */
export const useAddProductForm = (supplierList) => {
    const { loading, createProduct } = useCreateProduct();

    // Helper function để check productId đã tồn tại chưa
    const checkProductIdExists = async (productId) => {
        try {
            const res = await productApi.getByProductId(productId);
            return res?.data?._id ? false : true; // false = đã tồn tại
        } catch (error) {
            console.log(error);
            return true; // cho phép nếu API lỗi
        }
    };

    const formik = useFormik({
        initialValues: {
            productId: "",
            name: "",
            price: "",
            discount: 0,
            image: "",
            description: "",
            sizes: [],
            colors: [],
            category: "",
            brand: "",
            supplier: supplierList[0] ? supplierList[0]._id : "",
        },
        enableReinitialize: true,
        validateOnChange: false,
        validateOnBlur: true,
        validationSchema: Yup.object({
            productId: Yup.string()
                .required("Không được bỏ trống trường này!")
                .test("is-unique", "Mã sản phẩm đã tồn tại!", checkProductIdExists),
            name: Yup.string().required("Không được bỏ trống trường này!"),
            price: Yup.number()
                .typeError("Vui lòng nhập giá hợp lệ!")
                .required("Không được bỏ trống trường này!"),
            image: Yup.mixed()
                .required("Không được bỏ trống trường này!")
                .test(
                    "FILE_SIZE",
                    "Kích thước file quá lớn!",
                    (value) => !value || (value && value.size < 1024 * 1024)
                )
                .test(
                    "FILE_FORMAT",
                    "File không đúng định dạng!",
                    (value) =>
                        !value ||
                        (value &&
                            ["image/png", "image/gif", "image/jpeg"].includes(value?.type))
                ),
        }),
        onSubmit: async (values) => {
            await createProduct(values);
        },
    });

    return { formik, loading };
};






