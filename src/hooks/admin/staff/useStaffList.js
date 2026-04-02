import { useState, useEffect } from "react";
import userApi from "../../../api/userApi";

export const useStaffList = () => {
  const [staffData, setStaffData] = useState({ list: [], totalPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryObj = { role: 2 };
        if (searchString && searchString.trim().length > 0) {
          const regex = { $regex: searchString.trim(), $options: "i" };
          queryObj.$or = [
            { fullName: regex },
            { email: regex },
            { phoneNumber: regex },
          ];
        }
        const { data, pagination } = await userApi.getAll({
          page,
          limit: 10,
          query: queryObj,
        });
        setLoading(false);
        setStaffData({ list: data, totalPage: pagination.totalPage });
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
    staffData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    refreshList,
  };
};






