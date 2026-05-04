import { useState, useEffect } from "react";
import categoryApi from "../../../api/categoryApi";
import supplierApi from "../../../api/supplierApi";

export const useProductOptions = () => {
  const [categoryList, setcategoryList] = useState([]);
  const [supplierList, setsupplierList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchsuppliers = async () => {
    try {
      const res = await supplierApi.getAll({});
      setsupplierList(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchcategorys = async () => {
    try {
      const { data } = await categoryApi.getAll({});
      const opts = data.map((item) => {
        return { value: item._id, label: item.name };
      });
      setcategoryList(opts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchcategorys();
    fetchsuppliers();
  }, []);

  return {
    categoryList,
    supplierList,
    loading,
    setLoading,
    fetchcategorys,
    fetchsuppliers,
  };
};






