import { useState, useEffect } from "react";
import orderApi from "../../../api/orderApi";

export const useOrderList = () => {
  const [orderData, setOrderData] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await orderApi.getAll({
          page: page,
          limit: 10,
        });
        setLoading(false);
        setOrderData({ orders: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page]);

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






