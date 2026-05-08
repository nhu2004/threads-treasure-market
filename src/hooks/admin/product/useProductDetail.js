import { useState, useEffect } from "react";
import productApi from "../../../api/productApi";

export const useProductDetail = (productId) => {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productApi.getById(productId);
        
        // API trả về { product: {...} } hoặc chỉ {...}
        const data = response.product || response;
        setProductData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Lỗi tải chi tiết sản phẩm:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  return {
    productData,
    loading,
  };
};






