import { useState, useEffect } from "react";
import orderApi from "../../../api/orderApi";

// 1. Bổ sung tham số filters (mặc định là object rỗng để không bị lỗi nếu không truyền)
export const useOrderList = (filters = {}) => {
  const [orderData, setOrderData] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // CHỈ GỌI API 1 LẦN DUY NHẤT Ở ĐÂY
        const { data, pagination, stats } = await orderApi.getAll({
          page: page,
          limit: 10,
          ...filters 
        });
        
        setLoading(false);
        
        // Lưu toàn bộ dữ liệu (bao gồm cả stats) vào state
        setOrderData({ 
          orders: data, 
          totalPage: pagination.totalPage, 
          stats: stats 
        }); 
        
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page, filters.search, filters.status, filters.startDate, filters.endDate]); 

  const updateOrderInList = (orderId, updates) => {
    setOrderData((pre) => {
      const newArray = [...pre.orders];
      return {
        ...pre,
        orders: newArray.map((item) => {
          return item?._id === orderId ? { ...item, ...updates } : item;
        }),
      };
    });
  };

  return {
    orderData,
    page,
    setPage,
    loading,
    updateOrderInList,
  };
};