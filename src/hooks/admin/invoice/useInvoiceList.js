import { useState, useEffect } from "react";
import invoiceApi from "../../../api/invoicesAPI";

export const useInvoiceList = () => {
  const [invoiceData, setInvoiceData] = useState({ invoices: [], totalPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Tách biệt ô nhập liệu và từ khóa thực sự gửi đi để tránh lỗi gõ phím
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const { data, pagination } = await invoiceApi.getAll({ 
          search: searchString, 
          page: page 
      });
      setInvoiceData({ invoices: data, totalPage: pagination.totalPage });
      setLoading(false);
    };
    fetchInvoices();
  }, [page, searchString]);

  // Hàm được gọi khi bấm nút tìm kiếm
  const handleSearch = () => {
    setSearchString(searchInput);
    setPage(1);
  };

  return { 
    invoiceData, page, setPage, loading, 
    searchInput, setSearchInput, handleSearch 
  };
};