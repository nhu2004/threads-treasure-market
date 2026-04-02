import { useState, useEffect } from "react";
import productApi from "../../../api/productApi";

export const useProductDetail = (productId) => {
  const [bookData, setBookData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const { data } = await productApi.getById(productId);

        // Transform category and brand arrays for react-select
        const categorys = data.category.map((item) => ({
          value: item._id,
          label: item.name,
        }));

        const brands = data.brand.map((item) => ({
          value: item._id,
          label: item.name,
        }));

        setBookData({ ...data, category: categorys, brand: brands });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchBook();
  }, [productId]);

  return {
    bookData,
    loading,
  };
};






