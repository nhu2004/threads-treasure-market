import { useState, useEffect } from "react";
import userApi from "../../../api/userApi";

export const useCustomerList = () => {
  const [customerData, setCustomerData] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = {
          $or: [
            { fullName: { $regex: searchString, $options: "i" } },
            { email: { $regex: searchString, $options: "i" } },
            { phoneNumber: { $regex: searchString, $options: "i" } },
          ],
          role: { $in: [0, 1] },
        };
        const { data, pagination } = await userApi.getAll({
          page,
          limit: 10,
          query,
        });
        setLoading(false);
        setCustomerData({ list: data, totalPage: pagination.totalPage });
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

  return {
    customerData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
  };
};






