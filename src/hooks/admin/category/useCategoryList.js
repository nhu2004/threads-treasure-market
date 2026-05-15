import { useState, useEffect } from "react";
import categoryApi from "../../../api/categoryApi";

export const useCategoryList = () => {
  // 1. KHỞI TẠO STATE AN TOÀN: Mặc định phải có categorys là mảng rỗng []
  const [categoryData, setCategoryData] = useState({ categorys: [], totalPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 2. Gọi API với các tham số tìm kiếm, phân trang
        const response = await categoryApi.getAll({
          search: searchString,
          page: page,
          limit: 10,
        });

        // 3. Cập nhật state (Lấy response.data vì categoryApi.js trả về { data, pagination })
        setCategoryData({ 
            categorys: response.data || [], 
            totalPage: response.pagination?.totalPage || 1 
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        // Fallback an toàn nếu lỗi mạng
        setCategoryData({ categorys: [], totalPage: 1 }); 
        setLoading(false);
      }
    };
    fetchData();
  }, [page, searchString]);

  const handleSearch = () => {
    setSearchString(searchInput);
    setPage(1);
  };

  const refreshList = () => {
    setSearchString(searchString + " ");
    setTimeout(() => setSearchString(searchString.trim()), 100);
  };

  return {
    categoryData, page, setPage, loading, searchInput, setSearchInput, handleSearch, refreshList,
  };
};