import { useState, useEffect } from "react";
import brandApi from "../../../api/brandApi";
import categoryApi from "../../../api/categoryApi";
import supplierApi from "../../../api/supplierApi";

export const useProductOptions = () => {
  const [brandList, setbrandList] = useState([]);
  const [categoryList, setcategoryList] = useState([]);
  const [supplierList, setsupplierList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchbrands = async () => {
    try {
      const { data } = await brandApi.getAll({ limit: 0 });
      const opts = data.map((item) => {
        return { value: item._id, label: item.name };
      });
      setbrandList(opts);
    } catch (error) {
      console.log(error);
    }
  };

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
    fetchbrands();
    fetchcategorys();
    fetchsuppliers();
  }, []);

  return {
    brandList,
    categoryList,
    supplierList,
    loading,
    setLoading,
    fetchcategorys,
    fetchsuppliers,
  };
};






