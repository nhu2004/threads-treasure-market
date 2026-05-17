import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import productApi from "../../../api/productApi";

export const useProductList = () => {
  const [productData, setProductData] = useState({ products: [], totalPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");
  const location = useLocation();

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      // ĐỔI TỪ 10 THÀNH 7
      const res = await productApi.getAll({ 
        search: searchString, 
        page: page, 
        limit: 7, 
        admin: true 
      });
      
      const productsList = res.products || [];
      const totalPage = res.totalPage || 1;

      setProductData({ products: productsList, totalPage: totalPage });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };
  fetchData();
}, [page, searchString, location.search]);

  const handleSearch = () => {
    setSearchString(searchInput);
    setPage(1);
  };

  // ĐÃ SỬA: Đổi trạng thái Ẩn/Hiện trong React State thay vì xóa đi
  const removeProduct = (productId) => {
    setProductData((preState) => {
      const newArray = [...(preState.products || [])];
      return {
        ...preState,
        products: newArray.map((item) => {
            if (item.id === productId || item.ProductID === productId) {
                // Đảo ngược trạng thái isActive
                return { ...item, isActive: item.isActive === false ? true : false };
            }
            return item;
        }),
      };
    });
  };

  return { productData, page, setPage, loading, searchInput, setSearchInput, handleSearch, removeProduct };
};