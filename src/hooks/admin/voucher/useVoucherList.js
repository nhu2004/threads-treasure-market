import { useState, useEffect } from "react";
import voucherApi from "../../../api/voucherApi";

export const useVoucherList = () => {
  const [voucherData, setVoucherData] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = searchString
          ? {
              code: { $regex: searchString, $options: "i" },
            }
          : {};
        const res = await voucherApi.getAll({
          query,
          page: page,
          limit: 10,
          sortByDate: "desc",
        });
        setLoading(false);
        setVoucherData({
          vouchers: res.data,
          totalPage: res.pagination.totalPage,
        });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page, searchString, refreshTrigger]);

  const handleSearch = () => {
    setSearchString(searchInput);
    setPage(1);
  };

  const refreshList = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const removeVoucher = (voucherId) => {
    setVoucherData((preState) => {
      const newArray = [...preState.vouchers];
      return {
        ...preState,
        vouchers: newArray.filter((item) => item._id !== voucherId),
      };
    });
  };

  return {
    voucherData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    refreshList,
    removeVoucher,
  };
};






