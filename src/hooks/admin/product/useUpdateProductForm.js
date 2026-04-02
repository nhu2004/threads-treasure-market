import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdateBook } from "./useUpdateBook";

/**
 * Custom hook để xử lý form cập nhật sách với validation
 * @param {String} productId - ID của sách cần update
 * @param {Object} bookData - Dữ liệu sách hiện tại
 * @param {Array} supplierList - Danh sách nhà xuất bản
 * @returns {Object} { formik, loading, updateImage, setUpdateImage }
 */
export const useUpdateBookForm = (productId, bookData, supplierList) => {
    const { loading, updateImage, setUpdateImage, updateBook } =
        useUpdateBook(productId);

    const formik = useFormik({
        initialValues: {
            productId: bookData.productId ? bookData.productId : "",
            name: bookData.name ? bookData.name : "",
            year: bookData.year ? bookData.year : "",
            pages: bookData.pages ? bookData.pages : "",
            size: bookData.size ? bookData.size : "",
            price: bookData.price ? bookData.price : "",
            discount: bookData.discount ? bookData.discount : "",
            description: bookData.description ? bookData.description : "",
            brand: bookData.brand ? bookData.brand : [],
            category: bookData?.category ? bookData.category : [],
            supplier: bookData?.supplier?._id ? bookData.supplier._id : "",
        },
        enableReinitialize: true,
        validateOnChange: false,
        validateOnBlur: true,
        validationSchema: Yup.object({
            productId: Yup.string().required("Không được bỏ trống trường này!"),
            name: Yup.string().required("Không được bỏ trống trường này!"),
            price: Yup.number()
                .typeError("Vui lòng nhập giá hợp lệ!")
                .required("Không được bỏ trống trường này!"),
            image:
                updateImage &&
                Yup.mixed()
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
            await updateBook(values);
        },
    });

    return { formik, loading, updateImage, setUpdateImage };
};






