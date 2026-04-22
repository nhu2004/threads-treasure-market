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
        // ĐÃ SỬA: Truyền trực tiếp chữ tìm kiếm thay vì dùng query của MongoDB
        const res = await productApi.getAll({ search: searchString, page: page, limit: 10 });
        
        const productsList = res.data || res.products || [];
        const totalPage = res.pagination?.totalPage || res.totalPage || 1;

        setProductData({ products: productsList, totalPage: totalPage });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
      }
    };
    fetchData();
  }, [page, searchString, location.search]);

  const handleSearch = () => {
    setSearchString(searchInput);
    setPage(1);
  };

  const removeProduct = (productId) => {
    setProductData((preState) => {
      const newArray = [...(preState.products || [])];
      return {
        ...preState,
        // Dùng đúng ProductID của SQL Server hoặc _id của MongoDB
        products: newArray.filter((item) => item.ProductID !== productId && item._id !== productId && item.id !== productId),
      };
    });
  };

  return {
    productData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    removeProduct,
  };
};