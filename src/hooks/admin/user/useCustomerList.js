// /src/hooks/admin/useCustomerList.js
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
        
        // Gọi API lấy toàn bộ user (theo cấu trúc SQL mới của bạn)
        const { data } = await userApi.getAll();
        
        // 1. Lọc ra danh sách Khách hàng (loại bỏ admin/staff)
        let filteredData = data.filter(user => user.role !== 'admin' && user.role !== 'staff');

        // 2. Xử lý logic Tìm kiếm (Search) ở Frontend
        if (searchString) {
          const lowerSearch = searchString.toLowerCase();
          filteredData = filteredData.filter(user => 
            (user.fullName && user.fullName.toLowerCase().includes(lowerSearch)) ||
            (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
            (user.phone && user.phone.toLowerCase().includes(lowerSearch)) // SQL Server dùng 'phone' thay vì 'phoneNumber'
          );
        }

        // 3. Xử lý logic Phân trang (Pagination) ở Frontend (10 item / trang)
        const limit = 10;
        const totalPage = Math.ceil(filteredData.length / limit) || 1;
        const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

        // Đẩy dữ liệu vào state để hiển thị ra Table
        setCustomerData({ 
          list: paginatedData, 
          totalPage: totalPage 
        });

      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [page, searchString]);

  const handleSearch = () => {
    setSearchString(searchInput);
    setPage(1); // Reset về trang 1 khi tìm kiếm mới
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