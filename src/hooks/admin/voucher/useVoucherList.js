import { useState, useEffect } from "react";
import voucherApi from "../../../api/voucherApi";

export const useVoucherList = () => {
  const [voucherData, setVoucherData] = useState({ vouchers: [], totalPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Truyền page và limit xuống API (tạm bỏ regex MongoDB)
        const res = await voucherApi.getAll({
          page: page,
          limit: 10,
        });
        
        setLoading(false);
        // Cập nhật đúng các object trả về từ Controller Backend của SQL
        setVoucherData({
          vouchers: res.vouchers || [],
          totalPage: res.totalPage || 1,
        });
      } catch (error) {
        setLoading(false);
        console.log("Lỗi tải danh sách voucher:", error);
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
        // Đổi _id thành VoucherID để xóa trên giao diện
        vouchers: newArray.filter((item) => item.VoucherID !== voucherId),
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