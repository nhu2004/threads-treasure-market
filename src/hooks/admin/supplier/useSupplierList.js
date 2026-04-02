import { useState, useEffect } from "react";
import supplierApi from "../../../api/supplierApi";

export const usesupplierList = () => {
  const [supplierData, setsupplierData] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = {
          name: { $regex: searchString, $options: "i" },
        };
        const { data, pagination } = await supplierApi.getAll({
          query,
          page: page,
          limit: 10,
          sortByDate: "desc",
        });
        setLoading(false);
        setsupplierData({ suppliers: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
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
    setTimeout(() => setSearchString(searchString), 100);
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








