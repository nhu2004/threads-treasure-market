import { useState, useEffect } from "react";
import supplierApi from "../../../api/supplierApi";

export const useSupplierList = () => {
  const [supplierData, setSupplierData] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Đã sửa: Truyền thẳng searchString thay vì dùng object $regex
        const { data, pagination } = await supplierApi.getAll({
          search: searchString,
          page: page,
        });
        setLoading(false);
        setSupplierData({ suppliers: data, totalPage: pagination?.totalPage || 1 });
      } catch (error) {
        setLoading(false);
        console.log("Lỗi tải dữ liệu nhà cung cấp:", error);
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
    supplierData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    refreshList,
  };
};