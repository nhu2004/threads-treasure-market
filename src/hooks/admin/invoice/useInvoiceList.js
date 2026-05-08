// src/hooks/admin/invoice/useInvoiceDetail.js 
import { useState, useEffect } from "react";
import invoiceApi from "../../../api/invoicesApi";

export const useInvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    const data = await invoiceApi.getAll({ search });
    setInvoices(data);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, [search]);

  return { invoices, loading, search, setSearch, refresh: fetchInvoices };
};