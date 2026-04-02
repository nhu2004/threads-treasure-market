import { useState, useEffect } from "react";
import categoryApi from "../../../api/categoryApi";

export const usecategoryList = () => {
  const [categoryData, setcategoryData] = useState({});
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
        const { data, pagination } = await categoryApi.getAll({
          query,
          page: page,
          limit: 10,
          sortByDate: "desc",
        });
        setLoading(false);
        setcategoryData({ categorys: data, totalPage: pagination.totalPage });
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
    categoryData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    refreshList,
  };
};








