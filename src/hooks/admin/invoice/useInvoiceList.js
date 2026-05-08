// Client/src/hooks/admin/invoice/useInvoiceList.js
import { useState, useEffect } from "react";
import invoiceApi from "../../../api/invoicesAPI";

// Bên trong file useInvoiceList.js
export const useInvoiceList = ({ search, status, startDate, endDate }) => {
  const [invoiceData, setInvoiceData] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Gọi API kèm tham số
      const res = await invoiceApi.getAll({ page, search, status, startDate, endDate });
      setInvoiceData(res);
      setLoading(false);
    };
    
    fetchData();
  }, [page, search, status, startDate, endDate]); // Chạy lại khi page hoặc filter thay đổi

  return { invoiceData, page, setPage, loading };
};